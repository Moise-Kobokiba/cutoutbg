import { buildApi } from './api'
const app=buildApi(); app.listen({port:Number(process.env.PORT??4100),host:'0.0.0.0'}).catch(error=>{app.log.error(error);process.exit(1)})
