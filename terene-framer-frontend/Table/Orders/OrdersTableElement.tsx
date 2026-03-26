// OrdersTableElement.tsx
import React, { useState } from "react"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"

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

const formatTimestamp = (s: string) =>
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

export function OrdersTableElement({
    data,
    onUpdateOrder,
    onOpenDetail,
}: {
    data: any
    onUpdateOrder: (orderId: string, status: string) => void
    onOpenDetail: () => void
}) {
    const [isHiding, setIsHiding] = useState(false)
    const [hasHidden, setHasHidden] = useState<boolean>(Boolean(data.hidden))

    const cancellation = data._cancellations?.[0]
    const refund = data._refunds?.[0]
    const payment = data._payments?.[0]
    const settlement = data._settlements?.[0]

    const getReservationStatusTag = () => {
        const { reservation_status, stay_status, reserved_by_vaadd } = data
        const cancel_type = cancellation?.cancel_type
        const cancel_status = cancellation?.cancel_status
        const settlement_type = settlement?.settlement_type
        const settlement_status = settlement?.settlement_status

        let label = "-"
        let color = "#000000"
        let timestamp = ""

        if (cancel_type === "unpaid_cancel") {
            label = `취소 완료`
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
            label = `취소 처리 완료`
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (
            reservation_status === "pending" &&
            !cancellation &&
            !reserved_by_vaadd
        ) {
            label = "미결제 상태"
            color = "#ff0000"
            timestamp = getLatestTimestamp(data.reservation_history, "pending")
        } else if (
            reservation_status === "pending" &&
            !cancellation &&
            reserved_by_vaadd
        ) {
            label = "예약 대기"
            color = "#ffae00"
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
            label = `체크아웃 완료`
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
                        {formatTimestamp(timestamp)}
                    </div>
                )}
            </div>
        )
    }

    const getPaymentStatusTag = () => {
        const payment_status = payment?.payment_status
        const cancel_type = cancellation?.cancel_type
        const settlement_type = settlement?.settlement_type
        const settlement_status = settlement?.settlement_status
        const refund_status = refund?.refund_status

        let label = "-"
        let color = "#000000"
        let timestamp = ""

        const paymentHistory =
            payment?.payment_type === "order" ? payment?.payment_history : []

        if (
            (payment_status === "pending" || payment_status === "processing") &&
            !cancellation
        ) {
            label = "결제 대기"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(paymentHistory)
        } else if (payment_status === "error") {
            label = "결제 오류"
            color = "#ff4141"
            timestamp = getLatestTimestamp(paymentHistory, "error")
        } else if (
            payment_status === "completed" &&
            !cancellation &&
            !refund &&
            !settlement
        ) {
            label = "결제 완료"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(paymentHistory, "completed")
        } else if (
            payment_status === "completed" &&
            settlement_type === "deposit_refund" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "보증금 환불 진행중"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            payment_status === "completed" &&
            settlement_type === "additional_payment" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "추가 결제 대기"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            payment_status === "completed" &&
            settlement_status === "completed"
        ) {
            label = "정산 완료"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            payment_status === "completed" &&
            cancel_type === "paid_cancel" &&
            (refund_status === "pending" || refund_status === "processing")
        ) {
            label = "환불 신청"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(refund?.refund_history)
        } else if (
            payment_status === "completed" &&
            cancel_type === "paid_cancel" &&
            refund_status === "completed"
        ) {
            label = "환불 완료"
            timestamp = getLatestTimestamp(refund?.refund_history)
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
                        {formatTimestamp(timestamp)}
                    </div>
                )}
            </div>
        )
    }

    const getStayStatusTag = () => {
        const { reservation_status, stay_status } = data
        const payment_status = payment?.payment_status
        const isCanceled = !!cancellation || !!refund

        let label = "-"
        let color = "#000000"
        let timestamp = ""

        if (
            (reservation_status === "confirmed" ||
                payment_status === "completed") &&
            !isCanceled &&
            stay_status === "checked_in"
        ) {
            label = "체크인 중"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(data.stay_history, "checked_in")
        } else if (
            (reservation_status === "confirmed" ||
                payment_status === "completed") &&
            !isCanceled &&
            stay_status === "checked_out"
        ) {
            label = "체크아웃 완료"
            timestamp = getLatestTimestamp(data.stay_history, "checked_out")
        } else if (
            (reservation_status === "confirmed" ||
                payment_status === "completed") &&
            !isCanceled &&
            stay_status === "before_checkin"
        ) {
            label = "체크인 대기"
            color = "#b0b0b0"
            timestamp = getLatestTimestamp(data.stay_history, "before_checkin")
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
                        {formatTimestamp(timestamp)}
                    </div>
                )}
            </div>
        )
    }

    const shouldShowHideButton = (() => {
        const cancel_type = cancellation?.cancel_type
        const cancel_status = cancellation?.cancel_status
        const settlement_status = settlement?.settlement_status
        const reservation_status = data?.reservation_status
        const reserved_by_vaadd = data?.reserved_by_vaadd

        const isFailedReservation =
            reservation_status === "pending" &&
            !cancellation &&
            !reserved_by_vaadd

        const isCancelDone =
            cancel_type === "unpaid_cancel" ||
            (cancel_type === "paid_cancel" && cancel_status === "completed")

        const isStayCompleted =
            reservation_status === "confirmed" &&
            settlement_status === "completed"

        return (
            (isFailedReservation || isCancelDone || isStayCompleted) &&
            !hasHidden
        )
    })()

    const handleHideOrder = async () => {
        const ok = window.confirm("이 예약을 목록에서 숨기시겠습니까?")
        if (!ok) return
        try {
            setIsHiding(true)

            // ✅ orders 테이블 컬럼만 포함
            const payload = {
                order_id: data.order_id,
                old_order_id: data.old_order_id,
                membership_number: data.membership_number,
                reserver_name: data.reserver_name,
                reserver_birthdate: data.reserver_birthdate,
                reserver_contact: data.reserver_contact,
                reserver_email: data.reserver_email,
                stay_info: data.stay_info,
                stay_people: data.stay_people,
                stay_location: data.stay_location,
                checkin_date: data.checkin_date,
                checkout_date: data.checkout_date,
                stay_details: data.stay_details,
                initial_price: data.initial_price,
                discounted_price: data.discounted_price,
                service_price: data.service_price,
                vat_price: data.vat_price,
                deposit_price: data.deposit_price,
                final_price: data.final_price,
                stay_status: data.stay_status,
                stay_history: data.stay_history,
                reservation_status: data.reservation_status,
                reservation_history: data.reservation_history,
                reserved_by_vaadd: data.reserved_by_vaadd,
                hidden: true,
            }

            const res = await fetch(
                `https://terene-db-server.onrender.com/api/v2/orders/${encodeURIComponent(
                    data.order_id
                )}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )

            if (!res.ok) {
                const text = await res.text().catch(() => "")
                throw new Error(text || `HTTP ${res.status}`)
            }

            setHasHidden(true)
            alert("예약이 숨겨졌습니다.")
        } catch (e: any) {
            console.error(e)
            alert(`숨김 처리 중 오류가 발생했습니다.\n${e?.message ?? e}`)
        } finally {
            setIsHiding(false)
        }
    }

    const reservationTime =
        data.reservation_history?.find(
            (r: any) => r.status === data.reservation_status
        )?.timestamp || ""

    const settlement_final_price =
        data._settlements &&
        data._settlements?.[0]?.settlement_type === "deposit_refund"
            ? data.final_price - data._settlements[0]?.settlement_amount
            : data._settlements &&
                data._settlements?.[0]?.settlement_type === "additional_payment"
              ? data.final_price + data._settlements[0]?.settlement_amount
              : data.final_price

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 10,
                borderTop: "1px solid #BDBDBD",
                fontFamily: "Pretendard, sans-serif",
                // opacity:
                //     data.reservation_status === "pending" &&
                //     !data._cancellations?.[0] &&
                //     data.reserved_by_vaadd === false
                //         ? 0.5
                //         : 1,
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
                    예약일자: {formatTimestamp(reservationTime)}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
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
                    gridTemplateColumns: "repeat(7, 1fr)",
                    fontSize: 13,
                    padding: "30px 0",
                    borderTop: "1px solid #E0E0E0",
                }}
            >
                <div>{getReservationStatusTag()}</div>
                <div>{getPaymentStatusTag()}</div>
                <div>{getStayStatusTag()}</div>

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
                        일반 {data.stay_people?.adult ?? "-"}, 유아{" "}
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
                    ₩{Number(settlement_final_price || 0).toLocaleString()}
                    {shouldShowHideButton && (
                        <button
                            type="button"
                            onClick={handleHideOrder}
                            disabled={isHiding}
                            style={{
                                all: "unset",
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
                        >
                            {isHiding ? "숨기는 중..." : "예약 숨김"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
