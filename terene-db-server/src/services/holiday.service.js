// src/services/holiday.service.js
import db from "../models/db.js"

export async function getHolidays() {
    const result = await db.query("SELECT * FROM holidays ORDER BY date ASC")
    return result.rows
}

export async function addHoliday({ date, category }) {
    await db.query(
        "INSERT INTO holidays (date, category) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET category = EXCLUDED.category",
        [date, category]
    )
}

export async function removeHoliday(date) {
    await db.query("DELETE FROM holidays WHERE date = $1", [date])
}
