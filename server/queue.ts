import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import config from './config'
export const connection=config.redisUrl?new IORedis(config.redisUrl,{maxRetriesPerRequest:null}):null
export const queue=connection?new Queue('remove-background',{connection,defaultJobOptions:{attempts:2,backoff:{type:'exponential',delay:1000},removeOnComplete:100,removeOnFail:100}}):null
export async function enqueue(jobId:string,inputStorageKey:string){if(!queue)throw new Error('REDIS_URL is required to enqueue processing jobs');await queue.add('remove-background',{jobId,inputStorageKey})}
