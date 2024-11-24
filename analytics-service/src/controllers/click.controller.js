import { UAParser } from 'ua-parser-js'
import { Click } from '../models/click.model.js'

const asyncHandler = (reqHandler) => {
  return async (req, res, next) => {
    try {
      await reqHandler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

const trackUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.body

  if (!shortCode) {
    return res.status(400).json({ error: 'shortCode is required' })
  }

  // Initialize UAParser with proper error handling
  let browserInfo = {
    device: 'unknown',
    browser: 'unknown',
    os: 'unknown',
  }

  try {
    const ua = new UAParser(req.headers['user-agent'] || '')
    browserInfo = {
      device: ua.getDevice().type || 'desktop',
      browser: ua.getBrowser().name || 'unknown',
      os: ua.getOS().name || 'unknown',
    }
  } catch (error) {
    console.error('Error parsing user agent:', error)
    // Continue with defaults set above
  }

  // Get IP address handling different possible formats
  const ip = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.connection.remoteAddress ||
    ''
  )
    .split(',')[0]
    .trim()

  const click = new Click({
    shortCode,
    country:
      req.headers['cf-ipcountry'] || req.headers['x-country'] || 'unknown',
    city: req.headers['cf-ipcity'] || req.headers['x-city'] || 'unknown',
    ip: ip,
    referer:
      req.headers['referer'] ||
      req.headers['referrer'] || // Note both spellings
      'direct',
    device: browserInfo.device,
    browser: browserInfo.browser,
    os: browserInfo.os,
    timestamp: new Date(),
  })

  try {
    await click.save()
    console.log(`Tracked click for shortCode: ${shortCode}`, {
      ip,
      device: browserInfo.device,
      browser: browserInfo.browser,
      os: browserInfo.os,
    })

    res.status(200).json({
      status: 'success',
      data: {
        shortCode,
        device: browserInfo.device,
        browser: browserInfo.browser,
        os: browserInfo.os,
      },
    })
  } catch (error) {
    console.error('Error saving click:', error)
    throw new Error('Analytics tracking failed: ' + error.message)
  }
})

const urlStats = asyncHandler(async (req, res) => {
  const shortCode = req.params.code

  const clicks = await Click.find({ shortCode })

  const last24Hours = await Click.countDocuments({
    shortCode,
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })

  const stats = {
    total: clicks.length,
    last24Hours,
    byCountry: {},
    byDevice: {},
    byBrowser: {},
    byOS: {},
    byHour: Array(24).fill(0),
    byReferer: {},
    recent: clicks.slice(-5).map((click) => ({
      timestamp: click.timestamp,
      country: click.country,
      device: click.device,
      browser: click.browser,
    })),
  }

  clicks.forEach((click) => {
    stats.byCountry[click.country] = (stats.byCountry[click.country] || 0) + 1

    // Device stats
    stats.byDevice[click.device] = (stats.byDevice[click.device] || 0) + 1

    // Browser stats
    stats.byBrowser[click.browser] = (stats.byBrowser[click.browser] || 0) + 1

    // OS stats
    stats.byOS[click.os] = (stats.byOS[click.os] || 0) + 1

    // Hour Stats (for time distribution)
    const hour = new Date(click.timestamp).getHours()
    stats.byHour[hour]++

    // Referer Stats
    stats.byReferer[click.referer] = stats.byReferer[click.referer]
  })

  res.json(stats)
})

const Stats7Days = asyncHandler(async (req, res) => {
  const shortCode = req.params.code
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const hourlyStats = await Click.aggregate([
    {
      $match: {
        shortCode,
        timestamp: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 },
    },
  ])

  res.json(hourlyStats)
})

export { trackUrl, urlStats, Stats7Days }
