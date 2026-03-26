import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useStore } from "../../Store/MainStore.tsx"

type ViewMode = "desktop" | "tablet" | "mobile"

export default function CouponTable({
    viewMode = "desktop",
}: {
    viewMode?: ViewMode
}) {
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

                const STATUS_ORDER: Record<string, number> = {
                    available: 0,
                    used: 1,
                    expired: 2,
                    disabled: 3,
                }

                function nameRank(name?: string) {
                    const n = name ?? ""
                    const isMember = n.includes("_TERENE 회원 할인")
                    if (isMember && n.includes("평일")) return 1
                    if (isMember && n.includes("주말")) return 2
                    if (isMember && n.includes("성수기")) return 3
                    return 0
                }

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
                    .filter((c) => Boolean(c.coupon_code)) // 🔹 여기서 code 있는 쿠폰만
                    .sort((a, b) => {
                        const sa = STATUS_ORDER[a.status] ?? 99
                        const sb = STATUS_ORDER[b.status] ?? 99
                        if (sa !== sb) return sa - sb

                        const na = nameRank(a.name)
                        const nb = nameRank(b.name)
                        if (na !== nb) return na - nb

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

    // Responsive font sizes
    const tabFontSize = viewMode === "mobile" ? 14 : 18
    const nameFontSize = viewMode === "mobile" ? 18 : 20
    const descFontSize = viewMode === "mobile" ? 13 : 14
    const lastLineFontSize1 = viewMode === "mobile" ? 10 : 13
    const lastLineFontSize2 = viewMode === "mobile" ? 10 : 12
    const itemWidth = viewMode === "desktop" ? "calc(50% - 10px)" : "100%"

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
                    fontSize: tabFontSize,
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
                                width: itemWidth,
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
                                        alignItems: "start",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "Ariana Pro Medium",
                                            fontSize: nameFontSize,
                                            color: "#000000",
                                            letterSpacing: "0.2em",
                                            lineHeight: "1.8em",
                                            flex: 1,
                                            minWidth: 0,
                                            whiteSpace: "normal", // ✅ 자동 줄바꿈
                                            overflowWrap: "anywhere", // ✅ 긴 단어/토큰도 줄바꿈
                                            // (말줄임 제거) overflow, textOverflow 설정 삭제
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            padding: "8px 0px",
                                            fontFamily: "Pretendard Medium",
                                            fontSize: 12,
                                            color: "#000000",
                                            letterSpacing: "0em",
                                            lineHeight: "1.8em",
                                            whiteSpace: "nowrap", // ✅ status는 줄바꿈 금지 유지
                                            flexShrink: 0,
                                        }}
                                    >
                                        {statusText[c.status]}
                                    </div>
                                </div>

                                {/* description 줄 */}
                                {/*<div
                                    style={{
                                        fontFamily: "Pretendard SemiBold",
                                        fontSize: descFontSize,
                                        color: "#888888",
                                        letterSpacing: "0em",
                                        lineHeight: "1.8em",
                                    }}
                                >
                                    {c.description}
                                </div>*/}
                            </div>
                            {/* D-Day or 예약 번호 + 날짜 줄 */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10, // ← 필요시 유지
                                    // justifyContent: "space-between",  // ❌ 제거
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
                                                fontSize: lastLineFontSize1,
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
                                                fontSize: lastLineFontSize2,
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
                                                fontSize: lastLineFontSize1,
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
                                                fontSize: lastLineFontSize2,
                                                color: "#6e6e6e",
                                                letterSpacing: "0em",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {dueStr}까지
                                        </div>
                                    </div>
                                ) : null}

                                {/* ✅ 쿠폰 코드는 항상 오른쪽 끝 */}
                                {c.coupon_code && c.status === "available" && (
                                    <div
                                        style={{
                                            marginLeft: "auto", // ← 핵심
                                            fontFamily: "Pretendard Semibold",
                                            fontSize: lastLineFontSize2,
                                            color: "#000000",
                                            letterSpacing: "0em",
                                            lineHeight: "1.8em",
                                            // whiteSpace: "nowrap",        // (선택) 한 줄 고정 원하면 주석 해제
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

// Framer property control 추가
addPropertyControls(CouponTable, {
    viewMode: {
        type: ControlType.Enum,
        title: "View",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop", "Tablet", "Mobile"],
        defaultValue: "desktop",
    },
})
