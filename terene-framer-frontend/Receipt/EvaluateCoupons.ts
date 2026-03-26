
// EvaluateCoupons.ts
// UNDER CONSTRUCTION /////////////////////////////////////
import { unmuDayLimits } from "../Calendar/UnmuMembership_1231.tsx"

import { Category, DiscountContext, DiscountCoupon } from "./DiscountEngine.ts"

interface StoreInput {
    firstDate: { year: number; month: number; day: number }
    secondDate: { year: number; month: number; day: number }
    membership: string
    phase?: string
    signup_date?: string
    revisit?: string
    signupDate?: string
    isMultiDay?: boolean
    membership_number?: string
    enteredCouponCode?: string[]
    usedMileage?: number
    remarks?: string[]
    membershipCouponByDate?: Record<
        string,
        {
            coupon_instance_id: string
            name?: string
            date: string
            definition?: any
        }
    >
}

export interface CategoryMap {
    [date: string]: Category
}

interface DailyPriceItem {
    date: string
    price: number
    category: Category
}

interface EvaluatedCoupon {
    id: string
    name: string
    description: string
    amount: number
}

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function toDate(obj: { year: number; month: number; day: number }) {
    return new Date(obj.year, obj.month, obj.day)
}

function getKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Step 1: Initial price 계산
export function calculateInitialPrices(
    store: StoreInput,
    categoryMap: Record<string, string>,
    categoryDefs: Record<string, { unmu_price: number }>,
    firstDate?,
    secondDate?
): { initialPrice: number; dailyItems: DailyPriceItem[] } {
    let first = null
    let second = null

    if (firstDate && secondDate) {
        first = toDate(firstDate)
        second = new Date(toDate(secondDate))
    } else {
        first = toDate(store.firstDate)
        second = new Date(toDate(store.secondDate))
    }

    second.setDate(second.getDate() - 1) // 퇴실일은 계산에 포함 X

    const dailyItems: DailyPriceItem[] = []
    const basePrices: number[] = []

    const categoryCount: Record<string, number> = {
        Weekday: 0,
        Weekend: 0,
        Peak: 0,
    }

    // UNDER CONSTRUCTION /////////////////////////////////////
    const isUnmu = [
        "UNMU 6",
        "UNMU 9",
        "UNMU 12",
        "UNMU 24",
        "TERENE 6",
        "TERENE 9",
        "TERENE 12",
        "TERENE 24",
    ].includes(store.membership)

    for (let d = new Date(first); d <= second; d.setDate(d.getDate() + 1)) {
        const key = getKey(d)
        const category = (categoryMap[key] ?? "Weekday") as Category

        const def = categoryDefs[category]
        if (!def) {
            console.warn("[calculateInitialPrices] unknown category:", category)
            continue
        }

        const basePrice = Number(def.unmu_price)

        basePrices.push(basePrice)

        let price: number

        if (store.membership === "Non-Member") {
            price = basePrice
        } else if (isUnmu) {
            const limits =
                unmuDayLimits[store.membership as keyof typeof unmuDayLimits]

            let categoryKey: keyof typeof categoryCount = "Weekday"
            if (category === "Weekend") categoryKey = "Weekend"
            else if (category === "Peak-Weekday" || category === "Peak-Weekend")
                categoryKey = "Peak"

            const current = categoryCount[categoryKey]
            const allowed = limits[categoryKey]

            if (current < allowed) {
                price = Math.round(basePrice * 1)
            } else {
                price = Math.round(basePrice * 1) // 1.4였는데, 멤버쉽이 쿠폰화되면서 이부분은 아얘 폐지되는게 맞다고 생각함
            }

            categoryCount[categoryKey] += 1
        } else {
            // 'All-Free' case
            price = 0
        }

        dailyItems.push({ date: key, price, category })
    }

    // initialPrice는 basePrice만 더해서 계산
    const initialPrice = basePrices.reduce((acc, val) => acc + val, 0)

    return { initialPrice, dailyItems }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function filterCoupons(
    coupons: DiscountCoupon[],
    store: StoreInput,
    dailyItems: DailyPriceItem[]
): {
    passedPrimaryCoupons: DiscountCoupon[]
    passedSecondaryCoupons: DiscountCoupon[]
} {
    const { enteredCouponCode, signupDate } = store
    const totalPrice = dailyItems.reduce((acc, i) => acc + i.price, 0)
    const stayLength = dailyItems.length
    const stayDates = dailyItems.map((i) => i.date)
    const allCategories = new Set(dailyItems.map((i) => i.category))

    const now = getKSTDate()

    function kstEndOfDayFromYMD(ymd: string) {
        const [y, m, d] = ymd.split("-").map((v) => Number(v))
        return new Date(Date.UTC(y, m - 1, d, 14, 59, 59, 999)) // KST(UTC+9) 23:59:59.999
    }

    // const codes = coupons
    //     .filter((c) => c.coupon_code && c.coupon_code[0] == "H") // code 필드가 존재하는 쿠폰만
    //     .map((c) => c.coupon_code as string) // 문자열로 추출

    const passedCoupons = coupons.filter((c) => {
        if (!c.enabled) return false

        if (
            c.type === "code" &&
            (!enteredCouponCode || !enteredCouponCode.includes(c.coupon_code))
        ) {
            // if (enteredCouponCode.length > 0 && c.coupon_code.includes("H8"))
            //     alert(
            //         `A-1) entered: ${JSON.stringify(enteredCouponCode)}\nc.coupon_code: ${c.coupon_code}\n일치여부: ${enteredCouponCode.includes(c.coupon_code)}`
            //     )
            return false
        }

        // // Check if validity_value (YYYY-MM-DD) is expired
        // if (c.validity_value) {
        //     const validityDate = new Date(`${c.validity_value}T00:00:00+09:00`) // KST
        //     // console.log(JSON.stringify(validityDate))
        //     // console.log(now)
        //     // console.log(validityDate < now)
        //     if (validityDate < now) {
        //         if (
        //             enteredCouponCode.length > 0 &&
        //             c.coupon_code.includes("H8")
        //         )
        //             alert(`A-3`)
        //         return false
        //     }
        // }

        if (c.validity_value) {
            const validityDate = kstEndOfDayFromYMD(c.validity_value)
            if (now.getTime() > validityDate.getTime()) {
                // if (
                //     (enteredCouponCode?.length ?? 0) > 0 &&
                //     c.coupon_code?.includes("H8")
                // )
                //     alert(`A-3`)
                return false
            }
        }

        // Check if coupon_due (full ISO datetime) is expired
        if (c.coupon_due) {
            const dueDate = new Date(c.coupon_due)
            if (dueDate < now) {
                // if (
                //     enteredCouponCode.length > 0 &&
                //     c.coupon_code.includes("H8")
                // )
                //     alert(`A-4`)
                return false
            }
        }

        const conditions = Array.isArray(c.conditions_json)
            ? c.conditions_json
            : []

        for (const cond of conditions) {
            if (
                cond.type === "membership" &&
                !cond.members.includes(store.membership)
            ) {
                return false
            }

            if (cond.type === "phase") {
                // 1단계: phase 조건이 맞는지 확인
                if (!cond.phases.includes(store.phase)) {
                    return false
                }
            }

            if (cond.type === "revisit" && !cond.days.includes(store.revisit)) {
                return false
            }

            if (
                cond.type === "minimum_price" &&
                totalPrice < Number(cond.min ?? 0)
            ) {
                return false
            }
            if (cond.type === "relay") {
                if (stayLength < (Number(cond.min) ?? 0)) return false
                if (cond.max && stayLength > Number(cond.max)) return false
            }
            if (cond.type === "date") {
                const start = cond.startDate
                    ? getKSTDate(new Date(cond.startDate))
                    : null
                const end = cond.endDate
                    ? getKSTDate(new Date(cond.endDate))
                    : null
                const matched = stayDates.some((d) => {
                    const date = getKSTDate(new Date(d))
                    return (!start || date >= start) && (!end || date <= end)
                })
                if (!matched) {
                    return false
                }
            }
            if (cond.type === "seasonal") {
                const allowed = new Set(cond.allowedCategories || [])
                const matched = [...allCategories].some((c) => allowed.has(c))
                if (!matched) return false
            }
        }

        return true
    })

    // if (enteredCouponCode && enteredCouponCode.length > 0)
    //     alert(
    //         `A-2) entered: ${enteredCouponCode}\nexisting: ${codes}\npassed: ${JSON.stringify(passedCoupons)}`
    //     )

    return {
        passedPrimaryCoupons: passedCoupons.filter(
            (c) => c.discount_type === "percentage" && c.type === "global"
        ),
        passedSecondaryCoupons: passedCoupons.filter(
            (c) =>
                (c.discount_type === "percentage" && c.type === "code") ||
                c.discount_type === "fixed"
        ),
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function evaluateCoupons(
    primaryCoupons: DiscountCoupon[],
    secondaryCoupons: DiscountCoupon[],
    dailyItems: DailyPriceItem[],
    store?: StoreInput
): {
    primaryDiscountedPrice: number
    secondaryDiscountedPrice: number
    primaryDetails: EvaluatedCoupon[]
    secondaryDetails: EvaluatedCoupon[]
} {
    const totalPrice = dailyItems.reduce((sum, d) => sum + d.price, 0)
    // console.log(`total price: ${totalPrice}`)
    const ignoredCodeCoupons: string[] = []

    if (store?.membership === "All-Free") {
        const id = "all-free"
        const baseCoupon = {
            id,
            name: id,
            description: id,
            amount: totalPrice,
        }
        return {
            primaryDiscountedPrice: 0,
            secondaryDiscountedPrice: 0,
            primaryDetails: [baseCoupon],
            secondaryDetails: [],
        }
    }

    let primaryTotalDiscount = 0
    let secondaryTotalDiscount = 0

    const primaryDetailsMap1 = new Map<string, EvaluatedCoupon>() // Step 1
    const primaryDetailsMap2 = new Map<string, EvaluatedCoupon>() // Step 2
    const secondaryDetailsMap = new Map<string, EvaluatedCoupon>()

    const couponRemainingScope = new Map<string, number>()
    for (const c of [...primaryCoupons, ...secondaryCoupons]) {
        const scope = c.scope ?? -1
        couponRemainingScope.set(
            c.coupon_instance_id || c.coupon_definition_id,
            scope
        )
    }

    for (let i = 0; i < dailyItems.length; i++) {
        const day = dailyItems[i]
        // console.log(JSON.stringify(day))
        const originalPrice = day.price
        let primaryDiscountedPrice = originalPrice
        const dateStr = day.date

        // === Step 1: Primary Coupons ===
        for (const coupon of primaryCoupons) {
            if (coupon.discount_type !== "percentage") continue

            const couponId =
                coupon.coupon_instance_id || coupon.coupon_definition_id
            const remainingScope = couponRemainingScope.get(couponId)
            if (remainingScope === 0) continue

            const conditions = Array.isArray(coupon.conditions_json)
                ? coupon.conditions_json
                : []

            let skipCoupon = false

            for (const cond of conditions) {
                // Phase 조건 로직
                if (cond.type === "phase") {
                    if (!cond.phases.includes(store?.phase)) {
                        skipCoupon = true
                        break
                    }

                    // Phase-1이면 signup_date로부터 1년 지난 경우 skip
                    if (
                        store?.phase === "Phase-1" &&
                        store.signup_date &&
                        day.date // 현재 날짜 문자열
                    ) {
                        const signupDate = new Date(
                            `${store.signup_date}T00:00:00+09:00`
                        )
                        const oneYearLater = new Date(signupDate)
                        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
                        const currentDate = getKSTDate(new Date(day.date))

                        if (currentDate > oneYearLater) {
                            skipCoupon = true
                            break
                        }
                    }
                }

                if (cond.type === "relay" && i === 0) {
                    skipCoupon = true
                    break
                }

                if (cond.type === "seasonal") {
                    const allowed = new Set(cond.allowedCategories || [])
                    if (!allowed.has(day.category)) {
                        skipCoupon = true
                        break
                    }
                }

                if (cond.type === "date") {
                    const start = cond.startDate
                        ? getKSTDate(new Date(cond.startDate))
                        : null
                    const end = cond.endDate
                        ? getKSTDate(new Date(cond.endDate))
                        : null
                    const current = getKSTDate(new Date(dateStr))
                    if ((start && current < start) || (end && current > end)) {
                        skipCoupon = true
                        break
                    }
                }
            }

            if (skipCoupon) continue

            const discountValue = Number(coupon.discount_value)
            let max_amount = Infinity
            for (const cond of conditions) {
                if (cond.type === "applied_discount" && cond.max) {
                    max_amount = Number(cond.max)
                }
            }

            let amount = Math.min(
                Math.round(originalPrice * (discountValue / 100)),
                max_amount
            )
            // console.log(
            //     `[Primary][${dateStr}] Coupon: ${coupon.name} (${couponId}), Original Price: ${originalPrice}, Discount Value: ${discountValue}, Max Amount: ${max_amount}, Amount: ${amount}`
            // )
            if (primaryDiscountedPrice < amount) amount = primaryDiscountedPrice

            if (amount > 0) {
                primaryDiscountedPrice -= amount
                primaryTotalDiscount += amount

                const existing = primaryDetailsMap1.get(couponId)
                if (existing) existing.amount += amount
                else {
                    primaryDetailsMap1.set(couponId, {
                        id: couponId,
                        name: coupon.name,
                        description: coupon.description,
                        amount,
                    })
                }

                if (remainingScope > 0) {
                    couponRemainingScope.set(couponId, remainingScope - 1)
                }
            }
        }

        // === Step 2: Membership Coupon ===
        const membershipCoupon = store?.membershipCouponByDate?.[dateStr]
        const def = membershipCoupon?.definition
        if (membershipCoupon && def) {
            const discountValue = Number(def.discount_value)
            let amount = 0
            if (def.discount_type === "percentage") {
                amount = Math.round(
                    primaryDiscountedPrice * (discountValue / 100)
                )
            } else if (def.discount_type === "fixed") {
                amount = discountValue
            }

            if (primaryDiscountedPrice < amount) amount = primaryDiscountedPrice
            if (amount > 0) {
                primaryDiscountedPrice -= amount
                primaryTotalDiscount += amount

                const id = membershipCoupon.coupon_instance_id
                const existing = primaryDetailsMap2.get(id)
                if (existing) existing.amount += amount
                else {
                    primaryDetailsMap2.set(id, {
                        id,
                        name: membershipCoupon.name ?? id,
                        description: def.description ?? "",
                        amount,
                    })
                }
            }
        }

        let secondaryDiscountedPrice = primaryDiscountedPrice

        // === Step 3: Secondary Coupons (percentage only) ===
        for (const coupon of secondaryCoupons) {
            if (coupon.discount_type !== "percentage") continue

            const couponId =
                coupon.coupon_instance_id || coupon.coupon_definition_id
            const remainingScope = couponRemainingScope.get(couponId)
            if (remainingScope === 0) continue

            const conditions = Array.isArray(coupon.conditions_json)
                ? coupon.conditions_json
                : []

            let skipCoupon = false

            for (const cond of conditions) {
                // Phase 조건 로직
                if (cond.type === "phase") {
                    if (!cond.phases.includes(store?.phase)) {
                        skipCoupon = true
                        break
                    }

                    // Phase-1이면 signup_date로부터 1년 지난 경우 skip
                    if (
                        store?.phase === "Phase-1" &&
                        store.signup_date &&
                        day.date // 현재 날짜 문자열
                    ) {
                        const signupDate = new Date(
                            `${store.signup_date}T00:00:00+09:00`
                        )
                        const oneYearLater = new Date(signupDate)
                        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
                        const currentDate = getKSTDate(new Date(day.date))

                        if (currentDate > oneYearLater) {
                            skipCoupon = true
                            break
                        }
                    }
                }

                if (cond.type === "relay" && i === 0) {
                    skipCoupon = true
                    break
                }

                if (cond.type === "seasonal") {
                    const allowed = new Set(cond.allowedCategories || [])
                    if (!allowed.has(day.category)) {
                        skipCoupon = true
                        break
                    }
                }

                if (cond.type === "date") {
                    const start = cond.startDate
                        ? getKSTDate(new Date(cond.startDate))
                        : null
                    const end = cond.endDate
                        ? getKSTDate(new Date(cond.endDate))
                        : null
                    const current = getKSTDate(new Date(dateStr))
                    if ((start && current < start) || (end && current > end)) {
                        skipCoupon = true
                        break
                    }
                }
            }

            if (skipCoupon) continue

            const discountValue = Number(coupon.discount_value)
            let max_amount = Infinity
            for (const cond of conditions) {
                if (cond.type === "applied_discount" && cond.max) {
                    max_amount = Number(cond.max)
                }
            }

            let amount = Math.min(
                Math.round(primaryDiscountedPrice * (discountValue / 100)),
                max_amount
            )
            if (secondaryDiscountedPrice < amount)
                amount = secondaryDiscountedPrice

            if (amount > 0) {
                secondaryDiscountedPrice -= amount
                secondaryTotalDiscount += amount

                const existing = secondaryDetailsMap.get(couponId)
                if (existing) existing.amount += amount
                else {
                    secondaryDetailsMap.set(couponId, {
                        id: couponId,
                        name: coupon.name,
                        description: coupon.description,
                        amount,
                    })
                }

                if (remainingScope > 0) {
                    couponRemainingScope.set(couponId, remainingScope - 1)
                }
            }
        }
    }

    const primaryDiscountedPrice = totalPrice - primaryTotalDiscount

    // === Step 4: Remaining secondary coupons ===
    for (const coupon of secondaryCoupons) {
        if (coupon.discount_type !== "fixed") continue
        const couponId =
            coupon.coupon_instance_id || coupon.coupon_definition_id
        if (secondaryDetailsMap.has(couponId)) continue

        const discountValue = Number(coupon.discount_value)
        const amount = Math.min(
            discountValue,
            primaryDiscountedPrice - secondaryTotalDiscount
        )
        secondaryTotalDiscount += amount

        secondaryDetailsMap.set(couponId, {
            id: couponId,
            name: coupon.name,
            description: coupon.description,
            amount,
        })
    }

    {
        const mileage = Math.max(0, Math.floor(Number(store?.usedMileage ?? 0)))
        if (mileage > 0) {
            const remaining = Math.max(
                0,
                primaryDiscountedPrice - secondaryTotalDiscount
            )
            const applied = Math.min(mileage, remaining)

            if (applied > 0) {
                secondaryTotalDiscount += applied
                secondaryDetailsMap.set(`MI-${mileage}`, {
                    id: `MI-${mileage}`,
                    name: `마일리지 ${mileage.toLocaleString()}p`,
                    description: `마일리지 ${mileage.toLocaleString()}p`,
                    amount: applied,
                })
            }
        }
    }

    const primaryDetails = [
        ...primaryDetailsMap1.values(),
        ...primaryDetailsMap2.values(),
    ]

    // console.log(JSON.stringify(primaryDetails))

    const secondaryDiscountedPrice =
        primaryDiscountedPrice - secondaryTotalDiscount

    return {
        primaryDiscountedPrice,
        secondaryDiscountedPrice,
        primaryDetails: primaryDetails,
        secondaryDetails: Array.from(secondaryDetailsMap.values()),
    }
}
