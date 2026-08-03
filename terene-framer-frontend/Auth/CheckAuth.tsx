import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"

import { useStore } from "../Store/MainStore.tsx"
import { useCalendarStore } from "../Store/CalendarStore.tsx"

import { membershipLimits } from "../Calendar/UnmuMembership.tsx"

import { getKSTDate, getKSTISOString } from "../Utils/KST.tsx"
import {
    isBeyondReservationLimit,
    isReservationPairValid,
} from "../Utils/ReservationUtils.tsx"

import { createReservationMessage } from "../Notifier/messages.ts"
import { sendSMS, sendEmail } from "../Notifier/notify.ts"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
import {
    login,
    me as fetchAuthMe,
    logout as requestAuthLogout,
} from "../Api/auth.ts"
import { getReservationDays } from "../Api/reservations.ts"

const useAuthStore = createStore({
    temp_id: null,
    temp_password: null,
    checkedPermanentLogin: false,
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

export function toggleID(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAuthStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ temp_id: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function togglePassword(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAuthStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ temp_password: inputValue })
        }

        return <Component {...props} type="password" onChange={handleChange} />
    }
}

export function togglePermanentLogin(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAuthStore()
        const toggle = () => {
            setStore({ checkedPermanentLogin: !store.checkedPermanentLogin })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function safeRequestLogin(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [authStore] = useAuthStore()
        const [_, setStore] = useStore()

        const handleClick = async () => {
            try {
                // login logic
                const loginRes = await login({
                    id: authStore.temp_id,
                    password: authStore.temp_password,
                    mode: authStore.checkedPermanentLogin
                        ? "permanent"
                        : "temporary",
                })
                const data = await loginRes.json()
                if (!loginRes.ok || !data.token) {
                    alert("로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.")
                    return
                }
                localStorage.setItem("token", data.token)

                // me logic
                const meRes = await fetchAuthMe(data.token)
                if (!meRes.ok) {
                    alert("로그인 상태 확인 실패")
                    return
                }
                const user = await meRes.json()

                setStore({
                    membership_number: user.membership_number,
                    name: user.name,
                    birthdate: user.birthdate,
                    phone: user.phone,
                    email: user.email,
                    membership: user.membership,
                    phase: user.phase,
                    signup_date: user.signup_date,
                    nationality: user.nationality,
                })

                if (user.remarks?.includes("temp_password")) {
                    window.location.href = "/change-password"
                    return
                }

                if (user.membership_number[0] === "A") {
                    window.location.href = "/admin-checkreserve"
                } else {
                    window.location.href = "/member-page-회원정보"
                }
            } catch (err) {
                console.error("로그인 에러:", err)
                alert("로그인 요청 중 오류가 발생했습니다.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function safeRequestReservation(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [authStore] = useAuthStore()
        const [_, setStore] = useStore()

        const handleClick = async () => {
            try {
                // login logic
                const loginRes = await login({
                    id: authStore.temp_id,
                    password: authStore.temp_password,
                    mode: authStore.checkedPermanentLogin
                        ? "permanent"
                        : "temporary",
                })
                const data = await loginRes.json()
                if (!loginRes.ok || !data.token) {
                    alert("로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.")
                    return
                }
                localStorage.setItem("token", data.token)

                // me logic
                const meRes = await fetchAuthMe(data.token)
                if (!meRes.ok) {
                    alert("로그인 상태 확인 실패")
                    return
                }
                const user = await meRes.json()

                // 3. store에 회원 정보 저장
                setStore({
                    membership_number: user.membership_number,
                    name: user.name,
                    birthdate: user.birthdate,
                    phone: user.phone,
                    email: user.email,
                    membership: user.membership,
                    phase: user.phase,
                    signup_date: user.signup_date,
                    nationality: user.nationality,
                })

                // 비밀번호 변경 필요 시
                if (user.remarks?.includes("temp_password")) {
                    window.location.href = "/change-password"
                    return
                }

                // 4. 관리자 or 일반회원 분기
                if (user.membership_number[0] === "A") {
                    window.location.href = "/reservation-2-custom"
                } else {
                    window.location.href = "/reservation-2"
                }
            } catch (err) {
                console.error("로그인 에러:", err)
                alert("로그인 요청 중 오류가 발생했습니다.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function safeKeepMemberLogin(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    // 비밀번호 변경 필요 시
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number[0] === "A") {
                        window.location.href = "/admin-checkreserve"
                    } else {
                        window.location.href = "/member-page-회원정보"
                    }
                } catch (e) {
                    console.warn("사용자 인증 실패:", e)
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep1Login(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    // 비밀번호 변경 필요 시
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number[0] === "A") {
                        window.location.href = "/reservation-2-custom"
                    } else {
                        window.location.href = "/reservation-2"
                    }
                } catch (e) {}
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep2Login(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    if (res.ok) {
                        const user = await res.json()

                        setStore({
                            membership_number: user.membership_number,
                            membership: user.membership,
                            remarks: user.remarks ?? "",
                        })
                    }
                } catch (e) {
                    alert(
                        "로그인 정보가 확인되지 않아 비회원 예약 페이지로 이동합니다."
                    )
                    window.location.href = "/reservation-2-guest"
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function safe2to3(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store] = useStore()

        const handleClick = async () => {
            const firstDate = store.firstDate
            const secondDate = store.secondDate

            if (!firstDate || !secondDate) {
                alert("일정을 선택해주세요")
                return
            }

            const format = ({ year, month, day }) =>
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

            const first = format(firstDate)
            const second = format(secondDate)

            const baseUrl = "/reservation-3"
            const params = new URLSearchParams()
            params.set("first", first)
            params.set("second", second)

            window.location.href = `${baseUrl}?${params.toString()}`
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function safeKeep3Login(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const run = async () => {
                try {
                    const query = new URLSearchParams(window.location.search)
                    const first = query.get("first")
                    const second = query.get("second")

                    const firstDate = first ? parseDate(first) : null
                    const secondDate = second ? parseDate(second) : null

                    if (!firstDate || !secondDate) {
                        alert("날짜 정보가 누락되었습니다. 다시 시도해주세요.")
                        window.location.href = "/reservation-1"
                        return
                    }

                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    const dayRes = await getReservationDays()
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            category: item.category,
                            isHoliday: item.is_holiday,
                            checkin_occupied: item.checkin_occupied,
                            checkout_occupied: item.checkout_occupied,
                            checkin_order_id: item.checkin_order_id,
                            checkout_order_id: item.checkout_order_id,
                            checkin_allowed: item.checkin_allowed,
                            checkout_allowed: item.checkout_allowed,
                            location: item.location,
                        })
                    })

                    const today = getKSTDate()
                    today.setHours(0, 0, 0, 0)

                    const firstTime = new Date(
                        firstDate.year,
                        firstDate.month,
                        firstDate.day
                    )
                    const secondTime = new Date(
                        secondDate.year,
                        secondDate.month,
                        secondDate.day
                    )

                    const diffDays = Math.abs(
                        (secondTime.getTime() - firstTime.getTime()) /
                            (1000 * 60 * 60 * 24)
                    )
                    if (diffDays >= 4 || firstTime < today) {
                        alert("잘못된 예약 날짜입니다.")
                        window.location.href = "/reservation-2"
                        return
                    }

                    const dateToStr = (d) =>
                        `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`

                    const firstStr = dateToStr(firstDate)
                    const secondStr = dateToStr(secondDate)

                    if (
                        dayInfoMap.get(firstStr)?.checkin_occupied ||
                        dayInfoMap.get(secondStr)?.checkout_occupied
                    ) {
                        alert("해당 날짜는 이미 예약되어 있습니다.")
                        window.location.href = "/reservation-2"
                        return
                    }

                    for (
                        let d = new Date(firstTime.getTime() + 86400000);
                        d < secondTime;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const midStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap.get(midStr)
                        if (info?.checkin_occupied || info?.checkout_occupied) {
                            alert("중간 날짜 중 이미 예약된 날이 있습니다.")
                            window.location.href = "/reservation-2"
                            return
                        }
                    }

                    const membership = user.membership ?? "Non-Member"
                    if (
                        membership != "All-Free" &&
                        !isReservationPairValid(
                            today,
                            firstTime,
                            secondTime,
                            membership
                        )
                    ) {
                        alert("회원 등급에 맞지 않는 예약 기간입니다.")
                        window.location.href = "/reservation-2"
                        return
                    }

                    setStore({
                        membership_number: user.membership_number,
                        membership: user.membership,
                        phase: user.phase,
                        signup_date: user.signup_date,

                        name: user.name,
                        birthdate: user.birthdate,
                        phone: user.phone,
                        email: user.email,

                        remarks: user.remarks,
                        ownedMileage: Number(user.owned_mileage),
                        expiredCoupons: user.used_coupons,
                        nationality: user.nationality,
                    })
                } catch (err) {
                    const query = new URLSearchParams(window.location.search)
                    const first = query.get("first")
                    const second = query.get("second")

                    const baseUrl = "/reservation-3-guest"
                    const params = new URLSearchParams()
                    params.set("first", first)
                    params.set("second", second)

                    alert(
                        "로그인 정보가 확인되지 않아 비회원 예약 페이지로 이동합니다."
                    )
                    window.location.href = `${baseUrl}?${params.toString()}`
                }
            }

            run()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep2LoginNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    setStore({
                        membership: "Non-Member",
                    })
                } catch (e) {
                    alert("알 수 없는 오류가 발생했습니다.")
                    window.location.href = "/reservation-1"
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function safe2to3Nonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()

        const handleClick = async () => {
            const firstDate = store.firstDate
            const secondDate = store.secondDate

            if (!firstDate || !secondDate) {
                alert("일정을 선택해주세요")
                return
            }

            const format = ({ year, month, day }) =>
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

            const first = format(firstDate)
            const second = format(secondDate)

            const baseUrl = "/reservation-3-guest"
            const params = new URLSearchParams()
            params.set("first", first)
            params.set("second", second)

            window.location.href = `${baseUrl}?${params.toString()}`
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function safeKeep3LoginNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const run = async () => {
                try {
                    const query = new URLSearchParams(window.location.search)
                    const first = query.get("first")
                    const second = query.get("second")

                    const firstDate = first ? parseDate(first) : null
                    const secondDate = second ? parseDate(second) : null

                    if (!firstDate || !secondDate) {
                        alert("날짜 정보가 누락되었습니다. 다시 시도해주세요.")
                        window.location.href = "/reservation-1"
                        return
                    }

                    const dayRes = await getReservationDays()
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            category: item.category,
                            isHoliday: item.is_holiday,
                            checkin_occupied: item.checkin_occupied,
                            checkout_occupied: item.checkout_occupied,
                            checkin_order_id: item.checkin_order_id,
                            checkout_order_id: item.checkout_order_id,
                            checkin_allowed: item.checkin_allowed,
                            checkout_allowed: item.checkout_allowed,
                            location: item.location,
                        })
                    })

                    const today = getKSTDate()
                    today.setHours(0, 0, 0, 0)

                    const firstTime = new Date(
                        firstDate.year,
                        firstDate.month,
                        firstDate.day
                    )
                    const secondTime = new Date(
                        secondDate.year,
                        secondDate.month,
                        secondDate.day
                    )

                    const diffDays = Math.abs(
                        (secondTime.getTime() - firstTime.getTime()) /
                            (1000 * 60 * 60 * 24)
                    )
                    if (diffDays >= 4 || firstTime < today) {
                        alert("잘못된 예약 날짜입니다.")
                        window.location.href = "/reservation-1"
                        return
                    }

                    const dateToStr = (d) =>
                        `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`

                    const firstStr = dateToStr(firstDate)
                    const secondStr = dateToStr(secondDate)

                    if (
                        dayInfoMap.get(firstStr)?.checkin_occupied ||
                        dayInfoMap.get(secondStr)?.checkout_occupied
                    ) {
                        alert("해당 날짜는 이미 예약되어 있습니다.")
                        window.location.href = "/reservation-1"
                        return
                    }

                    for (
                        let d = new Date(firstTime.getTime() + 86400000);
                        d < secondTime;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const midStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap.get(midStr)
                        if (info?.checkin_occupied || info?.checkout_occupied) {
                            alert("중간 날짜 중 이미 예약된 날이 있습니다.")
                            window.location.href = "/reservation-1"
                            return
                        }
                    }

                    const membership = "Non-Member"
                    if (
                        !isReservationPairValid(
                            today,
                            firstTime,
                            secondTime,
                            membership
                        )
                    ) {
                        alert("회원 등급에 맞지 않는 예약 기간입니다.")
                        window.location.href = "/reservation-1"
                        return
                    }

                    setStore({
                        membership: membership,
                    })
                } catch (err) {
                    alert("인증 정보 또는 날짜 오류가 발생했습니다.")
                    window.location.href = "/reservation-1"
                }
            }

            run()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep2LoginCustom(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    if (res.ok) {
                        const user = await res.json()
                        if (user.membership_number[0] !== "A") {
                            throw new Error("인증 실패")
                        }

                        setStore({
                            membership_number: user.membership_number,
                            membership: user.membership,
                            remarks: user.remarks ?? "",
                        })
                    }
                } catch (e) {
                    alert(
                        "허용되지 않은 요청입니다. 로그인 페이지로 이동합니다."
                    )
                    window.location.href = "/login"
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep3LoginCustom(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const run = async () => {
                try {
                    const query = new URLSearchParams(window.location.search)
                    const orderId = query.get("orderId")
                    const first = query.get("first")
                    const second = query.get("second")

                    const firstDate = first ? parseDate(first) : null
                    const secondDate = second ? parseDate(second) : null

                    if (!orderId) {
                        alert("예약 정보가 잘못되었습니다. 다시 시도해주세요.")
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    if (!firstDate || !secondDate) {
                        alert("날짜 정보가 누락되었습니다. 다시 시도해주세요.")
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) {
                        setStore({
                            membership_number: null,
                            membership: "Non-Member",
                            remarks: null,
                        })
                    } else {
                        const user = await res.json()
                        setStore({
                            membership_number: user.membership_number,
                            membership: user.membership,

                            name: user.name,
                            birthdate: user.birthdate,
                            phone: user.phone,
                            email: user.email,

                            remarks: user.remarks ?? "",
                            nationality: user.nationality,
                        })
                    }

                    const dayRes = await getReservationDays()
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            category: item.category,
                            isHoliday: item.is_holiday,
                            checkin_occupied: item.checkin_occupied,
                            checkout_occupied: item.checkout_occupied,
                            checkin_order_id: item.checkin_order_id,
                            checkout_order_id: item.checkout_order_id,
                            checkin_allowed: item.checkin_allowed,
                            checkout_allowed: item.checkout_allowed,
                            location: item.location,
                        })
                    })

                    const today = getKSTDate()
                    today.setHours(0, 0, 0, 0)

                    const firstTime = new Date(
                        firstDate.year,
                        firstDate.month,
                        firstDate.day
                    )
                    const secondTime = new Date(
                        secondDate.year,
                        secondDate.month,
                        secondDate.day
                    )

                    const diffDays = Math.abs(
                        (secondTime.getTime() - firstTime.getTime()) /
                            (1000 * 60 * 60 * 24)
                    )

                    const dateToStr = (d) =>
                        `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`

                    const firstStr = dateToStr(firstDate)
                    const secondStr = dateToStr(secondDate)

                    if (
                        (dayInfoMap.get(firstStr)?.checkin_occupied &&
                            dayInfoMap.get(firstStr)?.checkin_order_id !==
                                orderId) ||
                        (dayInfoMap.get(secondStr)?.checkout_occupied &&
                            dayInfoMap.get(secondStr)?.checkout_order_id !==
                                orderId)
                    ) {
                        alert(
                            "해당 날짜는 이미 예약되어 있습니다. 다시 시도해주세요."
                        )
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    for (
                        let d = new Date(firstTime.getTime() + 86400000);
                        d < secondTime;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const midStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap.get(midStr)
                        if (
                            (info?.checkin_occupied &&
                                info?.checkin_order_id !== orderId) ||
                            (info?.checkout_occupied &&
                                info?.checkout_order_id !== orderId)
                        ) {
                            alert(
                                "중간 날짜 중 이미 예약된 날이 있습니다. 다시 시도해주세요."
                            )
                            window.location.href = "/member-checkreserve"
                            return
                        }
                    }
                } catch (err) {
                    alert("인증 정보 또는 날짜 오류가 발생했습니다.")
                    window.location.href = "/member-checkreserve"
                }
            }

            run()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeep3LoginCustomNonmember(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const run = async () => {
                try {
                    const query = new URLSearchParams(window.location.search)
                    const orderId = query.get("orderId")
                    const first = query.get("first")
                    const second = query.get("second")

                    const firstDate = first ? parseDate(first) : null
                    const secondDate = second ? parseDate(second) : null

                    if (!orderId) {
                        alert("예약 정보가 잘못되었습니다. 다시 시도해주세요.")
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    if (!firstDate || !secondDate) {
                        alert("날짜 정보가 누락되었습니다. 다시 시도해주세요.")
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    setStore({
                        membership_number: null,
                        membership: "Non-Member",
                        remarks: null,
                    })

                    const dayRes = await getReservationDays()
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            category: item.category,
                            isHoliday: item.is_holiday,
                            checkin_occupied: item.checkin_occupied,
                            checkout_occupied: item.checkout_occupied,
                            checkin_order_id: item.checkin_order_id,
                            checkout_order_id: item.checkout_order_id,
                            checkin_allowed: item.checkin_allowed,
                            checkout_allowed: item.checkout_allowed,
                            location: item.location,
                        })
                    })

                    const today = getKSTDate()
                    today.setHours(0, 0, 0, 0)

                    const firstTime = new Date(
                        firstDate.year,
                        firstDate.month,
                        firstDate.day
                    )
                    const secondTime = new Date(
                        secondDate.year,
                        secondDate.month,
                        secondDate.day
                    )

                    const diffDays = Math.abs(
                        (secondTime.getTime() - firstTime.getTime()) /
                            (1000 * 60 * 60 * 24)
                    )

                    const dateToStr = (d) =>
                        `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`

                    const firstStr = dateToStr(firstDate)
                    const secondStr = dateToStr(secondDate)

                    if (
                        (dayInfoMap.get(firstStr)?.checkin_occupied &&
                            dayInfoMap.get(firstStr)?.checkin_order_id !==
                                orderId) ||
                        (dayInfoMap.get(secondStr)?.checkout_occupied &&
                            dayInfoMap.get(secondStr)?.checkout_order_id !==
                                orderId)
                    ) {
                        alert(
                            "해당 날짜는 이미 예약되어 있습니다. 다시 시도해주세요."
                        )
                        window.location.href = "/member-checkreserve"
                        return
                    }

                    for (
                        let d = new Date(firstTime.getTime() + 86400000);
                        d < secondTime;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const midStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap.get(midStr)
                        if (
                            (info?.checkin_occupied &&
                                info?.checkin_order_id !== orderId) ||
                            (info?.checkout_occupied &&
                                info?.checkout_order_id !== orderId)
                        ) {
                            alert(
                                "중간 날짜 중 이미 예약된 날이 있습니다. 다시 시도해주세요."
                            )
                            window.location.href = "/member-checkreserve"
                            return
                        }
                    }
                } catch (err) {
                    alert("인증 정보 또는 날짜 오류가 발생했습니다.")
                    window.location.href = "/member-checkreserve"
                }
            }

            run()
        }, [])

        return <Component {...props} />
    }
}

