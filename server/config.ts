import { z } from 'zod'

export const config = z.object({
  port: z.coerce.number().positive().default(4100),
  databaseUrl: z.string().min(1).optional(),
  redisUrl: z.string().min(1).optional(),
  s3Endpoint: z.string().url().optional(), s3Region: z.string().default('us-east-1'),
  s3Bucket: z.string().min(1).default('cutoutbg-private'), s3AccessKey: z.string().min(1).optional(), s3SecretKey: z.string().min(1).optional(),
  uploadDir: z.string().min(1).default('./.data/uploads'), resultDir: z.string().min(1).default('./.data/results'),
  maxBytes: z.coerce.number().positive().default(25 * 1024 * 1024), maxPixels: z.coerce.number().positive().default(40_000_000),
  maxWidth: z.coerce.number().positive().default(12_000), maxHeight: z.coerce.number().positive().default(12_000),
  python: z.string().min(1).default('python'), inferenceTimeoutMs: z.coerce.number().positive().default(120_000),
}).parse(process.env)

export const runtimeConfigured = Boolean(config.databaseUrl && config.redisUrl && config.s3Endpoint && config.s3AccessKey && config.s3SecretKey)
export const runtimeMissing = ['DATABASE_URL','REDIS_URL','S3_ENDPOINT','S3_ACCESS_KEY','S3_SECRET_KEY'].filter((key) => !process.env[key])

declare global { var __cutoutbgConfig: typeof config | undefined }
export default config
void globalThis
