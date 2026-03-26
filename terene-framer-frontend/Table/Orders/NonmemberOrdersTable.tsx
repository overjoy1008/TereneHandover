// NonmemberOrdersTable.tsx
import React, { useEffect, useState, useMemo } from "react"
import { OrdersTableLogic } from "./OrdersTableLogic.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { OrdersTableDetail } from "./OrdersTableDetail.tsx"
import { NonmemberOrdersTableElement } from "./NonmemberOrdersTableElement.tsx"
import { addPropertyControls, ControlType } from "framer"
import RefundPopup from "./RefundPopup.tsx"

function getQueryParams() {
    const params = new URLSearchParams(window.location.search)
    return {
        order_id: params.get("order_id") ?? "",
        reserver_name: params.get("reserver_name") ?? "",
        reserver_contact: params.get("reserver_contact") ?? "",
    }
}

const normalize = (str?: string) =>
    (str ?? "").replace(/[\s\-]/g, "").toLowerCase()

export function NonmemberOrdersTable({
    viewMode = "desktop",
}: {
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const {
        updateOrder,
        sortConfig,
        toggleSort,
        sortedRows: allRows,
        onDeclineCustomer,
        onCancelCustomer,
    } = OrdersTableLogic()

    const [queryFilters, setQueryFilters] = useState({
        order_id: "",
        reserver_name: "",
        reserver_contact: "",
    })

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [detailOrder, setDetailOrder] = useState<any | null>(null)
    const [isRefundOpen, setIsRefundOpen] = useState(false)
    const [refundTarget, setRefundTarget] = useState<any | null>(null)

    useEffect(() => {
        const query = getQueryParams()
        setQueryFilters(query)
    }, [])

    const filteredRows = useMemo(() => {
        const hasOrderId = !!queryFilters.order_id.trim()
        const hasNameAndContact =
            !!queryFilters.reserver_name.trim() &&
            !!queryFilters.reserver_contact.trim()

        return allRows.filter((row) => {
            const includeRow =
                row.reservation_status !== "pending" || !!row.reserved_by_vaadd

            if (!includeRow) return false

            if (hasOrderId) {
                return (
                    normalize(row.order_id) === normalize(queryFilters.order_id)
                )
            } else if (hasNameAndContact) {
                return (
                    normalize(row.reserver_name) ===
                        normalize(queryFilters.reserver_name) &&
                    normalize(row.reserver_contact) ===
                        normalize(queryFilters.reserver_contact)
                )
            } else {
                return false
            }
        })
    }, [allRows, queryFilters])

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredRows])

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
    }, [filteredRows])

    const paginatedFilteredRows = useMemo(() => {
        return filteredRows.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [filteredRows, currentPage])

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
                                    ? "repeat(3, 1fr)"
                                    : "repeat(4, 1fr)",
                            padding: "12px 0",
                            fontWeight: 600,
                            fontSize: viewMode === "mobile" ? 12 : 14,
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
                                예약 상황
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
                        <div>예약자</div>
                        <div>숙박 정보</div>
                        <div>합계</div>
                    </div>

                    <div style={{ borderBottom: "1px solid #bdbdbd" }}>
                        {paginatedFilteredRows.map((row) => (
                            <NonmemberOrdersTableElement
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

                        {paginatedFilteredRows.length === 0 && (
                            <div
                                style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#888",
                                }}
                            >
                                로딩중입니다.
                            </div>
                        )}
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
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        size={16}
                    />
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <PaginationArrow
                        direction="right"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                            )
                        }
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

addPropertyControls(NonmemberOrdersTable, {
    viewMode: {
        type: ControlType.Enum,
        title: "View",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop", "Tablet", "Mobile"],
        defaultValue: "desktop",
    },
})
