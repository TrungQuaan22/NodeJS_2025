import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
const env = process.env.NODE_ENV
const envFileName = env ? `.env.${env}` : '.env'
if (!fs.existsSync(path.resolve(process.cwd(), envFileName))) {
  throw new Error(`Environment file ${envFileName} not found`)
}
export const isProduction = env === 'production'
config({
  path: env ? `.env.${env}` : '.env'
})
