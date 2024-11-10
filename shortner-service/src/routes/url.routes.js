import { Router } from "express"
import { redirectUrl, shortenUrl } from "../controllers/url.controller.js"

const router = Router()

router.route("/api/shorten").post(shortenUrl)
router.route("/r/:code").get(redirectUrl)

export default router
