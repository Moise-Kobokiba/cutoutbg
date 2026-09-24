import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { config } from './config'
export type Storage = { put(key:string,data:Buffer):Promise<void>; get(key:string):Promise<Buffer>; url(key:string):string }
function safeKey(key:string) { if (!/^[a-zA-Z0-9_./-]+$/.test(key) || key.includes('..')) throw new Error('invalid storage key'); return key }
export const storage:Storage={ async put(key,data){const path=join(config.uploadDir,safeKey(key)); await mkdir(dirname(path),{recursive:true}); await writeFile(path,data)}, async get(key){return readFile(join(config.uploadDir,safeKey(key)))}, url(key){return `/api/v1/files/${encodeURIComponent(safeKey(key))}`} }
export const results:Storage={ async put(key,data){const path=join(config.resultDir,safeKey(key)); await mkdir(dirname(path),{recursive:true}); await writeFile(path,data)}, async get(key){return readFile(join(config.resultDir,safeKey(key)))}, url(key){return `/api/v1/files/result/${encodeURIComponent(safeKey(key))}`} }
