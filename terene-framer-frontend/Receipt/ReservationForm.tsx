
import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"
import { formatDate, parseDate } from "../Utils/DateUtils.tsx"
import {
    useAdditionalServiceStore,
    createAdditionalServiceList,
} from "./AdditionalService.tsx"
import {
    useHolidayCategoryMap,
    useCoupons,
    toCategoryMap,
} from "./PriceDisplay.tsx"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
import { sendSMS, sendEmail } from "../Notifier/notify.ts"
import {
    createClientReservationMessage,
    createAdminReservationMessage,
} from "../Notifier/messages.ts"
import { LoadingOverlay } from "../Components/LoadingOverlay.tsx"
import { getReservationDays } from "../Api/reservations.ts"

// ✅ 추가: 계산/필터 함수 import (PriceDisplay와 동일 파이프라인 사용)
import {
    calculateInitialPrices,
    filterCoupons,
    evaluateCoupons,
} from "./EvaluateCoupons.ts"

import { useDayCategoryDefinitions } from "./useDayCategoryDefinitions.ts"

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

export const useFormStore = createStore({
    name: null,
    birthdate: null,
    phone: null,
    email: null,
    emailDomain: null,

    nationality: "domestic",
    reserver_number: null,
    reserver_name: null,
    reserver_birthdate: null,
    reserver_phone: null,
    reserver_email: null,
    reserver_email_domain: null,

    isSameReserverStay: false,
    stay_name: null,
    stay_birthdate: null,
    stay_phone: null,

    couponCode: null,

    mileage: 0,

    special_requests: null,
    anniversary_type: "기념일 종류",
    anniversary_name: null,
    anniversary_value: null,

    facility_policy: false,
    cancellation_policy: false,
    privacy_policy: false,
    marketing_consent: false,

    refund_name: null,
    refund_phone: null,
    refund_bank: null,
    refund_account: null,
})

