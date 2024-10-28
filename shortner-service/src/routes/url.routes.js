import { Router } from "express"
import { redirectUrl, shortenUrl } from "../controllers/url.controller.js"

const router = Router()

router.route("/shorten").post(shortenUrl)
router.route("/:code").get(redirectUrl)

export default router