export function safeKeepAdminLogin(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    if (res.ok) {
                        const user = await res.json()

                        if (user.membership_number[0] !== "A") {
                            alert("해당 페이지를 접근할 권한이 없습니다.")
                            window.location.href = "/member-page-회원정보"
                        }
                    }
                } catch (e) {
                    alert(
                        "로그인 정보가 확인되지 않아 로그인 페이지로 이동합니다."
                    )
                    window.location.href = "/login"
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function getMemberInfo(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()
        const [name, setName] = React.useState("")

        React.useEffect(() => {
            const fetchName = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetchAuthMe(token)
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    if (user.membership_number[0] === "A") {
                        window.location.href = "/admin-checkreserve"
                    }

                    // 비밀번호 변경 필요 시
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    setStore({
                        ...store,
                        membership_number: user.membership_number,
                        name: user.name,
                        phone: user.phone,
                        email: user.email,
                        membership: user.membership,
                        nationality: user.nationality,
                    })
                    setName(user.name)
                } catch (e) {
                    alert("로그인이 만료되었거나 인증에 실패했습니다.")
                    window.location.href = "/login"
                }
            }

            fetchName()
        }, [])

        return <Component {...props} />
    }
}

export function getMembership(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()

        return <Component {...props} text={store.membership} />
    }
}

