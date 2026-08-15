// src/services/entities.service.js

import db from "../models/db.js"

const TABLE_MAP = {
    orders: "orders_250618",
    payments: "order_payments_250618",
    settlements: "order_settlements_250618",
    cancellations: "order_cancellations_250618",
    refunds: "order_refunds_250618",
    mileages: "mileages_250618",
    coupon_definitions: "coupon_definitions_250618",
    coupon_instances: "coupon_instances_250618",
    customers: "customers_250618",
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

const COUPON_DELETE_ENTITY_TYPE = {
    coupon_definitions: "definition",
    coupon_instances: "instance",
}

function couponHistoryIds(entityType, idValue, row) {
    if (entityType === "definition") {
        return {
            definitionsId: String(
                row?.coupon_definition_id ?? idValue
            ),
            instancesId: null,
        }
    }

    return {
        definitionsId:
            row?.coupon_definition_id != null
                ? String(row.coupon_definition_id)
                : null,
        instancesId: String(row?.coupon_instance_id ?? idValue),
    }
}

export async function deleteById(type, idField, idValue, queryable = db) {
    const table = TABLE_MAP[type]
    if (!table) throw new Error("Invalid entity type")

    const entityType = COUPON_DELETE_ENTITY_TYPE[type]
    if (!entityType) {
        await queryable.query(`DELETE FROM ${table} WHERE ${idField} = $1`, [
            idValue,
        ])
        return
    }

    const client = await queryable.connect()
    try {
        await client.query("BEGIN")

        const selected = await client.query(
            `SELECT * FROM ${table} WHERE ${idField} = $1`,
            [idValue]
        )
        const row = selected.rows[0]
        if (row) {
            const { definitionsId, instancesId } = couponHistoryIds(
                entityType,
                idValue,
                row
            )
            await client.query(
                `INSERT INTO coupon_deletion_history_250618
                    (entity_type, entity_id, definitions_id, instances_id, deleted_by, source, snapshot)
                 VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
                [
                    entityType,
                    String(idValue),
                    definitionsId,
                    instancesId,
                    null,
                    null,
                    JSON.stringify(row),
                ]
            )
        }

        await client.query(`DELETE FROM ${table} WHERE ${idField} = $1`, [
            idValue,
        ])

        await client.query("COMMIT")
    } catch (err) {
        try {
            await client.query("ROLLBACK")
        } catch {}
        throw err
    } finally {
        client.release()
    }
}
