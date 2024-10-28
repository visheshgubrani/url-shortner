import { Router } from "express"
import {
  Stats7Days,
  trackUrl,
  urlStats,
} from "../controllers/click.controller.js"

const router = Router()

router.route("/track").post(trackUrl)
router.route("/stats/:code").get(urlStats)
router.route("/stats/:code/weekly").get(Stats7Days)

export default router