export function getMemberName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()

        const text = store.name
            ? `${store.name} 님,\n환영합니다.`
            : "         님,\n환영합니다."

        return <Component {...props} text={text} />
    }
}

export function logoutButton(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [_, setStore] = useStore()

        const handleClick = async () => {
            try {
                // logout logic
                // 1. (선택적으로) 서버에 로그아웃 요청
                await requestAuthLogout()
                // 2. 로컬스토리지에서 토큰 삭제
                localStorage.removeItem("token")

                // 3. 클라이언트 상태 초기화
                setStore({
                    membership_number: null,
                    membership: null,
                    name: null,
                    phone: null,
                    email: null,
                    ownedMileage: null,
                    expiredCoupons: null,
                    remarks: null,
                    nationality: null,
                })

                // 4. 로그인 페이지로 이동
                window.location.href = "/login"
            } catch (err) {
                console.error("로그아웃 실패:", err)
                alert("로그아웃 중 오류가 발생했습니다.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function getAvailableCouponCount(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const [count, setCount] = React.useState<number>(0)

        React.useEffect(() => {
            const fetchCoupons = async () => {
                if (!store.membership_number) return

                try {
                    const res = await fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    )
                    if (!res.ok) throw new Error("쿠폰 조회 실패")

                    const data = await res.json()

                    const availableCoupons = data.filter(
                        (coupon: any) =>
                            coupon.membership_number ===
                                store.membership_number &&
                            coupon.status === "available" &&
                            Boolean(coupon.coupon_code)
                    )

                    setCount(availableCoupons.length)
                } catch (e) {
                    console.error("쿠폰 불러오기 실패:", e)
                    setCount(0)
                }
            }

            fetchCoupons()
        }, [store.membership_number])

        return <Component {...props} text={`${count}개`} />
    }
}

export function getAvailableMileage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const [amount, setAmount] = React.useState<number>(0)

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

                    setAmount(sum)
                } catch (e) {
                    console.error("마일리지 불러오기 실패:", e)
                    setAmount(0)
                }
            }

            fetchMileages()
        }, [store.membership_number])

        return <Component {...props} text={`${amount.toLocaleString()}`} />
    }
}

