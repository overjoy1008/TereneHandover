// src/services/test.service.js

import db from "../models/db.js"

const TABLE_MAP = {
    days_category: "days_category_251222",
    days_design: "days_design_251222",
    days: "days_251222",
    settings: "settings_251222",
}

function parseField(value) {
    if (value === null || value === undefined) return null

    // Literally JSON
    if (typeof value === "object") return value

    // Boolean
    if (value === "true") return true
    if (value === "false") return false

    // JSON 형식의 string
    if (
        typeof value === "string" &&
        (value.trim().startsWith("{") || value.trim().startsWith("["))
    ) {
        try {
            return JSON.parse(value)
        } catch {
            return value // fallback
        }
    }

    // Numeric (문자열일 때만 trim 후 매칭)
    // 알파벳, 중간 하이픈, 0으로 시작하는 숫자 문자열은 숫자로 변환하지 않음
    if (typeof value === "string") {
        const trimmed = value.trim()

        const hasAlpha = /[a-zA-Z]/.test(trimmed)
        const hasMiddleDash = /.*-.*-/.test(trimmed)
        const isLeadingZeroNumber = /^0[0-9]+$/.test(trimmed)

        if (!hasAlpha && !hasMiddleDash && !isLeadingZeroNumber) {
            const number = parseFloat(trimmed)
            if (!isNaN(number) && trimmed.match(/^[0-9.\-]+$/)) {
                return number
            }
        }
    }

    // 문자열은 그대로, 그 외 타입은 as-is (예: Timestamp)
    return value
}

function sanitizeData(data) {
  const sanitized = {};

  for (const key in data) {
    const parsed = parseField(data[key]);

    // 특수 처리: remarks 배열을 PostgreSQL 배열 리터럴로 변환
    if (key === "remarks" && Array.isArray(parsed)) {
        // remarks: ['a', 'b'] → '{"a","b"}'
        const pgArray = `{${parsed.map(v => `"${v}"`).join(",")}}`
        sanitized[key] = pgArray
    } 

    // 객체나 배열이면 PostgreSQL JSONB에 맞게 stringify
    else if (typeof parsed === "object" && parsed !== null) {
      sanitized[key] = JSON.stringify(parsed);
    } else {
      sanitized[key] = parsed;
    }
  }

  return sanitized;
}

export async function getAll(type) {
    const table = TABLE_MAP[type]
    if (!table) throw new Error("Invalid entity type")
    const result = await db.query(`SELECT * FROM ${table}`)
    return result.rows
}

export async function getById(type, idField, idValue) {
    const table = TABLE_MAP[type]
    if (!table) throw new Error("Invalid entity type")
    const result = await db.query(`SELECT * FROM ${table} WHERE ${idField} = $1`, [idValue])
    return result.rows[0] || null
}

export async function insertOrUpdate(type, rawData, idField) {
    const table = TABLE_MAP[type]
    if (!table) throw new Error("Invalid entity type")

    const data = sanitizeData(rawData)
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")
    const updates = keys.map((key) => `${key} = EXCLUDED.${key}`).join(", ")

    const query = `
        INSERT INTO ${table} (${keys.join(", ")})
        VALUES (${placeholders})
        ON CONFLICT (${idField}) DO UPDATE SET ${updates}
    `
    await db.query(query, values)
}

export async function deleteById(type, idField, idValue) {
    const table = TABLE_MAP[type]
    if (!table) throw new Error("Invalid entity type")
    await db.query(`DELETE FROM ${table} WHERE ${idField} = $1`, [idValue])
}
