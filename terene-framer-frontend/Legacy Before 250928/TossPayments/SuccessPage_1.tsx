import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import {
    sendSMS,
    sendEmail,
    sendSMSv2,
    sendEmailv2,
    sendKakaov2,
} from "../Notifier/notify.ts"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
import { LoadingOverlay } from "../Components/LoadingOverlay.tsx"

export const successPage = (
    Component: ComponentType<any>
): ComponentType<any> => {
    return function SuccessPageOverride(props) {
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            const params = new URLSearchParams(window.location.search)
            const orderId = params.get("orderId")
            const amount = params.get("amount")
            const paymentKey = params.get("paymentKey")
            const isFree = Number(amount) === 0

            async function confirmPayment() {
                setIsLoading(true)

                const timings: Record<string, number> = {}

                function getKSTDate(baseDate = new Date()) {
                    const utc =
                        baseDate.getTime() +
                        baseDate.getTimezoneOffset() * 60000
                    return new Date(utc + 9 * 60 * 60 * 1000)
                }

                function getKSTISOString(date = new Date()) {
                    const kstDate = getKSTDate(date)
                    const pad = (n) => String(n).padStart(2, "0")
                    const year = kstDate.getFullYear()
                    const month = pad(kstDate.getMonth() + 1)
                    const day = pad(kstDate.getDate())
                    const hours = pad(kstDate.getHours())
                    const minutes = pad(kstDate.getMinutes())
                    const seconds = pad(kstDate.getSeconds())
                    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`
                }

                function logWithKST(label: string, ...args: any[]) {
                    const time = getKSTISOString()
                    console.log(`[${time}] ${label}`, ...args)
                }

                try {
                    // ✅ 결제 확인 (무료일 경우 스킵)
                    if (!isFree) {
                        timings.confirmStart = Date.now()
                        logWithKST("🔄 [결제 확인 요청 시작]")
                        const response = await fetch(
                            "https://terene-toss-server-api.onrender.com/confirm",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    orderId,
                                    amount: Number(amount),
                                    paymentKey,
                                }),
                            }
                        )
                        const result = await response.json()
                        timings.confirmEnd = Date.now()
                        logWithKST("✅ [결제 확인 응답]:", result)

                        if (!response.ok) {
                            throw { code: result.code, message: result.message }
                        }
                    } else {
                        logWithKST(
                            "⏭️ [무료 결제] amount=0 이므로 결제 확인 요청을 건너뜁니다."
                        )
                    }

                    function generateRandomString(length) {
                        const chars =
                            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                        let result = ""
                        for (let i = 0; i < length; i++) {
                            result += chars.charAt(
                                Math.floor(Math.random() * chars.length)
                            )
                        }
                        return result
                    }

                    // ✅ 예약 정보 요청
                    timings.orderFetchStart = Date.now()
                    logWithKST("📡 [예약 정보 요청 시작]")
                    const orderRes = await fetch(
                        `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
                    )
                    if (!orderRes.ok) {
                        throw new Error("예약 정보를 불러올 수 없습니다")
                    }
                    const orderData = await orderRes.json()
                    timings.orderFetchEnd = Date.now()
                    logWithKST("📦 [예약 정보 응답]:", orderData)

                    if (orderData.reservation_status !== "pending") {
                        throw new Error("이미 처리된 예약입니다")
                    }

                    const now = getKSTDate()
                    const nowISOString = getKSTISOString(now)
                    const dateStr = now
                        .toISOString()
                        .slice(2, 10)
                        .replace(/-/g, "")
                    const timeStr =
                        String(now.getHours()).padStart(2, "0") +
                        String(now.getMinutes()).padStart(2, "0")
                    const randStr = generateRandomString(6)
                    const paymentId = `P-${dateStr}-${timeStr}-${randStr}`

                    const paymentPayload = {
                        payment_id: paymentId,
                        payment_type: "order",
                        order_id: orderId,
                        payment_info: {
                            paymentKey: isFree ? null : paymentKey,
                            same_as_reserver: true,
                            name: orderData.reserver_name,
                            birthdate: orderData.reserver_birthdate,
                            contact: String(orderData.reserver_contact),
                        },
                        payment_method: isFree ? "Free" : "Toss Payments",
                        payment_account: {
                            is_vaadd: false,
                            account_holder: null,
                            bank_name: null,
                            account_number: null,
                        },
                        receiver_account: {
                            is_vaadd: true,
                            account_holder: null,
                            bank_name: null,
                            account_number: null,
                        },
                        payment_due: getKSTISOString(
                            new Date(now.getTime() + 24 * 60 * 60 * 1000)
                        ),
                        price_paid: Number(amount),
                        payment_status: "completed",
                        payment_history: [
                            { status: "pending", timestamp: nowISOString },
                            { status: "processing", timestamp: nowISOString },
                            { status: "completed", timestamp: nowISOString },
                        ],
                    }

                    timings.paymentSaveStart = Date.now()
                    logWithKST("💾 [결제 정보 저장 요청]:", paymentPayload)
                    const savePayment = await fetch(
                        "https://terene-db-server.onrender.com/api/v2/payments",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(paymentPayload),
                        }
                    )
                    if (!savePayment.ok) {
                        throw new Error("결제 정보 저장에 실패했습니다")
                    }
                    timings.paymentSaveEnd = Date.now()
                    logWithKST("✅ [결제 정보 저장 성공]")

                    const fullUpdatedOrder = {
                        ...orderData,
                        reservation_status: "confirmed",
                        reservation_history: orderData.reservation_history.map(
                            (entry) => {
                                if (entry.status === "confirmed") {
                                    return {
                                        status: "confirmed",
                                        timestamp: nowISOString,
                                    }
                                }
                                return entry
                            }
                        ),
                    }

                    timings.orderUpdateStart = Date.now()
                    logWithKST(
                        "🔄 [예약 상태 업데이트 요청]:",
                        fullUpdatedOrder
                    )
                    const updateOrder = await fetch(
                        `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(fullUpdatedOrder),
                        }
                    )
                    if (!updateOrder.ok) {
                        throw new Error("예약 상태 업데이트에 실패했습니다")
                    }
                    timings.orderUpdateEnd = Date.now()
                    logWithKST("✅ [예약 상태 업데이트 성공]")

                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    // -------------------------------------------------------
                    // Update daily occupancy
                    // -------------------------------------------------------

                    try {
                        const getAllDaysRes = await fetch(
                            `https://terene-db-server.onrender.com/api/days`
                        )
                        if (!getAllDaysRes.ok) {
                            const errorText = await getAllDaysRes.text()
                            throw new Error(
                                `HTTP ${getAllDaysRes.status} - ${errorText}`
                            )
                        }

                        const allDays = await getAllDaysRes.json()

                        // 3. dateList에 포함된 날짜들만 필터링
                        const dateRange = []
                        let current = new Date(orderData.checkin_date)
                        const end = new Date(orderData.checkout_date)

                        while (current <= end) {
                            const yyyyMMdd = current.toISOString().split("T")[0] // "YYYY-MM-DD"
                            dateRange.push(yyyyMMdd)
                            current.setDate(current.getDate() + 1)
                        }

                        const targetDays = allDays.filter((day) =>
                            dateRange.includes(day.date)
                        )

                        // 4. 각 날짜 정보 업데이트
                        for (const day of targetDays) {
                            let updatedDay = { ...day }

                            if (day.date === orderData.checkin_date) {
                                updatedDay.checkin = {
                                    is_occupied: true,
                                    occupied_order_id: orderId,
                                }
                            } else if (day.date === orderData.checkout_date) {
                                updatedDay.checkout = {
                                    is_occupied: true,
                                    occupied_order_id: orderId,
                                }
                            } else {
                                updatedDay.checkin = {
                                    is_occupied: true,
                                    occupied_order_id: orderId,
                                }
                                updatedDay.checkout = {
                                    is_occupied: true,
                                    occupied_order_id: orderId,
                                }
                            }

                            try {
                                const res = await fetch(
                                    `https://terene-db-server.onrender.com/api/days/${day.date}`,
                                    {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(updatedDay),
                                    }
                                )

                                if (!res.ok) {
                                    const errText = await res.text()
                                    throw new Error(
                                        `Failed to update occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
                                    )
                                }
                            } catch (err) {
                                console.error(
                                    "날짜 점유 정보 업데이트 중 오류 발생:",
                                    err
                                )
                                alert(
                                    `예약 날짜(${day.date}) 점유 정보 업데이트 중 오류가 발생했습니다.\n에러메시지: ${err}`
                                )
                                return
                            }
                        }
                    } catch (error) {
                        console.error(
                            "전체 날짜 데이터 가져오는 중 오류 발생:",
                            error
                        )
                        alert(
                            `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
                        )
                    }
                    //////////////////////////////////////////////////////////////////////////////////////////////////

                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    // 쿠폰 사용 완료 상태로 변환하는 로직
                    try {
                        timings.couponStart = Date.now()
                        logWithKST("📦 [쿠폰 인스턴스 목록 요청]")
                        const couponRes = await fetch(
                            "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                        )
                        if (!couponRes.ok) {
                            throw new Error(
                                "쿠폰 인스턴스를 불러오지 못했습니다"
                            )
                        }
                        const allCoupons = await couponRes.json()
                        logWithKST("✅ [쿠폰 목록 수신]")

                        const primary =
                            fullUpdatedOrder.discounted_price
                                ?.primary_coupons || []
                        const secondary =
                            fullUpdatedOrder.discounted_price
                                ?.secondary_coupons || []

                        const allUsedCouponEntries =
                            primary.length === 0
                                ? [...secondary]
                                : [...primary, ...secondary]

                        const nowKST = getKSTISOString()

                        for (const entry of allUsedCouponEntries) {
                            const matchingInstances = allCoupons.filter(
                                (instance) =>
                                    instance.coupon_instance_id ===
                                        entry.coupon_id &&
                                    instance.status === "available"
                            )

                            for (const instance of matchingInstances) {
                                try {
                                    // ✅ 쿠폰 정의 정보 조회
                                    const defRes = await fetch(
                                        `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${instance.coupon_definition_id}`
                                    )
                                    if (!defRes.ok) {
                                        console.warn(
                                            `⚠️ 쿠폰 정의(${instance.coupon_definition_id}) 조회 실패`
                                        )
                                        continue
                                    }
                                    const couponDef = await defRes.json()

                                    // counter 값 확인: 1이면 사용 처리, -1이면 스킵
                                    if (couponDef.counter >= 1) {
                                        const updatedCoupon = {
                                            ...instance,
                                            status: "used",
                                            order_id: fullUpdatedOrder.order_id,
                                            used_location:
                                                fullUpdatedOrder.stay_location,
                                            used_timestamp: nowKST,
                                            used_amount: entry.amount,
                                        }

                                        logWithKST(
                                            "🔄 [쿠폰 사용 처리 요청]:",
                                            updatedCoupon
                                        )

                                        const patchRes = await fetch(
                                            `https://terene-db-server.onrender.com/api/v2/coupon-instances/${instance.coupon_instance_id}`,
                                            {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                                body: JSON.stringify(
                                                    updatedCoupon
                                                ),
                                            }
                                        )

                                        if (!patchRes.ok) {
                                            console.warn(
                                                `⚠️ 쿠폰 ${instance.coupon_instance_id} 사용 처리 실패`
                                            )
                                        } else {
                                            logWithKST(
                                                `✅ 쿠폰 ${instance.coupon_instance_id} 사용 완료`
                                            )
                                        }
                                    } else if (couponDef.counter === -1) {
                                        logWithKST(
                                            `⏭️ 쿠폰 ${instance.coupon_instance_id} 무제한(-1) → 사용 처리 건너뜀`
                                        )
                                    }
                                } catch (err) {
                                    console.error(
                                        `쿠폰 처리 중 오류 (instance_id: ${instance.coupon_instance_id}):`,
                                        err
                                    )
                                }
                            }
                        }
                        timings.couponEnd = Date.now()
                    } catch (err) {
                        console.error("쿠폰 처리 중 오류 발생:", err)
                    }
                    //////////////////////////////////////////////////////////////////////////////////////////////////

                    const templateParams = {
                        stay_location: `${orderData.stay_location}`,
                        reserver_name: orderData.reserver_name,
                        order_id: orderData.order_id,
                        membership_number:
                            orderData.membership_number || "비회원 예약",
                        reserver_contact: String(orderData.reserver_contact),
                        checkin_date: orderData.checkin_date,
                        checkout_date: orderData.checkout_date,
                        adult: String(orderData.stay_people?.adult),
                        youth: String(orderData.stay_people?.teenager) || "0",
                        child: String(orderData.stay_people?.child),
                    }

                    const templateParamsB = {
                        stay_location: `${orderData.stay_location}`,
                        reserver_name: orderData.stay_info.name,
                        order_id: orderData.order_id,
                        membership_number:
                            orderData.membership_number || "비회원 예약",
                        reserver_contact: String(orderData.stay_info.contact),
                        checkin_date: orderData.checkin_date,
                        checkout_date: orderData.checkout_date,
                        adult: String(orderData.stay_people?.adult),
                        youth: String(orderData.stay_people?.teenager) || "0",
                        child: String(orderData.stay_people?.child),
                    }

                    timings.notifyAdminStart = Date.now()
                    for (const adminPhone of ADMIN_PHONES) {
                        await sendKakaov2(adminPhone, "A", templateParamsB)
                    }
                    // for (const adminEmail of ADMIN_EMAILS) {
                    //     await sendEmailv2(adminEmail, "A", templateParamsB)
                    // }
                    timings.notifyAdminEnd = Date.now()

                    timings.notifyUserStart = Date.now()
                    // await sendSMSv2(
                    //     orderData.reserver_contact,
                    //     "A",
                    //     templateParams
                    // )
                    await sendKakaov2(
                        orderData.reserver_contact,
                        "A",
                        templateParamsB
                    )
                    await sendEmailv2(
                        orderData.reserver_email,
                        "A",
                        templateParamsB
                    )
                    timings.notifyUserEnd = Date.now()

                    if (!orderData.stay_info?.same_as_reserver) {
                        const stay_contact = orderData.stay_info?.contact
                        if (stay_contact) {
                            timings.notifyGuestStart = Date.now()
                            // await sendSMSv2(stay_contact, "A", templateParamsB)
                            await sendKakaov2(
                                stay_contact,
                                "A",
                                templateParamsB
                            )
                            timings.notifyGuestEnd = Date.now()
                        }
                    }
                } catch (error) {
                    console.error("❌ [결제 처리 오류]:", error)
                    const code = encodeURIComponent(error.code || "UNKNOWN")
                    const msg = encodeURIComponent(
                        error.message || "결제 승인 실패"
                    )
                    window.location.href = `/reservation-fail?code=${code}&message=${msg}`
                    return
                } finally {
                    setIsLoading(false)

                    const seconds = (key: string) =>
                        timings[key + "End"] && timings[key + "Start"]
                            ? (
                                  (timings[key + "End"] -
                                      timings[key + "Start"]) /
                                  1000
                              ).toFixed(2)
                            : "-"
                }
            }

            if (orderId && paymentKey && amount) {
                confirmPayment()
            }
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
