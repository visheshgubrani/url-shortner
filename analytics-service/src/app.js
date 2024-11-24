import express from 'express'
import analyticsRouter from './routes/click.route.js'
import cors from 'cors'

const app = express()
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Routes
app.use('/api/analytics', analyticsRouter)

export default app
