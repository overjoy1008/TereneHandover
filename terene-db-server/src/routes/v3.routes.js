// src/routes/v3.routes.js

import express from "express"
import * as controller from "../controllers/v3.controller.js"

const router = express.Router()

const entities = [
    // { path: "orders", type: "orders" },
    // { path: "payments", type: "payments" },
    // { path: "settlements", type: "settlements" },
    // { path: "cancellations", type: "cancellations" },
    // { path: "refunds", type: "refunds" },
    // { path: "mileages", type: "mileages" },
    // { path: "coupon-definitions", type: "coupon_definitions" },
    // { path: "coupon-instances", type: "coupon_instances" },
    // { path: "customers", type: "customers" },

    { path: "locations", type: "locations" },
    { path: "admin-contacts", type: "admin_contacts" },
    { path: "employees", type: "employees" },
    { path: "attendance", type: "attendance" },
    { path: "managements", type: "managements" },
    { path: "days-category", type: "days_category" },
    { path: "days-design", type: "days_design" },
    { path: "days", type: "days" },
    { path: "refund-policy", type: "refund_policy" },
    { path: "additional-services", type: "additional_services" },
    { path: "memberships", type: "memberships" },
    { path: "settings", type: "settings" },
]

entities.forEach(({ path, type }) => {
    router.get(`/${path}`, controller.getAll(type))
    router.get(`/${path}/:id`, controller.getById(type))
    router.post(`/${path}`, controller.insertOrUpdate(type))
    router.put(`/${path}/:id`, controller.insertOrUpdate(type))
    router.delete(`/${path}/:id`, controller.deleteById(type))
})

export default router
