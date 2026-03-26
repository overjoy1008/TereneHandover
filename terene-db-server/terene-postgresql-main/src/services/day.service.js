// src/services/day.service.js
import db from "../models/db.js"

export async function getDays() {
    const result = await db.query("SELECT * FROM days ORDER BY date ASC")
    return result.rows
}

export async function addDay({ date, category, is_holiday, checkin, checkout }) {
    await db.query(
        `INSERT INTO days (date, category, is_holiday, checkin, checkout)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (date) DO UPDATE SET
            category = EXCLUDED.category,
            is_holiday = EXCLUDED.is_holiday,
            checkin = EXCLUDED.checkin,
            checkout = EXCLUDED.checkout`,
        [date, category, is_holiday, checkin, checkout]
    )
}

export async function removeDay(date) {
    await db.query("DELETE FROM days WHERE date = $1", [date])
}
