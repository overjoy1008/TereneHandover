
import { useState, useEffect } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { useFormStore } from "./ReservationForm.tsx"
import {
    useAdditionalServiceStore,
    createAdditionalServiceList,
} from "./AdditionalService.tsx"
import { useCoupons } from "./PriceDisplay.tsx"
import { formatDate, parseDate } from "../Utils/DateUtils.tsx"
import {
    sendSMS,
    sendEmail,
    sendSMSv2,
    sendEmailv2,
    sendKakaov2,
} from "../Notifier/notify.ts"
import {
    createClientReservationMessage,
    createAdminReservationMessage,
} from "../Notifier/messages.ts"
import { LoadingOverlay } from "../Components/LoadingOverlay.tsx"
import { type ComponentType } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AgreementPopup from "./AgreementPopup.tsx"
import { fetchAdminBypassCode } from "../Utils/FetchUtils.tsx"
import { createOrder, getCustomer } from "../Api/reservations.ts"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function getKSTISOString(date = new Date()): string {
    const kstDate = getKSTDate(date)
    const pad = (n: number) => String(n).padStart(2, "0")
    const year = kstDate.getFullYear()
    const month = pad(kstDate.getMonth() + 1)
    const day = pad(kstDate.getDate())
    const hours = pad(kstDate.getHours())
    const minutes = pad(kstDate.getMinutes())
    const seconds = pad(kstDate.getSeconds())
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`
}

function generateRandomString(length: number) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function submitReservation(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [isLoading, setIsLoading] = useState(false)
        const [showAgreementPopup, setShowAgreementPopup] = useState(false)

        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const checkin_date = first ? parseDate(first) : null
        const checkout_date = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const [additionalServiceStore] = useAdditionalServiceStore()
        const { coupons } = useCoupons()

        const [adminBypassCode, setAdminBypassCode] = useState<string | null>(
            null
        )

        useEffect(() => {
            fetchAdminBypassCode().then(setAdminBypassCode)
        }, [])

        const isValidPhone = (phone: string) => {
            const internationalRegex = /^\+?[0-9]{7,15}$/
            const koreanRegex = /^(01[016789]|0[2-9][0-9]?)-?\d{3,4}-?\d{4}$/
            return (
                internationalRegex.test(phone.replace(/-/g, "")) ||
                koreanRegex.test(phone)
            )
        }

        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

        const isValidBirthdate = (yyyymmdd: string) => {
            if (!/^\d{8}$/.test(yyyymmdd)) return false
            const year = parseInt(yyyymmdd.substring(0, 4), 10)
            const month = parseInt(yyyymmdd.substring(4, 6), 10)
            const day = parseInt(yyyymmdd.substring(6, 8), 10)
            const date = new Date(year, month - 1, day)
            if (
                date.getFullYear() !== year ||
                date.getMonth() !== month - 1 ||
                date.getDate() !== day
            )
                return false
            return date <= new Date()
        }

        const transformCouponDetails = (details) =>
            (details || []).map((couponDetail) => {
                if (couponDetail.id.startsWith("phase-1")) {
                    return {
                        coupon_id: couponDetail.id,
                        coupon_name: "Phase-1 전액 할인",
                        coupon_description: `Phase-1 계정 숙박비 전액 할인`,
                        amount: couponDetail.amount,
                    }
                }

                if (couponDetail.id.startsWith("all-free")) {
                    return {
                        coupon_id: couponDetail.id,
                        coupon_name: "Admin 계정 전액 할인",
                        coupon_description: `Admin 계정 전액 할인`,
                        amount: couponDetail.amount,
                    }
                }

                const matching = coupons.find((c) => c.id === couponDetail.id)
                return {
                    coupon_id: couponDetail.id,
                    coupon_name: couponDetail.name,
                    coupon_description: couponDetail.description,
                    amount: couponDetail.amount,
                }
            })

        const transformedPrimaryCoupons = transformCouponDetails(
            store.couponPrimaryDetails
        )
        const transformedSecondaryCoupons = transformCouponDetails(
            store.couponSecondaryDetails
        )

        const transformedServices = createAdditionalServiceList(
            additionalServiceStore,
            store
        ).map((s) => ({
            type: s.type,
            amount: s.amount,
        }))

        const handleClick = async () => {
            if (store.membership_number) {
                const blocked =
                    isBlacklisted === null
                        ? await fetchBlacklistStatus()
                        : isBlacklisted

                if (blocked) {
                    alert("해당 계정은 예약/결제를 진행할 수 없습니다.")
                    return
                }
            }

            const {
                nationality,
                reserver_name,
                reserver_birthdate,
                reserver_phone,
                reserver_email,
                stay_name,
                stay_birthdate,
                stay_phone,
            } = formStore

            if (store.finalPrice == null) {
                alert(
                    "가격이 계산되는 중입니다. 조금만 기다렸다가 다시 시도해주십시오"
                )
                return
            }

            // *필수사항 중 단 1개라도 비워둔 경우
            if (
                store.membership != "All-Free" &&
                (!reserver_name ||
                    !nationality ||
                    !reserver_birthdate ||
                    !reserver_phone ||
                    !reserver_email)
            ) {
                alert("필수사항 (*표시)를 입력하셔야 결제가 가능합니다")
                return
            }

            // 패키지를 단 1개도 선택하지 않은 경우
            const selectedPackageExists = Object.values(
                additionalServiceStore.selectedServices || {}
            ).some((s: any) => s.category === "package" && s.checked)

            if (store.membership != "All-Free" && !selectedPackageExists) {
                alert("필수사항 (*표시)를 입력하셔야 결제가 가능합니다")
                return
            }

            // 체크박스 / 드롭다운 선택 정합성 검사 (패키지 / 추가서비스 분리)
            const selectedServices =
                additionalServiceStore.selectedServices || {}

            const hasInvalidPackageSelection = Object.values(
                selectedServices
            ).some((s: any) => {
                if (s.category !== "package" || !s.show_dropdown) return false

                const dropdownSelected =
                    s.dropdownValue != null && s.dropdownValue !== 0
                const checkboxSelected = !!s.checked

                return (
                    (checkboxSelected && !dropdownSelected) ||
                    (!checkboxSelected && dropdownSelected)
                )
            })

            if (hasInvalidPackageSelection) {
                alert("선택하신 패키지의 옵션을 지정해 주세요")
                return
            }

            const hasInvalidAdditionalSelection = Object.values(
                selectedServices
            ).some((s: any) => {
                if (s.category !== "additional" || !s.show_dropdown)
                    return false

                const dropdownSelected =
                    s.dropdownValue != null && s.dropdownValue !== 0
                const checkboxSelected = !!s.checked

                return (
                    (checkboxSelected && !dropdownSelected) ||
                    (!checkboxSelected && dropdownSelected)
                )
            })

            if (hasInvalidAdditionalSelection) {
                alert("선택하신 추가서비스의 옵션을 지정해 주세요")
                return
            }

            if (!isValidBirthdate(reserver_birthdate)) {
                alert(`생년월일이 올바르지 않습니다\n\n형식: YYYYMMDD`)
                return
            }

            if (!isValidPhone(reserver_phone)) {
                alert(
                    `전화번호 형식이 올바르지 않습니다\n\n가능한 형식:\n01x-xxxx-xxxx 혹은 02-xxxx-xxxx\n010xxxxxxxx\n+8210xxxxxxxx 등`
                )
                return
            }

            const fullEmail = formStore.reserver_email_domain
                ? `${reserver_email.split("@")[0]}${formStore.reserver_email_domain}`
                : reserver_email

            if (!isValidEmail(fullEmail)) {
                alert("이메일 형식이 올바르지 않습니다")
                return
            }

            if (!store.payment) {
                alert("결제 수단 선택은 필수입니다")
                return
            }

            if (
                store.membership != "All-Free" &&
                (!formStore.facility_policy ||
                    !formStore.cancellation_policy ||
                    !formStore.privacy_policy)
            ) {
                alert("필수 이용약관을 동의하시기 바랍니다")
                return
            }

            setShowAgreementPopup(true)
        }

        const handleAgree = async () => {
            setShowAgreementPopup(false)

            const {
                nationality,
                reserver_name,
                reserver_birthdate,
                reserver_phone,
                reserver_email,
                stay_name,
                stay_birthdate,
                stay_phone,
            } = formStore

            setIsLoading(true)

            try {
                const now = getKSTDate()
                const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
                const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`
                const randomStr = generateRandomString(6)
                const orderId = `O-${dateStr}-${randomStr}`

                const payload = {
                    order_id: orderId,
                    membership_number: store.membership_number || null,

                    reserver_name,
                    reserver_birthdate,
                    reserver_contact: reserver_phone,
                    reserver_email: formStore.reserver_email_domain
                        ? `${reserver_email.split("@")[0]}${formStore.reserver_email_domain}`
                        : reserver_email,

                    stay_info: {
                        same_as_reserver: formStore.isSameReserverStay,
                        name: stay_name || reserver_name,
                        birthdate: stay_birthdate || reserver_birthdate,
                        contact: stay_phone || reserver_phone,
                    },

                    stay_people: {
                        adult: Number(additionalServiceStore.adult),
                        child: Number(additionalServiceStore.child),
                    },

                    // UNDER CONSTRUCTION /////////////////////////////////////
                    stay_location: "UNMU",
                    checkin_date: formatDate(checkin_date),
                    checkout_date: formatDate(checkout_date),

                    stay_details: {
                        special_requests: formStore.special_requests || null,
                        anniversary:
                            formStore.anniversary_type === "기념일 종류" ||
                            !formStore.anniversary_type
                                ? {
                                      type: "미선택",
                                      name: formStore.anniversary_name,
                                      value: formStore.anniversary_value,
                                  }
                                : {
                                      type: formStore.anniversary_type,
                                      name: formStore.anniversary_name,
                                      value: formStore.anniversary_value,
                                  },
                        terms_agreement: {
                            facility_policy: formStore.facility_policy,
                            cancellation_policy: formStore.cancellation_policy,
                            privacy_policy: formStore.privacy_policy,
                            marketing_consent:
                                formStore.marketing_consent || false,
                        },
                    },

                    initial_price: Number(store.initialPrice),

                    discounted_price: {
                        amount: Number(store.discountedPrice),
                        primary_coupons: transformedPrimaryCoupons,
                        secondary_coupons: transformedSecondaryCoupons,
                    },

                    service_price: {
                        amount: Number(store.additionalPrice),
                        services: transformedServices,
                    },

                    exchange_margin_price: Number(store.exchangeMarginPrice),
                    vat_price: Number(store.vatPrice),
                    deposit_price: Number(store.depositPrice),
                    final_price: Number(store.finalPrice),

                    stay_status: "before_checkin",
                    stay_history: [
                        { status: "checked_in", timestamp: null },
                        { status: "checked_out", timestamp: null },
                    ],

                    reservation_status: "pending",
                    reservation_history: [
                        { status: "pending", timestamp: getKSTISOString() },
                        { status: "confirmed", timestamp: null },
                    ],

                    payment: store.payment || null,
                    nationality,
                }

                console.log("payload: ", JSON.stringify(payload))

                const res = await createOrder(payload)

                if (!res.ok) throw new Error(await res.text())

                const finalAmount = Number(store.finalPrice) || 0
                const isAdminBypass = formStore.special_requests
                    ?.trim()
                    .includes(adminBypassCode)

                if (finalAmount === 0 || isAdminBypass) {
                    // 무료 결제 → 성공 페이지로, paymentKey는 'null' 문자열로 전달
                    const qs = new URLSearchParams({
                        orderId,
                        amount: String(finalAmount),
                        paymentKey: "null",
                        isAdminBypass: isAdminBypass ? "1" : "0",
                    })
                    window.location.href = `/reservation-loading?${qs.toString()}`
                } else {
                    // window.location.href = `/toss-payments?orderId=${orderId}`
                    window.location.href =
                        store.payment === "paypal"
                            ? `/toss-payments-usd?orderId=${orderId}`
                            : store.payment === "foreignCard"
                              ? `/toss-payments-foreign-card?orderId=${orderId}`
                              : `/toss-payments?orderId=${orderId}`
                }
            } catch (e) {
                alert("예약 중 오류 발생: " + e.message)
                console.error(e)
                setIsLoading(false)
            }
        }

        const [isBlacklisted, setIsBlacklisted] = useState<boolean | null>(null)

        const fetchBlacklistStatus = async () => {
            const membershipNumber = store.membership_number
            if (!membershipNumber) {
                setIsBlacklisted(false)
                return false
            }

            try {
                const res = await getCustomer(
                    encodeURIComponent(membershipNumber)
                )

                if (!res.ok) {
                    console.error(
                        `Blacklist check failed: HTTP ${res.status} - ${await res
                            .text()
                            .catch(() => "")}`
                    )
                    // 조회 실패 시 결제 막지 않음(최소 영향)
                    setIsBlacklisted(false)
                    return false
                }

                const customer = await res.json()
                const blocked = Boolean(customer?.blacklist)
                setIsBlacklisted(blocked)
                return blocked
            } catch (e) {
                console.error("Blacklist check error:", e)
                setIsBlacklisted(false)
                return false
            }
        }

        useEffect(() => {
            setIsBlacklisted(null)
            if (store.membership_number) fetchBlacklistStatus()
            else setIsBlacklisted(false)
        }, [store.membership_number])

        return (
            <>
                <LoadingOverlay
                    visible={isLoading || store.finalPrice == null}
                    message={
                        store.finalPrice != null
                            ? "예약 처리중입니다...\n잠시만 기다려주세요."
                            : "가격 계산중입니다...\n잠시만 기다려주세요."
                    }
                />
                {showAgreementPopup && (
                    <AgreementPopup
                        onAgree={handleAgree}
                        onCancel={() => setShowAgreementPopup(false)}
                    />
                )}
                <Component {...props} onClick={handleClick} />
            </>
        )
    }
}
