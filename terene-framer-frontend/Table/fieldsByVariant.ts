
//fieldsByVariant.ts
export const fieldsByVariant = {
    days: [
        { key: "date", type: "input", isPrimary: true, notNull: true },
        {
            key: "category",
            type: "category",
            options: ["Weekday", "Weekend", "Peak-Weekday", "Peak-Weekend"],
            notNull: true,
        },
        {
            key: "is_holiday",
            type: "category",
            options: ["true", "false"],
            notNull: true,
        },
        {
            key: "checkin",
            type: "input",
            notNull: false,
        },
        {
            key: "checkout",
            type: "input",
            notNull: false,
        },
    ],
    customers: [
        {
            key: "membership_number",
            type: "input",
            isPrimary: true,
            notNull: true,
        },
        { key: "id", type: "input" }, // 과거에는 notNull이었음
        { key: "password", type: "input", notNull: true },
        { key: "name_kor", type: "input" },
        { key: "name_eng", type: "input" },
        {
            key: "is_personal",
            type: "category",
            options: ["true", "false"],
            notNull: true,
        },
        { key: "birthdate", type: "input" },
        {
            key: "gender",
            type: "category",
            options: ["Male", "Female"],
        },
        { key: "business_registration_number", type: "input" },
        { key: "contact_person_name", type: "input" },
        { key: "contact_person_phone", type: "input" },
        { key: "address", type: "input", notNull: true },
        { key: "phone", type: "input", notNull: true },
        { key: "email", type: "input", notNull: true },
        {
            key: "membership_grade",
            type: "category",
            options: [
                "Non-Member",
                "TERENE 6",
                "TERENE 9",
                "TERENE 12",
                "TERENE 24",
                "All-Free",
            ],
            notNull: true,
        },
        {
            key: "phase",
            type: "category",
            options: ["Phase-1", "Phase-2", "Phase-3"],
            notNull: true,
        },
        { key: "signup_date", type: "input" },
        { key: "remarks", type: "input" },
        {
            key: "blacklist",
            type: "category",
            options: ["true", "false"],
        },
    ],
    coupons: [
        {
            key: "coupon_definition_id",
            type: "input",
            isPrimary: true,
            notNull: true,
        },
        { key: "name", type: "input", notNull: true },
        { key: "description", type: "input", notNull: true },
        {
            key: "discount_type",
            type: "category",
            options: ["percentage", "fixed"],
            notNull: true,
        },
        { key: "discount_value", type: "input", notNull: true },
        { key: "exclusive", type: "input", notNull: true },
        { key: "scope", type: "input", notNull: true },
        { key: "counter", type: "input", notNull: true },
        {
            key: "type",
            type: "category",
            options: ["global", "membership", "code"],
            notNull: false,
        },
        { key: "conditions_json", type: "input" },
        {
            key: "validity_type",
            type: "category",
            options: ["day", "week", "month", "year", "custom", "permanent"],
            notNull: true,
        },
        { key: "validity_value", type: "input" },
        {
            key: "refillable",
            type: "category",
            options: ["true", "false"],
            notNull: true,
        },
        {
            key: "enabled",
            type: "category",
            options: ["true", "false"],
            notNull: true,
        },
    ],

    orders: [
        { key: "order_id", type: "input", isPrimary: true, notNull: true },
        { key: "membership_number", type: "input" },
        { key: "order_product", type: "input", notNull: true },
        {
            key: "payment_status",
            type: "category",
            options: ["pending", "accepted", "cancelled", "refunded"],
            notNull: true,
        },
        { key: "payment_timeline", type: "input", notNull: true }, // JSONB
        { key: "start_date", type: "input", notNull: true },
        { key: "end_date", type: "input", notNull: true },
        {
            key: "stay_status",
            type: "category",
            options: ["before_checkin", "checked_in", "checked_out"],
            notNull: true,
        },
        { key: "stay_timeline", type: "input", notNull: true }, // JSONB
        { key: "reserver_name", type: "input" },
        { key: "reserver_birthdate", type: "input" },
        { key: "reserver_contact", type: "input" },
        { key: "reserver_email", type: "input" },
        { key: "adult", type: "input", notNull: true },
        { key: "child", type: "input", notNull: true },
        { key: "order_details", type: "input", notNull: true }, // JSONB
        { key: "final_price", type: "input", notNull: true },
        { key: "receipt", type: "input", notNull: true }, // JSONB
        { key: "coupons", type: "input" }, // JSONB
    ],
}
