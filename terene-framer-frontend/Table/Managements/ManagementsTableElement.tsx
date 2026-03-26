// ManagementTableElement.tsx
import * as React from "react"

type Slot = { name: string; attend: boolean }

export function ManagementsTableElement({
    row,
    showPhone,
    showSettlement,
    gridTemplateColumns,
    onChange,
    onSave,
    disabled = false,
}: {
    row: any
    showPhone: boolean
    showSettlement: boolean
    gridTemplateColumns: string
    onChange: (patch: any) => void
    onSave: () => void
    disabled?: boolean
}) {
    const badge = (on: boolean, label: string) => (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 22,
                minWidth: 34,
                padding: "0 8px",
                border: "1px solid #222",
                fontFamily: "Pretendard Regular",
                fontSize: 12,
                color: "#222",
                opacity: on ? 1 : 0.35,
                userSelect: "none",
            }}
        >
            {label}
        </span>
    )

    const managerCell = (idx: number) => {
        const slot: Slot = row.managers?.[idx] || { name: "", attend: false }
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                    value={slot.name}
                    disabled={disabled}
                    onChange={(e) => {
                        const next = (row.managers || []).slice()
                        next[idx] = { ...slot, name: e.target.value }
                        while (next.length < 4)
                            next.push({ name: "", attend: false })
                        onChange({ managers: next })
                    }}
                    placeholder="이름"
                    style={{
                        width: 70,
                        height: 26,
                        border: "none",
                        borderBottom: "1px solid #E0E0E0",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        color: "#000",
                        padding: "0 6px",
                    }}
                />
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        const next = (row.managers || []).slice()
                        next[idx] = { ...slot, attend: !slot.attend }
                        while (next.length < 4)
                            next.push({ name: "", attend: false })
                        onChange({ managers: next })
                    }}
                    style={{
                        width: 70,
                        height: 24,
                        border: "1px solid #222",
                        backgroundColor: "transparent",
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 12,
                        letterSpacing: "0.06em",
                        opacity: slot.name.trim() ? 1 : 0.5,
                    }}
                >
                    {slot.attend ? "O" : ""}
                </button>
            </div>
        )
    }

    const settlementText =
        typeof row.settlementFinal === "number"
            ? `₩${Number(row.settlementFinal).toLocaleString()}`
            : ""

    const dirty = Boolean(row._dirty)

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns,
                gap: 0,
                padding: "10px 0",
                borderTop: "1px solid #E0E0E0",
                alignItems: "center",
                fontFamily: "Pretendard Regular",
                fontSize: 12,
                color: "#111",
            }}
        >
            <div style={{ paddingRight: 10 }}>
                <div style={{ fontFamily: "Pretendard SemiBold" }}>
                    {row.date}
                </div>
                <div style={{ fontSize: 11, color: "#777" }}>{row.kind}</div>
            </div>

            <div style={{ paddingRight: 10 }}>
                <div style={{ fontFamily: "Pretendard SemiBold" }}>
                    {row.reserver || "-"}
                </div>
            </div>

            <div
                style={{
                    paddingRight: 10,
                    color: row.people ? "#111" : "#777",
                }}
            >
                {row.people || "-"}
            </div>

            {showPhone && (
                <div
                    style={{
                        paddingRight: 10,
                        color: row.phone ? "#111" : "#777",
                    }}
                >
                    {row.phone || "-"}
                </div>
            )}

            <div
                style={{
                    paddingRight: 10,
                    color: row.membershipNumber ? "#111" : "#777",
                }}
            >
                {row.membershipNumber || "-"}
            </div>

            <div
                style={{
                    paddingRight: 10,
                    color: row.nights ? "#111" : "#777",
                }}
            >
                {row.nights || "-"}
            </div>

            {showSettlement && (
                <div
                    style={{
                        paddingRight: 10,
                        color: settlementText ? "#111" : "#777",
                    }}
                >
                    {settlementText || "-"}
                </div>
            )}

            <div style={{ paddingRight: 10 }}>
                {badge(Boolean(row.checkout), "퇴실")}
            </div>
            <div style={{ paddingRight: 10 }}>
                {badge(Boolean(row.checkin), "입실")}
            </div>

            <div style={{ paddingRight: 10 }}>{managerCell(0)}</div>
            <div style={{ paddingRight: 10 }}>{managerCell(1)}</div>
            <div style={{ paddingRight: 10 }}>{managerCell(2)}</div>
            <div style={{ paddingRight: 10 }}>{managerCell(3)}</div>

            <div
                style={{
                    paddingRight: 10,
                    display: "flex",
                    gap: 5,
                    alignItems: "Center",
                }}
            >
                <textarea
                    value={row.hqStaff || ""}
                    disabled={disabled}
                    onChange={(e) => onChange({ hqStaff: e.target.value })}
                    placeholder="본사직원 (콤마로 구분)"
                    style={{
                        width: "100%",
                        minHeight: 54,
                        resize: "vertical",
                        border: "1px solid #E0E0E0",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        padding: "8px 10px",
                        boxSizing: "border-box",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        marginTop: 8,
                    }}
                >
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={disabled}
                        style={{
                            height: 30,
                            padding: "0 12px",
                            border: "none",
                            backgroundColor: "#EBEBEB",
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontFamily: "Pretendard SemiBold",
                            fontSize: 12,
                            letterSpacing: "0.06em",
                            opacity: dirty ? 1 : 0.7,
                        }}
                    >
                        저장
                    </button>
                    {dirty && (
                        <span style={{ fontSize: 11, color: "#777" }}>
                            변경됨
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
