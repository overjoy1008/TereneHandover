// OrdersTable.tsx
import React, { useState, useMemo } from "react"
import { OrdersTableLogic } from "./OrdersTableLogic.tsx"
import { OrdersTableElement } from "./OrdersTableElement.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { OrdersTableToolbar } from "./OrdersTableToolbar.tsx"
import { OrdersTableDetail } from "./OrdersTableDetail.tsx"

export function OrdersTableComponent() {
    const [tab, setTab] = useState<"예약" | "취소">("예약")
    const [branch, setBranch] = useState("")
    const [detailOrder, setDetailOrder] = useState<any | null>(null)

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
        handleCancel,
        handleRefund,
        handleSettlement,
        handleComplete,
        reload,
    } = OrdersTableLogic()

    const paginatedRows = useMemo(() => {
        return sortedRows.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [sortedRows, currentPage, itemsPerPage])

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(sortedRows.length / itemsPerPage))
    }, [sortedRows, itemsPerPage])

    const handleSearch = (customTab?: "예약" | "취소", q?: string) => {
        const effectiveTab = customTab ?? tab
        setFilters({
            tab: effectiveTab,
            branch,
            query: q && q.trim() ? q.trim() : undefined,
        })
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
                onSearch={(q) => handleSearch(undefined, q)}
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
                            gridTemplateColumns: "repeat(7, 1fr)",
                            padding: "12px 0",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#333",
                        }}
                    >
                        <div
                            onClick={() => toggleSort("reservation_status_tag")}
                            style={{ cursor: "pointer" }}
                        >
                            예약 표시 상황
                            {sortConfig?.key === "reservation_status_tag" && (
                                <span>
                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                </span>
                            )}
                        </div>

                        <div>결제 상황</div>
                        <div>입실 상황</div>

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
                        {paginatedRows.map((row) => (
                            <OrdersTableElement
                                key={row.order_id}
                                data={row}
                                onUpdateOrder={updateOrder}
                                onOpenDetail={() => setDetailOrder(row)}
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
                    onAccept={() =>
                        updateOrder(detailOrder.order_id, "accepted")
                    }
                    onDecline={() =>
                        handleCancel(
                            detailOrder.order_id,
                            "decline",
                            detailOrder.nationality === "foreign"
                                ? "foreign_en"
                                : "toss_ko"
                        )
                    }
                    onCancel={() =>
                        handleCancel(
                            detailOrder.order_id,
                            "cancel",
                            detailOrder.nationality === "foreign"
                                ? "foreign_en"
                                : "toss_ko"
                        )
                    }
                    onRefund={() =>
                        handleRefund(
                            detailOrder.order_id,
                            detailOrder.nationality === "foreign"
                                ? "foreign_en"
                                : "toss_ko"
                        )
                    }
                    onSettlement={(type, info, url) =>
                        handleSettlement(
                            detailOrder.order_id,
                            type,
                            info,
                            url,
                            detailOrder.nationality === "foreign"
                                ? "foreign_en"
                                : "toss_ko"
                        )
                    }
                    onComplete={(type, info, url) =>
                        handleComplete(detailOrder.order_id, type, info)
                    }
                    onCheckIn={() =>
                        updateOrder(detailOrder.order_id, "checked_in")
                    }
                    onCheckOut={() =>
                        updateOrder(detailOrder.order_id, "checked_out")
                    }
                    onReload={reload}
                    mode="admin"
                />
            )}
        </div>
    )
}
