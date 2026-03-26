
// DiscountEngine.ts
export type Membership =
    | "Non-Member"
    | "UNMU 6"
    | "UNMU 9"
    | "UNMU 12"
    | "UNMU 24"
    | "TERENE 6"
    | "TERENE 9"
    | "TERENE 12"
    | "TERENE 24"
    | "All-Free"

export type Category = string

export interface DiscountContext {
    date: Date
    price: number
    category: Category
    membership: Membership
    signupDate?: Date
    isMultiDay?: boolean
    membershipNumber?: string
    enteredCode?: string
}

export type Condition = (ctx: DiscountContext) => boolean
export type ApplyDiscount = (price: number) => number

export interface DiscountCoupon {
    // Definition fields
    coupon_definition_id: string // coupon_definition_id
    name: string
    description: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    scope: number // e.g. 1, 2, -1
    counter: number
    type: "global" | "membership" | "code"
    conditions_json?: any[] // raw JSON array
    validity_value: string
    refillable: boolean
    enabled: boolean

    // Instance fields (only for 'code' coupons)
    coupon_instance_id?: string // coupon_instance_id
    coupon_code?: string // coupon_code
    status?: "available" | "used" | "expired" | "disabled"
    issued_at?: Date
    coupon_due?: Date // coupon_due
    membership_number?: string // coupon 소유자의 멤버십 번호
}
