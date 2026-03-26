import React, { useEffect, useState } from "react"
import CssStyles from "./CssStyles.tsx"

const clientKey = "live_gck_mBZ1gQ4YVXWWyAo0R0X93l2KPoqN"
const clientTestKey = "test_gck_DpexMgkW36b5kBmklzXE3GbR5ozO"
const isTestMode = false
const keyToUse = isTestMode ? clientTestKey : clientKey
const customerKey = "FNEu-pPjNfn5YeNtoewBV"

export function CheckoutPageIntegrated() {
    const queryParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams("")

    const orderId = queryParams.get("orderId")

    const [amount, setAmount] = useState<{ currency: string; value: number }>({
        currency: "KRW",
        value: 100,
    })
    const [order, setOrder] = useState<any>(null)
    const [widgets, setWidgets] = useState<any>(null)
    const [ready, setReady] = useState(false)

    const [mode, setMode] = useState<"domestic" | "foreign">("domestic")

    // 주문 정보
    useEffect(() => {
        if (!orderId) return

        fetch("https://terene-db-server.onrender.com/api/v2/orders")
            .then((r) => r.json())
            .then((orders) => {
                const matched = orders.find((o: any) => o.order_id === orderId)
                if (!matched) return
                setOrder(matched)
                setAmount({
                    currency: "KRW",
                    value: Number(matched.final_price),
                })
            })
    }, [orderId])

    // SDK + widgets
    useEffect(() => {
        const loadScript = (): Promise<void> =>
            new Promise((resolve, reject) => {
                if ((window as any).TossPayments) {
                    resolve()
                    return
                }
                const script = document.createElement("script")
                script.src = "https://js.tosspayments.com/v2/standard"
                script.async = true
                script.onload = () => resolve()
                script.onerror = () => reject()
                document.head.appendChild(script)
            })

        loadScript().then(() => {
            const tossPayments = (window as any).TossPayments(keyToUse)
            setWidgets(tossPayments.widgets({ customerKey }))
        })
    }, [])

    // 결제 UI 렌더 (단일)
    useEffect(() => {
        if (!widgets) return

        async function render() {
            setReady(false)

            await widgets.setAmount(amount)

            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                variantKey: mode === "domestic" ? "DEFAULT" : "foreignCard",
            })

            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: mode === "domestic" ? "AGREEMENT" : "AGREEMENT-EN",
            })

            setReady(true)
        }

        render()
    }, [widgets, amount, mode])

    return (
        <>
            <CssStyles />
            <div className="wrapper">
                <div className="box_section">
                    {/* 탭 */}
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 16,
                        }}
                    >
                        <button
                            className="btn"
                            style={{
                                opacity: mode === "domestic" ? 1 : 0.4,
                            }}
                            onClick={() => setMode("domestic")}
                        >
                            🇰🇷 국내 결제
                        </button>
                        <button
                            className="btn"
                            style={{
                                opacity: mode === "foreign" ? 1 : 0.4,
                            }}
                            onClick={() => setMode("foreign")}
                        >
                            🌍 해외 카드
                        </button>
                    </div>

                    {/* Toss UI */}
                    <div id="payment-method" />
                    <div id="agreement" />

                    <button
                        className="btn"
                        disabled={!ready || !order}
                        onClick={async () => {
                            const testParam = isTestMode ? "&testMode=1" : ""

                            await widgets.requestPayment({
                                orderId,
                                orderName: "TERENE UNMU 예약",
                                successUrl: `${window.location.origin}/reservation-loading?orderId=${orderId}${testParam}`,
                                failUrl: `${window.location.origin}/reservation-fail?orderId=${orderId}`,
                                customerEmail: order.reserver_email,
                                customerName: order.reserver_name,
                                customerMobilePhone:
                                    order.reserver_contact.replace(/-/g, ""),
                            })
                        }}
                    >
                        결제하기
                    </button>
                </div>
            </div>
        </>
    )
}
