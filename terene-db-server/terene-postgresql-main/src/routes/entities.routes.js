// src/routes/entities.routes.js

import express from "express"
import * as controller from "../controllers/entities.controller.js"

const router = express.Router()

const entities = [
    { path: "orders", type: "orders" },
    { path: "payments", type: "payments" },
    { path: "settlements", type: "settlements" },
    { path: "cancellations", type: "cancellations" },
    { path: "refunds", type: "refunds" },
    { path: "mileages", type: "mileages" },
    { path: "coupon-definitions", type: "coupon_definitions" },
    { path: "coupon-instances", type: "coupon_instances" },
    { path: "customers", type: "customers" },
]

entities.forEach(({ path, type }) => {
    router.get(`/${path}`, controller.getAll(type))
    router.get(`/${path}/:id`, controller.getById(type))
    router.post(`/${path}`, controller.insertOrUpdate(type))
    router.put(`/${path}/:id`, controller.insertOrUpdate(type))
    router.delete(`/${path}/:id`, controller.deleteById(type))
})

export default router
