
// OrderDetailOverlay.tsx
import * as React from "react"
import { OrderJsonAccordion } from "./OrderJsonAccordion.tsx"
import { formatDate, parseDate } from "../Receipt/CheckAuth.tsx"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

const formatDateTime = (str?: string | null) =>
    str
        ? new Date(str).toLocaleString("ko-KR", {
              hour12: false,
          })
        : "-"

export function OrderDetailOverlay({
    order,
    onClose,
    onAccept,
    onDecline,
    onRefund,
    onCheckIn,
    onCheckOut,
}: {
    order: Record<string, any>
    onClose: () => void
    onAccept: () => void
    onDecline: () => void
    onRefund: () => void
    onCheckIn: () => void
    onCheckOut: () => void
}) {
    const amount = order.amount || 0

    const buttonStyleBase = {
        padding: "10px 20px",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: 500,
        backgroundColor: "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        borderWidth: "2px",
        borderStyle: "solid",
    } as const

    const styles = {
        green: {
            ...buttonStyleBase,
            borderColor: "#22b463",
            color: "#22b463",
        },
        red: {
            ...buttonStyleBase,
            borderColor: "#ea5455",
            color: "#ea5455",
        },
        yellow: {
            ...buttonStyleBase,
            borderColor: "#ff9f43",
            color: "#ff9f43",
        },
        blue: {
            ...buttonStyleBase,
            borderColor: "#4b7bec",
            color: "#4b7bec",
        },
        brown: {
            ...buttonStyleBase,
            borderColor: "#7B5E57",
            color: "#7B5E57",
        },
    }

    const hoverStyle = {
        green: { backgroundColor: "#22b4632d" },
        red: { backgroundColor: "#ea54552d" },
        yellow: { backgroundColor: "#ff9f432d" },
        blue: { backgroundColor: "#4b7bec2d" },
        brown: { backgroundColor: "#7B5E572d" },
    }

    // const todayKST = getKSTDate().toLocaleDateString("ko-KR", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //     weekday: "long",
    // })
    const todayKST = getKSTDate().toISOString().slice(0, 10)

    const [hover, setHover] = React.useState<string | null>(null)

    const handleConfirm = (type: "accept" | "decline" | "refund") => {
        if (type === "accept") {
            if (
                window.confirm(
                    `${formatDateTime(order.payment_timeline.order_datetime)}로부터 24시간 이내에 ${Number(order.final_price).toLocaleString()}원이 입금된 것을 확인하셨나요?\n\n${order.reserver_name}님에게 예약 확정 알림톡이 전송됩니다.\n\n예약을 확정하시겠습니까?`
                )
            ) {
                onAccept()
            }
        } else if (type === "decline") {
            if (
                window.confirm(
                    `${order.reserver_name}님에게 예약 거절 알림톡이 전송됩니다.\n\n예약을 거절하시겠습니까?`
                )
            ) {
                onDecline()
            }
        } else if (type === "refund") {
            if (
                window.confirm(
                    `${(Number(order.refund_info.discounted_w_vat_refund) + Number(order.refund_info.additional_w_vat_refund) + Number(order.refund_info.deposit_refund)).toLocaleString()}원 환불을 진행하셨나요?\n - 환불 계좌: ${order.refund_info.refund_bank} ${order.refund_info.refund_account}\n - 예금주: ${order.refund_info.refund_name}\n\n${order.reserver_name}님에게 환불 알림톡이 전송됩니다.\n\n환불을 완료하시겠습니까?`
                )
            ) {
                onRefund()
            }
        }
    }

    const actionButtons = () => {
        const status = order.payment_status
        const stayStatus = order.stay_status

        const buttons: React.ReactNode[] = []

        // Check In / Check Out logic (only if not in pending/cancelled/refunded)
        if (status === "accepted") {
            if (stayStatus === "before_checkin") {
                buttons.push(
                    <button
                        key="checked_in"
                        onClick={() => {
                            if (
                                window.confirm(
                                    `${order.reserver_name}님의 체크인 예정 날짜는 ${order.start_date}입니다.\n숙박 기간: ${order.start_date} ~ ${order.end_date}\n오늘 날짜: ${todayKST}\n\n* 체크인 혹은 체크아웃 완료 시 예약 취소/환불이 불가합니다.\n\n체크인을 진행하시겠습니까?`
                                )
                            ) {
                                onCheckIn()
                            }
                        }}
                        style={{
                            ...styles.blue,
                            ...(hover === "checked_in" ? hoverStyle.blue : {}),
                        }}
                        onMouseEnter={() => setHover("checked_in")}
                        onMouseLeave={() => setHover(null)}
                    >
                        Check In
                    </button>
                )
            } else if (stayStatus === "checked_in") {
                buttons.push(
                    <button
                        key="checked_out"
                        onClick={() => {
                            if (
                                window.confirm(
                                    `${order.reserver_name}님의 체크아웃 예정 날짜는 ${order.end_date}입니다.\n숙박 기간: ${order.start_date} ~ ${order.end_date}\n오늘 날짜: ${todayKST}\n\n* 체크인 혹은 체크아웃 완료 시 예약 취소/환불이 불가합니다.\n\n체크아웃을 진행하시겠습니까?`
                                )
                            ) {
                                onCheckOut()
                            }
                        }}
                        style={{
                            ...styles.brown,
                            ...(hover === "checked_out"
                                ? hoverStyle.brown
                                : {}),
                        }}
                        onMouseEnter={() => setHover("checked_out")}
                        onMouseLeave={() => setHover(null)}
                    >
                        Check Out
                    </button>
                )
            }
        }

        // Action buttons
        if (status === "pending") {
            buttons.push(
                <button
                    key="accept"
                    onMouseEnter={() => setHover("accept")}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => handleConfirm("accept")}
                    style={{
                        ...styles.green,
                        ...(hover === "accept" ? hoverStyle.green : {}),
                    }}
                >
                    Accept
                </button>,
                <button
                    key="decline"
                    onMouseEnter={() => setHover("decline")}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => handleConfirm("decline")}
                    style={{
                        ...styles.red,
                        ...(hover === "decline" ? hoverStyle.red : {}),
                    }}
                >
                    Decline
                </button>
            )
        } else if (status === "accepted" && stayStatus === "before_checkin") {
            // TODO: Cancel과 Decline을 서로 분리하기: 밑에 있는 코드는 기존의 로직과 알람을 따라가는 Cancel이지만, 위에 있는 코드는 환불 정보가 없는 Decline이어야 함

            buttons.push(
                <button
                    key="decline"
                    onMouseEnter={() => setHover("decline")}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => handleConfirm("decline")}
                    style={{
                        ...styles.red,
                        ...(hover === "decline" ? hoverStyle.red : {}),
                    }}
                >
                    Decline
                </button>
            )
        } else if (status === "cancelled") {
            buttons.push(
                <button
                    key="refund"
                    onMouseEnter={() => setHover("refund")}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => handleConfirm("refund")}
                    style={{
                        ...styles.yellow,
                        ...(hover === "refund" ? hoverStyle.yellow : {}),
                    }}
                >
                    Refund
                </button>
            )
        }

        return buttons
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    width: "80vw",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    borderRadius: 8,
                    padding: 24,
                    position: "relative",
                    fontFamily: "Pretendard, sans-serif",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontSize: 18,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                    }}
                >
                    ✖
                </button>

                <h2 style={{ marginBottom: 16 }}>예약 상세 정보</h2>
                <OrderJsonAccordion data={order} />

                <div
                    style={{
                        marginTop: 24,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    {actionButtons()}
                </div>
            </div>
        </div>
    )
}
