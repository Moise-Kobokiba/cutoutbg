import { describe,it,expect } from 'vitest'
import { buildApi } from './api'
describe('processing API',()=>{it('reports health',async()=>{const app=buildApi(); const response=await app.inject({method:'GET',url:'/health'}); expect(response.statusCode).toBe(200); expect(response.json()).toEqual({status:'ok'}); await app.close()}); it('rejects missing upload',async()=>{const app=buildApi(); const response=await app.inject({method:'POST',url:'/api/v1/jobs'}); expect(response.statusCode).toBe(400); await app.close()})})
