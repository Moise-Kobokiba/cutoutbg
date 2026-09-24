import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import config from './config'
export type StorageProvider={put(key:string,data:Buffer,contentType?:string):Promise<void>;get(key:string):Promise<Buffer>;delete(key:string):Promise<void>;exists(key:string):Promise<boolean>;createDownloadUrl(key:string):Promise<string>}
const safe=(key:string)=>{if(!/^[a-zA-Z0-9/_\-.]+$/.test(key)||key.includes('..'))throw new Error('INVALID_STORAGE_KEY');return key}
const s3=config.s3Endpoint&&config.s3AccessKey&&config.s3SecretKey?new S3Client({endpoint:config.s3Endpoint,region:config.s3Region,forcePathStyle:true,credentials:{accessKeyId:config.s3AccessKey,secretAccessKey:config.s3SecretKey}}):null
const local=(base:string):StorageProvider=>({async put(k,d){const p=join(base,safe(k));await mkdir(dirname(p),{recursive:true});await writeFile(p,d)},async get(k){return readFile(join(base,safe(k)))},async delete(k){const {unlink}=await import('node:fs/promises');await unlink(join(base,safe(k))).catch(()=>{})},async exists(k){try{await readFile(join(base,safe(k)));return true}catch{return false}},async createDownloadUrl(k){return `/api/v1/files/result/${encodeURIComponent(safe(k))}`}})
const remote=(result=false):StorageProvider=>({async put(k,d,type='application/octet-stream'){await s3!.send(new PutObjectCommand({Bucket:config.s3Bucket,Key:safe(k),Body:d,ContentType:type}))},async get(k){const r=await s3!.send(new GetObjectCommand({Bucket:config.s3Bucket,Key:safe(k)}));return Buffer.from(await r.Body!.transformToByteArray())},async delete(k){await s3!.send(new DeleteObjectCommand({Bucket:config.s3Bucket,Key:safe(k)}))},async exists(k){try{await s3!.send(new HeadObjectCommand({Bucket:config.s3Bucket,Key:safe(k)}));return true}catch{return false}},async createDownloadUrl(k){return getSignedUrl(s3!,new GetObjectCommand({Bucket:config.s3Bucket,Key:safe(k)}),{expiresIn:300})}})
export const storage=s3?remote():local(config.uploadDir)
export const results=s3?remote(true):local(config.resultDir)
export async function ensureStorageBucket(){if(!s3)return;try{await s3.send(new HeadBucketCommand({Bucket:config.s3Bucket}))}catch{await s3.send(new CreateBucketCommand({Bucket:config.s3Bucket}))}}
