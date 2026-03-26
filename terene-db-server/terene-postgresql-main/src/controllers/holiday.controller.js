// src/controllers/holiday.controller.js
import * as service from "../services/holiday.service.js"

export const getAllHolidays = async (req, res) => {
    try {
        const data = await service.getHolidays()
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const insertHoliday = async (req, res) => {
    try {
        const { date, category } = req.body
        if (!date || !category) {
            return res.status(400).json({ error: "date and category are required" })
        }
        await service.addHoliday({ date, category })
        res.status(201).json({ message: "Holiday inserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteHoliday = async (req, res) => {
    try {
        const date = req.params.date
        await service.removeHoliday(date)
        res.status(200).json({ message: `Deleted holiday on ${date}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const upsertHoliday = async (req, res) => {
    try {
        const date = req.params.date
        const { category } = req.body

        if (!category) {
            return res.status(400).json({ error: "category is required" })
        }

        await service.addHoliday({ date, category }) // ⬅️ 기존 addHoliday 재사용
        res.status(200).json({ message: "Holiday upserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
