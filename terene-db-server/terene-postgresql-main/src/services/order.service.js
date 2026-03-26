import db from "../models/db.js"

export async function getOrders() {
    const result = await db.query("SELECT * FROM orders ORDER BY start_date DESC")
    return result.rows
}

export async function addOrder(order) {
    const parseJSONField = (field, fieldName) => {
        if (field === undefined || field === null) return {}
        if (typeof field === "string") {
            try {
                return JSON.parse(field)
            } catch (err) {
                throw new Error(`${fieldName} must be valid JSON: ${err.message}`)
            }
        }
        if (typeof field === "object") return field
        throw new Error(`${fieldName} must be a valid object or JSON string`)
    }

    const parseNumeric = (value, fieldName) => {
        const n = parseFloat(value)
        if (isNaN(n)) throw new Error(`${fieldName} must be a number`)
        return n
    }

    const adult = parseNumeric(order.adult, "adult")
    const child = parseNumeric(order.child, "child")
    const finalPrice = parseNumeric(order.final_price, "final_price")

    const paymentTimeline = parseJSONField(order.payment_timeline, "payment_timeline")
    const stayTimeline = parseJSONField(order.stay_timeline, "stay_timeline")
    const orderDetails = parseJSONField(order.order_details, "order_details")
    const receipt = parseJSONField(order.receipt, "receipt")
    const coupons = order.coupons ? parseJSONField(order.coupons, "coupons") : null
    const refundInfo = order.refund_info ? parseJSONField(order.refund_info, "refund_info") : null

    const paymentTimelineJSON = JSON.stringify(paymentTimeline)
    const stayTimelineJSON = JSON.stringify(stayTimeline)
    const orderDetailsJSON = JSON.stringify(orderDetails)
    const receiptJSON = JSON.stringify(receipt)
    const couponsJSON = coupons ? JSON.stringify(coupons) : null
    const refundInfoJSON = refundInfo ? JSON.stringify(refundInfo) : null

    const query = `
        INSERT INTO orders (
            order_id, membership_number, order_product,
            start_date, end_date,
            reserver_name, reserver_birthdate, reserver_contact, reserver_email,
            payment_status, payment_timeline,
            stay_status, stay_timeline,
            adult, child,
            order_details,
            final_price, receipt, coupons, refund_info
        ) VALUES (
            $1, $2, $3,
            $4, $5,
            $6, $7, $8, $9,
            $10, $11::jsonb,
            $12, $13::jsonb,
            $14, $15,
            $16::jsonb,
            $17, $18::jsonb, $19::jsonb, $20::jsonb
        )
        ON CONFLICT (order_id) DO UPDATE SET
            membership_number = EXCLUDED.membership_number,
            order_product = EXCLUDED.order_product,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            reserver_name = EXCLUDED.reserver_name,
            reserver_birthdate = EXCLUDED.reserver_birthdate,
            reserver_contact = EXCLUDED.reserver_contact,
            reserver_email = EXCLUDED.reserver_email,
            payment_status = EXCLUDED.payment_status,
            payment_timeline = EXCLUDED.payment_timeline,
            stay_status = EXCLUDED.stay_status,
            stay_timeline = EXCLUDED.stay_timeline,
            adult = EXCLUDED.adult,
            child = EXCLUDED.child,
            order_details = EXCLUDED.order_details,
            final_price = EXCLUDED.final_price,
            receipt = EXCLUDED.receipt,
            coupons = EXCLUDED.coupons,
            refund_info = EXCLUDED.refund_info
    `

    const values = [
        order.order_id,
        order.membership_number || null,
        order.order_product,
        order.start_date,
        order.end_date,
        order.reserver_name,
        order.reserver_birthdate,
        order.reserver_contact,
        order.reserver_email,
        order.payment_status,
        paymentTimelineJSON,
        order.stay_status,
        stayTimelineJSON,
        adult,
        child,
        orderDetailsJSON,
        finalPrice,
        receiptJSON,
        couponsJSON,
        refundInfoJSON
    ]

    await db.query(query, values)
}

export async function removeOrder(order_id) {
    await db.query("DELETE FROM orders WHERE order_id = $1", [order_id])
}
