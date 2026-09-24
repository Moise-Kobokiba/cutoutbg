import { z } from 'zod'

export const config = { port: Number(process.env.PORT ?? 4100), uploadDir: process.env.UPLOAD_DIR ?? './.data/uploads', resultDir: process.env.RESULT_DIR ?? './.data/results', maxBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 25 * 1024 * 1024), maxPixels: Number(process.env.MAX_PIXELS ?? 40_000_000), maxWidth: Number(process.env.MAX_WIDTH ?? 12_000), maxHeight: Number(process.env.MAX_HEIGHT ?? 12_000), python: process.env.PYTHON_BIN ?? 'python', inferenceTimeoutMs: Number(process.env.INFERENCE_TIMEOUT_MS ?? 120_000) }
export const configSchema = z.object({ port: z.number().positive(), uploadDir: z.string().min(1), resultDir: z.string().min(1), maxBytes: z.number().positive(), maxPixels: z.number().positive(), maxWidth: z.number().positive(), maxHeight: z.number().positive(), python: z.string().min(1), inferenceTimeoutMs: z.number().positive() })
configSchema.parse(config)
