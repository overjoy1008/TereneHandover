import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"
import { membershipLimits } from "../Calendar/UnmuMembership.tsx"
import {
    isBeyondReservationLimit,
    isReservationPairValid,
} from "../Utils/ReservationUtils.tsx"
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

const usePasswordStore = createStore({
    is_personal: true,
    membership_number: null,
    name_kor: null,
    birthdate: null,
    email: null,

    tempPassword: null,
    newPassword: null,
    newPasswordAgain: null,
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

export function toggleMembershipNumber(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ membership_number: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleName(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ name_kor: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleBirthdate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ birthdate: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleEmail(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ email: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleTempPassword(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ tempPassword: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleNewPassword(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ newPassword: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleNewPasswordAgain(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = usePasswordStore()

        const handleChange = (event) => {
            const inputValue = event.target.value
            setStore({ newPasswordAgain: inputValue })
        }

        return <Component {...props} onChange={handleChange} />
    }
}

function generateTempPassword(): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function requestResetEmail(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = usePasswordStore()

        const handleClick = async () => {
            try {
                if (!store.membership_number || !store.email) {
                    alert("입력되지 않은 정보가 있습니다.")
                    return
                }

                // // me-only logic
                // const token = localStorage.getItem("token")
                // if (!token) throw new Error("토큰 없음")
                // const res = await fetch(
                //     "https://terene-notifier-server.onrender.com/api/auth/me",
                //     {
                //         headers: {
                //             Authorization: `Bearer ${token}`,
                //         },
                //     }
                // )
                // if (!res.ok) throw new Error("인증 실패")
                // const user = await res.json()

                const customerRes = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/customers/${store.membership_number}`
                )
                if (!customerRes.ok) throw new Error("고객 전체 조회 실패")

                const customerList = await customerRes.json()

                console.log(JSON.stringify(customerList))

                // const matchedCustomer =
                //     customerList.membership_number === user.membership_number
                //         ? customerList
                //         : null
                const matchedCustomer =
                    customerList.membership_number === store.membership_number
                        ? customerList
                        : null

                if (!matchedCustomer) {
                    alert("인증 실패: 회원 정보 없음")
                    return
                }

                // 이메일 도메인 버그 있음
                // const fullEmail = store.emailDomain
                //     ? `${store.email?.split("@")[0]}${store.emailDomain}`
                //     : store.email
                const fullEmail = store.email

                const normalize = (str: string) =>
                    str
                        ?.replace(/[\s\-./]/g, "")
                        .toLowerCase()
                        .trim()

                const match =
                    normalize(store.membership_number) ===
                        normalize(matchedCustomer.membership_number) &&
                    // fullEmail === matchedCustomer.email
                    normalize(store.email) === normalize(matchedCustomer.email)

                if (match) {
                    // 임시 비밀번호 생성
                    const tempPassword = generateTempPassword()

                    const htmlTemplate = `
<div style="background-color: #ffffff; color: #000000; font-family: 'Pretendard', sans-serif; padding: 40px; max-width: 600px; margin: auto;">
  <div style="text-align: center;">
    <h2 style="margin: 0; font-weight: normal;">T E R E N E</h2>
  </div>

  <h3 style="margin-top: 40px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; line-height: 1.6em;">임시 비밀번호 발급 안내</h3>

  <p style="font-size: 13px; font-weight: 400; letter-spacing: 0.1em; line-height: 1.6em;">
    안녕하세요. 테레네입니다.<br>
    테레네를 방문해주셔서 감사드립니다.
  </p>

  <p style="font-size: 13px; font-weight: 400; letter-spacing: 0.1em; line-height: 1.6em;">
    <strong>${matchedCustomer.name_kor}</strong> 님의 TERENE 회원 계정 임시 비밀번호는<br>
    <strong style="font-weight: 700;">${tempPassword}</strong> 입니다.
  </p>

  <p style="font-size: 13px; font-weight: 400; letter-spacing: 0.1em; line-height: 1.6em;">
    발급된 임시 비밀번호로 <a href="https://terene.kr" style="color: #000000; text-decoration: underline;">TERENE 홈페이지</a>에 로그인하신 뒤<br>
    새로운 비밀번호로 변경 후 이용해 주세요.
  </p>

  <p style="font-size: 13px; font-weight: 400; letter-spacing: 0.1em; line-height: 1.6em;">
    감사합니다,<br>
    <strong>TERENE team</strong>
  </p>

  <hr style="margin: 40px 0; border: none; border-top: 1px solid #ccc;">

  <footer style="font-size: 11px; letter-spacing: 0.1em; line-height: 1.3em; color: #666666;">
    주식회사 바드건축사사무소<br>
    서울특별시 마포구 독막로15길 3-13, 5층<br>
    사업자등록번호 463-88-02624<br>
    © Copyright 2025 VAADD ARCHITECTS
  </footer>
</div>
`

                    const fallbackText = `
T E R E N E

임시 비밀번호 발급 안내

안녕하세요. 테레네입니다.
테레네를 방문해주셔서 감사드립니다.

${matchedCustomer.name_kor} 님의 TERENE 회원 계정 임시 비밀번호는
${tempPassword} 입니다.

발급된 임시 비밀번호로 TERENE 홈페이지 (https://terene.kr)에 로그인하신 뒤
새로운 비밀번호로 변경 후 이용해 주세요.

감사합니다,
TERENE team

----------------------------

주식회사 바드건축사사무소
서울특별시 마포구 독막로15길 3-13, 5층
사업자등록번호 463-88-02624
© Copyright 2025 VAADD ARCHITECTS
`

                    try {
                        const response = await fetch(
                            "https://terene-notifier-server.onrender.com/api/email",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    platform: "gmail",
                                    receiver_email: matchedCustomer.email,
                                    email_title: "임시 비밀번호 발급 안내",
                                    email_message: fallbackText,
                                    email_html: htmlTemplate,
                                }),
                            }
                        )

                        if (!response.ok) {
                            const errRes = await response.json()
                            console.error("이메일 전송 실패:", errRes)
                        } else {
                            // 비밀번호 포함 새 customer 객체 생성
                            const updatedCustomer = {
                                ...matchedCustomer,
                                password: tempPassword,
                                remarks: [
                                    ...(matchedCustomer.remarks || []),
                                    "temp_password",
                                ],
                            }

                            const updateRes = await fetch(
                                `https://terene-db-server.onrender.com/api/v2/customers/${matchedCustomer.membership_number}`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(updatedCustomer),
                                }
                            )

                            if (!updateRes.ok) {
                                const errorText = await updateRes.text()
                                console.error(
                                    "🚨 회원 정보 업데이트 실패. 서버 응답:",
                                    errorText
                                )
                                throw new Error("회원 정보 업데이트 실패")
                            }

                            alert(
                                `${fullEmail}로 임시 비밀번호를 전송하였습니다.`
                            )

                            window.location.href = "/find-password-send"
                        }
                    } catch (emailError) {
                        console.error(
                            "❌ 이메일/DB 요청 중 오류 발생:",
                            emailError
                        )
                        alert("이메일 전송 중 오류가 발생했습니다.")
                    }
                } else {
                    alert("회원 정보가 잘못되었습니다. 다시 한번 확인해주세요")
                }
            } catch (error) {
                console.error(error)
                alert("회원 정보가 잘못되었습니다. 다시 한번 확인해주세요")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}

export function fetchBeforeLogout(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [message, setMessage] = useState("")

        useEffect(() => {
            const fetchAndLogout = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    const name = user.name_kor || user.name || "회원"
                    const email = user.email || "등록된 이메일"

                    setMessage(
                        `${name} 회원님, 임시 비밀번호를\n${email}으로 보내드렸습니다.`
                    )

                    // logout logic
                    // 1. (선택적으로) 서버에 로그아웃 요청
                    await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/logout",
                        {
                            method: "POST",
                            // ✅ 쿠키 안 쓰므로 제거
                            // credentials: "include",
                        }
                    )
                    // 2. 로컬스토리지에서 토큰 삭제
                    localStorage.removeItem("token")
                } catch (e) {
                    console.error("로그아웃 또는 사용자 정보 가져오기 실패", e)
                    window.location.href = "/login"
                }
            }

            fetchAndLogout()
        }, [])

        return <Component {...props} text={message} />
    }
}

