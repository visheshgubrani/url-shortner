import express from 'express'
import cors from 'cors'
import urlRouter from './routes/url.routes.js'
// import prometheusExporter from './tracing.js'
import client from 'prom-client'
const app = express()

const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})
register.registerMetric(httpRequestCounter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc()
  })
  next()
})

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
// Routes

app.use('/', urlRouter)

export default app
