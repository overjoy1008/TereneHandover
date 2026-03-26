// src/routes/test.routes.js

import express from "express"
import * as controller from "../controllers/test.controller.js"

const router = express.Router()

const entities = [
    { path: "days-category", type: "days_category" },
    { path: "days-design", type: "days_design" },
    { path: "days", type: "days" },
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
