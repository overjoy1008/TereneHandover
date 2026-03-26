import * as React from "react"
import { useStore } from "../../Calendar/MonthDisplay.tsx"

export default function CouponTable() {
    const [store] = useStore()
    const [coupons, setCoupons] = React.useState<any[]>([])
    const [filter, setFilter] = React.useState<
        "all" | "available" | "used" | "expired"
    >("all")

    React.useEffect(() => {
        const fetchData = async () => {
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

                // 정렬 우선순위 매핑
                const STATUS_ORDER: Record<string, number> = {
                    available: 0,
                    used: 1,
                    expired: 2,
                    disabled: 3,
                }

                // 이름 그룹 랭크: (기타=0) → 평일=1 → 주말=2 → 성수기=3
                function nameRank(name?: string) {
                    const n = name ?? ""
                    const isMember = n.includes("_TERENE 회원 할인") // 조건에 명시된 문구
                    if (isMember && n.includes("평일")) return 1
                    if (isMember && n.includes("주말")) return 2
                    if (isMember && n.includes("성수기")) return 3
                    return 0 // 그 외(기타)
                }

                // 타이브레이커: issued_at 최신 우선
                function issuedDesc(a?: string, b?: string) {
                    const at = a ? new Date(a).getTime() : 0
                    const bt = b ? new Date(b).getTime() : 0
                    return bt - at
                }

                const myCoupons = insts
                    .filter(
                        (c) => c.membership_number === store.membership_number
                    )
                    .map((inst) => {
                        const def = defs.find(
                            (d) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return {
                            ...inst,
                            name: def?.name || "이름 없음",
                            description: def?.description || "",
                        }
                    })
                    .sort((a, b) => {
                        // 1) status 순서
                        const sa = STATUS_ORDER[a.status] ?? 99
                        const sb = STATUS_ORDER[b.status] ?? 99
                        if (sa !== sb) return sa - sb

                        // 2) 같은 status면 이름 그룹 순서
                        const na = nameRank(a.name)
                        const nb = nameRank(b.name)
                        if (na !== nb) return na - nb

                        // 3) 같은 그룹이면 최신 발급일 우선
                        return issuedDesc(a.issued_at, b.issued_at)
                    })

                setCoupons(myCoupons)
            } catch (err) {
                console.error("쿠폰 불러오기 실패", err)
            }
        }

        if (store.membership_number) fetchData()
    }, [store.membership_number])

    const getKSTDate = () => {
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        return new Date(utc + 9 * 60 * 60 * 1000)
    }

    const calcDDay = (target: string) => {
        if (!target) return ""
        const today = getKSTDate()
        const targetDate = new Date(target)
        const diff = Math.floor(
            (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
    }

    const formatDate = (d: string) => {
        const date = new Date(d)
        return date.toISOString().split("T")[0]
    }

    const tabs = [
        { key: "all", label: "전체 쿠폰" },
        { key: "available", label: "적립 쿠폰" },
        { key: "used", label: "사용 쿠폰" },
        { key: "expired", label: "소멸 쿠폰" },
    ]

    const statusText = {
        available: "사용 가능",
        used: "사용 완료",
        expired: "기간 만료",
        disabled: "비활성 쿠폰",
    }

    const filtered =
        filter === "all"
            ? coupons
            : coupons.filter((c) =>
                  filter === "expired"
                      ? ["expired", "disabled"].includes(c.status)
                      : c.status === filter
              )

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    height: 45,
                    paddingBottom: 10,
                    fontFamily: "Pretendard Medium",
                    fontSize: 18,
                    letterSpacing: "0.2em",
                    lineHeight: "1.8em",
                }}
            >
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            cursor: "pointer",
                            color: filter === tab.key ? "#000" : "#6e6e6e",
                            borderBottom:
                                filter === tab.key ? "2px solid #000" : "none",
                            paddingBottom: 2,
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* CONTENT */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {filtered.map((c, i) => {
                    const due = c.coupon_due
                    const dDay = due ? calcDDay(due) : ""
                    const dueStr = due ? formatDate(due) : ""
                    const usedDate = c.used_timestamp
                        ? formatDate(c.used_timestamp)
                        : ""

                    return (
                        <div
                            key={c.coupon_instance_id || i}
                            style={{
                                width: "calc(50% - 10px)",
                                height: 200,
                                padding: 30,
                                backgroundColor: "#e6e6e6",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                borderRadius: 4,
                                opacity: c.status === "available" ? 1 : 0.5,
                            }}
                        >
                            {/* content-wrapper */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                {/* name + status 줄 */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "Ariana Pro Medium",
                                            fontSize: 20,
                                            color: "#000000",
                                            letterSpacing: "0.2em",
                                            lineHeight: "1.8em",
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "Pretendard Medium",
                                            fontSize: 12,
                                            color: "#000000",
                                            letterSpacing: "0em",
                                            lineHeight: "1.8em",
                                        }}
                                    >
                                        {statusText[c.status]}
                                    </div>
                                </div>

                                {/* description 줄 */}
                                <div
                                    style={{
                                        fontFamily: "Pretendard SemiBold",
                                        fontSize: 14,
                                        color: "#888888",
                                        letterSpacing: "0em",
                                        lineHeight: "1.8em",
                                    }}
                                >
                                    {c.description}
                                </div>
                            </div>

                            {/* D-Day 또는 예약 번호 + 날짜 줄 */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                {c.status === "used" ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                                fontSize: 13,
                                                color: "#888888",
                                                letterSpacing: "0em",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            예약 번호: {c.order_id || "없음"}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "Pretendard Medium",
                                                fontSize: 12,
                                                color: "#6e6e6e",
                                                letterSpacing: "0em",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            사용 일자:{" "}
                                            {usedDate || "알 수 없음"}
                                        </div>
                                    </div>
                                ) : due ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                                fontSize: 13,
                                                color: "#888888",
                                                letterSpacing: "0em",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {dDay}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "Pretendard Medium",
                                                fontSize: 12,
                                                color: "#6e6e6e",
                                                letterSpacing: "0em",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {dueStr}까지
                                        </div>
                                    </div>
                                ) : null}

                                {/* coupon code 표시 */}
                                {c.coupon_code && c.status === "available" && (
                                    <div
                                        style={{
                                            fontFamily: "Pretendard Semibold",
                                            fontSize: 12,
                                            color: "#000000",
                                            letterSpacing: "0em",
                                            lineHeight: "1.8em",
                                        }}
                                    >
                                        쿠폰 코드: {c.coupon_code}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
