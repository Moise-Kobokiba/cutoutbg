import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import sharp from 'sharp'
import config from './config'
import { getJob, transition } from './jobs'
import { storage, results, ensureStorageBucket } from './storage'

async function runInference(input:string, output:string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(config.python, ['-m','cutoutbg','remove',input,'--output',output,'--model','birefnet-general','--device',process.env.INFERENCE_DEVICE??'cpu','--cache-dir',process.env.MODEL_CACHE_DIR??'./model-cache'], {env:{...process.env, PYTHONPATH:process.env.PYTHONPATH??'src'}})
    let stderr = ''
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('inference timeout')) }, config.inferenceTimeoutMs)
    child.stderr.on('data', data => { stderr += data.toString() })
    child.on('error', reject)
    child.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(stderr.slice(-500) || `inference exited ${code}`)) })
  })
}

export async function startWorker() {
  if (!config.redisUrl) throw new Error('REDIS_URL is required for worker')
  await ensureStorageBucket()
  const connection = new IORedis(config.redisUrl, {maxRetriesPerRequest:null})
  const worker = new Worker('remove-background', async task => {
    const {jobId, inputStorageKey} = task.data as {jobId:string; inputStorageKey:string}
    const job = await getJob(jobId)
    if (!job) throw new Error('job not found')
    await transition(jobId, 'processing', {startedAt:new Date().toISOString()})
    const dir = await mkdtemp(join(tmpdir(), 'cutoutbg-'))
    try {
      const input = join(dir, 'input')
      const output = join(dir, 'output.png')
      await writeFile(input, await storage.get(inputStorageKey))
      await runInference(input, output)
      const data = await readFile(output)
      const meta = await sharp(data, {failOn:'error'}).metadata()
      if (meta.format !== 'png' || meta.channels !== 4 || !meta.width || !meta.height || !meta.hasAlpha) throw new Error('invalid output')
      const alpha = await sharp(data).ensureAlpha().extractChannel('alpha').stats()
      if (alpha.channels[0].min === 255 || alpha.channels[0].max === 0) throw new Error('pathological alpha')
      const outputKey = `jobs/${jobId}/output.png`
      await results.put(outputKey, data, 'image/png')
      await transition(jobId, 'completed', {completedAt:new Date().toISOString(), outputStorageKey:outputKey, outputWidth:meta.width, outputHeight:meta.height, outputSizeBytes:data.length})
    } catch (error) {
      await transition(jobId, 'failed', {errorCode:'PROCESSING_FAILED', errorMessage:'Image processing failed'})
      throw error
    } finally { await rm(dir, {recursive:true, force:true}) }
  }, {connection, concurrency:1})
  worker.on('failed', () => undefined)
  return worker
}