export function showMembershipNumber(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [membershipNumber, setMembershipNumber] = useState("")

        useEffect(() => {
            const fetchMembershipNumber = async () => {
                try {
                    // me-only logic
                    const token = localStorage.getItem("token")
                    if (!token) throw new Error("토큰 없음")
                    const res = await fetch(
                        "https://terene-notifier-server.onrender.com/api/auth/me",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                    if (!res.ok) throw new Error("인증 실패")
                    const user = await res.json()

                    setMembershipNumber(user.membership_number)
                } catch (e) {
                    alert("로그인 요청 중 오류가 발생했습니다.")
                }
            }

            fetchMembershipNumber()
        }, [])

        return <Component {...props} text={membershipNumber} />
    }
}

export function changePasswordWithValidation(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = usePasswordStore()

        function isValidPassword(password: string): boolean {
            const lengthCheck = /^.{8,16}$/.test(password)
            const hasLower = /[a-z]/.test(password)
            const hasUpper = /[A-Z]/.test(password)
            const hasNumber = /[0-9]/.test(password)
            const hasSpecial = /[^A-Za-z0-9]/.test(password)

            // 조건: 위 요소 중 2개 이상 조합
            const typesCount = [
                hasLower && hasUpper,
                hasNumber,
                hasSpecial,
            ].filter(Boolean).length

            return lengthCheck && typesCount >= 2
        }

        const handleClick = async () => {
            try {
                // 1. 인증된 사용자 정보 가져오기
                // me-only logic
                const token = localStorage.getItem("token")
                if (!token) throw new Error("토큰 없음")
                const res = await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                if (!res.ok) throw new Error("인증 실패")
                const user = await res.json()

                const membershipNumber = user.membership_number

                // 2. 전체 고객 리스트 가져오기
                const customerRes = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/customers`
                )
                if (!customerRes.ok)
                    throw new Error("고객 전체 정보 불러오기 실패")

                const customerList = await customerRes.json()

                const matchedCustomer = customerList.find(
                    (c) => c.membership_number === membershipNumber
                )
                if (!matchedCustomer) {
                    alert("회원 정보가 존재하지 않습니다.")
                    return
                }

                // 3. 비밀번호 및 조건 확인
                if (
                    store.tempPassword !== matchedCustomer.password ||
                    store.newPassword !== store.newPasswordAgain
                ) {
                    alert(
                        "입력된 임시 비밀번호가 올바르지 않거나, 새 비밀번호가 일치하지 않습니다."
                    )
                    return
                }

                if (!isValidPassword(store.newPassword)) {
                    alert(
                        "새 비밀번호는 영문 대소문자, 숫자, 특수문자 중 2가지 이상 조합으로 8~16자여야 합니다."
                    )
                    return
                }

                // 4. remarks에서 temp_password 제거
                const updatedRemarks = (matchedCustomer.remarks || []).filter(
                    (remark) => remark !== "temp_password"
                )

                // 5. 사용자 정보 업데이트
                const updatedCustomer = {
                    ...matchedCustomer,
                    password: store.newPassword,
                    remarks: updatedRemarks,
                }

                const updateRes = await fetch(
                    `https://terene-db-server.onrender.com/api/v2/customers/${membershipNumber}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedCustomer),
                    }
                )

                if (!updateRes.ok) throw new Error("비밀번호 업데이트 실패")

                // logout logic
                // 1. (선택적으로) 서버에 로그아웃 요청
                await fetch(
                    "https://terene-notifier-server.onrender.com/api/auth/logout",
                    {
                        method: "POST",
                        // ✅ 쿠키 안 쓰므로 제거
                        // credentials: "include",
                    }
                )
                // 2. 로컬스토리지에서 토큰 삭제
                localStorage.removeItem("token")

                alert("비밀번호가 성공적으로 변경되었습니다.")

                window.location.href = "/login"
                return
            } catch (err) {
                console.error("비밀번호 변경 오류:", err)
                alert("비밀번호 변경 중 오류가 발생했습니다.")
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}
