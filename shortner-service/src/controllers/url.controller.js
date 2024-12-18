import { UAParser } from 'ua-parser-js'
import redis from '../config/redis.js'
import { URL } from '../models/urlSchema.js'

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
    throw new Error('Please provide the url')
  }
  const newUrl = new URL({ originalUrl: url })
  await newUrl.save()

  await redis.set(`url:${newUrl.shortCode}`, url, 'EX', 86400) // 24H cache

  return res.status(200).json({
    shortCode: newUrl.shortCode,
    shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`,
  })
})

const redirectUrl = asyncHandler(async (req, res) => {
  const { code: shortCode } = req.params

  if (!shortCode) {
    return res.status(400).json({ error: 'shortCode is required' })
  }

  const cachedUrl = await redis.get(`url:${shortCode}`)
  const analyticsUrl = process.env.ANALYTICS_URL

  // Extract user-agent info
  const ua = new UAParser(req.headers['user-agent'] || '')
  const deviceInfo = {
    browser: ua.getBrowser().name || 'unknown',
    os: ua.getOS().name || 'unknown',
    device: ua.getDevice().type || 'desktop',
  }

  // Fetch from Redis or Database
  if (cachedUrl) {
    try {
      await fetch(`${analyticsUrl}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode,
          timestamp: new Date(),
          userAgent: req.headers['user-agent'],
          referer: req.headers['referer'] || 'direct',
          ip:
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip ||
            'unknown',
          ...deviceInfo,
        }),
      })
    } catch (error) {
      console.error('Error sending analytics:', error)
    }

    return res.redirect(cachedUrl)
  }

  const urlDoc = await URL.findOneAndUpdate(
    { shortCode },
    { $inc: { clicks: 1 } },
    { new: true }
  )

  if (!urlDoc) {
    return res.status(404).json({ error: 'URL not found' })
  }

  // Cache the URL
  await redis.set(`url:${shortCode}`, urlDoc.originalUrl, 'EX', 86400)

  try {
    await fetch(`${analyticsUrl}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shortCode,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'] || 'direct',
        ip:
          req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown',
        ...deviceInfo,
      }),
    })
  } catch (error) {
    console.error('Error sending analytics:', error)
  }

  res.redirect(urlDoc.originalUrl)
})
export { shortenUrl, redirectUrl }
