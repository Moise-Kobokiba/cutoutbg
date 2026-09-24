import { buildApi } from './api'
import config from './config'
import { ensureStorageBucket } from './storage'
const app=buildApi()
ensureStorageBucket().then(()=>app.listen({port:config.port,host:'0.0.0.0'})).catch(error=>{app.log.error(error);process.exit(1)})
