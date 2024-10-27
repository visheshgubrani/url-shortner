import redis from "../config/redis"
import { URL } from "../models/urlSchema"

const asyncHandler = (reqHandler) => {
  return async (req, res, next) => {
    try {
      await reqHandler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

const shortenUrl = asyncHandler(async (req, res) => {
  const { url } = req.body
  if (!url) {
    throw new Error("Please provide the url")
  }
  const newUrl = new URL({ originalUrl: url })
  await newUrl.save()

  await redis.set(`url:${newUrl.shortCode}`, url, "EX", 86400) // 24H cache

  return res.status(200).json({
    shortCode: newUrl.shortCode,
    shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`,
  })
})

const redirectUrl = asyncHandler(async (req, res) => {
  const cachedUrl = await redis.get(`url:${req.params.code}`)
  if (cachedUrl) {
    fetch("http://analytics-service:3001/track", {
      method: "POST",
      headers: { "Contend-Type": "application/json" },
      body: JSON.stringify({
        shortCode: req.params.code,
        timestamp: new Date(),
        userAgent: req.headers["user-agent"],
      }),
    }).catch(console.error)

    return res.redirect(cachedUrl)
  }

  const url = await URL.findOne({ shortCode: req.params.code })
  if (!url) {
    return res.status(404).json({ error: "URL not found" })
  }

  url.clicks++
  await url.save()

  // Cache the results
  await redis.set(`url:${req.params.code}`, url.originalUrl, "EX", 86400)

  res.redirect(url.originalUrl)
})

export { shortenUrl, redirectUrl }
