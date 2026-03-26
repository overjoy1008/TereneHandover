import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"
import { useStore } from "../Calendar/MonthDisplay.tsx"
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
                // 1. 로그인 요청
                const loginRes = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/login",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키 포함
                        body: JSON.stringify({
                            id: authStore.temp_id,
                            password: authStore.temp_password,
                            mode: authStore.checkedPermanentLogin
                                ? "permanent"
                                : "temporary",
                        }),
                    }
                )

                if (!loginRes.ok) {
                    alert("로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.")
                    return
                }

                // 2. 로그인 성공 후 유저 정보 가져오기
                const meRes = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/me",
                    {
                        credentials: "include",
                    }
                )

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
                })

                // 비밀번호 변경 필요 시
                if (user.remarks?.includes("temp_password")) {
                    window.location.href = "/change-password"
                    return
                }

                // 4. 관리자 or 일반회원 분기
                if (user.membership_number === "A-00000001") {
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
                // 1. 로그인 요청
                const loginRes = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/login",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키 포함
                        body: JSON.stringify({
                            id: authStore.temp_id,
                            password: authStore.temp_password,
                            mode: authStore.checkedPermanentLogin
                                ? "permanent"
                                : "temporary",
                        }),
                    }
                )

                if (!loginRes.ok) {
                    alert("로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.")
                    return
                }

                // 2. 로그인 성공 후 유저 정보 가져오기
                const meRes = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/me",
                    {
                        credentials: "include",
                    }
                )

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
                })

                // 비밀번호 변경 필요 시
                if (user.remarks?.includes("temp_password")) {
                    window.location.href = "/change-password"
                    return
                }

                // 4. 관리자 or 일반회원 분기
                if (user.membership_number === "A-00000001") {
                    window.location.href = "/reservation-2-admin"
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
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")

                    const user = await res.json()

                    // 비밀번호 변경 필요 시
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number === "A-00000001") {
                        window.location.href = "/admin-checkreserve"
                    } else {
                        window.location.href = "/member-page-회원정보"
                    }
                } catch (e) {}
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
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")

                    const user = await res.json()

                    // 비밀번호 변경 필요 시
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    if (user.membership_number === "A-00000001") {
                        window.location.href = "/reservation-2-admin"
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
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
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
                    alert("로그인 정보가 확인되지 않았습니다.")
                    window.location.href = "/reservation-1"
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

                    const userRes = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!userRes.ok) throw new Error("Unauthorized")
                    const user = await userRes.json()

                    const dayRes = await fetch(
                        "https://terene-db-server.onrender.com/api/days"
                    )
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            isHoliday: item.is_holiday,
                            checkin: item.checkin,
                            checkout: item.checkout,
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
                        dayInfoMap.get(firstStr)?.checkin?.is_occupied ||
                        dayInfoMap.get(secondStr)?.checkout?.is_occupied
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
                        if (
                            info?.checkin?.is_occupied ||
                            info?.checkout?.is_occupied
                        ) {
                            alert("중간 날짜 중 이미 예약된 날이 있습니다.")
                            window.location.href = "/reservation-1"
                            return
                        }
                    }

                    const membership = user.membership ?? "Non-Member"
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
                    alert("로그인 정보가 확인되지 않았습니다.")
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

            const baseUrl = "/reservation-3-nonmember"
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

                    const dayRes = await fetch(
                        "https://terene-db-server.onrender.com/api/days"
                    )
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            isHoliday: item.is_holiday,
                            checkin: item.checkin,
                            checkout: item.checkout,
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
                        dayInfoMap.get(firstStr)?.checkin?.is_occupied ||
                        dayInfoMap.get(secondStr)?.checkout?.is_occupied
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
                        if (
                            info?.checkin?.is_occupied ||
                            info?.checkout?.is_occupied
                        ) {
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

export function getMemberInfo(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()
        const [name, setName] = React.useState("")

        React.useEffect(() => {
            const fetchName = async () => {
                try {
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")

                    const user = await res.json()

                    if (user.membership_number == "A-00000001") {
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

        return <Component {...props} text={`${store.name} 님,\n환영합니다.`} />
    }
}

export function logoutButton(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [_, setStore] = useStore()

        const handleClick = async () => {
            try {
                // 1. 서버에 로그아웃 요청
                await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/logout",
                    {
                        method: "POST",
                        credentials: "include",
                    }
                )

                // 2. 클라이언트 상태 초기화
                setStore({
                    membership_number: null,
                    membership: null,
                    name: null,
                    phone: null,
                    email: null,
                    ownedMileage: null,
                    expiredCoupons: null,
                    remarks: null,
                })

                // 3. 로그인 페이지로 이동
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
                            coupon.status === "available"
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

export function adminKeep2Login(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")

                    const user = await res.json()
                    if (user.membership_number !== "A-00000001") {
                        alert("관리자만이 이 페이지에서 예약할 수 있습니다.")
                        window.location.href = "/login"
                        return
                    } else {
                        setStore({
                            membership: "TERENE 24",
                        })
                    }
                } catch (e) {
                    alert("로그인 정보가 확인되지 않았습니다.")
                    window.location.href = "/login"
                }
            }

            fetchUser()
        }, [])

        return <Component {...props} />
    }
}

export function admin2to3(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [authStore] = useAuthStore()
        const [store] = useStore()

        const handleClick = async () => {
            const queryParams = new URLSearchParams(window.location.search)
            const encodedMembershipNumber = queryParams.get("mn")
            const decoded = atob(encodedMembershipNumber)

            const firstDate = store.firstDate
            const secondDate = store.secondDate

            // first와 second 값이 둘 다 있어야만 URL에 추가하도록 조건을 설정
            if (!firstDate || !secondDate) {
                alert("일정을 선택해주세요")
                return
            }

            const first = formatDate(firstDate)
            const second = formatDate(secondDate)

            const baseUrl = "/reservation-3-admin"
            const params = new URLSearchParams()
            //////////////////////////////

            if (encodedMembershipNumber) {
                params.set("mn", encodedMembershipNumber)
            }

            params.set("first", first)
            params.set("second", second)

            window.location.href = `${baseUrl}?${params.toString()}`
            return
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function adminKeep3Login(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [decodedMembershipNumber, setDecodedMembershipNumber] = useState<
            string | null
        >(null)
        const [store, setStore] = useStore()

        useEffect(() => {
            const fetchUser = async () => {
                try {
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            credentials: "include",
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")

                    const user = await res.json()
                    if (user.membership_number !== "A-00000001") {
                        alert("관리자만이 이 페이지에서 예약할 수 있습니다.")
                        window.location.href = "/login"
                        return
                    }
                } catch (e) {
                    alert("로그인 정보가 확인되지 않았습니다.")
                    window.location.href = "/login"
                }
            }

            const verifyMembershipNumber = async () => {
                const queryParams = new URLSearchParams(window.location.search)
                const encodedMembershipNumber = queryParams.get("mn")
                const first = queryParams.get("first")
                const second = queryParams.get("second")

                const firstDate = first ? parseDate(first) : null
                const secondDate = second ? parseDate(second) : null

                if (!firstDate || !secondDate) {
                    alert(
                        "날짜가 선택되지 않은 채로 넘어와 오류가 발생했습니다. 로그인 화면으로 돌아갑니다."
                    )
                    window.location.href = `/reservation-1`
                    return
                }

                try {
                    const decoded = atob(encodedMembershipNumber)

                    // 고객 정보 가져오기
                    const response = await fetch(
                        "https://terene-db-server.onrender.com/api/customers"
                    )
                    const data = await response.json()
                    const matchedUser = data.find(
                        (user) => user.membership_number === decoded
                    )

                    // 날짜 점유 정보 가져오기
                    const dayRes = await fetch(
                        "https://terene-db-server.onrender.com/api/days"
                    )
                    const dayData = await dayRes.json()
                    const dayInfoMap = new Map()
                    dayData.forEach((item) => {
                        dayInfoMap.set(item.date, {
                            isHoliday: item.is_holiday,
                            checkin: item.checkin,
                            checkout: item.checkout,
                        })
                    })

                    const dateToString = ({ year, month, day }) =>
                        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const dateToTime = ({ year, month, day }) =>
                        new Date(year, month, day).getTime()

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
                    if (diffDays >= 4) {
                        alert(
                            "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return
                    }

                    if (firstTime.getTime() < today.getTime()) {
                        alert(
                            "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return
                    }

                    const firstStr = dateToString(firstDate)
                    const secondStr = dateToString(secondDate)
                    const firstInfo = dayInfoMap.get(firstStr)
                    const secondInfo = dayInfoMap.get(secondStr)

                    if (firstInfo?.checkin?.is_occupied) {
                        alert(
                            "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return
                    }

                    if (secondInfo?.checkout?.is_occupied) {
                        alert(
                            "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return
                    }

                    // 사이 날짜 점유 여부 확인
                    for (
                        let d = new Date(firstTime.getTime() + 86400000);
                        d < secondTime;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap.get(key)
                        if (
                            info?.checkin?.is_occupied ||
                            info?.checkout?.is_occupied
                        ) {
                            alert(
                                "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                            )
                            window.location.href = "/reservation-1"
                            return
                        }
                    }

                    if (matchedUser) {
                        const membership = matchedUser.membership_grade
                        if (
                            !isReservationPairValid(
                                today,
                                firstTime,
                                secondTime,
                                membership
                            )
                        ) {
                            alert(
                                "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                            )
                            window.location.href = "/reservation-1"
                            return
                        }

                        setStore({
                            membership_number: matchedUser.membership_number,
                            name: matchedUser.name_kor,
                            birthdate: matchedUser.birthdate,
                            phone: matchedUser.phone,
                            email: matchedUser.email,

                            membership: matchedUser.membership_grade,
                            remarks: matchedUser.remarks,
                            ownedMileage: Number(matchedUser.owned_mileage),
                            expiredCoupons: matchedUser.used_coupons,
                        })
                    } else {
                        if (encodedMembershipNumber) {
                            alert(
                                "회원 정보가 데이터베이스에서 확인되지 않았습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                            )
                            window.location.href = "/reservation-1"
                            return
                        } else {
                            const membership = "Non-Member"
                            if (
                                !isReservationPairValid(
                                    today,
                                    firstTime,
                                    secondTime,
                                    membership
                                )
                            ) {
                                alert(
                                    "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                                )
                                window.location.href = "/reservation-1"
                                return
                            }

                            setStore({
                                // firstDate: null,
                                // secondDate: null,
                                membership_number: null,
                                membership: "Non-Member",
                            })
                        }
                    }
                } catch (error) {
                    if (encodedMembershipNumber) {
                        alert(
                            "회원 정보가 데이터베이스에서 확인되지 않았습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return
                    } else {
                        alert(
                            "데이터베이스에서 일시적인 오류가 발생하여 로그인 화면으로 돌아갑니다."
                        )
                        window.location.href = "/reservation-1"
                        return

                        setStore({
                            // firstDate: firstDate,
                            // secondDate: secondDate,
                            membership_number: null,
                            membership: "Non-Member",
                        })
                    }
                }
            }

            verifyMembershipNumber()
        }, [])

        const isLoggedIn = !!decodedMembershipNumber

        return <Component {...props} />
    }
}

export function redirectToReservation(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const handleClick = async () => {
            try {
                const res = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/me",
                    {
                        credentials: "include",
                    }
                )

                if (res.ok) {
                    // 비밀번호 변경 필요 시
                    const user = await res.json()
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    window.location.href = "/reservation-2"
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
                const res = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/me",
                    {
                        credentials: "include",
                    }
                )

                if (res.ok) {
                    // 비밀번호 변경 필요 시
                    const user = await res.json()
                    if (user.remarks?.includes("temp_password")) {
                        window.location.href = "/change-password"
                        return
                    }

                    window.location.href = "/member-page-회원정보"
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
