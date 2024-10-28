import express from "express"
import analyticsRouter from "./routes/click.route.js"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  next()
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something broke!" })
})

// Routes
app.use("/", analyticsRouter)

export default app
