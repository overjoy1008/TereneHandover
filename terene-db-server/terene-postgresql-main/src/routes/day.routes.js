// src/routes/day.routes.js
import express from "express"
import * as controller from "../controllers/day.controller.js"

const router = express.Router()

router.get("/", controller.getAllDays)
router.post("/", controller.insertDay)
router.delete("/:date", controller.deleteDay)
router.put("/:date", controller.upsertDay)

export default router
