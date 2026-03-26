import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
import { LoadingOverlay } from "../Components/LoadingOverlay.tsx"

export const loadingPage = (
    Component: ComponentType<any>
): ComponentType<any> => {
    return function LoadingPageOverride(props) {
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            const params = new URLSearchParams(window.location.search)
            const orderId = params.get("orderId")
            const amount = params.get("amount")
            const paymentKey = params.get("paymentKey")
            const isFree = Number(amount) === 0
            const testMode = params.get("testMode") === "1"
            const isAdminBypass = params.get("isAdminBypass") === "1"

            const timeoutId = setTimeout(() => {
                window.location.href =
                    "https://terene.kr/reservation-fail?code=FRAMER_TIMEOUT&message=Framer%20예약%20대기%20타임아웃"
            }, 10000)

            function getKSTDate(baseDate = new Date()) {
                const utc =
                    baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
                return new Date(utc + 9 * 60 * 60 * 1000)
            }
            function pad(n: number) {
                return String(n).padStart(2, "0")
            }
            function getKSTISOString(date = new Date()) {
                const d = getKSTDate(date)
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+09:00`
            }
            function logKST(label: string, ...args: any[]) {
                console.log(`[${getKSTISOString()}] ${label}`, ...args)
            }

            async function run() {
                try {
                    if (!orderId || !amount || !paymentKey) return

                    if (!isFree && !isAdminBypass) {
                        const res = await fetch(
                            "https://terene-toss-server-api.onrender.com/confirm",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    orderId,
                                    amount: Number(amount),
                                    paymentKey,
                                    testMode,
                                }),
                            }
                        )
                        const json = await res.json()
                        if (!res.ok)
                            throw { code: json.code, message: json.message }
                    } else {
                        logKST("무료 결제: 결제 확인 생략")
                    }

                    const orderRes = await fetch(
                        `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
                    )
                    if (!orderRes.ok) {
                        const t = await orderRes.text()
                        throw new Error(
                            `주문 조회 실패: ${orderRes.status} - ${t}`
                        )
                    }
                    const orderData = await orderRes.json()

                    const templateParams = {
                        stay_location: `${orderData.stay_location}`,
                        reserver_name: orderData.reserver_name,
                        order_id: orderData.order_id,
                        membership_number:
                            orderData.membership_number || "비회원 예약",
                        reserver_contact: String(orderData.reserver_contact),
                        checkin_date: orderData.checkin_date,
                        checkout_date: orderData.checkout_date,
                        adult: String(orderData.stay_people?.adult ?? 0),
                        youth: String(orderData.stay_people?.teenager ?? 0),
                        child: String(orderData.stay_people?.child ?? 0),
                        final_price: String(orderData.final_price),
                    }

                    const templateParamsB = {
                        stay_location: `${orderData.stay_location}`,
                        reserver_name:
                            orderData.stay_info?.name ||
                            orderData.reserver_name,
                        order_id: orderData.order_id,
                        membership_number:
                            orderData.membership_number || "비회원 예약",
                        reserver_contact: String(
                            orderData.stay_info?.contact ||
                                orderData.reserver_contact
                        ),
                        checkin_date: orderData.checkin_date,
                        checkout_date: orderData.checkout_date,
                        adult: String(orderData.stay_people?.adult ?? 0),
                        youth: String(orderData.stay_people?.teenager ?? 0),
                        child: String(orderData.stay_people?.child ?? 0),
                        final_price: String(orderData.final_price),
                    }

                    const jobPayload = {
                        orderId,
                        amount: Number(amount),
                        paymentKey,
                        isFree,
                        isAdminBypass,
                        templateParams,
                        templateParamsB,
                        lang:
                            orderData.nationality === "foreign"
                                ? "foreign_en"
                                : "toss_ko",
                        notify: {
                            adminPhones: ADMIN_PHONES,
                            adminEmails: ADMIN_EMAILS,
                        },
                        orderSnapshot: {
                            order_id: orderData.order_id,
                            reservation_status: orderData.reservation_status,
                            stay_location: orderData.stay_location,
                            checkin_date: orderData.checkin_date,
                            checkout_date: orderData.checkout_date,
                            stay_people: orderData.stay_people,
                            reserver_name: orderData.reserver_name,
                            reserver_contact: orderData.reserver_contact,
                            reserver_email: orderData.reserver_email,
                            membership_number: orderData.membership_number,
                            stay_info: orderData.stay_info,
                            discounted_price: orderData.discounted_price,
                        },
                        enqueuedAt: getKSTISOString(),
                    }

                    const qRes = await fetch(
                        "https://terene-notifier-server.onrender.com/api/queue/A",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(jobPayload),
                        }
                    )
                    if (!qRes.ok) {
                        const t = await qRes.text()
                        throw new Error(`큐 등록 실패: ${qRes.status} - ${t}`)
                    }
                    logKST("서버 큐 등록 완료")

                    clearTimeout(timeoutId)
                    const successQS = new URLSearchParams({
                        orderId,
                        amount,
                        paymentKey,
                    }).toString()
                    window.location.href = `/reservation-success?${successQS}`
                    return
                } catch (err: any) {
                    clearTimeout(timeoutId)
                    const code = encodeURIComponent(err?.code || "UNKNOWN")
                    const msg = encodeURIComponent(
                        err?.message || "결제 처리 실패"
                    )
                    window.location.href = `/reservation-fail?code=${code}&message=${msg}`
                    return
                } finally {
                    setIsLoading(false)
                }
            }

            run()
            return () => clearTimeout(timeoutId)
        }, [])

        return (
            <>
                <LoadingOverlay
                    visible={isLoading}
                    message={
                        "결제가 진행중입니다.\n화면을 나가지 말고 잠시만 대기해주세요."
                    }
                />
                <Component {...props} />
            </>
        )
    }
}
