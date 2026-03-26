import db from "../models/db.js"

export async function getCustomers() {
    const result = await db.query("SELECT * FROM customers ORDER BY membership_number ASC")
    return result.rows
}

export async function addCustomer(customer) {
    // 자동 변환 처리
    const owned_mileage = typeof customer.owned_mileage === "string"
        ? parseFloat(customer.owned_mileage)
        : customer.owned_mileage ?? 0

    const used_coupons = Array.isArray(customer.used_coupons)
        ? customer.used_coupons
        : typeof customer.used_coupons === "string"
            ? customer.used_coupons.split(",").map(s => s.trim())
            : []

    const remarks = Array.isArray(customer.remarks)
        ? customer.remarks
        : typeof customer.remarks === "string"
            ? customer.remarks.split(",").map(s => s.trim())
            : []

    const query = `
        INSERT INTO customers (
            membership_number, id, password,
            name_kor, name_eng, is_personal, birthdate, gender,
            business_registration_number,
            contact_person_name, contact_person_phone,
            address, phone, email,
            membership_grade,
            owned_mileage, signup_date, used_coupons, remarks
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6, $7, $8,
            $9,
            $10, $11,
            $12, $13, $14,
            $15,
            $16, $17, $18, $19
        )
        ON CONFLICT (membership_number) DO UPDATE SET
            id = EXCLUDED.id,
            password = EXCLUDED.password,
            name_kor = EXCLUDED.name_kor,
            name_eng = EXCLUDED.name_eng,
            is_personal = EXCLUDED.is_personal,
            birthdate = EXCLUDED.birthdate,
            gender = EXCLUDED.gender,
            business_registration_number = EXCLUDED.business_registration_number,
            contact_person_name = EXCLUDED.contact_person_name,
            contact_person_phone = EXCLUDED.contact_person_phone,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            membership_grade = EXCLUDED.membership_grade,
            owned_mileage = EXCLUDED.owned_mileage,
            signup_date = EXCLUDED.signup_date,
            used_coupons = EXCLUDED.used_coupons,
            remarks = EXCLUDED.remarks
    `

    const values = [
        customer.membership_number, customer.id, customer.password,
        customer.name_kor, customer.name_eng, customer.is_personal,
        customer.birthdate, customer.gender,
        customer.business_registration_number,
        customer.contact_person_name, customer.contact_person_phone,
        customer.address, customer.phone, customer.email,
        customer.membership_grade,
        owned_mileage, customer.signup_date,
        used_coupons, remarks
    ]

    await db.query(query, values)
}

export async function removeCustomer(membership_number) {
    await db.query("DELETE FROM customers WHERE membership_number = $1", [membership_number])
}
