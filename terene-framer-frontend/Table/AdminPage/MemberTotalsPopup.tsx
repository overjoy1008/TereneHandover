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

type TotalsRow = {
    membership_number: string
    accumulate_sum: number
    use_sum: number
    expire_sum: number
    net_sum: number
    count: number
}

export function MemberTotalsPopup({
    visible,
    onClose,
}: {
    visible: boolean
    onClose: () => void
}) {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [rows, setRows] = React.useState<TotalsRow[]>([])
    const [keyword, setKeyword] = React.useState("")

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
                const map = new Map<string, TotalsRow>()
                for (const it of data) {
                    const key = it.membership_number || ""
                    if (!map.has(key)) {
                        map.set(key, {
                            membership_number: key,
                            accumulate_sum: 0,
                            use_sum: 0,
                            expire_sum: 0,
                            net_sum: 0,
                            count: 0,
                        })
                    }
                    const r = map.get(key)!
                    const amt = Number(it.mileage_amount) || 0
                    if (it.mileage_type === "accumulate")
                        r.accumulate_sum += amt
                    else if (it.mileage_type === "use") r.use_sum += amt
                    else if (it.mileage_type === "expire") r.expire_sum += amt
                    else r.accumulate_sum += 0
                    r.count += 1
                }
                for (const r of map.values()) {
                    r.net_sum = r.accumulate_sum + r.use_sum + r.expire_sum
                }
                const arr = Array.from(map.values()).sort(
                    (a, b) => b.net_sum - a.net_sum
                )
                if (mounted.current) setRows(arr)
            } catch (e: any) {
                if (mounted.current) setError(e?.message ?? "알 수 없는 오류")
            } finally {
                if (mounted.current) setLoading(false)
            }
        }
        run()
    }, [visible])

    const filtered = React.useMemo(() => {
        if (!keyword.trim()) return rows
        const k = keyword.trim().toLowerCase()
        return rows.filter((r) => r.membership_number.toLowerCase().includes(k))
    }, [rows, keyword])

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
                    maxWidth: 1000,
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
                            회원별 누계
                        </strong>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            총 {filtered.length}명
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            placeholder="회원 번호 검색"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{
                                padding: "6px 10px",
                                border: "1px solid #e5e5e5",
                                borderRadius: 8,
                                fontFamily: "Pretendard Regular",
                                fontSize: 13,
                            }}
                        />
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
                            rows.length === 0 &&
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
                                        "회원 번호",
                                        "적립 합계",
                                        "사용 합계",
                                        // "소멸 합계",
                                        "마일리지 잔액",
                                        "건수",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                textAlign: "left",
                                                padding: "10px 12px",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                color: "#555",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r) => (
                                    <tr
                                        key={r.membership_number}
                                        style={{
                                            borderBottom: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <td style={td}>
                                            {r.membership_number}
                                        </td>
                                        <td style={td}>
                                            {Math.round(
                                                r.accumulate_sum
                                            ).toLocaleString()}
                                        </td>
                                        <td style={td}>
                                            {Math.round(
                                                r.use_sum
                                            ).toLocaleString()}
                                        </td>
                                        {/*<td style={td}>
                                            {Math.round(
                                                r.expire_sum
                                            ).toLocaleString()}
                                        </td>*/}
                                        <td
                                            style={{
                                                ...td,
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                            }}
                                        >
                                            {Math.round(
                                                r.net_sum
                                            ).toLocaleString()}
                                        </td>
                                        <td style={td}>
                                            {r.count.toLocaleString()}
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
