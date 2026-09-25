import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import config, { runtimeConfigured, runtimeMissing } from './config'
import { createJob, getJob, transition } from './jobs'
import { storage, results } from './storage'
import { enqueue } from './queue'

const formats = new Set(['png', 'jpeg', 'webp'])
const mimeByFormat: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
const extensionByFormat: Record<string, string[]> = { png: ['png'], jpeg: ['jpg', 'jpeg'], webp: ['webp'] }
const safeFilename = (filename: string) => filename.replace(/[\\/\0]/g, '_').slice(0, 255) || 'upload'

function errorResponse(code: string, message: string) {
  return { error: { code, message } }
}

export function buildApi() {
  const app = Fastify({ logger: true })
  app.register(cors, { origin: process.env.WEB_ORIGIN ?? true })
  app.register(multipart, { limits: { fileSize: config.maxBytes, files: 1 } })

  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/ready', async (_request, reply) => runtimeConfigured ? { status: 'ready' } : reply.code(503).send({ status: 'not_ready', missing: runtimeMissing }))

  app.post('/api/v1/jobs', async (request, reply) => {
    let job: Awaited<ReturnType<typeof createJob>> | undefined
    try {
      const file = await request.file()
      if (!file) return reply.code(400).send(errorResponse('INVALID_FILE', 'multipart field file is required'))

      const data = await file.toBuffer()
      const metadata = await sharp(data, { failOn: 'error' }).metadata()
      const format = metadata.format
      const extension = file.filename.split('.').pop()?.toLowerCase()
      const declaredMime = file.mimetype.toLowerCase()

      if (!format || !metadata.width || !metadata.height || !formats.has(format)) {
        return reply.code(415).send(errorResponse('UNSUPPORTED_FORMAT', 'PNG, JPEG, and WebP are supported'))
      }
      if (declaredMime !== mimeByFormat[format] || !extension || !extensionByFormat[format].includes(extension)) {
        return reply.code(415).send(errorResponse('MIME_TYPE_MISMATCH', 'The file type and image contents do not match'))
      }
      if (metadata.width > config.maxWidth || metadata.height > config.maxHeight || metadata.width * metadata.height > config.maxPixels) {
        return reply.code(413).send(errorResponse('IMAGE_TOO_LARGE', 'Image dimensions exceed the configured limit'))
      }

      const inputStorageKey = `jobs/${randomUUID()}/input`
      job = await createJob({
        originalFilename: safeFilename(file.filename),
        inputMimeType: mimeByFormat[format],
        inputSizeBytes: data.length,
        inputStorageKey,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      })
      await storage.put(inputStorageKey, data, mimeByFormat[format])
      await enqueue(job.id, inputStorageKey)
      return reply.code(202).send({ jobId: job.id, status: job.status })
    } catch (error) {
      request.log.error(error)
      if (job) {
        await transition(job.id, 'failed', { errorCode: 'QUEUE_ERROR', errorMessage: 'Processing could not be queued' }).catch(() => undefined)
        return reply.code(503).send(errorResponse('QUEUE_ERROR', 'Processing could not be queued'))
      }
      const message = error instanceof Error && /maximum file size/i.test(error.message)
        ? 'The image must be smaller than the configured upload limit'
        : 'The uploaded file could not be decoded'
      return reply.code(message.startsWith('The image') ? 413 : 400).send(errorResponse(message.startsWith('The image') ? 'FILE_TOO_LARGE' : 'INVALID_FILE', message))
    }
  })

  app.get('/api/v1/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const job = await getJob(id)
    if (!job) return reply.code(404).send(errorResponse('JOB_NOT_FOUND', 'Processing job not found'))
    const response: Record<string, unknown> = { jobId: job.id, status: job.status }
    if (job.status === 'completed' && job.outputStorageKey) response.result = { downloadUrl: await results.createDownloadUrl(job.outputStorageKey), width: job.outputWidth, height: job.outputHeight }
    if (job.status === 'failed') response.error = { code: job.errorCode ?? 'PROCESSING_FAILED', message: job.errorMessage ?? 'The image could not be processed' }
    return response
  })

  app.get('/api/v1/files/result/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    try {
      const data = await results.get(decodeURIComponent(key))
      return reply.type('image/png').send(data)
    } catch {
      return reply.code(404).send(errorResponse('RESULT_NOT_FOUND', 'Processed image not found'))
    }
  })

  return app
}

export default buildApi
