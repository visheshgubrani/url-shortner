import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
})

export default redis
