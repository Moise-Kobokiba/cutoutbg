import { randomUUID } from 'node:crypto'
export type JobStatus = 'queued'|'processing'|'completed'|'failed'
export type Job = { id:string; status:JobStatus; originalFilename:string; inputMimeType:string; inputSizeBytes:number; inputStorageKey:string; outputStorageKey?:string; outputWidth?:number; outputHeight?:number; outputSizeBytes?:number; errorCode?:string; errorMessage?:string; createdAt:string; updatedAt:string; startedAt?:string; completedAt?:string }
const jobs = new Map<string, Job>()
export function createJob(input: Omit<Job,'id'|'status'|'createdAt'|'updatedAt'>) { const now=new Date().toISOString(); const job:Job={...input,id:randomUUID(),status:'queued',createdAt:now,updatedAt:now}; jobs.set(job.id,job); return job }
export function getJob(id:string) { return jobs.get(id) }
export function updateJob(id:string, patch:Partial<Job>) { const job=jobs.get(id); if(!job) return; Object.assign(job,patch,{updatedAt:new Date().toISOString()}); return job }
