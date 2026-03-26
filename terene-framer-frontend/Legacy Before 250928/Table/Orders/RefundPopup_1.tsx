import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getDiffDaysKST } from "./OrdersTableLogic.tsx"

type RefundDetails = {
    days_before_checkin: number
    discounted_w_vat: number
    service_w_vat: number
    deposit: number
}

type RefundHistory = {
    status: string
    timestamp: string
}

type RefundData = {
    refund_details: RefundDetails
    refund_price: number
    refund_status: string
    refund_history: RefundHistory[]
}

type PriceInfo = {
    amount: number
}

type RefundPopupProps = {
    onClose: () => void
    onCancelCustomer: () => void // 추가
    data: {
        checkin_date: string
        final_price?: number
        discounted_price?: PriceInfo
        service_price?: PriceInfo
        deposit_price?: number
        _refunds?: RefundData[]
    }
    mode?: "user" | "admin"
}

export default function RefundPopup({
    onClose,
    onCancelCustomer, // 추가
    data,
    mode = "user",
}: RefundPopupProps) {
    const refund = data._refunds?.[0]
    const hasRefundData = refund?.refund_details

    let diffDays = getDiffDaysKST(data.checkin_date)
    let lodgingRefund = 0
    let serviceRefund = 0
    let depositRefund = 0
    let totalRefund = 0
    let lodgingRate = 0
    let serviceRate = 0

    if (hasRefundData) {
        const details = refund!.refund_details
        diffDays = details.days_before_checkin
        lodgingRefund = details.discounted_w_vat
        serviceRefund = details.service_w_vat
        depositRefund = details.deposit
        totalRefund = refund!.refund_price
    } else {
        const getLodgingRefundRate = () => {
            if (diffDays >= 31) return 1.0
            if (diffDays >= 15) return 0.8
            if (diffDays >= 10) return 0.6
            return 0.0
        }

        const getServiceRefundRate = () => {
            if (diffDays >= 10) return 1.0
            return 0.0
        }

        lodgingRate = getLodgingRefundRate()
        serviceRate = getServiceRefundRate()

        const lodgingBase = (data.discounted_price?.amount || 0) * 1.1
        lodgingRefund = lodgingBase * lodgingRate

        const serviceBase = (data.service_price?.amount || 0) * 1.1
        serviceRefund = serviceBase * serviceRate

        depositRefund = (data.deposit_price || 0) * 1.0
        totalRefund = lodgingRefund + serviceRefund + depositRefund
    }

    const refundStatus = refund?.refund_status
    const refundHistory = refund?.refund_history?.find(
        (r) => r.status === refundStatus
    )
    const statusText =
        refundStatus === "pending"
            ? "대기"
            : refundStatus === "processing"
              ? "처리 중"
              : refundStatus === "completed"
                ? "완료"
                : "-"

    const refundTimestamp = refundHistory?.timestamp

    // 팝업 바깥 클릭 감지
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <AnimatePresence>
            <motion.div
                onClick={handleBackdropClick}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    style={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        padding: 32,
                        maxWidth: 600,
                        width: "60%",
                        maxHeight: "95vh",
                        overflowY: "auto",
                        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                        fontFamily: "Pretendard",
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                >
                    {/* 제목 */}
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                            borderBottom: "1px solid #E5E7EB",
                            paddingBottom: 12,
                            marginBottom: 20,
                        }}
                    >
                        환불 정보
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {/* 원 결제액 */}
                        <Row label="원 결제액">
                            {`${Number(data.final_price || 0).toLocaleString()}원`}
                        </Row>

                        {/* 환불 금액 */}
                        <Row label="환불 금액">
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <div style={{ fontSize: 14, color: "#374151" }}>
                                    {`${Math.round(totalRefund).toLocaleString()}원`}
                                </div>
                                <Subtext>
                                    체크인 {diffDays}일 전 (환불 기준)
                                </Subtext>
                                <Subtext>
                                    숙박요금 환불 금액 (
                                    {hasRefundData
                                        ? "-"
                                        : `${Math.round(lodgingRate * 100)}%`}
                                    ) -{" "}
                                    {Math.round(lodgingRefund).toLocaleString()}
                                    원
                                </Subtext>
                                <Subtext>
                                    추가서비스요금 환불 금액 (
                                    {hasRefundData
                                        ? "-"
                                        : `${Math.round(serviceRate * 100)}%`}
                                    ) -{" "}
                                    {Math.round(serviceRefund).toLocaleString()}
                                    원
                                </Subtext>
                                <Subtext>
                                    보증금 환불 금액 (100%) -{" "}
                                    {Math.round(depositRefund).toLocaleString()}
                                    원
                                </Subtext>
                            </div>
                        </Row>

                        {/* 결제 수단 */}
                        {refund && (
                            <Row label="결제 수단">
                                카드결제 환불 | {statusText}{" "}
                                {refundTimestamp &&
                                    new Date(refundTimestamp).toLocaleString(
                                        "ko-KR",
                                        {
                                            hour12: false,
                                        }
                                    )}
                            </Row>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 50,
                        }}
                    >
                        <button
                            onClick={onCancelCustomer}
                            style={{
                                backgroundColor: "transparent",
                                border: "1px solid #a1a1a1",
                                color: "#a1a1a1",
                                fontSize: 12,
                                fontFamily: "Pretendard Medium",
                                letterSpacing: "0.02em",
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            환불내역 동의 및 예약 취소
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function Row({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "start",
                gap: 24,
            }}
        >
            <div
                style={{
                    width: 140,
                    fontSize: 14,
                    fontFamily: "Pretendard",
                    fontWeight: 500,
                    color: "#6B7280",
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 14,
                    fontFamily: "Pretendard",
                    color: "#374151",
                }}
            >
                {children}
            </div>
        </div>
    )
}

function Subtext({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                color: "#6b7280",
                fontSize: 13,
                lineHeight: "20px",
                fontFamily: "Pretendard",
            }}
        >
            {children}
        </div>
    )
}
