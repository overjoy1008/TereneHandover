import * as React from "react"

type MileageRow = {
    mileage_id: string
    membership_number: string
    issued_at: string
    mileage_amount: number
    mileage_type: "accumulate" | "use" | "expire" | string
    description?: string | null
    mileage_due?: string | null
    order_id?: string | null
}

const fmt = (s?: string | null) => (s ? s.replace("T", " ").slice(0, 16) : "")

export function MileagesPopup({
    visible,
    onClose,
}: {
    visible: boolean
    onClose: () => void
}) {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [items, setItems] = React.useState<MileageRow[]>([])
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

    const mounted = React.useRef(true)
    React.useEffect(
        () => () => {
            mounted.current = false
        },
        []
    )

    React.useEffect(() => {
        if (!visible) return
        const run = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/mileages"
                )
                if (!res.ok) throw new Error("마일리지 조회 실패")
                const data: MileageRow[] = await res.json()
                data.sort(
                    (a, b) =>
                        new Date(b.issued_at).getTime() -
                        new Date(a.issued_at).getTime()
                )
                if (mounted.current) setItems(data)
            } catch (e: any) {
                if (mounted.current) setError(e?.message ?? "알 수 없는 오류")
            } finally {
                if (mounted.current) setLoading(false)
            }
        }
        run()
    }, [visible])

    const handleDeleteOne = async (id: string) => {
        if (!confirm("해당 내역을 삭제할까요?")) return
        setDeletingIds((p) => [...p, id])
        try {
            const res = await fetch(
                `https://terene-db-server.onrender.com/api/v2/mileages/${id}`,
                { method: "DELETE" }
            )
            if (!res.ok) throw new Error("삭제 실패")
            setItems((p) => p.filter((x) => x.mileage_id !== id))
        } catch (e: any) {
            alert(e?.message ?? "오류")
        } finally {
            setDeletingIds((p) => p.filter((x) => x !== id))
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm("표시된 모든 내역을 삭제할까요?")) return
        setBulkDeleting(true)
        try {
            for (const it of items) {
                await fetch(
                    `https://terene-db-server.onrender.com/api/v2/mileages/${it.mileage_id}`,
                    { method: "DELETE" }
                )
            }
            setItems([])
        } catch {
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
                background: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                fontFamily: "Pretendard Regular",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 18,
                    width: "96%",
                    maxWidth: 1200,
                    maxHeight: "84vh",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontFamily: "Pretendard Regular",
                }}
            >
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
                        <strong
                            style={{
                                fontFamily: "Pretendard SemiBold",
                                fontSize: 16,
                            }}
                        >
                            마일리지 전체 조회
                        </strong>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            총 {items.length}건
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={handleDeleteAll}
                            disabled={
                                loading ||
                                !!error ||
                                items.length === 0 ||
                                bulkDeleting
                            }
                            style={{
                                fontSize: 13,
                                padding: "6px 12px",
                                background: "#ffecec",
                                border: "1px solid #f5b5b5",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontFamily: "Pretendard SemiBold",
                            }}
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
                                fontFamily: "Pretendard SemiBold",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

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
                    <div
                        style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #eee",
                            fontSize: 12,
                            color: "#666",
                            background: "#fafafa",
                            fontFamily: "Pretendard Regular",
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

                    <div style={{ overflow: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                                color: "#333",
                                tableLayout: "fixed",
                                fontFamily: "Pretendard Regular",
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
                                        "마일리지 ID",
                                        "회원 번호",
                                        "부여 시간",
                                        "금액",
                                        "유형",
                                        "설명",
                                        // "유효 기한",   // 👉 주석 처리
                                        "예약 번호",
                                        "삭제",
                                    ].map((h, i) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: "left",
                                                padding: "10px 12px",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                color: "#555",
                                                width: [
                                                    "18%",
                                                    "12%",
                                                    "14%",
                                                    "8%",
                                                    "8%",
                                                    "14%",
                                                    // "12%", // 👉 주석 처리
                                                    "14%",
                                                    "8%",
                                                ][i],
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it) => (
                                    <tr
                                        key={it.mileage_id}
                                        style={{
                                            borderBottom: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <td style={td}>{it.mileage_id}</td>
                                        <td style={td}>
                                            {it.membership_number}
                                        </td>
                                        <td style={td}>{fmt(it.issued_at)}</td>
                                        <td style={td}>
                                            {Number(
                                                it.mileage_amount
                                            ).toLocaleString()}
                                        </td>
                                        <td style={td}>
                                            {it.mileage_type === "accumulate"
                                                ? "적립"
                                                : it.mileage_type === "use"
                                                  ? "사용"
                                                  : it.mileage_type === "expire"
                                                    ? "소멸"
                                                    : it.mileage_type}
                                        </td>
                                        <td style={td}>
                                            {it.description ?? ""}
                                        </td>
                                        {/* <td style={td}>{fmt(it.mileage_due ?? "")}</td> */}
                                        <td style={td}>{it.order_id ?? ""}</td>
                                        <td style={td}>
                                            <button
                                                onClick={() =>
                                                    handleDeleteOne(
                                                        it.mileage_id
                                                    )
                                                }
                                                disabled={deletingIds.includes(
                                                    it.mileage_id
                                                )}
                                                style={{
                                                    fontSize: 12,
                                                    padding: "4px 8px",
                                                    background: "#ffecec",
                                                    border: "1px solid #f5b5b5",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                    fontFamily:
                                                        "Pretendard SemiBold",
                                                }}
                                            >
                                                {deletingIds.includes(
                                                    it.mileage_id
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

const td: React.CSSProperties = {
    padding: "10px 12px",
    verticalAlign: "middle",
    whiteSpace: "normal",
    wordBreak: "break-word",
    fontFamily: "Pretendard Regular",
}
