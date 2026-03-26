
// === New file: CouponTargetsPopup.tsx ===
import React from "react"

export type TargetRow = {
    membership_number: string | null
    issued_date: string | null
    coupon_code: string | null
    name: string | null
    birthdate: string | null
    contact: string | null
    distribute_count: number | null
}

export function CouponTargetsPopup({
    visible,
    onClose,
    coupon,
    temp,
}: {
    visible: boolean
    onClose: () => void
    coupon: any
    temp: any
}) {
    const [rows, setRows] = React.useState<TargetRow[]>([
        {
            membership_number: null,
            issued_date: null,
            coupon_code: null,
            name: null,
            birthdate: null,
            contact: null,
            distribute_count: 1,
        },
    ])
    const [busy, setBusy] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!visible) return
        setError(null)
    }, [visible])

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

    const addRow = () =>
        setRows((r) => [
            ...r,
            {
                membership_number: null,
                issued_date: null,
                coupon_code: null,
                name: null,
                birthdate: null,
                contact: null,
                distribute_count: 1,
            },
        ])

    const removeRow = (idx: number) =>
        setRows((r) => r.filter((_, i) => i !== idx))

    const clearAll = () => setRows([])

    const update = (idx: number, key: keyof TargetRow, val: any) =>
        setRows((r) =>
            r.map((row, i) => (i === idx ? { ...row, [key]: val } : row))
        )

    // ==== Distribution helpers (trimmed/adapted from CouponDistributionPanel) ====
    const distributeAll = async () => {
        if (!coupon?.coupon_definition_id) {
            alert("쿠폰이 선택되지 않았습니다.")
            return
        }
        setBusy(true)
        setError(null)
        try {
            const today = new Date()
            const kstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)

            const formatDate = (d: Date) => {
                const yyyy = d.getFullYear()
                const mm = String(d.getMonth() + 1).padStart(2, "0")
                const dd = String(d.getDate()).padStart(2, "0")
                return `${yyyy}-${mm}-${dd}`
            }

            const generateSafeCode = (length = 8) => {
                const chars =
                    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"
                return Array.from(
                    { length },
                    () => chars[Math.floor(Math.random() * chars.length)]
                ).join("")
            }

            const generateCouponInstanceId = () => {
                const datePart = kstDate
                    .toISOString()
                    .slice(2, 10)
                    .replace(/-/g, "")
                const timePart =
                    String(kstDate.getHours()).padStart(2, "0") +
                    String(kstDate.getMinutes()).padStart(2, "0")
                const rand = generateSafeCode(8)
                return `CI-${datePart}-${timePart}-${rand}`
            }

            const addDate = (base: Date, type: string, value: string) => {
                const result = new Date(base)
                const val = parseInt(value, 10)
                if (type === "day") result.setDate(result.getDate() + val)
                else if (type === "week")
                    result.setDate(result.getDate() + val * 7)
                else if (type === "month")
                    result.setMonth(result.getMonth() + val)
                else if (type === "year")
                    result.setFullYear(result.getFullYear() + val)
                result.setSeconds(result.getSeconds() - 1)
                return result
            }

            const toYMD = (d: Date) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate())
            const todayYMD = toYMD(kstDate)

            const makeDue = (baseDate: Date) => {
                let due: Date | null = null
                if (temp.validity_type === "custom") {
                    due = temp.validity_value
                        ? new Date(temp.validity_value)
                        : null
                } else if (temp.validity_type === "permanent") {
                    due = null
                } else {
                    due = addDate(
                        baseDate,
                        temp.validity_type,
                        temp.validity_value
                    )
                }
                if (temp.type === "membership" && due) {
                    let d = toYMD(due)
                    if (!isNaN(d.getTime())) {
                        while (d < todayYMD) d.setFullYear(d.getFullYear() + 1)
                        d = new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1000)
                        due = d
                    }
                }
                return due
            }

            const normalize = (str?: string | null) =>
                str
                    ?.replace(/[\s\-./]/g, "")
                    .toLowerCase()
                    .trim()

            // existing instances (for duplicate checks)
            const existingInstances: any[] = await fetch(
                `https://terene-db-server.onrender.com/api/v2/coupon-instances?coupon_definition_id=${coupon.coupon_definition_id}`
            ).then((r) => r.json())

            // 이미 존재하는(충돌 방지용) 코드 목록 수집
            const usedCodes = new Set<string>(
                existingInstances
                    .map((i) => i?.coupon_code)
                    .filter((c: any) => typeof c === "string" && c.trim())
            )

            const makeUniqueCode = (base?: string | null) => {
                // base 후보가 있으면 우선 사용 (충돌 시 랜덤 대체)
                if (base && !usedCodes.has(base)) {
                    usedCodes.add(base)
                    return base
                }
                let code = ""
                do {
                    code = generateSafeCode(8 + Math.floor(Math.random() * 3))
                } while (usedCodes.has(code))
                usedCodes.add(code)
                return code
            }

            const shouldSkip = (info: TargetRow) => {
                if (info.membership_number) {
                    return existingInstances.some(
                        (inst) =>
                            inst.coupon_definition_id ===
                                coupon.coupon_definition_id &&
                            normalize(inst.membership_number) ===
                                normalize(info.membership_number)
                    )
                }
                return existingInstances.some(
                    (inst) =>
                        inst.coupon_definition_id ===
                            coupon.coupon_definition_id &&
                        normalize(inst.receiver_info?.name) ===
                            normalize(info.name) &&
                        normalize(inst.receiver_info?.birthdate) ===
                            normalize(info.birthdate) &&
                        normalize(inst.receiver_info?.contact) ===
                            normalize(info.contact)
                )
            }

            const postInstance = async (payload: any) => {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/coupon-instances",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                )
                if (!res.ok) throw new Error("쿠폰 발급 실패")
                return res.json()
            }

            const results: {
                row: number
                member: string
                code: string | null
            }[] = []

            for (let i = 0; i < rows.length; i++) {
                const info = rows[i]
                if (!info) continue
                const baseDate =
                    temp.type === "membership" &&
                    info.issued_date == null &&
                    info.membership_number
                        ? // 멤버십의 경우 미입력 시 가입일 대신 오늘 0시 기준 발급일 처리 (심플)
                          kstDate
                        : info.issued_date?.trim()
                          ? new Date(info.issued_date)
                          : kstDate

                const due = makeDue(baseDate)
                // const coupon_due = due ? formatDate(due) : null
                const coupon_due = due
                const issuedAtMidnight = toYMD(kstDate)

                const isMembershipCoupon = temp.type === "membership"

                const payloadBase = {
                    coupon_definition_id: coupon.coupon_definition_id,
                    status: "available",
                    // issued_at: formatDate(issuedAtMidnight),
                    issued_at: baseDate,
                    coupon_due,
                    sender_info: {
                        is_vaadd: true,
                        membership_number: null,
                        name: null,
                        birthdate: null,
                        contact: null,
                    },
                    receiver_info: {
                        membership_number: info.membership_number ?? null,
                        name: info.name ?? null,
                        birthdate: info.birthdate ?? null,
                        contact: info.contact ?? null,
                    },
                    order_id: null,
                    used_location: null,
                    used_timestamp: null,
                    used_amount: null,
                }

                if (shouldSkip(info)) continue

                const count = Math.max(1, Number(info.distribute_count || 1))
                for (let k = 0; k < count; k++) {
                    // 인스턴스마다 고유 코드 생성 (멤버십은 코드 없음)
                    let coupon_code: string | null = null
                    if (!isMembershipCoupon) {
                        if (info.coupon_code) {
                            // 첫 장은 입력값 그대로, 이후는 "-2", "-3"... 시도 (충돌 시 랜덤 대체)
                            const candidate =
                                k === 0
                                    ? info.coupon_code
                                    : `${info.coupon_code}-${k + 1}`
                            coupon_code = makeUniqueCode(candidate)
                        } else {
                            coupon_code = makeUniqueCode()
                        }
                    }

                    const payload = {
                        ...payloadBase,
                        coupon_instance_id: generateCouponInstanceId(),
                        coupon_code,
                        membership_number: info.membership_number,
                    }
                    await postInstance(payload)
                    results.push({
                        row: i + 1,
                        member: info.membership_number || "비회원",
                        code: coupon_code,
                    })
                }
            }

            alert(
                results.length
                    ? `총 ${results.length}건 발급 완료.`
                    : "발급된 쿠폰이 없습니다. (중복 정책으로 스킵되었을 수 있어요)"
            )
            onClose()
        } catch (e: any) {
            setError(e?.message || "배포 중 오류가 발생했습니다.")
        } finally {
            setBusy(false)
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
                    maxWidth: 1100,
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
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "baseline",
                        }}
                    >
                        <strong style={{ fontSize: 16 }}>다중 배포 대상</strong>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            definition:{" "}
                            <code style={{ fontFamily: "ui-monospace, Menlo" }}>
                                {coupon?.coupon_definition_id || "-"}
                            </code>
                        </span>
                        <span style={{ fontSize: 12, color: "#777" }}>
                            총 {rows.length}건
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={addRow}
                            style={{
                                fontSize: 13,
                                padding: "4px 10px",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                            disabled={busy}
                        >
                            행 추가
                        </button>
                        <button
                            onClick={clearAll}
                            style={{
                                fontSize: 13,
                                padding: "4px 10px",
                                backgroundColor: "#ffe5e5",
                                border: "1px solid #f5b5b5",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                            disabled={busy || rows.length === 0}
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
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Status bar */}
                <div
                    style={{
                        padding: "8px 12px",
                        border: "1px solid #eee",
                        background: "#fafafa",
                        borderRadius: 8,
                        fontSize: 12,
                        color: error ? "#d00" : "#666",
                    }}
                >
                    {busy
                        ? "배포 중..."
                        : error
                          ? error
                          : "각 항목은 모두 수정 가능합니다."}
                </div>

                {/* Table */}
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
                                        "회원번호",
                                        "쿠폰 발급일",
                                        "쿠폰 코드",
                                        "이름",
                                        "생년월일",
                                        "연락처",
                                        "배포 개수",
                                        "삭제",
                                    ].map((header, i) => (
                                        <th
                                            key={i}
                                            style={{
                                                textAlign: "left",
                                                padding: "10px 12px",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                color: "#555",
                                            }}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        style={{
                                            borderBottom: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <td style={cellStyle}>
                                            <input
                                                value={
                                                    row.membership_number ?? ""
                                                }
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "membership_number",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                placeholder="YYYY-MM-DD"
                                                value={row.issued_date ?? ""}
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "issued_date",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                value={row.coupon_code ?? ""}
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "coupon_code",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                value={row.name ?? ""}
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                placeholder="YYYY-MM-DD"
                                                value={row.birthdate ?? ""}
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "birthdate",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                value={row.contact ?? ""}
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "contact",
                                                        e.target.value
                                                    )
                                                }
                                                style={ipt}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                min={1}
                                                value={
                                                    row.distribute_count ?? 1
                                                }
                                                onChange={(e) =>
                                                    update(
                                                        idx,
                                                        "distribute_count",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                style={{ ...ipt, width: 90 }}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <button
                                                onClick={() => removeRow(idx)}
                                                disabled={busy}
                                                style={{
                                                    fontSize: 12,
                                                    padding: "2px 6px",
                                                    backgroundColor: "#ffe5e5",
                                                    border: "1px solid #f5b5b5",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{
                                                padding: 16,
                                                color: "#777",
                                                fontSize: 12,
                                            }}
                                        >
                                            행이 없습니다. [행 추가] 를 눌러
                                            시작하세요.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                    }}
                >
                    <button
                        onClick={distributeAll}
                        disabled={busy || rows.length === 0}
                        style={{
                            padding: "8px 18px",
                            background: "#3399ff",
                            color: "#fff",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        쿠폰 배포
                    </button>
                </div>
            </div>
        </div>
    )
}

const ipt: React.CSSProperties = {
    width: "100%",
    height: 28,
    padding: "6px 10px",
    border: "1px solid " + "#ccc",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
}

const cellStyle: React.CSSProperties = {
    padding: "10px 12px",
    verticalAlign: "middle",
}
