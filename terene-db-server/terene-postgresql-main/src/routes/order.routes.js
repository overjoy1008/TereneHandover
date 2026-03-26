import express from "express"
import * as controller from "../controllers/order.controller.js"

const router = express.Router()

router.get("/", controller.getAllOrders)
router.post("/", controller.insertOrder)
router.delete("/:id", controller.deleteOrder)
router.put("/:id", controller.upsertOrder)

export default router
