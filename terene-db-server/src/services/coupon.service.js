import db from "../models/db.js"

export async function getCoupons() {
    const result = await db.query("SELECT * FROM coupons ORDER BY id ASC")
    return result.rows
}

export async function addCoupon(coupon) {
    const discountValue = Number(coupon.discount_value)
    if (isNaN(discountValue)) throw new Error("discount_value must be a number")

    const priority = Number(coupon.priority)
    if (isNaN(priority)) throw new Error("priority must be a number")

    const enabled = coupon.enabled === true || coupon.enabled === "true"

    let conditionsJSON = null
    if (Array.isArray(coupon.conditions_json)) {
        conditionsJSON = JSON.stringify(coupon.conditions_json)
    } else if (typeof coupon.conditions_json === "string") {
        try {
            const parsed = JSON.parse(coupon.conditions_json)
            if (!Array.isArray(parsed)) {
                throw new Error("conditions_json must be a JSON array")
            }
            conditionsJSON = coupon.conditions_json
        } catch (err) {
            throw new Error("conditions_json is not valid JSON array: " + err.message)
        }
    }

    let allowedMembers = null
    if (Array.isArray(coupon.allowed_members)) {
        allowedMembers = coupon.allowed_members
    } else if (typeof coupon.allowed_members === "string") {
        const str = coupon.allowed_members.trim()
        if (str.startsWith("[") && str.endsWith("]")) {
            try {
                const parsed = JSON.parse(str)
                if (Array.isArray(parsed)) allowedMembers = parsed
            } catch {
                throw new Error("allowed_members: Invalid JSON array string")
            }
        } else {
            allowedMembers = str
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
        }
    }

    const query = `
        INSERT INTO coupons (
            id, priority, name, description,
            discount_type, discount_value, scope,
            type, allowed_members, code,
            conditions_json, enabled
        ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
            priority = EXCLUDED.priority,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            scope = EXCLUDED.scope,
            type = EXCLUDED.type,
            allowed_members = EXCLUDED.allowed_members,
            code = EXCLUDED.code,
            conditions_json = EXCLUDED.conditions_json,
            enabled = EXCLUDED.enabled
    `

    const values = [
        coupon.id,
        priority,
        coupon.name,
        coupon.description || null,
        coupon.discount_type,
        discountValue,
        coupon.scope,
        coupon.type || null,
        allowedMembers,
        coupon.code || null,
        conditionsJSON,
        enabled,
    ]

    await db.query(query, values)
}

export async function removeCoupon(id) {
    await db.query("DELETE FROM coupons WHERE id = $1", [id])
}

// priority 충돌 시 밀어주기
export async function adjustPriorities(priority, excludeId = null) {
    const shiftQuery = excludeId
        ? `UPDATE coupons SET priority = priority + 1 WHERE priority >= $1 AND id != $2 ORDER BY priority DESC`
        : `UPDATE coupons SET priority = priority + 1 WHERE priority >= $1 ORDER BY priority DESC`

    const values = excludeId ? [priority, excludeId] : [priority]

    await db.query(shiftQuery, values)
}