import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redis from "../config/redis.js"

const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: "rate-limit",
  }),

  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
})

export default limiter
