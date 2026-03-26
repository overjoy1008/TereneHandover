import React, { useEffect, useState } from "react"
import CssStyles from "./CssStyles.tsx"

const clientKey = "live_gck_mBZ1gQ4YVXWWyAo0R0X93l2KPoqN" // 라이브 API 키, 외부 공개 금지
const clientTestKey = "test_gck_DpexMgkW36b5kBmklzXE3GbR5ozO" // 테스트 API 키, 외부 공개 금지
const isTestMode = false
const keyToUse = isTestMode ? clientTestKey : clientKey
const customerKey = "FNEu-pPjNfn5YeNtoewBV"

export function CheckoutPage() {
    const queryParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams("")

    const orderId = queryParams.get("orderId")

    const [amount, setAmount] = useState<{ currency: string; value: number }>({
        currency: "KRW",
        value: 100, // initial 테스트
    })
    const [order, setOrder] = useState<any>(null)
    const [ready, setReady] = useState(false)
    const [widgets, setWidgets] = useState<any>(null)

    // 주문 정보 가져오기
    useEffect(() => {
        async function fetchOrderDetails() {
            if (!orderId) return

            try {
                const res = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/orders`
                )
                const allOrders = await res.json()

                const matched = allOrders.find(
                    (o: any) => o.order_id === orderId
                )

                if (matched) {
                    setOrder(matched)
                    setAmount({
                        currency: "KRW",
                        value: Number(matched.final_price),
                    })
                } else {
                    console.warn("해당 orderId를 가진 주문이 없습니다.")
                }
            } catch (error) {
                console.error("주문 정보를 불러오는 중 오류 발생:", error)
            }
        }

        fetchOrderDetails()
    }, [orderId])

    // Toss SDK 로드 & 위젯 초기화
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
                script.onerror = () => reject(new Error("Toss SDK 로드 실패"))
                document.head.appendChild(script)
            })

        async function fetchPaymentWidgets() {
            try {
                await loadScript()
                const tossPayments = (window as any).TossPayments(keyToUse)
                const w = tossPayments.widgets({ customerKey })
                setWidgets(w)
            } catch (error) {
                console.error("결제 위젯 불러오기 오류:", error)
            }
        }

        fetchPaymentWidgets()
    }, [])

    // 위젯 렌더링
    useEffect(() => {
        async function renderPaymentWidgets() {
            if (!widgets) return
            try {
                await widgets.setAmount(amount)
                await widgets.renderPaymentMethods({
                    selector: "#payment-method",
                    variantKey: "DEFAULT",
                })
                await widgets.renderAgreement({
                    selector: "#agreement",
                    variantKey: "AGREEMENT",
                })
                setReady(true)
            } catch (error) {
                console.error("결제 위젯 렌더링 오류:", error)
            }
        }
        renderPaymentWidgets()
    }, [widgets, amount])

    const updateAmount = async (newAmount: {
        currency: string
        value: number
    }) => {
        setAmount(newAmount)
        if (widgets) {
            try {
                await widgets.setAmount(newAmount)
            } catch (error) {
                console.error("결제 금액 업데이트 오류:", error)
            }
        }
    }

    return (
        <>
            <CssStyles />
            <div className="wrapper">
                <div className="box_section">
                    <div id="payment-method" />
                    <div id="agreement" />
                    <button
                        className="btn"
                        disabled={!ready || !order}
                        onClick={async () => {
                            try {
                                const testParam = isTestMode
                                    ? "&testMode=1"
                                    : ""

                                await widgets.requestPayment({
                                    orderId: orderId,
                                    orderName: "TERENE UNMU 예약",
                                    successUrl: `${window.location.origin}/reservation-loading?orderId=${orderId}${testParam}`,

                                    failUrl: `${window.location.origin}/reservation-fail?orderId=${orderId}`,

                                    customerEmail: order.reserver_email,
                                    customerName: order.reserver_name,
                                    customerMobilePhone:
                                        order.reserver_contact.replace(
                                            /-/g,
                                            ""
                                        ),
                                })
                            } catch (error) {
                                console.error("결제 요청 오류:", error)
                            }
                        }}
                    >
                        결제하기
                    </button>
                </div>
            </div>
        </>
    )
}

function generateRandomString(): string {
    return window.btoa(Math.random().toString()).slice(0, 20)
}