export function toggleName(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ name: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleBirthdate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ birthdate: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function togglePhone(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ phone: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleEmail(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ email: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleNationality(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill =
            mainStore.nationality === "domestic" ||
            mainStore.nationality === "foreign"
        // const shouldAutofill = false

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.nationality !== mainStore.nationality
            ) {
                setFormStore({ nationality: mainStore.nationality })
            }
        }, [shouldAutofill, mainStore.nationality])

        const handleChange = (value: string) => {
            setFormStore({ nationality: value })
        }

        return (
            <Component
                {...props}
                disabled={shouldAutofill}
                selectedValue={
                    shouldAutofill ? mainStore.nationality : props.selectedValue
                }
                onChange={shouldAutofill ? undefined : handleChange}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverNumber(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill = false

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_number !== mainStore.membership_number
            ) {
                setFormStore({ reserver_name: mainStore.membership_number })
            }
        }, [shouldAutofill, mainStore.name])

        const handleChange = (event) => {
            setFormStore({ reserver_number: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.membership_number : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill =
            mainStore.name !== null &&
            mainStore.birthdate !== null &&
            mainStore.phone !== null &&
            mainStore.email !== null

        React.useEffect(() => {
            if (shouldAutofill && formStore.reserver_name !== mainStore.name) {
                setFormStore({ reserver_name: mainStore.name })
            }
        }, [shouldAutofill, mainStore.name])

        const handleChange = (event) => {
            setFormStore({ reserver_name: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.name : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverBirthdate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill =
            mainStore.name !== null &&
            mainStore.birthdate !== null &&
            mainStore.phone !== null &&
            mainStore.email !== null

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_birthdate !== mainStore.birthdate
            ) {
                setFormStore({ reserver_birthdate: mainStore.birthdate })
            }
        }, [shouldAutofill, mainStore.birthdate])

        const handleChange = (event) => {
            setFormStore({ reserver_birthdate: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.birthdate : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverPhone(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill =
            mainStore.name !== null &&
            mainStore.birthdate !== null &&
            mainStore.phone !== null &&
            mainStore.email !== null

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_phone !== mainStore.phone
            ) {
                setFormStore({ reserver_phone: mainStore.phone })
            }
        }, [shouldAutofill, mainStore.phone])

        const handleChange = (event) => {
            setFormStore({ reserver_phone: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.phone : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverEmail(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill =
            mainStore.name !== null &&
            mainStore.birthdate !== null &&
            mainStore.phone !== null &&
            mainStore.email !== null

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_email !== mainStore.email
            ) {
                setFormStore({ reserver_email: mainStore.email })
            }
        }, [shouldAutofill, mainStore.email])

        const handleChange = (event) => {
            setFormStore({ reserver_email: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.email : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function handleEmailDomainDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value

            if (selectedValue && selectedValue !== "직접 입력") {
                setStore({ reserver_email_domain: selectedValue })
            }
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleReserverNameNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill = false

        React.useEffect(() => {
            if (shouldAutofill && formStore.reserver_name !== mainStore.name) {
                setFormStore({ reserver_name: mainStore.name })
            }
        }, [shouldAutofill, mainStore.name])

        const handleChange = (event) => {
            setFormStore({ reserver_name: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.name : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverBirthdateNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill = false

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_birthdate !== mainStore.birthdate
            ) {
                setFormStore({ reserver_birthdate: mainStore.birthdate })
            }
        }, [shouldAutofill, mainStore.birthdate])

        const handleChange = (event) => {
            setFormStore({ reserver_birthdate: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.birthdate : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverPhoneNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill = false

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_phone !== mainStore.phone
            ) {
                setFormStore({ reserver_phone: mainStore.phone })
            }
        }, [shouldAutofill, mainStore.phone])

        const handleChange = (event) => {
            setFormStore({ reserver_phone: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.phone : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleReserverEmailNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [mainStore] = useStore()

        const shouldAutofill = false

        React.useEffect(() => {
            if (
                shouldAutofill &&
                formStore.reserver_email !== mainStore.email
            ) {
                setFormStore({ reserver_email: mainStore.email })
            }
        }, [shouldAutofill, mainStore.email])

        const handleChange = (event) => {
            setFormStore({ reserver_email: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? mainStore.email : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleSameReserverStay(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()
        const toggle = () => {
            setStore({ isSameReserverStay: !store.isSameReserverStay })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleStayName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const [formStore, setFormStore] = useFormStore()

        const shouldAutofill = formStore.isSameReserverStay
        const autofillValue = formStore.reserver_name ?? ""

        React.useEffect(() => {
            if (shouldAutofill && formStore.stay_name !== autofillValue) {
                setFormStore({ stay_name: autofillValue })
            }
        }, [shouldAutofill, autofillValue])

        const handleChange = (event) => {
            setFormStore({ stay_name: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? autofillValue : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleStayBirthdate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const [formStore, setFormStore] = useFormStore()

        const shouldAutofill = formStore.isSameReserverStay
        const autofillValue = formStore.reserver_birthdate ?? ""

        React.useEffect(() => {
            if (shouldAutofill && formStore.stay_birthdate !== autofillValue) {
                setFormStore({ stay_birthdate: autofillValue })
            }
        }, [shouldAutofill, autofillValue])

        const handleChange = (event) => {
            setFormStore({ stay_birthdate: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? autofillValue : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleStayPhone(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const [formStore, setFormStore] = useFormStore()

        const shouldAutofill = formStore.isSameReserverStay
        const autofillValue = formStore.reserver_phone ?? ""

        React.useEffect(() => {
            if (shouldAutofill && formStore.stay_phone !== autofillValue) {
                setFormStore({ stay_phone: autofillValue })
            }
        }, [shouldAutofill, autofillValue])

        const handleChange = (event) => {
            setFormStore({ stay_phone: event.target.value })
        }

        return (
            <Component
                {...props}
                onChange={shouldAutofill ? undefined : handleChange}
                value={shouldAutofill ? autofillValue : undefined}
                mode={shouldAutofill ? "autofill" : "default"}
            />
        )
    }
}

export function toggleCouponCode(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ couponCode: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function applyCouponCode(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [store, setStore] = useStore()

        const handleClick = async () => {
            const code = formStore.couponCode?.trim()
            if (!code) {
                alert("쿠폰 번호를 입력해주세요.")
                return
            }

            // if (store.expiredCoupons.includes(code)) {
            //     alert("한번 사용한 쿠폰은 재사용할 수 없습니다.")
            //     return
            // }
            if (store.enteredCouponCode.includes(code)) {
                alert("이미 적용된 쿠폰입니다.")
                return
            }

            try {
                // 쿠폰 데이터 가져오기
                const [defRes, instRes] = await Promise.all([
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-definitions"
                    ),
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    ),
                ])

                const definitions = await defRes.json()
                const instances = await instRes.json()

                // code 타입 정의만 필터링
                const codeDefs = definitions.filter(
                    (def: any) => def.type === "code"
                )

                // 인스턴스 + 정의 병합
                const mergedCoupons = instances
                    .filter((inst: any) => inst.coupon_code === code)
                    .map((inst: any) => {
                        const def = codeDefs.find(
                            (d: any) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return def ? { ...def, ...inst } : null
                    })
                    .filter(Boolean)

                if (mergedCoupons.length === 0) {
                    alert("쿠폰이 존재하지 않거나 쿠폰번호가 잘못되었습니다.")
                    return
                }

                const [found] = mergedCoupons

                // 상태 체크
                if (found.status !== "available") {
                    alert("이 쿠폰은 현재 사용이 불가능합니다.")
                    return
                }

                // 유효기간 체크
                if (found.coupon_due) {
                    const now = new Date()
                    const due = new Date(found.coupon_due)
                    if (isNaN(due.getTime()) || now > due) {
                        alert("이 쿠폰의 유효기간이 지났습니다.")
                        return
                    }
                }

                // 적용 확인
                const isConfirmed = window.confirm(`쿠폰 ${code}을 적용합니다.`)

                if (isConfirmed) {
                    setStore({
                        enteredCouponCode: [...store.enteredCouponCode, code],
                    })
                }
            } catch (error) {
                console.error("쿠폰 확인 중 오류 발생:", error)
                alert("쿠폰 확인 중 오류가 발생했습니다. 다시 시도해주세요.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

// -----------------------------------------
export function checkRevisitAndCouponCode(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore] = useFormStore()
        const [store, setStore] = useStore()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const handleClick = async () => {
            const code = formStore.couponCode?.trim()
            if (!code) {
                alert("쿠폰 번호를 입력해주세요.")
                return
            }

            try {
                // revisit 계산 (체크아웃 기준)
                const ordersRes = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/orders"
                )
                const orders = await ordersRes.json()

                const normalize = (str: string) =>
                    str
                        ?.replace(/[\s\-./]/g, "")
                        .toLowerCase()
                        .trim()

                const revisitCount = orders.filter((order: any) => {
                    return (
                        order.stay_status === "checked_out" &&
                        normalize(order.reserver_name) ===
                            normalize(formStore.reserver_name) &&
                        normalize(order.reserver_birthdate) ===
                            normalize(formStore.reserver_birthdate) &&
                        normalize(order.reserver_contact) ===
                            normalize(formStore.reserver_phone)
                    )
                }).length

                setStore({ revisit: String(revisitCount) })

                if (store.enteredCouponCode?.includes(code)) {
                    alert("이미 적용된 쿠폰입니다.")
                    return
                }

                // 쿠폰 정의/인스턴스 가져오기
                const [defRes, instRes] = await Promise.all([
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-definitions"
                    ),
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    ),
                ])

                const definitions = await defRes.json()
                const instances = await instRes.json()

                const codeDefs = definitions.filter(
                    (def: any) => def.type === "code"
                )

                const mergedCoupons = instances
                    .filter((inst: any) => inst.coupon_code === code)
                    .map((inst: any) => {
                        const def = codeDefs.find(
                            (d: any) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return def ? { ...def, ...inst } : null
                    })
                    .filter(Boolean)

                if (mergedCoupons.length === 0) {
                    alert("쿠폰이 존재하지 않거나 쿠폰번호가 잘못되었습니다.")
                    return
                }

                const [found] = mergedCoupons

                // 🔁 중복 제한(요구사항 반영): exclusive ↔ 모든 code형 쿠폰 상호배타
                const appliedCodeCoupons = (store.enteredCouponCode ?? [])
                    .map((appliedCode: string) => {
                        const inst = instances.find(
                            (i: any) => i.coupon_code === appliedCode
                        )
                        if (!inst) return null
                        const def = definitions.find(
                            (d: any) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return def ? { ...def, ...inst } : null
                    })
                    .filter((c: any) => c && c.type === "code")

                const hasAppliedExclusiveCode = appliedCodeCoupons.some(
                    (c: any) => c.exclusive === true
                )

                if (found.exclusive) {
                    // 이미 어떤 code형 쿠폰이라도 적용돼 있으면 exclusive는 불가
                    if (appliedCodeCoupons.length > 0) {
                        const conflict = appliedCodeCoupons[0]
                        alert(
                            `해당 쿠폰은 단독형 쿠폰으로, 기존 쿠폰(${conflict.description})과 함께 사용할 수 없습니다.`
                        )
                        return
                    }
                } else {
                    // exclusive가 한 번이라도 적용돼 있으면 모든 code형 쿠폰 추가 불가
                    if (hasAppliedExclusiveCode) {
                        const conflict = appliedCodeCoupons.find(
                            (c: any) => c.exclusive === true
                        )
                        alert(
                            `이미 단독형 쿠폰(${conflict.description})이 적용되어 있어 다른 쿠폰을 사용할 수 없습니다.`
                        )
                        return
                    }
                }

                // 수취인/멤버십 일치 검증
                const n = (v: any) =>
                    String(v ?? "")
                        .replace(/[\s\-./]/g, "")
                        .toLowerCase()
                        .trim()
                const mismatch = (a: any, b: any) => n(a) !== n(b)

                const hasMembership =
                    found.membership_number != null &&
                    n(found.membership_number) !== ""

                const membershipMismatch = mismatch(
                    found.membership_number,
                    (store as any).membership_number
                )
                const infoMismatch =
                    mismatch(
                        found.receiver_info?.name,
                        formStore.reserver_name
                    ) ||
                    mismatch(
                        found.receiver_info?.birthdate,
                        formStore.reserver_birthdate
                    ) ||
                    mismatch(
                        found.receiver_info?.contact,
                        formStore.reserver_phone
                    )

                const isEmptyCoupon =
                    !found.receiver_info?.name &&
                    !found.receiver_info?.birthdate &&
                    !found.receiver_info?.contact &&
                    !hasMembership

                const shouldAlert = hasMembership
                    ? membershipMismatch
                    : infoMismatch
                if (!isEmptyCoupon && shouldAlert) {
                    alert("쿠폰이 존재하지 않거나 쿠폰번호가 잘못되었습니다.")
                    return
                }

                if (found.status !== "available") {
                    alert("이 쿠폰은 현재 사용이 불가능합니다.")
                    return
                }
                if (found.coupon_due) {
                    const now = new Date()
                    const due = new Date(found.coupon_due)
                    if (isNaN(due.getTime()) || now > due) {
                        alert("이 쿠폰의 유효기간이 지났습니다.")
                        return
                    }
                }

                // ----------------------------
                // 날짜 준비/검증
                // ----------------------------
                const queryParams = new URLSearchParams(window.location.search)
                const first = queryParams.get("first")
                const second = queryParams.get("second")
                const firstDateFromQuery = first ? parseDate(first) : null
                const secondDateFromQuery = second ? parseDate(second) : null

                const firstDateObj =
                    (store as any).firstDate ?? firstDateFromQuery
                const secondDateObj =
                    (store as any).secondDate ?? secondDateFromQuery

                if (!firstDateObj || !secondDateObj) {
                    alert(
                        "체크인/체크아웃 날짜를 먼저 선택한 뒤 쿠폰을 적용해주세요."
                    )
                    return
                }

                // ----------------------------
                // 카테고리 맵 로드
                // ----------------------------
                let categoryMap: Record<string, any> = {}
                try {
                    const holidayRes = await getReservationDays()
                    const days = await holidayRes.json()

                    const rawMap: Record<string, string> = {}
                    for (const item of days) {
                        rawMap[item.date] = item.category
                    }

                    categoryMap = toCategoryMap(rawMap)
                } catch (err) {
                    console.error("❌ Category map load failed:", err)
                    categoryMap = {}
                }

                console.log("firstDateObj", firstDateObj)
                console.log("secondDateObj", secondDateObj)

                // ----------------------------
                // 일자별 가격 계산 (명시적 날짜 전달)
                // ----------------------------
                const { dailyItems } = calculateInitialPrices(
                    { ...(store as any) },
                    categoryMap,
                    categoryDefs,
                    firstDateObj,
                    secondDateObj
                )

                // 글로벌 + 현재 코드만 구성
                const globalDefs = definitions.filter(
                    (def: any) => def.type === "global"
                )
                const couponsForCheck = [...globalDefs, found]

                // 가상 store: enteredCouponCode에 현재 코드 포함
                const simulatedStore = {
                    ...(store as any),
                    enteredCouponCode: [
                        ...(store.enteredCouponCode ?? []),
                        code,
                    ],
                }

                // 필터 통과 여부
                const { passedPrimaryCoupons, passedSecondaryCoupons } =
                    filterCoupons(
                        couponsForCheck,
                        simulatedStore as any,
                        dailyItems
                    )

                // const codes = couponsForCheck
                //     .filter((c) => c.coupon_code && c.coupon_code[0] == "H") // coupon_code 필드가 존재하는 쿠폰만
                //     .map((c) => c.coupon_code as string) // 문자열로 추출

                // alert(
                //     `B-1) check: ${JSON.stringify(codes)}\npassedSecondary: ${JSON.stringify(passedSecondaryCoupons)}`
                // )

                const targetId =
                    found.coupon_instance_id || found.coupon_definition_id

                const included = passedSecondaryCoupons.some(
                    (c: any) =>
                        (c.coupon_instance_id || c.coupon_definition_id) ===
                        targetId
                )

                if (!included) {
                    // 🔸 필터에서 제외된 경우
                    alert(`사용할 수 없는 쿠폰 조건입니다.`)
                    return
                }

                // 실제 할인액 계산
                const { secondaryDetails } = evaluateCoupons(
                    passedPrimaryCoupons,
                    passedSecondaryCoupons,
                    dailyItems,
                    simulatedStore as any
                )

                const detail = secondaryDetails.find((d) => d.id === targetId)
                const appliedAmount = detail?.amount ?? 0

                if (!detail || appliedAmount <= 0) {
                    // 🔸 필터는 통과했지만, 적용 가능한 결제 금액(잔액/상한)을 초과해 0원 처리된 경우
                    alert(
                        "결제 할인 금액을 초과하여 쿠폰을 사용할 수 없습니다."
                    )
                    return
                }

                // 최종 적용
                const isConfirmed = window.confirm(`쿠폰 ${code}을 적용합니다.`)
                if (isConfirmed) {
                    setStore({
                        enteredCouponCode: [
                            ...(store.enteredCouponCode ?? []),
                            code,
                        ],
                    })
                }
            } catch (error) {
                console.error("쿠폰 확인 중 오류 발생:", error)
                alert("쿠폰 확인 중 오류가 발생했습니다. 다시 시도해주세요.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export async function fetchTotalMileage(
    membershipNumber: string
): Promise<number> {
    try {
        const res = await fetch(
            "https://terene-db-server.onrender.com/api/v2/mileages"
        )
        if (!res.ok) throw new Error("Failed to fetch mileage data")

        const data = await res.json()
        const userMileage = data.filter(
            (m: any) => m.membership_number === membershipNumber
        )

        const totalAmount = userMileage.reduce(
            (sum: number, entry: any) =>
                sum + Number(entry.mileage_amount || 0),
            0
        )

        return totalAmount
    } catch (error) {
        console.error("마일리지 조회 실패:", error)
        return 0
    }
}

export function toggleMileage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ mileage: Number(inputValue) })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleSpecialRequests(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ special_requests: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function handleAnniversaryDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value

            if (selectedValue !== "기념일 종류") {
                setStore({ anniversary_type: selectedValue })
            }
        }

        return (
            <Component
                {...props}
                value={store.anniversary_type}
                onChange={handleChange}
            />
        )
    }
}

export function toggleAnniversaryName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ anniversary_name: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleAnniversaryValue(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ anniversary_value: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

// ----- 토스 결제 / Paypal 결제 분기점 -----
export function toggleTossPayment(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()
        const [formStore, setformStore] = useFormStore()
        const [payment, setPayment] = useState(formStore.payment)

        const toggle = () => {
            setStore({ payment: "toss" })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function togglePaypalPayment(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()
        const [formStore, setformStore] = useFormStore()
        const [payment, setPayment] = useState(formStore.payment)

        const toggle = () => {
            setStore({ payment: "paypal" })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleForeignCardPayment(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()
        const [formStore, setformStore] = useFormStore()
        const [payment, setPayment] = useState(formStore.payment)

        const toggle = () => {
            setStore({ payment: "foreignCard" })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleRefundName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ refund_name: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleRefundPhone(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ refund_phone: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function handleRefundBank(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value

            if (selectedValue !== "은행명") {
                setStore({ refund_bank: selectedValue })
            }
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleRefundAccount(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ refund_account: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function getAvailableMileage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()

        return (
            <Component
                {...props}
                text={`사용 가능 ${(store.totalMileage - store.usedMileage).toLocaleString()}p`}
            />
        )
    }
}

export function getTotalMileage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        React.useEffect(() => {
            const fetchMileages = async () => {
                if (!store.membership_number) return

                try {
                    const res = await fetch(
                        "https://terene-db-server.onrender.com/api/v2/mileages"
                    )
                    if (!res.ok) throw new Error("마일리지 조회 실패")
                    const data = await res.json()

                    const sum = data
                        .filter(
                            (m: any) =>
                                m.membership_number === store.membership_number
                        )
                        .reduce(
                            (acc: number, m: any) =>
                                acc + Number(m.mileage_amount || 0),
                            0
                        )

                    setStore({
                        totalMileage: sum,
                    })
                } catch (e) {
                    console.error("마일리지 불러오기 실패:", e)
                    setStore({
                        totalMileage: 0,
                    })
                }
            }

            fetchMileages()
        }, [store.membership_number])

        return (
            <Component
                {...props}
                text={`보유 ${store.totalMileage.toLocaleString()}p`}
            />
        )
    }
}

export function applyMileage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore, setFormStore] = useFormStore()
        const [store, setStore] = useStore()

        const handleClick = async () => {
            if (!formStore.mileage) {
                alert(`마일리지를 입력해주세요.`)
                return
            }

            if (
                !Number.isInteger(formStore.mileage) ||
                formStore.mileage <= 0
            ) {
                alert("마일리지는 1 이상의 자연수로만 입력해주세요.")
                return
            }

            // if (!store.membership_number) {
            //     alert("멤버십 로그인이 필요합니다.")
            //     return
            // }

            // const totalMileage = await fetchTotalMileage(
            //     store.membership_number
            // )
            const availableMileage = store.totalMileage - store.usedMileage

            if (formStore.mileage > availableMileage || availableMileage <= 0) {
                alert(`마일리지 수 부족: ${availableMileage.toLocaleString()}p`)
                return
            }

            if (formStore.mileage > store.integratedPrice) {
                alert(
                    `최대 적용 가능한 마일리지 수를 초과하였습니다.\n현재 최대 적용 가능한 마일리지 수: ${store.integratedPrice.toLocaleString()}p`
                )
                return
            }

            if (store.usedMileage == 0) {
                const isConfirmed = window.confirm(
                    `마일리지 ${formStore.mileage.toLocaleString()}p를 적용합니다.`
                )
                if (isConfirmed) {
                    setStore({
                        usedMileage:
                            (store.usedMileage || 0) + formStore.mileage,
                    })
                }
            } else {
                const isConfirmed = window.confirm(
                    `마일리지 ${formStore.mileage.toLocaleString()}p를 추가로 적용합니다.`
                )
                if (isConfirmed) {
                    setStore({
                        usedMileage:
                            (store.usedMileage || 0) + formStore.mileage,
                    })
                }
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function hidePaypalInfo(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        if (store.payment !== "paypal") return null

        return <Component {...props} />
    }
}
