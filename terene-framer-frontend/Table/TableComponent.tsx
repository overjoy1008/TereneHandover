
// TableComponent.tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { ElementComponent } from "./ElementComponent.tsx"
import { TableHeader } from "./TableHeader.tsx"
import { useTableLogic } from "./useTableLogic.ts"
import { fieldsByVariant } from "./fieldsByVariant.ts"
import { CouponContainer } from "./CouponContainer.tsx"
import { OrderElementComponent } from "./OrderElementComponent.tsx"
import { OrderDetailOverlay } from "./OrderDetailOverlay.tsx"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function getKSTISOString(date = new Date()): string {
    const kstDate = getKSTDate(date)

    const pad = (n: number) => String(n).padStart(2, "0")

    const year = kstDate.getFullYear()
    const month = pad(kstDate.getMonth() + 1)
    const day = pad(kstDate.getDate())
    const hours = pad(kstDate.getHours())
    const minutes = pad(kstDate.getMinutes())
    const seconds = pad(kstDate.getSeconds())

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`
}

export function TableComponent(props) {
    const { variant: initialVariant } = props

    const tableNameMap = {
        coupons: "쿠폰 목록 테이블",
        days: "2025~2026 휴일/성수기 테이블",
        customers: "고객 정보 테이블",
        orders: "전체 주문 내역 테이블",
    }

    const optionTitlesMap = {
        coupons: "쿠폰 조건",
        days: "휴일/성수기",
        customers: "고객 정보",
        orders: "전체 주문 내역",
    }

    const itemsPerPageMap = {
        days: 20,
        customers: 20,
        coupons: 5,
        orders: 20,
    }

    const editableVariants = ["days", "customers", "coupons", "orders"]
    const [selectedVariant, setSelectedVariant] = React.useState(
        editableVariants.includes(initialVariant)
            ? initialVariant
            : editableVariants[0]
    )

    const [selectedOrderDetail, setSelectedOrderDetail] = React.useState(null)

    const [resetKey, setResetKey] = React.useState(0)
    const handleReload = () => {
        setResetKey((prev) => prev + 1)
    }

    // 모바일/태블릿 처리
    if (initialVariant === "tablet") {
        return (
            <div
                style={{
                    width: "100%",
                    padding: 24,
                    textAlign: "center",
                    fontSize: 16,
                    color: "#888",
                    fontFamily: "Pretendard, sans-serif",
                }}
            >
                태블릿 환경에서는 테이블 수정이 불가능합니다.
            </div>
        )
    }
    if (initialVariant === "mobile") {
        return (
            <div
                style={{
                    width: "100%",
                    padding: 24,
                    textAlign: "center",
                    fontSize: 16,
                    color: "#888",
                    fontFamily: "Pretendard, sans-serif",
                }}
            >
                모바일 환경에서는
                <br />
                테이블 수정이 불가능합니다.
            </div>
        )
    }

    const parsedFields = fieldsByVariant[selectedVariant] || []
    const idKey = parsedFields.find((field) => field.isPrimary)?.key || "id"
    const tableName = tableNameMap[selectedVariant]
    const currentItemsPerPage = itemsPerPageMap[selectedVariant]

    const {
        rows,
        paginatedRows,
        emptySlots,
        justAddedID,
        updating,
        updated,
        currentPage,
        totalPages,
        sortConfig,
        toggleSort,
        addElement,
        editElement,
        deleteElement,
        updateBackend,
        updateOrder,
        setCurrentPage,
        updateError,
    } = useTableLogic(
        selectedVariant,
        currentItemsPerPage,
        parsedFields,
        resetKey
    )

    const prevPage = () => setCurrentPage(Math.max(1, currentPage - 1))
    const nextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "table_data.json"
        a.click()
        URL.revokeObjectURL(url)
    }

    const buttonStyle: React.CSSProperties = {
        padding: "8px 16px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        fontSize: "14px",
        cursor: "pointer",
    }

    return (
        <div
            style={{
                width: selectedVariant === "coupons" ? "1268px" : "1268px",
                padding: selectedVariant === "coupons" ? 0 : 24,
                fontFamily: "Pretendard, sans-serif",
            }}
        >
            {/* Header */}

            {!["coupons"].includes(selectedVariant) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                    }}
                >
                    <div style={{ fontSize: 20, fontWeight: 600, height: 38 }}>
                        {tableName}
                    </div>
                    {!["coupons", "orders"].includes(selectedVariant) && (
                        <button
                            onClick={() => updateBackend()} // ✅ 명시적으로 인자 없음
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
                                  : "Update Table"}
                        </button>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}
            >
                {/* 좌측: variant select + reload 버튼은 항상 표시 */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        padding: selectedVariant === "coupons" ? "0 24px" : "0",
                    }}
                >
                    {/*<select
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        style={{
                            fontSize: 16,
                            padding: 8,
                            fontWeight: 600,
                            fontFamily: "inherit",
                        }}
                    >
                        {editableVariants.map((key) => (
                            <option key={key} value={key}>
                                {optionTitlesMap[key]}
                            </option>
                        ))}
                    </select>*/}

                    {selectedVariant !== "coupons" && (
                        <button
                            onClick={handleReload}
                            title="Reload Table"
                            style={{
                                fontSize: 14,
                                padding: "4px 8px",
                                cursor: "pointer",
                                border: "1px solid #ccc",
                                backgroundColor: "#fff",
                                borderRadius: 4,
                            }}
                        >
                            🔄 Reload
                        </button>
                    )}
                </div>

                {/* 우측은 coupons이 아닐 때만 표시 */}
                {selectedVariant !== "coupons" && (
                    <>
                        <div style={{ display: "flex", gap: 8 }}>
                            {selectedVariant !== "orders" && (
                                <button
                                    onClick={addElement}
                                    style={buttonStyle}
                                >
                                    Add Row
                                </button>
                            )}
                            <button onClick={downloadJSON} style={buttonStyle}>
                                Download JSON
                            </button>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                style={buttonStyle}
                            >
                                ◀ Prev
                            </button>
                            <span style={{ fontSize: 14 }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                style={buttonStyle}
                            >
                                Next ▶
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Error */}
            {updateError && selectedVariant !== "coupons" && (
                <div style={{ color: "red", fontSize: 13, marginBottom: 12 }}>
                    ⚠️ {updateError}
                </div>
            )}

            {/* Conditionally Render CouponContainer for Coupons Variant */}
            {selectedVariant === "coupons" ? (
                <CouponContainer />
            ) : selectedVariant === "orders" ? (
                <>
                    <div style={{ marginBottom: 100 }}>
                        <div style={{ overflowX: "auto" }}>
                            <div
                                style={{
                                    borderTop: "1px solid #ccc",
                                    minWidth: "800px",
                                }}
                            >
                                {paginatedRows.map((row) => {
                                    const rowID = row[idKey]
                                    return (
                                        <OrderElementComponent
                                            key={rowID}
                                            data={row}
                                            onOpenDetails={() =>
                                                setSelectedOrderDetail(row)
                                            }
                                        />
                                    )
                                })}
                            </div>
                        </div>

                        {selectedOrderDetail && (
                            <OrderDetailOverlay
                                order={selectedOrderDetail}
                                onClose={() => setSelectedOrderDetail(null)}
                                onAccept={() => {
                                    const updated = {
                                        ...selectedOrderDetail,
                                        payment_status: "accepted",
                                    }
                                    // editElement(selectedOrderDetail[idKey], updated)
                                    updateOrder(
                                        [selectedOrderDetail[idKey]],
                                        "accepted",
                                        "approval_datetime",
                                        getKSTISOString(),
                                        null,
                                        null,
                                        null
                                    )
                                    setSelectedOrderDetail(null)
                                }}
                                onDecline={() => {
                                    const updated = {
                                        ...selectedOrderDetail,
                                        payment_status: "cancelled",
                                    }
                                    // editElement(selectedOrderDetail[idKey], updated)
                                    updateOrder(
                                        [selectedOrderDetail[idKey]],
                                        "cancelled",
                                        "cancellation_datetime",
                                        getKSTISOString(),
                                        null,
                                        null,
                                        null
                                    )
                                    setSelectedOrderDetail(null)
                                }}
                                onRefund={() => {
                                    const updated = {
                                        ...selectedOrderDetail,
                                        payment_status: "refunded",
                                    }
                                    // editElement(selectedOrderDetail[idKey], updated)
                                    updateOrder(
                                        [selectedOrderDetail[idKey]],
                                        "refunded",
                                        "refund_datetime",
                                        getKSTISOString(),
                                        null,
                                        null,
                                        null
                                    )
                                    setSelectedOrderDetail(null)
                                }}
                                onCheckIn={() => {
                                    const updated = {
                                        ...selectedOrderDetail,
                                        stay_status: "checked_in",
                                    }
                                    // editElement(selectedOrderDetail[idKey], updated)
                                    updateOrder(
                                        [selectedOrderDetail[idKey]],
                                        null,
                                        null,
                                        null,
                                        "checked_in",
                                        "checkin_datetime",
                                        getKSTISOString()
                                    )
                                    setSelectedOrderDetail(null)
                                }}
                                onCheckOut={() => {
                                    const updated = {
                                        ...selectedOrderDetail,
                                        stay_status: "checked_out",
                                    }
                                    // editElement(selectedOrderDetail[idKey], updated)
                                    updateOrder(
                                        [selectedOrderDetail[idKey]],
                                        null,
                                        null,
                                        null,
                                        "checked_out",
                                        "checkout_datetime",
                                        getKSTISOString()
                                    )
                                    setSelectedOrderDetail(null)
                                }}
                            />
                        )}
                    </div>
                </>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <div
                        style={{
                            minWidth: `${parsedFields.length * 120 + 160}px`,
                            borderTop: "1px solid #ccc",
                        }}
                    >
                        <TableHeader
                            fields={parsedFields}
                            sortConfig={sortConfig}
                            toggleSort={toggleSort}
                        />
                        {paginatedRows.map((row) => {
                            const rowID = row[idKey]
                            return (
                                <ElementComponent
                                    key={rowID}
                                    data={row}
                                    fields={parsedFields}
                                    onEdit={(updatedRow) =>
                                        editElement(rowID, updatedRow)
                                    }
                                    onDelete={() => deleteElement(rowID)}
                                    isNew={
                                        justAddedID !== null &&
                                        rowID === justAddedID
                                    }
                                    idKey={idKey}
                                    isPlaceholder={false}
                                />
                            )
                        })}
                        {Array.from({ length: emptySlots }).map((_, i) => (
                            <ElementComponent
                                key={`empty-${i}`}
                                data={parsedFields.reduce(
                                    (acc, field) => ({
                                        ...acc,
                                        [field.key]: "\u200B",
                                    }),
                                    {}
                                )}
                                fields={parsedFields}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                isNew={false}
                                idKey={idKey}
                                isPlaceholder={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

addPropertyControls(TableComponent, {
    variant: {
        type: ControlType.Enum,
        options: ["coupons", "days", "customers", "orders", "tablet", "mobile"],
        optionTitles: [
            "쿠폰 조건",
            "휴일/성수기",
            "고객 정보",
            "전체 주문 내역",
            "Tablet (수정 불가)",
            "Mobile (수정 불가)",
        ],
        defaultValue: "days",
        title: "Variant",
    },
})
