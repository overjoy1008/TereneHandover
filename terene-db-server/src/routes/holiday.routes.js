// src/routes/holiday.routes.js
import express from "express"
import * as controller from "../controllers/holiday.controller.js"

const router = express.Router()

router.get("/", controller.getAllHolidays)
router.post("/", controller.insertHoliday)
router.delete("/:date", controller.deleteHoliday)
router.put("/:date", controller.upsertHoliday)

export default router