export function redirectToReservation(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const handleClick = async () => {
            try {
                // me-only logic
                const token = localStorage.getItem("token")
                if (!token) throw new Error("토큰 없음")
                const res = await fetchAuthMe(token)
                if (!res.ok) throw new Error("인증 실패")
                if (res.ok) {
                    // 비밀번호 변경 필요 시
                    const user = await res.json()
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number[0] === "A") {
                        window.location.href = "/reservation-2-custom"
                        return
                    } else {
                        window.location.href = "/reservation-2"
                        return
                    }
                } else {
                    throw new Error("Not authenticated")
                }
            } catch (err) {
                window.location.href = "/reservation-1"
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function redirectToMemberPage(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const handleClick = async () => {
            try {
                // me-only logic
                const token = localStorage.getItem("token")
                if (!token) throw new Error("토큰 없음")
                const res = await fetchAuthMe(token)
                if (!res.ok) throw new Error("인증 실패")
                if (res.ok) {
                    // 비밀번호 변경 필요 시
                    const user = await res.json()
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number[0] === "A") {
                        window.location.href = "/admin-checkreserve"
                        return
                    } else {
                        window.location.href = "/member-page-회원정보"
                        return
                    }
                } else {
                    throw new Error("Not authenticated")
                }
            } catch (err) {
                window.location.href = "/login"
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function withDaysCache(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [cache, setCache] = useCalendarStore()

        useEffect(() => {
            // 이미 캐시되어 있다면 fetch 스킵
            if (cache?.dayInfoMap && cache?.categoryMap && cache?.designMap)
                return

            const fetchAll = async () => {
                try {
                    const [days, categories, designs] = await Promise.all([
                        getReservationDays().then((r) => r.json()),
                        fetch(
                            "https://terene-db-server.onrender.com/api/v3/days-category"
                        ).then((r) => r.json()),
                        fetch(
                            "https://terene-db-server.onrender.com/api/v3/days-design"
                        ).then((r) => r.json()),
                    ])

                    console.log(`Fetch days: ${JSON.stringify(days)}`)
                    console.log(
                        `Fetch categories: ${JSON.stringify(categories)}`
                    )
                    console.log(`Fetch designs: ${JSON.stringify(designs)}`)

                    const dayInfoMap = new Map()
                    days.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            category: item.category,
                            isHoliday: item.is_holiday,
                            checkin_occupied: item.checkin_occupied,
                            checkout_occupied: item.checkout_occupied,
                            checkin_order_id: item.checkin_order_id,
                            checkout_order_id: item.checkout_order_id,
                            checkin_allowed: item.checkin_allowed,
                            checkout_allowed: item.checkout_allowed,
                            location: item.location,
                        })
                    })

                    const categoryMap = new Map()
                    categories.forEach((c: any) =>
                        categoryMap.set(c.eng_name, c.bg_color)
                    )

                    const designMap = new Map()
                    designs.forEach((d: any) =>
                        designMap.set(d.object, d.color)
                    )

                    setCache({ dayInfoMap, categoryMap, designMap })
                } catch (e) {
                    console.error("❌ withDaysCache fetch error:", e)
                }
            }

            fetchAll()
        }, [cache, setCache])

        return <Component {...props} />
    }
}
