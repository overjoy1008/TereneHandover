import * as service from "../services/order.service.js"

export const getAllOrders = async (req, res) => {
    try {
        const data = await service.getOrders()
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const insertOrder = async (req, res) => {
    try {
        const order = req.body
        const requiredFields = [
            "order_id", "order_product", "start_date", "end_date",
            "reserver_name", "reserver_birthdate", "reserver_contact",
            "reserver_email", "payment_status", "payment_timeline",
            "stay_status", "stay_timeline", "adult", "child",
            "order_details", "final_price", "receipt"
        ]
        const missingFields = requiredFields.filter(f =>
            order[f] === undefined || order[f] === null
        )

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing fields: ${missingFields.join(", ")}` })
        }

        await service.addOrder(order)
        res.status(201).json({ message: "Order inserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const order_id = req.params.id
        await service.removeOrder(order_id)
        res.status(200).json({ message: `Deleted order ${order_id}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const upsertOrder = async (req, res) => {
    try {
        const order_id = req.params.id
        const order = { ...req.body, order_id }
        await service.addOrder(order)
        res.status(200).json({ message: "Order upserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
