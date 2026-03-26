// src/controllers/day.controller.js
import * as service from "../services/day.service.js"

export const getAllDays = async (req, res) => {
    try {
        const data = await service.getDays()
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const insertDay = async (req, res) => {
    try {
        const { date, category, is_holiday, checkin, checkout } = req.body

        if (!date || !category || is_holiday === undefined) {
            return res.status(400).json({ error: "date, category, and is_holiday are required" })
        }

        let parsedCheckin, parsedCheckout
        try {
            parsedCheckin = typeof checkin === 'string' ? JSON.parse(checkin) : checkin
            parsedCheckout = typeof checkout === 'string' ? JSON.parse(checkout) : checkout
        } catch (e) {
            return res.status(400).json({ error: "Invalid JSON format in checkin or checkout" })
        }

        await service.addDay({
            date,
            category,
            is_holiday,
            checkin: parsedCheckin,
            checkout: parsedCheckout
        })

        res.status(201).json({ message: "Day inserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteDay = async (req, res) => {
    try {
        const date = req.params.date
        await service.removeDay(date)
        res.status(200).json({ message: `Deleted day on ${date}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const upsertDay = async (req, res) => {
    try {
        const date = req.params.date
        const { category, is_holiday, checkin, checkout } = req.body

        if (!category || is_holiday === undefined) {
            return res.status(400).json({ error: "category and is_holiday are required" })
        }

        let parsedCheckin, parsedCheckout
        try {
            parsedCheckin = typeof checkin === 'string' ? JSON.parse(checkin) : checkin
            parsedCheckout = typeof checkout === 'string' ? JSON.parse(checkout) : checkout
        } catch (e) {
            return res.status(400).json({ error: "Invalid JSON format in checkin or checkout" })
        }

        await service.addDay({
            date,
            category,
            is_holiday,
            checkin: parsedCheckin,
            checkout: parsedCheckout
        })

        res.status(200).json({ message: "Day upserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
