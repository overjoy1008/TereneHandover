// ManagementToolbar.tsx
import * as React from "react"

export function ManagementsTableToolbar({
    locations,
    monthRanges,
    location,
    monthRange,
    showPhone,
    showSettlement,
    onChangeLocation,
    onChangeMonthRange,
    onTogglePhone,
    onToggleSettlement,
    onReload,
    onSaveAll,
    disabled = false,
}: {
    locations: any[]
    monthRanges: Array<{ id: string; label: string }>
    location: string
    monthRange: string
    showPhone: boolean
    showSettlement: boolean
    onChangeLocation: (v: string) => void
    onChangeMonthRange: (v: string) => void
    onTogglePhone: () => void
    onToggleSettlement: () => void
    onReload: () => void
    onSaveAll: () => void
    disabled?: boolean
}) {
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                borderBottom: "1px solid #ccc",
                paddingBottom: 16,
                fontFamily: "Pretendard Regular",
            }}
        >
            <div
                style={{
                    fontFamily: "Pretendard SemiBold",
                    fontSize: 16,
                    letterSpacing: "0.18em",
                    lineHeight: "1.8em",
                }}
            >
                지점 운영 관리 테이블
            </div>

            <div
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <select
                    value={location}
                    onChange={(e) => onChangeLocation(e.target.value)}
                    disabled={disabled}
                    style={{
                        height: 36,
                        padding: "0 12px",
                        border: "none",
                        borderBottom: "1px solid #222",
                        outline: "none",
                        backgroundColor: "transparent",
                        color: location ? "#000000" : "#000000",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        letterSpacing: "0.1em",
                    }}
                >
                    <option value="" disabled>
                        지점을 선택하세요
                    </option>
                    {locations
                        .slice()
                        .sort((a, b) =>
                            String(a.location_id || "").localeCompare(
                                String(b.location_id || "")
                            )
                        )
                        .map((l) => (
                            <option
                                key={String(l.location_id)}
                                value={String(l.location_id)}
                            >
                                {String(l.location_id)}
                            </option>
                        ))}
                </select>

                <select
                    value={monthRange}
                    onChange={(e) => onChangeMonthRange(e.target.value)}
                    disabled={disabled}
                    style={{
                        height: 36,
                        padding: "0 12px",
                        border: "none",
                        borderBottom: "1px solid #222",
                        outline: "none",
                        backgroundColor: "transparent",
                        color: monthRange ? "#000000" : "#000000",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        letterSpacing: "0.1em",
                    }}
                >
                    <option value="" disabled>
                        기간을 선택하세요 (30일)
                    </option>
                    {monthRanges.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.label}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={onReload}
                    disabled={disabled}
                    style={{
                        height: 36,
                        width: "100%",
                        border: "none",
                        cursor: disabled ? "not-allowed" : "pointer",
                        backgroundColor: "#EBEBEB",
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 13,
                        letterSpacing: "0.06em",
                    }}
                >
                    새로고침
                </button>

                <button
                    type="button"
                    onClick={onSaveAll}
                    disabled={disabled}
                    style={{
                        height: 36,
                        width: "100%",
                        border: "none",
                        cursor: disabled ? "not-allowed" : "pointer",
                        backgroundColor: "#EBEBEB",
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 13,
                        letterSpacing: "0.06em",
                    }}
                >
                    전체 저장
                </button>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                    type="button"
                    onClick={onTogglePhone}
                    style={{
                        height: 32,
                        padding: "0 12px",
                        border: "1px solid #222",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        letterSpacing: "0.06em",
                    }}
                >
                    연락처 {showPhone ? "숨김" : "표시"}
                </button>
                <button
                    type="button"
                    onClick={onToggleSettlement}
                    style={{
                        height: 32,
                        padding: "0 12px",
                        border: "1px solid #222",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        letterSpacing: "0.06em",
                    }}
                >
                    정산금액 {showSettlement ? "숨김" : "표시"}
                </button>
            </div>
        </div>
    )
}
