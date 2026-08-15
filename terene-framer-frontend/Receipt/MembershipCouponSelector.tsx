
// MembershipCouponSelector.tsx
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"
import { useHolidayCategoryMap, toCategoryMap } from "./PriceDisplay.tsx"
import { getReservationSettings } from "../Api/reservations.ts"

function parseDateParam(param: string): Date {
    const [year, month, day] = param.split("-").map(Number)
    return new Date(year, month - 1, day)
}

function getDateRange(start: Date, end: Date): Date[] {
    const range: Date[] = []
    const cur = new Date(start)
    while (cur < end) {
        range.push(new Date(cur))
        cur.setDate(cur.getDate() + 1)
    }
    return range
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("sv-SE")
}

type Category = "Weekday" | "Weekend" | "Peak-Weekday" | "Peak-Weekend"

export default function MembershipCouponSelector() {
    const [store, setStore] = useStore()
    const [dates, setDates] = React.useState<Date[]>([])
    const [applicableCoupons, setApplicableCoupons] = React.useState<any[]>([])
    const [selectedCoupons, setSelectedCoupons] = React.useState<
        Record<string, string>
    >({})

    const [excessDiscountRate, setExcessDiscountRate] =
        React.useState<number>(0)

    const { categories: rawCategoryMap, isLoading: isCategoryLoading } =
        useHolidayCategoryMap()
    const categoryMap = React.useMemo(
        () => toCategoryMap(rawCategoryMap),
        [rawCategoryMap]
    )

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const firstParam = params.get("first")
        const secondParam = params.get("second")

        if (firstParam && secondParam) {
            const start = parseDateParam(firstParam)
            const end = parseDateParam(secondParam)
            setDates(getDateRange(start, end))
        }
    }, [])

    React.useEffect(() => {
        const fetchCoupons = async () => {
            if (!store.membership_number || !store.membership) return

            try {
                const [defRes, instRes] = await Promise.all([
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-definitions"
                    ),
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    ),
                ])

                const defs = await defRes.json()
                const insts = await instRes.json()

                const membershipDefs = defs.filter(
                    (d: any) => d.type === "membership"
                )

                const myCoupons = insts
                    .filter(
                        (c: any) =>
                            c.membership_number === store.membership_number
                    )
                    .filter((c: any) => c.status === "available")
                    .map((inst: any) => {
                        const def = membershipDefs.find(
                            (d: any) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return def ? { ...inst, definition: def } : null
                    })
                    .filter(Boolean)

                setApplicableCoupons(myCoupons)
            } catch (err) {
                console.error("쿠폰 데이터 불러오기 실패", err)
            }
        }

        fetchCoupons()
    }, [store.membership_number, store.membership])

    React.useEffect(() => {
        getReservationSettings()
            .then((res) => res.json())
            .then((data) => {
                const excess = data.find(
                    (s: any) => s.id === "ExcessDiscountRate"
                )

                const rate = Number(excess?.numeric_setting)

                if (Number.isFinite(rate) && rate >= 0 && rate <= 100) {
                    setExcessDiscountRate(rate)
                } else {
                    setExcessDiscountRate(25) // 예외 처리 - 잘못된 입력값
                }
            })
            .catch((error) => {
                setExcessDiscountRate(25) // 예외 처리 - v3/settings 서버 터짐
                console.error(error)
            })
    }, [])

    const getAllowedCategories = (couponName: string): Category[] => {
        if (couponName.includes("성수기"))
            return ["Weekday", "Weekend", "Peak-Weekday", "Peak-Weekend"]
        if (couponName.includes("주말")) return ["Weekday", "Weekend"]
        if (couponName.includes("평일")) return ["Weekday"]
        return ["Weekday"]
    }

    const getCouponPriority = (couponName: string): number => {
        if (couponName.includes("초과사용일")) return 3
        if (couponName.includes("평일")) return 0
        if (couponName.includes("주말")) return 1
        if (couponName.includes("성수기")) return 2
        return 99
    }

    const handleSelect = (
        dateStr: string,
        couponId: string,
        index?: number
    ) => {
        console.log(`[쿠폰 선택됨] 날짜: ${dateStr}, 쿠폰 ID: ${couponId}`)

        setSelectedCoupons((prev) => {
            const newSelected = { ...prev, [dateStr]: couponId }

            const membershipCouponByDate = Object.fromEntries(
                Object.entries(newSelected)
                    .filter(([_, id]) => !!id)
                    .map(([date, id], idx) => {
                        // 초과사용일 쿠폰에 대해 날짜별 고유 ID 부여
                        if (id === "CI-250801-0000-extra025") {
                            const uniqueId = `CI-250801-0000-extra${String(idx + 1).padStart(3, "0")}`
                            return [
                                date,
                                {
                                    coupon_instance_id: uniqueId,
                                    name: "초과사용일 _TERENE 회원 할인",
                                    date,
                                    definition: {
                                        coupon_definition_id:
                                            "CD-250801-0000-extra025",
                                        name: "초과사용일 _TERENE 회원 할인",
                                        description: `초과사용일 _TERENE 회원 ${excessDiscountRate}% 할인`,
                                        discount_type: "percentage",
                                        discount_value:
                                            String(excessDiscountRate),
                                        scope: 1,
                                        counter: -1,
                                        type: "membership",
                                        conditions_json: null,
                                        validity_type: "permanent",
                                        validity_value: null,
                                        refillable: true,
                                        enabled: true,
                                    },
                                },
                            ]
                        }

                        const matched = applicableCoupons.find(
                            (c) => c.coupon_instance_id === id
                        )

                        return matched
                            ? [
                                  date,
                                  {
                                      coupon_instance_id:
                                          matched.coupon_instance_id,
                                      name:
                                          matched.definition?.name ||
                                          "이름 없음",
                                      date,
                                      definition: matched.definition,
                                  },
                              ]
                            : null
                    })
                    .filter((entry) => !!entry)
            )

            setStore((prev) => ({
                ...prev,
                membershipCouponByDate,
            }))

            return newSelected
        })
    }

    React.useEffect(() => {
        if (dates.length === 0 || Object.keys(categoryMap).length === 0) return

        const usedCouponIds = new Set<string>()

        const autoSelect = () => {
            dates.forEach((date, index) => {
                const dateStr = formatDate(date)
                const category = categoryMap[dateStr]
                if (!category) return

                const allowedCoupons = applicableCoupons
                    .filter((coupon) => {
                        const allowed = getAllowedCategories(
                            coupon.definition?.name || ""
                        )
                        return allowed.includes(category)
                    })
                    .filter(
                        (coupon) =>
                            !usedCouponIds.has(coupon.coupon_instance_id)
                    )

                allowedCoupons.sort(
                    (a, b) =>
                        getCouponPriority(a.definition?.name || "") -
                        getCouponPriority(b.definition?.name || "")
                )

                const bestCoupon = allowedCoupons[0]

                if (bestCoupon) {
                    handleSelect(dateStr, bestCoupon.coupon_instance_id)
                    usedCouponIds.add(bestCoupon.coupon_instance_id)
                } else {
                    // 중복 허용용 초과사용일 쿠폰
                    handleSelect(dateStr, "CI-250801-0000-extra025", index)
                }
            })
        }

        autoSelect()
    }, [dates, categoryMap, applicableCoupons])

    if (isCategoryLoading) {
        return (
            <div style={{ padding: 20, color: "#aaa" }}>
                날짜 정보를 불러오는 중입니다...
            </div>
        )
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                minHeight: 120,
            }}
        >
            {dates.length === 0 ? (
                <div style={{ padding: 20, color: "#aaa" }}>
                    날짜를 불러오는 중입니다...
                </div>
            ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {dates.map((date, idx) => {
                        const dateStr = formatDate(date)
                        const category = categoryMap[dateStr]
                        const selectedSet = new Set(
                            Object.values(selectedCoupons).filter(
                                (id) => id && selectedCoupons[dateStr] !== id
                            )
                        )

                        return (
                            <div
                                key={idx}
                                style={{
                                    flex: 1,
                                    minWidth: 130,
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                    padding: 10,
                                    textAlign: "center",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    {dateStr}
                                </div>
                                <div style={{ fontSize: 12, color: "#666" }}>
                                    ({category || "정보 없음"})
                                </div>
                                <select
                                    value={selectedCoupons[dateStr] || ""}
                                    onChange={(e) =>
                                        handleSelect(
                                            dateStr,
                                            e.target.value,
                                            idx
                                        )
                                    }
                                    style={{
                                        width: "100%",
                                        marginTop: 10,
                                        padding: 6,
                                        fontSize: 12,
                                    }}
                                >
                                    <option value="CI-250801-0000-extra025">
                                        초과사용일 _TERENE 회원 할인
                                    </option>
                                    {applicableCoupons.map((coupon) => {
                                        const allowedCategories =
                                            getAllowedCategories(
                                                coupon.definition?.name || ""
                                            )
                                        const isDisabled =
                                            selectedSet.has(
                                                coupon.coupon_instance_id
                                            ) ||
                                            !allowedCategories.includes(
                                                category
                                            )

                                        return (
                                            <option
                                                key={coupon.coupon_instance_id}
                                                value={
                                                    coupon.coupon_instance_id
                                                }
                                                disabled={isDisabled}
                                            >
                                                {coupon.definition?.name ||
                                                    "이름 없음"}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
