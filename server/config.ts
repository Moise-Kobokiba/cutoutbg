import { z } from 'zod'

const environment = z.object({
  PORT: z.coerce.number().positive().default(4100),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  S3_ENDPOINT: z.string().url().optional(), S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().min(1).default('cutoutbg-private'), S3_ACCESS_KEY: z.string().min(1).optional(), S3_SECRET_KEY: z.string().min(1).optional(),
  UPLOAD_DIR: z.string().min(1).default('./.data/uploads'), RESULT_DIR: z.string().min(1).default('./.data/results'),
  MAX_BYTES: z.coerce.number().positive().default(25 * 1024 * 1024), MAX_PIXELS: z.coerce.number().positive().default(40_000_000),
  MAX_WIDTH: z.coerce.number().positive().default(12_000), MAX_HEIGHT: z.coerce.number().positive().default(12_000),
  PYTHON: z.string().min(1).default('python'), INFERENCE_TIMEOUT_MS: z.coerce.number().positive().default(120_000),
}).parse(process.env)

export const config = {
  port: environment.PORT,
  databaseUrl: environment.DATABASE_URL,
  redisUrl: environment.REDIS_URL,
  s3Endpoint: environment.S3_ENDPOINT,
  s3Region: environment.S3_REGION,
  s3Bucket: environment.S3_BUCKET,
  s3AccessKey: environment.S3_ACCESS_KEY,
  s3SecretKey: environment.S3_SECRET_KEY,
  uploadDir: environment.UPLOAD_DIR,
  resultDir: environment.RESULT_DIR,
  maxBytes: environment.MAX_BYTES,
  maxPixels: environment.MAX_PIXELS,
  maxWidth: environment.MAX_WIDTH,
  maxHeight: environment.MAX_HEIGHT,
  python: environment.PYTHON,
  inferenceTimeoutMs: environment.INFERENCE_TIMEOUT_MS,
}

export const runtimeConfigured = Boolean(config.databaseUrl && config.redisUrl && config.s3Endpoint && config.s3AccessKey && config.s3SecretKey)
export const runtimeMissing = ['DATABASE_URL','REDIS_URL','S3_ENDPOINT','S3_ACCESS_KEY','S3_SECRET_KEY'].filter((key) => !process.env[key])

declare global { var __cutoutbgConfig: typeof config | undefined }
export default config
void globalThis
