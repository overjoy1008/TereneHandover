// OrdersTableDetail.tsx
import * as React from "react"
import { OrdersTableDetailList } from "./OrdersTableDetailList.tsx"
import { getDiffDaysKST } from "./OrdersTableLogic.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"
import {
    fetchRefundPolicies,
    getRefundPolicyByDays,
} from "../../Utils/refundPolicy.ts"

export function OrdersTableDetail({
    order,
    onClose,
    onAccept,
    onDecline,
    onCancel,
    onRefund,
    onSettlement,
    onComplete,
    onCheckIn,
    onCheckOut,
    onReload,
    mode = "admin",
}: {
    order: Record<string, any>
    onClose: () => void
    onAccept: () => void | Promise<void>
    onDecline: () => void | Promise<void>
    onCancel: () => void | Promise<void>
    onRefund: () => void | Promise<void>
    onSettlement: (
        type: "refund" | "additional",
        info: {
            additional_price: number
            settlement_amount: number
            settlement_breakdown: string
        },
        settlement_url?: string
    ) => void | Promise<void>
    onComplete: (
        type: "refund" | "additional" | "complete",
        info: {
            additional_price: number
            settlement_amount: number
            settlement_breakdown: string
        },
        settlement_url?: string
    ) => void | Promise<void>
    onCheckIn: () => void | Promise<void>
    onCheckOut: () => void | Promise<void>
    onReload?: () => void
    mode?: "admin" | "customer"
}) {
    const [hover, setHover] = React.useState<string | null>(null)

    const [settlementResult, setSettlementResult] = React.useState<
        "refund" | "payment" | "complete" | null
    >(null)

    const [settlementData, setSettlementData] = React.useState({
        additional_price: 0,
        settlement_amount: 0,
        settlement_breakdown: "",
    })

    const [settlementUrl, setSettlementUrl] = React.useState("")

    const [cancelPerson, setCancelPerson] = React.useState<string | undefined>(
        order._cancellations?.[0]?.cancel_person
    )

    // 처리 중 여부 (중복 클릭 방지 + 로딩 오버레이 표시)
    const [isProcessing, setIsProcessing] = React.useState(false)

    const [localOrder, setLocalOrder] = React.useState(order)

    // ESC 키로 창 닫기
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isProcessing) {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [isProcessing, onClose])

    React.useEffect(() => {
        setLocalOrder(order)
    }, [order])

    // 모든 액션을 이 래퍼로 감싸 처리 (sync/async 모두 지원)
    const runWithLoading = React.useCallback(
        async (fn: () => void | Promise<void>) => {
            setIsProcessing(true)
            try {
                await Promise.resolve(fn())
                onReload?.()
            } catch (err) {
                console.error(err)
                // 필요 시 UI에 맞춰 토스트 등으로 교체
                alert(
                    err instanceof Error
                        ? err.message
                        : "처리 중 오류가 발생했습니다. 다시 시도해 주세요."
                )
            } finally {
                setIsProcessing(false)
            }
        },
        [onReload]
    )

    const buttonBase = {
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 500,
        backgroundColor: "transparent",
        cursor: "pointer",
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "0",
        transition: "all 0.2s ease-in-out",
    } as const

    const disabledStyle: React.CSSProperties = isProcessing
        ? { opacity: 0.5, cursor: "not-allowed" }
        : {}

    const cancellation = order._cancellations?.[0]
    const refund = order._refunds?.[0]
    const settlement = order._settlements?.[0]

    const cancel_status = cancellation?.cancel_status
    const cancel_type = cancellation?.cancel_type
    const settlement_status = settlement?.settlement_status
    const settlement_type = settlement?.settlement_type

    const showNoCancelOrRefund = !cancellation && !refund
    const settlementPending =
        settlement_status === "pending" || settlement_status === "processing"

    const buttons: React.ReactNode[] = []

    const handleConfirm = async (type: string) => {
        const getRefundAmount = async () => {
            const diffDays = getDiffDaysKST(order.checkin_date)
            const policies = await fetchRefundPolicies()
            const policy = getRefundPolicyByDays(policies, diffDays)
            if (!policy) return 0

            const isAdmin = cancelPerson === "admin"

            const lodgingPercent = isAdmin
                ? policy.dva_percent
                : policy.dvc_percent
            const servicePercent = isAdmin
                ? policy.sva_percent
                : policy.svc_percent
            const depositPercent = isAdmin
                ? policy.dpa_percent
                : policy.dpc_percent

            const lodgingRefund =
                (order.discounted_price?.amount || 0) *
                1.1 *
                (lodgingPercent / 100)

            const serviceRefund =
                (order.service_price?.amount || 0) *
                1.1 *
                (servicePercent / 100)

            const depositRefund =
                (order.deposit_price || 0) * (depositPercent / 100)

            return Math.round(lodgingRefund + serviceRefund + depositRefund)
        }

        if (type === "accept") {
            if (window.confirm(`입금 확인 및 예약 확정을 진행하시겠습니까?`)) {
                await runWithLoading(onAccept)
            }
        } else if (type === "decline") {
            if (
                window.confirm(
                    `${order.reserver_name}님의 예약을 취소하시겠습니까? [지점 취소, 미결제 취소]`
                )
            ) {
                await runWithLoading(onDecline)
            }
        } else if (type === "cancel") {
            if (
                window.confirm(
                    `${order.reserver_name}님의 예약을 취소하시겠습니까? [지점 취소, 결제 후 취소]`
                )
            ) {
                await runWithLoading(onCancel)
            }
        } else if (type === "refund" && cancelPerson === "customer") {
            const refundAmount = await getRefundAmount()

            if (
                window.confirm(
                    `${order.reserver_name}님에게 ${refundAmount.toLocaleString()}원을 환불 완료하셨나요? [고객 취소, 지점 부분 환불]`
                )
            ) {
                await runWithLoading(onRefund)
            }
        } else if (type === "refund" && cancelPerson === "admin") {
            const refundAmount = await getRefundAmount()

            if (
                window.confirm(
                    `${order.reserver_name}님에게 ${refundAmount.toLocaleString()}원을 환불 완료하셨나요? [지점 취소, 지점 전액 환불]`
                )
            ) {
                await runWithLoading(onRefund)
            }
        } else if (type === "settlement_refund") {
            if (window.confirm(`보증금 환불 최종 값을 확정하시겠습니까?`)) {
                await runWithLoading(() =>
                    onSettlement("refund", settlementData)
                )
            }
        } else if (type === "settlement_additional") {
            if (window.confirm(`링크페이로 추가 결제를 요청하시겠습니까?`)) {
                await runWithLoading(() =>
                    onSettlement("additional", settlementData, settlementUrl)
                )
            }
        } else if (
            type === "complete" &&
            settlement_type === "deposit_refund"
        ) {
            if (
                window.confirm(
                    `보증금 환불을 완료하셨나요?\n정산을 완료합니다.`
                )
            ) {
                await runWithLoading(() => onComplete("refund", settlementData))
            }
        } else if (
            type === "complete" &&
            settlement_type === "additional_payment"
        ) {
            if (
                window.confirm(
                    `링크페이로 추가 결제값이 들어온 것을 확인하셨나요?\n정산을 완료합니다.`
                )
            ) {
                await runWithLoading(() =>
                    onComplete("additional", settlementData)
                )
            }
        } else if (type === "complete") {
            if (window.confirm(`정산을 완료합니다.`)) {
                await runWithLoading(() =>
                    onComplete("complete", settlementData)
                )
            }
        }
    }

    // 버튼은 admin 모드에서만 구성
    if (mode === "admin") {
        if (showNoCancelOrRefund && order.reservation_status === "pending") {
            buttons.push(
                // <button
                //     key="accept"
                //     style={{
                //         ...buttonBase,
                //         borderColor: "#49c94d",
                //         color: "#49c94d",
                //         ...(hover === "accept" && {
                //             backgroundColor: "#49c94d2d",
                //         }),
                //         ...disabledStyle,
                //     }}
                //     onClick={() => handleConfirm("accept")}
                //     onMouseEnter={() => setHover("accept")}
                //     onMouseLeave={() => setHover(null)}
                //     disabled={isProcessing}
                // >
                //     예약 확정
                // </button>,
                <button
                    key="decline"
                    style={{
                        ...buttonBase,
                        borderColor: "#000000",
                        color: "#000000",
                        ...(hover === "decline" && {
                            backgroundColor: "#0000001a",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("decline")}
                    onMouseEnter={() => setHover("decline")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    예약 취소
                </button>
            )
        } else if (
            showNoCancelOrRefund &&
            order.reservation_status === "confirmed" &&
            order.stay_status === "before_checkin"
        ) {
            buttons.push(
                <button
                    key="cancel"
                    style={{
                        ...buttonBase,
                        borderColor: "#000000",
                        color: "#000000",
                        ...(hover === "cancel" && {
                            backgroundColor: "#0000001a",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("cancel")}
                    onMouseEnter={() => setHover("cancel")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    예약 취소
                </button>
            )
        } else if (settlementResult === "refund") {
            buttons.push(
                <button
                    key="refund_done"
                    style={{
                        ...buttonBase,
                        borderColor: "#ffbb28",
                        color: "#ffbb28",
                        ...(hover === "refund" && {
                            backgroundColor: "#ffbb282d",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("settlement_refund")}
                    onMouseEnter={() => setHover("refund")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    보증금 환불 진행 완료
                </button>
            )
        } else if (settlementResult === "payment") {
            buttons.push(
                <input
                    key="payment_input"
                    type="text"
                    placeholder="결제 요청 링크페이 입력"
                    value={settlementUrl}
                    onChange={(e) => setSettlementUrl(e.target.value)}
                    disabled={isProcessing}
                    style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #ccc",
                        flexGrow: 1,
                        ...disabledStyle,
                    }}
                />,
                <button
                    key="payment_request"
                    style={{
                        ...buttonBase,
                        borderColor: "#2f7048",
                        color: "#2f7048",
                        ...(hover === "payment_request" && {
                            backgroundColor: "#2f70482d",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("settlement_additional")}
                    onMouseEnter={() => setHover("payment_request")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    추가 결제 요청
                </button>
            )
        } else if (
            settlement_status !== "completed" &&
            (settlementResult === "complete" || settlement_type)
        ) {
            buttons.push(
                <button
                    key="complete_stay"
                    style={{
                        ...buttonBase,
                        borderColor: "#000000",
                        color: "#000000",
                        ...(hover === "complete_stay" && {
                            backgroundColor: "#0000001a",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("complete")}
                    onMouseEnter={() => setHover("complete_stay")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    숙박 완료
                </button>
            )
        } else if (
            cancel_type === "paid_cancel" &&
            (cancel_status === "pending" || cancel_status === "processing")
        ) {
            buttons.push(
                <button
                    key="cancel_done"
                    style={{
                        ...buttonBase,
                        borderColor: "#ffbb28",
                        color: "#ffbb28",
                        ...(hover === "refund" && {
                            backgroundColor: "#ffbb282d",
                        }),
                        ...disabledStyle,
                    }}
                    onClick={() => handleConfirm("refund")}
                    onMouseEnter={() => setHover("refund")}
                    onMouseLeave={() => setHover(null)}
                    disabled={isProcessing}
                >
                    취소 진행 완료
                </button>
            )
        } else if (
            showNoCancelOrRefund &&
            order.reservation_status === "confirmed" &&
            order.stay_status === "checked_out" &&
            !settlement
        ) {
            buttons.push(
                <button
                    key="input_required"
                    style={{
                        ...buttonBase,
                        borderColor: "#b0b0b0",
                        color: "#b0b0b0",
                        cursor: "default",
                        ...disabledStyle,
                    }}
                    disabled
                >
                    추가 결제 금액을 입력하세요
                </button>
            )
        }
    }

    return (
        <div
            onClick={() => {
                if (!isProcessing) onClose()
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            {/* 처리 중 전체 로딩 오버레이 */}
            <LoadingOverlay visible={isProcessing} message={"처리 중입니다."} />

            <div
                onClick={(e) => e.stopPropagation()}
                aria-busy={isProcessing}
                style={{
                    background: "#fff",
                    width: "80vw",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    borderRadius: 8,
                    padding: 24,
                    position: "relative",
                    filter: isProcessing ? "grayscale(0.2)" : "none",
                }}
            >
                <button
                    onClick={() => {
                        if (!isProcessing) onClose()
                    }}
                    disabled={isProcessing}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontSize: 18,
                        border: "none",
                        background: "none",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.5 : 1,
                    }}
                >
                    ✖
                </button>

                <h2 style={{ marginBottom: 16 }}>예약 상세 정보</h2>
                <OrdersTableDetailList
                    data={localOrder}
                    onSettlementChange={setSettlementResult}
                    onSettlementDataChange={setSettlementData}
                    onUpdate={setLocalOrder}
                    runWithLoading={runWithLoading}
                    mode={mode}
                />

                {mode === "admin" && buttons.length > 0 && (
                    <div
                        style={{
                            marginTop: 24,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 12,
                            alignItems: "center",
                            pointerEvents: isProcessing ? "none" : "auto",
                        }}
                    >
                        {buttons}
                    </div>
                )}
            </div>
        </div>
    )
}
