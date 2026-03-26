import React, { useState } from "react"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import RefundPopup from "./RefundPopup.tsx" // 경로에 맞게 조정하세요

const Tag = ({ value, color }: { value: string; color: string }) => (
    <span
        style={{
            height: 27,
            width: "fit-content",
            padding: "5px 10px",
            display: "inline-block",
            fontSize: 14,
            fontWeight: 500,
            border: `1px solid ${color}`,
            color,
        }}
    >
        {value}
    </span>
)

const format = (s: string) =>
    s ? s.replace("T", " ").slice(0, 16) : "시간 없음"

const getLatestTimestamp = (history: any[], status?: string) => {
    if (!history || !Array.isArray(history)) return ""
    const filtered = status
        ? history.filter((h) => h.status === status)
        : history
    if (filtered.length === 0) return ""
    return filtered.reduce((latest, curr) =>
        new Date(curr.timestamp) > new Date(latest.timestamp) ? curr : latest
    ).timestamp
}

export function MemberOrdersTableElement({
    data,
    onUpdateOrder,
    onOpenDetail,
    onDeclineCustomer,
    onCancelCustomer,
}: {
    data: any
    onUpdateOrder: (orderId: string, status: string) => void
    onOpenDetail: () => void
    onDeclineCustomer: (orderId: string) => void
    onCancelCustomer: (orderId: string) => void
}) {
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

    const handleRefundClose = () => {
        setIsRefundModalOpen(false)
    }

    const cancellation = data._cancellations?.[0]
    const settlement = data._settlements?.[0]

    const getReservationStatusTag = () => {
        const { reservation_status, stay_status } = data
        const cancel_type = cancellation?.cancel_type
        const cancel_status = cancellation?.cancel_status
        const settlement_type = settlement?.settlement_type
        const settlement_status = settlement?.settlement_status

        let label = "-"
        let color = "#000000"
        let timestamp = ""

        if (cancel_type === "unpaid_cancel") {
            label = "취소 완료"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (
            cancel_type === "paid_cancel" &&
            (cancel_status === "pending" || cancel_status === "processing")
        ) {
            label = "예약 취소 신청"
            color = "#ffbb28"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (
            cancel_type === "paid_cancel" &&
            cancel_status === "completed"
        ) {
            label = "취소 처리 완료"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (reservation_status === "pending" && !cancellation) {
            label = "예약 대기"
            color = "#ff4141"
            timestamp = getLatestTimestamp(data.reservation_history, "pending")
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "before_checkin"
        ) {
            label = "예약 확정"
            color = "#49c94d"
            timestamp = getLatestTimestamp(
                data.reservation_history,
                "confirmed"
            )
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "checked_in"
        ) {
            label = "체크인 중"
            color = "#3551ff"
            timestamp = getLatestTimestamp(data.stay_history, "checked_in")
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "checked_out"
        ) {
            label = "체크아웃 완료"
            color = "#996b18"
            timestamp = getLatestTimestamp(data.stay_history, "checked_out")
        } else if (
            reservation_status === "confirmed" &&
            settlement_type === "deposit_refund" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "보증금 환불 진행중"
            color = "#ffbb28"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            reservation_status === "confirmed" &&
            settlement_type === "additional_payment" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "추가 결제 대기"
            color = "#2f7048"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            reservation_status === "confirmed" &&
            settlement_status === "completed"
        ) {
            label = "숙박 완료"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        }

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                <Tag value={label} color={color} />
                {timestamp && (
                    <div style={{ color: "#888", fontSize: 12 }}>
                        {format(timestamp)}
                    </div>
                )}
            </div>
        )
    }

    const reservationTime =
        data.reservation_history?.find(
            (r: any) => r.status === data.reservation_status
        )?.timestamp || ""

    const shouldShowCancelButton =
        (data.reservation_status === "pending" && !cancellation) ||
        (data.reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            data.stay_status === "before_checkin")

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 10,
                borderTop: "1px solid #BDBDBD",
                fontFamily: "Pretendard, sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 20,
                    cursor: "pointer",
                }}
                onClick={onOpenDetail}
            >
                <div
                    style={{ fontSize: 12, color: "#000", lineHeight: "35px" }}
                >
                    예약번호: {data.order_id}
                </div>
                <div
                    style={{ fontSize: 12, color: "#000", lineHeight: "35px" }}
                >
                    예약일자: {format(reservationTime)}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        lineHeight: "35px",
                    }}
                >
                    <span style={{ fontSize: 11, color: "#888" }}>
                        상세 내역보기
                    </span>
                    <PaginationArrow direction="right" size={8} color="#888" />
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    fontSize: 13,
                    padding: "30px 0",
                    borderTop: "1px solid #E0E0E0",
                }}
            >
                <div>{getReservationStatusTag()}</div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {data.reserver_name || "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        {data.membership_number || "비회원 예약"}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {data.stay_info?.name || "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        성인 {data.stay_people?.adult ?? "-"}, 영유아{" "}
                        {data.stay_people?.child ?? "-"}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {data.stay_location || "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        {data.checkin_date || "-"} - {data.checkout_date || "-"}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        fontWeight: 600,
                        gap: 10,
                    }}
                >
                    ₩{Number(data.final_price || 0).toLocaleString()}
                    {shouldShowCancelButton && (
                        <div
                            style={{
                                fontFamily: "Pretendard, sans-serif",
                                fontWeight: 400,
                                fontSize: 14,
                                lineHeight: "1.2em",
                                color: "#949494",
                                padding: "5px 10px",
                                borderBottom: "1px solid #949494",
                                display: "inline-block",
                                width: "fit-content",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                const refundAmount = Number(
                                    data.final_price || 0
                                )

                                if (data.reservation_status === "pending") {
                                    const confirm =
                                        window.confirm(
                                            "예약을 취소하시겠습니까?"
                                        )
                                    if (confirm)
                                        onDeclineCustomer(data.order_id)
                                } else if (
                                    data.reservation_status === "confirmed"
                                ) {
                                    const confirm = window.confirm(
                                        `예약을 취소 및 환불 요청하시겠습니까?\n\n환불 예정 금액: ${refundAmount.toLocaleString()}`
                                    )
                                    if (confirm) onCancelCustomer(data.order_id)
                                }
                            }}
                        >
                            예약 취소
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
