// ManagementTable.tsx
import * as React from "react"
import { useMemo, useState } from "react"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { ManagementsTableLogic } from "./ManagementsTableLogic.tsx"
import { ManagementsTableToolbar } from "./ManagementsTableToolbar.tsx"
import { ManagementsTableElement } from "./ManagementsTableElement.tsx"

export function ManagementsTableComponent() {
    const [location, setLocation] = useState("")
    const [monthRange, setMonthRange] = useState("")
    const [showPhone, setShowPhone] = useState(false)
    const [showSettlement, setShowSettlement] = useState(false)

    const {
        rows,
        locations,
        monthRanges,
        isLoading,
        error,
        itemsPerPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        setFilters,
        updateRowDraft,
        saveRow,
        saveAll,
        reload,
    } = ManagementsTableLogic()

    React.useEffect(() => {
        setFilters({ location, monthRange })
    }, [location, monthRange])

    const gridTemplateColumns = useMemo(() => {
        const cols: string[] = []
        cols.push("1.1fr") // 날짜
        cols.push("0.8fr") // 예약자
        cols.push("1.05fr") // 인원정보
        if (showPhone) cols.push("1.1fr") // 연락처
        cols.push("0.9fr") // 구분
        cols.push("0.6fr") // 박수
        if (showSettlement) cols.push("1.05fr") // 정산금액
        cols.push("0.6fr") // 퇴실
        cols.push("0.6fr") // 입실
        cols.push("80px") // 관리인1
        cols.push("80px") // 관리인2
        cols.push("80px") // 관리인3
        cols.push("80px") // 관리인4
        cols.push("1.7fr") // 본사직원
        return cols.join(" ")
    }, [showPhone, showSettlement])

    return (
        <div
            style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 28,
                fontFamily: "Pretendard Regular",
            }}
        >
            <ManagementsTableToolbar
                locations={locations}
                monthRanges={monthRanges}
                location={location}
                monthRange={monthRange}
                showPhone={showPhone}
                showSettlement={showSettlement}
                onChangeLocation={(v) => setLocation(v)}
                onChangeMonthRange={(v) => setMonthRange(v)}
                onTogglePhone={() => setShowPhone((p) => !p)}
                onToggleSettlement={() => setShowSettlement((p) => !p)}
                onReload={reload}
                onSaveAll={saveAll}
                disabled={isLoading}
            />

            {error && (
                <div
                    style={{
                        padding: "10px 12px",
                        border: "1px solid #E0E0E0",
                        color: "#B00020",
                        fontSize: 13,
                        lineHeight: "1.6em",
                    }}
                >
                    {error}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns,
                        padding: "10px 0",
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 13,
                        color: "#222",
                        borderBottom: "1px solid #BDBDBD",
                        letterSpacing: "0.02em",
                    }}
                >
                    <div>날짜</div>
                    <div>예약자</div>
                    <div>인원정보</div>
                    {showPhone && <div>연락처</div>}
                    <div>구분</div>
                    <div>박수</div>
                    {showSettlement && <div>정산금액</div>}
                    <div>퇴실</div>
                    <div>입실</div>
                    <div>관리인1</div>
                    <div>관리인2</div>
                    <div>관리인3</div>
                    <div>관리인4</div>
                    <div>본사직원</div>
                </div>

                <div style={{ borderBottom: "1px solid #BDBDBD" }}>
                    {rows.map((row) => (
                        <ManagementsTableElement
                            key={row.date_id}
                            row={row}
                            showPhone={showPhone}
                            showSettlement={showSettlement}
                            gridTemplateColumns={gridTemplateColumns}
                            onChange={(patch) =>
                                updateRowDraft(row.date_id, patch)
                            }
                            onSave={() => saveRow(row.date_id)}
                            disabled={isLoading}
                        />
                    ))}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 18,
                        padding: "18px 0",
                        fontSize: 14,
                        color: "#444",
                    }}
                >
                    <PaginationArrow
                        direction="left"
                        onClick={prevPage}
                        disabled={currentPage === 1 || isLoading}
                        size={16}
                    />
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <PaginationArrow
                        direction="right"
                        onClick={nextPage}
                        disabled={currentPage === totalPages || isLoading}
                        size={16}
                    />
                </div>
            </div>
        </div>
    )
}
