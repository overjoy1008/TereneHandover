
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { CouponCard } from "./CouponCard.tsx"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function formatKSTDateString(date = new Date()): string {
    const kstDate = getKSTDate(date)
    return kstDate.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
    }) // "YYYY-MM-DD" 형식
}

export function CouponContainer({
    rowsPerPage = 3,
    variant = "desktop", // desktop, tablet, mobile
}: {
    rowsPerPage?: number
    variant?: "desktop" | "tablet" | "mobile"
}) {
    const isMobile = variant === "mobile"

    const isTablet = variant === "tablet"

    const containerWidth = isMobile ? "100%" : isTablet ? 600 : 1260
    const columnCount = isTablet ? 1 : 2

    if (isMobile) {
        return (
            <div
                style={{
                    padding: 24,
                    textAlign: "center",
                    fontSize: 16,
                    color: "#888",
                }}
            >
                모바일 환경에서는
                <br />
                쿠폰 수정이 불가능합니다.
            </div>
        )
    }

    const containerHeightMap: Record<number, number> = {
        2: 1586,
        3: 1906,
        4: 2226,
        5: 2546,
        6: 2866,
    }

    const containerHeight = containerHeightMap[rowsPerPage] ?? 1626 // fallback

    const [coupons, setCoupons] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [updating, setUpdating] = React.useState(false)
    const [updated, setUpdated] = React.useState(false)
    const [updateError, setUpdateError] = React.useState<string | null>(null)
    const [currentPage, setCurrentPage] = React.useState(1)

    const itemsPerPage = rowsPerPage * columnCount
    const totalPages = Math.max(
        1,
        Math.ceil((coupons.length + 1) / itemsPerPage)
    )
    const isLastPage = currentPage === totalPages

    // 정렬 추가
    const paginatedCoupons = coupons.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const prevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1))
    const nextPage = () =>
        setCurrentPage((prev) => Math.min(totalPages, prev + 1))

    const buttonStyle: React.CSSProperties = {
        padding: "8px 16px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        fontSize: 14,
        cursor: "pointer",
    }

    React.useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/v2/coupon-definitions")
            .then((res) => res.json())
            .then((data) => {
                // ✅ 처음 로딩될 때만 정렬
                const sorted = [...data].sort((a, b) => {
                    if (a.type === b.type) {
                        return a.name.localeCompare(b.name)
                    }
                    return a.type.localeCompare(b.type)
                })
                setCoupons(sorted)
                setLoading(false)
            })
            .catch((err) => {
                console.error("쿠폰 로딩 오류:", err)
                setLoading(false)
            })
    }, [])

    const handleUpdate = (updatedCoupon: any) => {
        setCoupons((prev) =>
            prev.map((c) =>
                c.coupon_definition_id === updatedCoupon.coupon_definition_id
                    ? updatedCoupon
                    : c
            )
        )
    }

    // const updateCoupons = async () => {
    //     setUpdating(true)
    //     setUpdated(false)
    //     setUpdateError(null)

    //     try {
    //         for (const c of coupons) {
    //             await fetch(
    //                 `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${c.coupon_definition_id}`,
    //                 {
    //                     method: "PUT",
    //                     headers: { "Content-Type": "application/json" },
    //                     body: JSON.stringify(c),
    //                 }
    //             )
    //         }
    //         setUpdated(true)
    //     } catch (e: any) {
    //         setUpdateError(e.message)
    //     } finally {
    //         setUpdating(false)
    //         setTimeout(() => {
    //             setUpdated(false)
    //             setUpdateError(null)
    //         }, 5000)
    //     }
    // }

    const updateCoupons = async () => {
        setUpdating(true)
        setUpdated(false)
        setUpdateError(null)

        try {
            for (const c of coupons) {
                const cleanCoupon = { ...c }
                delete cleanCoupon.distributeMode // ← 이 줄 추가
                delete cleanCoupon.distributeCount
                delete cleanCoupon.groupTarget

                const res = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${c.coupon_definition_id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(cleanCoupon),
                    }
                )

                if (!res.ok) {
                    const contentType = res.headers.get("content-type")
                    const errorText = contentType?.includes("application/json")
                        ? (await res.json()).error
                        : await res.text()

                    console.error("❌ 쿠폰 업데이트 실패:", cleanCoupon)
                    console.error(`❌ 서버 응답 ${res.status}:`, errorText)
                    throw new Error(`(${res.status}) ${errorText}`)
                }
            }

            setUpdated(true)
        } catch (e: any) {
            setUpdateError(e.message)
        } finally {
            setUpdating(false)
            setTimeout(() => {
                setUpdated(false)
                setUpdateError(null)
            }, 5000)
        }
    }

    // const handleAddCoupon = () => {
    //     const today = getKSTDate()
    //     const nextMonth = new Date(today)
    //     nextMonth.setMonth(today.getMonth() + 1)

    //     // 실제 숫자만 모으기
    //     const usedPriorities = new Set(
    //         coupons.map((c) => Number(c.priority)).filter((p) => !isNaN(p))
    //     )

    //     // 1부터 999 중 비어있는 값 찾기
    //     let newPriority = 1
    //     while (usedPriorities.has(newPriority) && newPriority < 1000) {
    //         newPriority++
    //     }
    //     alert(`${JSON.stringify([...usedPriorities])}\n${newPriority}`)

    //     if (newPriority >= 1000) {
    //         alert("❌ 사용할 수 있는 priority가 없습니다.")
    //         return
    //     }

    //     const newCoupon = {
    //         id: Math.random().toString(36).substring(2, 12),
    //         priority: newPriority,
    //         type: "code",
    //         name: `쿠폰 이름`,
    //         description: "영수증에 노출되는 쿠폰 명칭",
    //         code: "쿠폰 코드",
    //         allowed_members: ["A-00000001"],
    //         scope: "per_stay",
    //         discount_type: "percentage",
    //         discount_value: 25,
    //         enabled: true,
    //         conditions_json: [
    //             {
    //                 type: "date",
    //                 startDate: formatKSTDateString(today),
    //                 endDate: formatKSTDateString(nextMonth),
    //             },
    //         ],
    //     }

    //     const newCoupons = [...coupons, newCoupon]
    //     setCoupons(newCoupons)
    //     setCurrentPage(Math.ceil((newCoupons.length + 1) / itemsPerPage))
    // }

    const handleAddCoupon = () => {
        const today = getKSTDate()

        // KST 기준 날짜 및 시간 추출
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "") // YYMMDD
        const timeStr = today.toTimeString().slice(0, 5).replace(":", "") // HHMM

        // 랜덤 8자리 알파벳+숫자
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()

        const coupon_definition_id = `CD-${dateStr}-${timeStr}-${randomPart}`

        const newCoupon = {
            coupon_definition_id,
            name: "마이페이지에 노풀되는 쿠폰 이름",
            description: "영수증에 노출되는 쿠폰 명칭",
            discount_type: "percentage",
            discount_value: 25,
            type: "code",
            exclusive: false,
            scope: -1,
            counter: 1,
            validity_type: "year",
            validity_value: "1",
            refillable: false,
            enabled: true,
            conditions_json: [
                {
                    type: "date",
                    startDate: formatKSTDateString(today),
                    endDate: formatKSTDateString(
                        new Date(today.setFullYear(today.getFullYear() + 1))
                    ),
                },
            ],
        }

        const newCoupons = [...coupons, newCoupon]
        setCoupons(newCoupons)
        setCurrentPage(Math.ceil((newCoupons.length + 1) / itemsPerPage))
    }

    const handleDeleteCoupon = async (coupon_definition_id: string) => {
        // 로컬 상태 먼저 수정
        setCoupons((prev) =>
            prev.filter((c) => c.coupon_definition_id !== coupon_definition_id)
        )

        // 서버에서 삭제 요청
        try {
            await fetch(
                `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${coupon_definition_id}`,
                {
                    method: "DELETE",
                }
            )
        } catch (error) {
            console.error("쿠폰 삭제 실패:", error)
        }

        // 페이지 보정
        const newTotalPages = Math.ceil((coupons.length - 1 + 1) / itemsPerPage)
        if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, newTotalPages))
        }
    }

    if (loading)
        return <div style={{ padding: 24 }}>⏳ 쿠폰을 불러오는 중...</div>

    return (
        <div
            style={{
                width: containerWidth,
                height: containerHeight,
                margin: "0 auto",
                padding: 24,
                boxSizing: "border-box",
                overflow: "hidden", // prevent scroll
            }}
        >
            {/* 헤더 영역 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <div style={{ fontSize: 20, fontWeight: 600 }}>쿠폰 목록</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleAddCoupon} style={buttonStyle}>
                        Add Coupon
                    </button>
                    <button
                        onClick={updateCoupons}
                        disabled={updating}
                        style={{
                            ...buttonStyle,
                            minWidth: 130,
                            cursor: updating ? "wait" : "pointer",
                        }}
                    >
                        {updating
                            ? "⏳ Updating..."
                            : updated
                              ? "✅ 저장됨"
                              : "Update Coupons"}
                    </button>
                </div>
            </div>

            {updateError && (
                <div style={{ color: "red", fontSize: 13, marginBottom: 12 }}>
                    ⚠️ {updateError}
                </div>
            )}

            {/* 쿠폰 카드 그리드 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                    gap: 20,
                }}
            >
                {paginatedCoupons.map((coupon) => (
                    <CouponCard
                        key={coupon.coupon_definition_id}
                        coupon={coupon}
                        onUpdate={handleUpdate}
                        onDelete={() =>
                            handleDeleteCoupon(coupon.coupon_definition_id)
                        } // ✅ 삭제 콜백
                    />
                ))}

                {/* 마지막 페이지에서만 + 카드 보이기 */}
                {isLastPage && paginatedCoupons.length < itemsPerPage && (
                    <div
                        onClick={handleAddCoupon}
                        style={{
                            aspectRatio: "5.96 / 5",
                            border: "1px dashed #aaa",
                            borderRadius: 12,
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 40,
                            color: "#999",
                            fontWeight: 300,
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "#e0e0e0"
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "#f0f0f0"
                        }}
                    >
                        +
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 32,
                    gap: 12,
                    fontFamily: "inherit",
                }}
            >
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    style={{
                        padding: "8px 20px",
                        fontSize: 14,
                        fontWeight: 600,
                        border: "1px solid #ccc",
                        background: currentPage === 1 ? "#f9f9f9" : "#fff",
                        color: currentPage === 1 ? "#aaa" : "#333",
                        borderRadius: 8,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease-in-out",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                >
                    ◀ Prev
                </button>

                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 500,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "#f5f5f5",
                        color: "#444",
                    }}
                >
                    Page {currentPage} / {totalPages}
                </span>

                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: "8px 20px",
                        fontSize: 14,
                        fontWeight: 600,
                        border: "1px solid #ccc",
                        background:
                            currentPage === totalPages ? "#f9f9f9" : "#fff",
                        color: currentPage === totalPages ? "#aaa" : "#333",
                        borderRadius: 8,
                        cursor:
                            currentPage === totalPages
                                ? "not-allowed"
                                : "pointer",
                        transition: "all 0.2s ease-in-out",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                >
                    Next ▶
                </button>
            </div>
        </div>
    )
}

addPropertyControls(CouponContainer, {
    rowsPerPage: {
        type: ControlType.Number,
        title: "Rows",
        defaultValue: 3,
        min: 2,
        max: 6,
        step: 1,
    },
    variant: {
        type: ControlType.Enum,
        title: "Device",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop (2줄)", "Tablet (1줄)", "Mobile (수정 불가)"],
    },
})
