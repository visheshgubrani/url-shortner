import express from "express"
import cors from "cors"
import urlRouter from "./routes/url.routes.js"
const app = express()

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Routes

app.use("/", urlRouter)

export default app
