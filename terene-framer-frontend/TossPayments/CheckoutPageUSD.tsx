import React, { useEffect, useState } from "react"
import CssStyles from "./CssStyles.tsx"

const clientKey = "live_gck_mBZ1gQ4YVXWWyAo0R0X93l2KPoqN" // 라이브 API 키, 외부 공개 금지
const clientTestKey = "test_gck_DpexMgkW36b5kBmklzXE3GbR5ozO" // 테스트 API 키, 외부 공개 금지
const isTestMode = false
const keyToUse = isTestMode ? clientTestKey : clientKey
const customerKey = "nI7-bxL90ixHhMOKazawc"

export function CheckoutPageUSD() {
    const queryParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams("")

    const orderId = queryParams.get("orderId")

    const [amount, setAmount] = useState<{ currency: string; value: number }>({
        currency: "USD",
        value: 1, // initial 테스트
    })
    const [order, setOrder] = useState<any>(null)
    const [ready, setReady] = useState(false)
    const [widgets, setWidgets] = useState<any>(null)
    const [exchangeRate, setExchangeRate] = useState<number | null>(null)

    const exchangeMargin = 1 // 본래 1.08배였지만 폐지

    // 실시간 환율 가져오기 (Frankfurter API)
    useEffect(() => {
        async function fetchExchangeRate() {
            try {
                const res = await fetch(
                    "https://api.frankfurter.app/latest?from=KRW&to=USD"
                )
                const data = await res.json()

                // ✅ 응답 형태에 정확히 맞게 처리
                if (data && data.rates && typeof data.rates.USD === "number") {
                    setExchangeRate(data.rates.USD)
                    console.log(`KRW→USD 환율 (${data.date}):`, data.rates.USD)
                } else {
                    throw new Error("환율 데이터를 찾을 수 없습니다.")
                }
            } catch (err) {
                console.error("환율 fetch 오류:", err)
            }
        }
        fetchExchangeRate()
    }, [])

    // 주문 정보 가져오기
    useEffect(() => {
        async function fetchOrderDetails() {
            if (!orderId || !exchangeRate) return

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

                    const UsdPrice =
                        Number(matched.final_price) *
                        exchangeRate *
                        exchangeMargin
                    const roundedUsdPrice = Number(UsdPrice.toFixed(2))

                    setAmount({
                        currency: "USD",
                        value: roundedUsdPrice,
                    })
                    // alert(`USD: ${roundedUsdPrice}$`)
                } else {
                    console.warn("해당 orderId를 가진 주문이 없습니다.")
                }
            } catch (error) {
                console.error("주문 정보를 불러오는 중 오류 발생:", error)
            }
        }

        fetchOrderDetails()
    }, [orderId, exchangeRate])

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
                    variantKey: "foreignUSD",
                })
                await widgets.renderAgreement({
                    selector: "#agreement",
                    variantKey: "AGREEMENT-EN",
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

                                    // 해외결제용 파라미터
                                    foreignEasyPay: {
                                        country: "US", // 반드시 ISO 국가 코드
                                        products: [
                                            {
                                                name: "TERENE UNMU Reservation",
                                                quantity: 1,
                                                unitAmount: amount.value, // USD 단가
                                                currency: "USD",
                                                description: `Reservation for ${order.reserver_name}`,
                                            },
                                        ],
                                        shipping: {
                                            fullName:
                                                order.reserver_name ||
                                                "Toss Kim",
                                            address: {
                                                country: "US",
                                                line1: "2nd St 105",
                                                area1: "CA",
                                                area2: "San Jose",
                                                postalCode: "16328",
                                            },
                                        },
                                        paymentMethodOptions: {
                                            paypal: {
                                                setTransactionContext: {
                                                    sender_account_id:
                                                        "tosspayments-paypal@example.com",
                                                    sender_first_name: "Toss",
                                                    sender_last_name: "Kim",
                                                    sender_email:
                                                        "tosspayments-paypal@example.com",
                                                    sender_phone:
                                                        "(1) 562 254 5591",
                                                    sender_country_code: "US",
                                                    sender_create_date:
                                                        "2012-12-09T19:14:55.277-00:00",
                                                },
                                            },
                                        },
                                    },
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
