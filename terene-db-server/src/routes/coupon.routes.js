import express from "express"
import * as controller from "../controllers/coupon.controller.js"

const router = express.Router()

router.get("/", controller.getAllCoupons)
router.post("/", controller.insertCoupon)
router.delete("/:id", controller.deleteCoupon)
router.put("/:id", controller.upsertCoupon)

export default router
