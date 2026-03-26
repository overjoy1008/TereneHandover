// MemberOrdersTable.tsx
import React, { useState, useEffect, useMemo } from "react"
import { OrdersTableLogic } from "./OrdersTableLogic.tsx"
import { MemberOrdersTableElement } from "./MemberOrdersTableElement.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { OrdersTableToolbar } from "./OrdersTableToolbar.tsx"
import { OrdersTableDetail } from "./OrdersTableDetail.tsx"
import { useStore } from "../../Store/MainStore.tsx"
import { addPropertyControls, ControlType } from "framer"
import RefundPopup from "./RefundPopup.tsx"

export function MemberOrdersTable({
    viewMode = "desktop",
}: {
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const [store] = useStore()
    const [tab, setTab] = useState<"예약" | "취소">("예약")
    const [branch, setBranch] = useState("")
    const [detailOrder, setDetailOrder] = useState<any | null>(null)
    const [isRefundOpen, setIsRefundOpen] = useState(false)
    const [refundTarget, setRefundTarget] = useState<any | null>(null)

    const {
        sortedRows,
        itemsPerPage,
        currentPage,
        prevPage,
        nextPage,
        updateOrder,
        setFilters,
        toggleSort,
        sortConfig,
        onDeclineCustomer,
        onCancelCustomer,
    } = OrdersTableLogic()

    const handleSearch = (customTab?: "예약" | "취소") => {
        const effectiveTab = customTab ?? tab
        setFilters({
            tab: effectiveTab,
            branch,
            membership_number: store?.membership_number,
        })
    }

    useEffect(() => {
        if (store?.membership_number) {
            handleSearch()
        }
    }, [store?.membership_number])

    const filteredRows = useMemo(() => {
        return sortedRows.filter(
            (row) =>
                row.membership_number === store?.membership_number &&
                (row.reservation_status !== "pending" ||
                    row.reserved_by_vaadd === true)
        )
    }, [sortedRows, store?.membership_number])

    const paginatedRows = useMemo(() => {
        return filteredRows.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [filteredRows, currentPage, itemsPerPage])

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
    }, [filteredRows, itemsPerPage])

    const openRefund = (row: any) => {
        setRefundTarget(row)
        setIsRefundOpen(true)
    }
    const closeRefund = () => {
        setIsRefundOpen(false)
        setRefundTarget(null)
    }

    return (
        <div
            style={{
                width: "100%",
                fontFamily: "Pretendard, sans-serif",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 40,
            }}
        >
            <OrdersTableToolbar
                tab={tab}
                onChangeTab={(label) => {
                    setTab(label)
                    handleSearch(label)
                }}
                branch={branch}
                onChangeBranch={(val) => {
                    setBranch(val)
                    handleSearch()
                }}
                onSearch={() => handleSearch()}
                viewMode={viewMode} // ✅ 이거 추가
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                viewMode === "mobile"
                                    ? "repeat(4, 1fr)"
                                    : "repeat(5, 1fr)",
                            padding: "12px 0",
                            fontWeight: 600,
                            fontSize: viewMode === "mobile" ? 11 : 14,
                            color: "#333",
                        }}
                    >
                        {viewMode !== "mobile" && (
                            <div
                                onClick={() =>
                                    toggleSort("reservation_status_tag")
                                }
                                style={{ cursor: "pointer" }}
                            >
                                예약 표시 상황
                                {sortConfig?.key ===
                                    "reservation_status_tag" && (
                                    <span>
                                        {sortConfig.direction === "asc"
                                            ? "▲"
                                            : "▼"}
                                    </span>
                                )}
                            </div>
                        )}

                        <div
                            onClick={() => toggleSort("reserver_name")}
                            style={{ cursor: "pointer" }}
                        >
                            예약자{" "}
                            {sortConfig?.key === "reserver_name" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("stay_info.name")}
                            style={{ cursor: "pointer" }}
                        >
                            숙박자{" "}
                            {sortConfig?.key === "stay_info.name" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("checkin_date")}
                            style={{ cursor: "pointer" }}
                        >
                            숙박 정보{" "}
                            {sortConfig?.key === "checkin_date" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("final_price")}
                            style={{ cursor: "pointer" }}
                        >
                            합계{" "}
                            {sortConfig?.key === "final_price" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>
                    </div>

                    <div style={{ borderBottom: "1px solid #bdbdbd" }}>
                        {filteredRows.map((row) => (
                            <MemberOrdersTableElement
                                key={row.order_id}
                                data={row}
                                viewMode={viewMode}
                                onUpdateOrder={updateOrder}
                                onOpenDetail={() => setDetailOrder(row)}
                                onDeclineCustomer={onDeclineCustomer}
                                onCancelCustomer={onCancelCustomer}
                                onOpenRefund={openRefund}
                            />
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 25,
                        padding: "24px 0",
                        fontSize: 16,
                        color: "#444",
                    }}
                >
                    <PaginationArrow
                        direction="left"
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        size={16}
                    />
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <PaginationArrow
                        direction="right"
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        size={16}
                    />
                </div>
            </div>

            {detailOrder && (
                <OrdersTableDetail
                    order={detailOrder}
                    onClose={() => setDetailOrder(null)}
                    onAccept={() => {}}
                    onDecline={() => {}}
                    onCancel={() => {}}
                    onRefund={() => {}}
                    onSettlement={() => {}}
                    onComplete={() => {}}
                    onCheckIn={() => {}}
                    onCheckOut={() => {}}
                    mode="customer"
                />
            )}

            {isRefundOpen && refundTarget && (
                <RefundPopup
                    onClose={closeRefund}
                    onCancelCustomer={() =>
                        onCancelCustomer(refundTarget.order_id)
                    }
                    data={refundTarget}
                    mode="admin"
                />
            )}
        </div>
    )
}

addPropertyControls(MemberOrdersTable, {
    viewMode: {
        type: ControlType.Enum,
        title: "View",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop", "Tablet", "Mobile"],
        defaultValue: "desktop",
    },
})
