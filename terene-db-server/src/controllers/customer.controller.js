import * as service from "../services/customer.service.js"

export const getAllCustomers = async (req, res) => {
    try {
        const data = await service.getCustomers()
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const insertCustomer = async (req, res) => {
    try {
        const customer = req.body
        if (!customer.membership_number || !customer.id || !customer.password) {
            return res.status(400).json({ error: "Required fields are missing" })
        }
        await service.addCustomer(customer)
        res.status(201).json({ message: "Customer inserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteCustomer = async (req, res) => {
    try {
        const membership_number = req.params.membership_number
        await service.removeCustomer(membership_number)
        res.status(200).json({ message: `Deleted customer ${membership_number}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const upsertCustomer = async (req, res) => {
    try {
        const membership_number = req.params.membership_number
        const customer = { ...req.body, membership_number }
        await service.addCustomer(customer)
        res.status(200).json({ message: "Customer upserted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
