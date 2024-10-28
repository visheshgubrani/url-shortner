import express from "express"
import cors from "cors"
import urlRouter from "./routes/url.routes.js"
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Routes

app.use("/url", urlRouter)

export default app
