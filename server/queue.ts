import { Queue } from 'bullmq'
import IORedis from 'ioredis'
export const queue = process.env.REDIS_URL ? new Queue('remove-background',{connection:new IORedis(process.env.REDIS_URL,{maxRetriesPerRequest:null}),defaultJobOptions:{attempts:2,backoff:{type:'exponential',delay:1000},removeOnComplete:100,removeOnFail:100}}) : null
export async function enqueue(jobId:string,inputStorageKey:string){ if(!queue) throw new Error('REDIS_URL is required to enqueue processing jobs'); await queue.add('remove-background',{jobId,inputStorageKey}) }
