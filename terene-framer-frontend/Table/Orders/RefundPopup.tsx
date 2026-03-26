import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getDiffDaysKST } from "./OrdersTableLogic.tsx"
import {
    fetchRefundPolicies,
    getRefundPolicyByDays,
} from "../../Utils/refundPolicy.ts"

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
    onCancelCustomer: (lang: string) => void
    data: {
        checkin_date: string
        final_price?: number
        discounted_price?: PriceInfo
        service_price?: PriceInfo
        deposit_price?: number
        nationality: string
        _refunds?: RefundData[]
    }
    mode?: "user" | "admin"
}

export default function RefundPopup({
    onClose,
    onCancelCustomer,
    data,
    mode = "user",
}: RefundPopupProps) {
    const refund = data._refunds?.[0]
    const hasRefundData = refund?.refund_details

    const [isProcessing, setIsProcessing] = useState(false)
    const [screen, setScreen] = useState<"review" | "receipt">("review")

    const [refundPreview, setRefundPreview] = useState<null | {
        diffDays: number
        lodgingRefund: number
        serviceRefund: number
        depositRefund: number
        totalRefund: number
        lodgingPercent: number
        servicePercent: number
        depositPercent: number
    }>(null)

    useEffect(() => {
        const run = async () => {
            // 서버에 이미 확정된 환불이 있는 경우
            if (hasRefundData) {
                const d = refund!.refund_details
                setRefundPreview({
                    diffDays: d.days_before_checkin,
                    lodgingRefund: d.discounted_w_vat,
                    serviceRefund: d.service_w_vat,
                    depositRefund: d.deposit,
                    totalRefund: refund!.refund_price,
                    lodgingPercent: 0,
                    servicePercent: 0,
                    depositPercent: 100,
                })
                return
            }

            const diffDays = getDiffDaysKST(data.checkin_date)
            const policies = await fetchRefundPolicies()
            const policy = getRefundPolicyByDays(policies, diffDays)

            const lodgingPercent = policy?.dvc_percent ?? 0
            const servicePercent = policy?.svc_percent ?? 0
            const depositPercent = policy?.dpc_percent ?? 0

            const lodgingRefund =
                (data.discounted_price?.amount || 0) *
                1.1 *
                (lodgingPercent / 100)

            const serviceRefund =
                (data.service_price?.amount || 0) * 1.1 * (servicePercent / 100)

            const depositRefund =
                (data.deposit_price || 0) * (depositPercent / 100)

            setRefundPreview({
                diffDays,
                lodgingRefund,
                serviceRefund,
                depositRefund,
                totalRefund: lodgingRefund + serviceRefund + depositRefund,
                lodgingPercent,
                servicePercent,
                depositPercent,
            })
        }

        run()
    }, [
        data.checkin_date,
        data.discounted_price?.amount,
        data.service_price?.amount,
        data.deposit_price,
        refund,
        hasRefundData,
    ])

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

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    const lang = data.nationality === "foreign" ? "foreign_en" : "toss_kr"

    const handleCancelClick = () => {
        if (isProcessing) return
        setIsProcessing(true)
        onCancelCustomer(lang)
        setScreen("receipt")
        setIsProcessing(false)
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
                    {screen === "review" ? (
                        <>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    borderBottom: "1px solid #E5E7EB",
                                    paddingBottom: 12,
                                    marginBottom: 20,
                                }}
                            >
                                환불 정보
                            </div>

                            {refundPreview && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 12,
                                    }}
                                >
                                    <Row label="원 결제액">
                                        {`${Number(
                                            data.final_price || 0
                                        ).toLocaleString()}원`}
                                    </Row>

                                    <Row label="환불 금액">
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 4,
                                            }}
                                        >
                                            <div style={{ fontSize: 14 }}>
                                                {`${Math.round(
                                                    refundPreview.totalRefund
                                                ).toLocaleString()}원`}
                                            </div>
                                            <Subtext>
                                                체크인 {refundPreview.diffDays}
                                                일 전 (환불 기준)
                                            </Subtext>
                                            <Subtext>
                                                숙박요금 환불 금액 (
                                                {
                                                    String(
                                                        refundPreview.lodgingPercent
                                                    ).split(".")[0]
                                                }
                                                %) -{" "}
                                                {Math.round(
                                                    refundPreview.lodgingRefund
                                                ).toLocaleString()}
                                                원
                                            </Subtext>
                                            <Subtext>
                                                추가서비스요금 환불 금액 (
                                                {
                                                    String(
                                                        refundPreview.servicePercent
                                                    ).split(".")[0]
                                                }
                                                %) -{" "}
                                                {Math.round(
                                                    refundPreview.serviceRefund
                                                ).toLocaleString()}
                                                원
                                            </Subtext>
                                            <Subtext>
                                                보증금 환불 금액 (
                                                {
                                                    String(
                                                        refundPreview.depositPercent
                                                    ).split(".")[0]
                                                }
                                                %) -{" "}
                                                {Math.round(
                                                    refundPreview.depositRefund
                                                ).toLocaleString()}
                                                원
                                            </Subtext>
                                        </div>
                                    </Row>

                                    {refund && (
                                        <Row label="결제 수단">
                                            카드결제 환불 | {statusText}{" "}
                                            {refundTimestamp &&
                                                new Date(
                                                    refundTimestamp
                                                ).toLocaleString("ko-KR", {
                                                    hour12: false,
                                                })}
                                        </Row>
                                    )}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginTop: 50,
                                    gap: 30,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        lineHeight: "1.8em",
                                        textAlign: "center",
                                    }}
                                >
                                    예약 취소 진행 건 재취소는 불가한 점 유의
                                    부탁드립니다.
                                </div>

                                <button
                                    onClick={handleCancelClick}
                                    disabled={isProcessing}
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "1px solid #a1a1a1",
                                        color: "#a1a1a1",
                                        fontSize: 12,
                                        padding: "10px 20px",
                                        cursor: "pointer",
                                        opacity: isProcessing ? 0.5 : 1,
                                    }}
                                >
                                    환불내역 동의 및 예약 취소
                                </button>
                            </div>
                        </>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 24,
                                minHeight: 260,
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: 15 }}>
                                예약 취소 및 환불 요청이 접수되었습니다
                            </div>
                            <div style={{ fontSize: 13, lineHeight: "1.8em" }}>
                                취소 및 환불은 접수시점을 기준으로 환불 규정에
                                맞춰 처리되며
                                <br />
                                결제하신 수단으로 평균 3~5 영업일 이내에
                                처리됩니다.
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #D1D5DB",
                                    color: "#9CA3AF",
                                    fontSize: 14,
                                    padding: "10px 24px",
                                    cursor: "pointer",
                                }}
                            >
                                닫기
                            </button>
                        </div>
                    )}
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
        <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
            <div style={{ width: 140, fontSize: 14, fontWeight: 500 }}>
                {label}
            </div>
            <div style={{ fontSize: 14 }}>{children}</div>
        </div>
    )
}

function Subtext({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontSize: 13, lineHeight: "20px", color: "#6b7280" }}>
            {children}
        </div>
    )
}
