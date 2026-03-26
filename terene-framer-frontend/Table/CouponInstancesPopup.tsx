
import React from "react"

type CouponInstance = {
    coupon_instance_id: string
    coupon_definition_id: string
    coupon_code: string | null
    status: "available" | "used" | "expired" | string
    issued_at: string | null
    coupon_due: string | null
    order_id: string | null
    receiver_info?: {
        membership_number?: string | null
        name?: string | null
        birthdate?: string | null
        contact?: string | null
    }
}

const formatTimestamp = (s: string) =>
    s ? s.replace("T", " ").slice(0, 16) : "영구적"

export function CouponInstancesPopup({
    visible,
    onClose,
    couponDefinitionId,
}: {
    visible: boolean
    onClose: () => void
    couponDefinitionId?: string
}) {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [items, setItems] = React.useState<CouponInstance[]>([])
    const [deletingIds, setDeletingIds] = React.useState<string[]>([])
    const [bulkDeleting, setBulkDeleting] = React.useState(false)

    // ESC로 창 닫기
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    const mountedRef = React.useRef(true)
    React.useEffect(() => {
        return () => {
            mountedRef.current = false
        }
    }, [])

    React.useEffect(() => {
        if (!visible || !couponDefinitionId) return
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // 1차: 정의된 쿼리 파라미터 시도
                let res = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/coupon-instances?coupon_definition_id=${encodeURIComponent(
                        couponDefinitionId
                    )}`
                )

                // 혹시 서버가 쿼리를 지원 안 하면 전체 받아서 필터
                if (!res.ok) {
                    res = await fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    )
                }
                if (!res.ok) throw new Error("쿠폰 인스턴스 조회 실패")

                const data: CouponInstance[] = await res.json()
                const filtered = data.filter(
                    (d) => d.coupon_definition_id === couponDefinitionId
                )

                // 최신 발급 순으로 정렬(issued_at desc, 없으면 최근 생성 가정)
                filtered.sort((a, b) => {
                    const ta = a.issued_at ? new Date(a.issued_at).getTime() : 0
                    const tb = b.issued_at ? new Date(b.issued_at).getTime() : 0
                    return tb - ta
                })

                if (mountedRef.current) setItems(filtered)
            } catch (e: any) {
                if (mountedRef.current)
                    setError(e?.message || "알 수 없는 오류가 발생했습니다.")
            } finally {
                if (mountedRef.current) setLoading(false)
            }
        }
        fetchData()
    }, [visible, couponDefinitionId])

    const handleCopy = async () => {
        try {
            const header =
                "배포 대상 | 쿠폰 코드 | 이용 상태 | 쿠폰 발행 시각 | 쿠폰 소멸 시각 | 사용된 예약 번호"
            const lines = items.map((it) =>
                [
                    it.receiver_info?.membership_number ?? "비회원",
                    it.coupon_code ?? "(멤버쉽 쿠폰)",
                    it.status ?? "",
                    it.issued_at ?? "",
                    it.coupon_due ?? "",
                    it.order_id ?? "",
                ].join(" | ")
            )
            await navigator.clipboard.writeText([header, ...lines].join("\n"))
            alert("표 내용이 복사되었습니다.")
        } catch {
            alert("복사에 실패했습니다.")
        }
    }

    const handleDeleteOne = async (id: string) => {
        if (!confirm("정말 이 쿠폰을 삭제하시겠습니까?")) return
        setDeletingIds((prev) => [...prev, id])
        try {
            const res = await fetch(
                `https://terene-db-server.onrender.com/api/v2/coupon-instances/${id}`,
                { method: "DELETE" }
            )
            if (!res.ok) throw new Error("삭제 실패")
            setItems((prev) =>
                prev.filter((it) => it.coupon_instance_id !== id)
            )
        } catch (err) {
            alert((err as Error).message)
        } finally {
            setDeletingIds((prev) => prev.filter((x) => x !== id))
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm("정말 모든 쿠폰을 삭제하시겠습니까?")) return
        setBulkDeleting(true)
        try {
            for (const it of items) {
                await fetch(
                    `https://terene-db-server.onrender.com/api/v2/coupon-instances/${it.coupon_instance_id}`,
                    { method: "DELETE" }
                )
            }
            setItems([])
        } catch (err) {
            alert("일부 삭제에 실패했습니다.")
        } finally {
            setBulkDeleting(false)
        }
    }

    if (!visible) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                fontFamily: "Pretendard, sans-serif",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    width: "96%",
                    maxWidth: 1300,
                    maxHeight: "84vh",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    position: "relative",
                    fontFamily: "Pretendard, sans-serif",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                {/* 헤더 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 10,
                        }}
                    >
                        <strong style={{ fontSize: 16 }}>
                            쿠폰 인스턴스 조회
                        </strong>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            definition:{" "}
                            <code
                                style={{
                                    fontFamily:
                                        "ui-monospace, SFMono-Regular, Menlo",
                                }}
                            >
                                {couponDefinitionId}
                            </code>
                        </span>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            총 {items.length}건
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                fontSize: 13,
                                padding: "4px 10px",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                            disabled={loading || !!error || items.length === 0}
                            title={
                                items.length === 0
                                    ? "복사할 내용이 없습니다."
                                    : ""
                            }
                        >
                            복사
                        </button>
                        <button
                            onClick={handleDeleteAll}
                            style={{
                                fontSize: 13,
                                padding: "4px 10px",
                                backgroundColor: "#ffe5e5",
                                border: "1px solid #f5b5b5",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                            disabled={
                                loading ||
                                !!error ||
                                items.length === 0 ||
                                bulkDeleting
                            }
                        >
                            전체 삭제
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: "none",
                                fontSize: 20,
                                cursor: "pointer",
                                color: "#666",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 바디 */}
                <div
                    style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 200,
                    }}
                >
                    {/* 상태 바 */}
                    <div
                        style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #eee",
                            fontSize: 12,
                            color: "#666",
                            background: "#fafafa",
                        }}
                    >
                        {loading && "불러오는 중..."}
                        {error && (
                            <span style={{ color: "#d00" }}>{error}</span>
                        )}
                        {!loading &&
                            !error &&
                            items.length === 0 &&
                            "데이터가 없습니다."}
                    </div>

                    {/* 테이블 래퍼 (스크롤) */}
                    <div style={{ overflow: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                                color: "#333",
                                tableLayout: "fixed",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "#f7f7f7",
                                        borderBottom: "1px solid #eee",
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    {[
                                        "배포 대상",
                                        "쿠폰 코드",
                                        "이용 상태",
                                        "쿠폰 발행 시각",
                                        "쿠폰 소멸 시각",
                                        "사용된 예약 번호",
                                        "삭제",
                                    ].map((header, i) => (
                                        <th
                                            key={header}
                                            style={{
                                                ...thStyle,
                                                width: thWidths[i],
                                            }}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((it) => (
                                    <tr
                                        key={it.coupon_instance_id}
                                        style={{
                                            borderBottom: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            {it.receiver_info?.membership_number
                                                ? `${it.receiver_info?.name ?? "이름 없음"} | ${it.receiver_info?.membership_number}`
                                                : `${it.receiver_info?.name ?? "이름 없음"} | ${it.receiver_info?.birthdate ?? "생년월일 없음"} | ${it.receiver_info?.contact ?? "연락처 없음"}`}
                                        </td>

                                        <td style={tdStyle}>
                                            {it.coupon_code ?? "(멤버쉽 쿠폰)"}
                                        </td>
                                        <td style={tdStyle}>
                                            {humanizeStatus(it.status)}
                                        </td>
                                        <td style={tdStyle}>
                                            {formatTimestamp(it.issued_at) ??
                                                ""}
                                        </td>
                                        <td style={tdStyle}>
                                            {formatTimestamp(it.coupon_due) ??
                                                ""}
                                        </td>
                                        <td style={tdStyle}>
                                            {it.order_id ?? ""}
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() =>
                                                    handleDeleteOne(
                                                        it.coupon_instance_id
                                                    )
                                                }
                                                disabled={deletingIds.includes(
                                                    it.coupon_instance_id
                                                )}
                                                style={{
                                                    fontSize: 12,
                                                    padding: "2px 6px",
                                                    backgroundColor: "#ffe5e5",
                                                    border: "1px solid #f5b5b5",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {deletingIds.includes(
                                                    it.coupon_instance_id
                                                )
                                                    ? "삭제중..."
                                                    : "삭제"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const thWidths = [
    "25%", // 배포 대상
    "15%", // 쿠폰 코드
    "10%", // 이용 상태
    "15%", // 쿠폰 발행 시각
    "15%", // 쿠폰 소멸 시각
    "15%", // 사용된 예약 번호
    "5", // 삭제 버튼
]

const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontWeight: 700,
    fontSize: 12,
    color: "#555",
    whiteSpace: "normal", // 줄바꿈 허용
    wordBreak: "break-word",
}

const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    verticalAlign: "middle",
    whiteSpace: "normal", // 줄바꿈 허용
    wordBreak: "break-word", // 긴 단어도 줄바꿈
}

function humanizeStatus(s?: string) {
    if (!s) return ""
    if (s === "available") return "사용 가능"
    if (s === "used") return "사용 완료"
    if (s === "expired") return "기간 만료"
    if (s === "disabled") return "비활성 쿠폰"
    return s
}
