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

  // Default browser and device info
  const browserInfo = {
    device: 'unknown',
    browser: 'unknown',
    os: 'unknown',
  }

  // Parse user-agent
  try {
    const ua = new UAParser(req.headers['user-agent'] || '')
    browserInfo.device = ua.getDevice().type || 'desktop'
    browserInfo.browser = ua.getBrowser().name || 'unknown'
    browserInfo.os = ua.getOS().name || 'unknown'
  } catch (error) {
    console.error('Error parsing user-agent:', error)
  }

  // Extract IP address
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    'unknown'

  const click = new Click({
    shortCode,
    country: 'unknown',
    ip,
    referer: req.headers['referer'] || 'direct',
    device: browserInfo.device,
    browser: browserInfo.browser,
    os: browserInfo.os,
    timestamp: new Date(),
  })

  try {
    await click.save()
    console.log(`Tracked click for shortCode: ${shortCode}`, browserInfo)

    res.status(200).json({
      status: 'success',
      data: {
        shortCode,
        ...browserInfo,
      },
    })
  } catch (error) {
    console.error('Error saving click:', error)
    res.status(500).json({ error: 'Failed to track analytics' })
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
