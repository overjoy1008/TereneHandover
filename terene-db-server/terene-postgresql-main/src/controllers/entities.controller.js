// src/controllers/entities.controller.js

import * as service from "../services/entities.service.js"

const ID_FIELDS = {
    orders: "order_id",
    payments: "payment_id",
    settlements: "settlement_id",
    cancellations: "cancellation_id",
    refunds: "refund_id",
    mileages: "mileage_id",
    coupon_definitions: "coupon_definition_id",
    coupon_instances: "coupon_instance_id",
    customers: "membership_number",
}

export const getAll = (type) => async (req, res) => {
    try {
        const data = await service.getAll(type)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getById = (type) => async (req, res) => {
    try {
        const id = req.params.id
        const idField = ID_FIELDS[type]
        const data = await service.getById(type, idField, id)
        if (!data) return res.status(404).json({ error: "Not found" })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const insertOrUpdate = (type) => async (req, res) => {
    try {
        const idField = ID_FIELDS[type]
        const data = req.body
        if (!data[idField]) return res.status(400).json({ error: `${idField} is required` })
        await service.insertOrUpdate(type, data, idField)
        res.status(200).json({ message: "Insert/Update successful" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteById = (type) => async (req, res) => {
    try {
        const id = req.params.id
        const idField = ID_FIELDS[type]
        await service.deleteById(type, idField, id)
        res.status(200).json({ message: `Deleted ${id}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
