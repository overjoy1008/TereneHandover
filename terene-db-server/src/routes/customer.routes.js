import express from "express"
import * as controller from "../controllers/customer.controller.js"

const router = express.Router()

router.get("/", controller.getAllCustomers)
router.post("/", controller.insertCustomer)
router.delete("/:membership_number", controller.deleteCustomer)
router.put("/:membership_number", controller.upsertCustomer)

export default router
