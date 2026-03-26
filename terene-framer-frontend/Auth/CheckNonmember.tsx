import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"
import { membershipLimits } from "../Calendar/UnmuMembership.tsx"
import {
    isBeyondReservationLimit,
    isReservationPairValid,
} from "../Calendar/WeekComponent.tsx"
import { createReservationMessage } from "../Notifier/messages.ts"
import { sendSMS, sendEmail } from "../Notifier/notify.ts"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"

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

const useNonmemberStore = createStore({
    order_id: null,
    reserver_name: null,
    reserver_contact: null,
})

export function formatDate({
    year,
    month,
    day,
}: {
    year: number
    month: number
    day: number
}): string {
    const paddedMonth = String(month + 1).padStart(2, "0") // month는 0-based
    const paddedDay = String(day).padStart(2, "0")
    return `${year}-${paddedMonth}-${paddedDay}`
}

export function parseDate(
    dateStr: string
): { year: number; month: number; day: number } | null {
    const [yearStr, monthStr, dayStr] = dateStr.split("-")
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1 // zero-based
    const day = parseInt(dayStr)

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null

    return { year, month, day }
}

function safeParseDate(input: string): Date | null {
    const date = new Date(input)
    return isNaN(date.getTime()) ? null : date
}

export function toggleOrderID(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useNonmemberStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ order_id: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleName(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useNonmemberStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ reserver_name: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleContact(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useNonmemberStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ reserver_contact: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function nonmemberRequest(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useNonmemberStore()

        const normalize = (str: string) =>
            str
                ?.replace(/[\s\-./]/g, "")
                .toLowerCase()
                .trim()

        const handleClick = async () => {
            const { order_id, reserver_name, reserver_contact } = store

            const hasOrderId = !!order_id?.trim()
            const hasNameAndContact =
                !!reserver_name?.trim() && !!reserver_contact?.trim()

            if (!hasOrderId && !hasNameAndContact) {
                alert("예약번호 또는 예약자+연락처 정보를 입력해주세요.")
                return
            }

            try {
                const response = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/orders`
                )
                if (!response.ok) throw new Error("데이터 조회 실패")

                const orders = await response.json()

                const inputOrderId = normalize(order_id)
                const inputName = normalize(reserver_name)
                const inputContact = normalize(reserver_contact)

                let matched = null
                let matchedOrderId = null

                if (hasOrderId) {
                    matched = orders.find((order: any) => {
                        const currentOrderId = normalize(order.order_id)
                        const oldOrderId = normalize(order.old_order_id)
                        if (
                            currentOrderId === inputOrderId ||
                            oldOrderId === inputOrderId
                        ) {
                            matchedOrderId = currentOrderId // always use current order_id for param
                            return true
                        }
                        return false
                    })
                } else if (hasNameAndContact) {
                    matched = orders.find(
                        (order: any) =>
                            normalize(order.reserver_name) === inputName &&
                            normalize(order.reserver_contact) === inputContact
                    )
                }

                if (matched) {
                    const params = new URLSearchParams({
                        order_id: matchedOrderId || "",
                        reserver_name: reserver_name || "",
                        reserver_contact: reserver_contact || "",
                    }).toString()

                    window.location.href = `/non-member-checkreserve?${params}`
                    // } else if (matched.membership_number) {
                    //     alert(
                    //         "해당 페이지는 비회원 예약 조회 전용입니다.\n회원은 로그인 후 마이페이지에서 예약 조회가 가능합니다."
                    //     )
                } else {
                    alert(
                        "예약 내역이 없습니다.\n정보를 다시 한번 확인해주십시오. (예: 대소문자 구분)"
                    )
                }
            } catch (error) {
                console.error("비회원 예약 조회 오류:", error)
                alert("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}
