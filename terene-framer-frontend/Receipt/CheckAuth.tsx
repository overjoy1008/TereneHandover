// import { forwardRef, useEffect, useState, type ComponentType } from "react"
// import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
// import * as React from "react"
// import { useStore } from "../Store/MainStore.tsx"
// import { membershipLimits } from "../Calendar/UnmuMembership.tsx"
// import { getKSTDate, getKSTISOString } from "../Utils/KST.tsx"
// import {
//     isBeyondReservationLimit,
//     isReservationPairValid,
// } from "../Utils/ReservationUtils.tsx"

// import { createReservationMessage } from "../Notifier/messages.ts"
// import { sendSMS, sendEmail } from "../Notifier/notify.ts"
// import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"

// const useAuthStore = createStore({
//     temp_id: null,
//     temp_password: null,
// })

// // export function formatDate({
// //     year,
// //     month,
// //     day,
// // }: {
// //     year: number
// //     month: number
// //     day: number
// // }): string {
// //     const paddedMonth = String(month + 1).padStart(2, "0") // month는 0-based
// //     const paddedDay = String(day).padStart(2, "0")
// //     return `${year}-${paddedMonth}-${paddedDay}`
// // }

// // export function parseDate(
// //     dateStr: string
// // ): { year: number; month: number; day: number } | null {
// //     const [yearStr, monthStr, dayStr] = dateStr.split("-")
// //     const year = parseInt(yearStr)
// //     const month = parseInt(monthStr) - 1 // zero-based
// //     const day = parseInt(dayStr)

// //     if (isNaN(year) || isNaN(month) || isNaN(day)) return null

// //     return { year, month, day }
// // }

// function safeParseDate(input: string): Date | null {
//     const date = new Date(input)
//     return isNaN(date.getTime()) ? null : date
// }

// export function toggleID(Component: ComponentType<any>): ComponentType<any> {
//     return (props) => {
//         const [store, setStore] = useAuthStore()

//         const handleChange = (event) => {
//             const inputValue = event.target.value
//             setStore({ temp_id: inputValue })
//         }

//         return <Component {...props} onChange={handleChange} />
//     }
// }

// export function togglePassword(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [store, setStore] = useAuthStore()

//         const handleChange = (event) => {
//             const inputValue = event.target.value
//             setStore({ temp_password: inputValue })
//         }

//         return <Component {...props} type="password" onChange={handleChange} />
//     }
// }

// export function unsafeRequestLogin(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [authStore] = useAuthStore()
//         const [_, setStore] = useStore()

//         const handleClick = async () => {
//             try {
//                 const response = await fetch(
//                     "https://terene-db-server.onrender.com/api/customers"
//                 )
//                 const data = await response.json()

//                 const matchedUser = data.find(
//                     (user) =>
//                         user.id === authStore.temp_id &&
//                         user.password === authStore.temp_password
//                 )

//                 if (matchedUser) {
//                     const encodedMembershipNumber = btoa(
//                         matchedUser.membership_number
//                     )

//                     if (matchedUser.membership_number === "A-00000001") {
//                         window.location.href = `/admin-table?mn=${encodedMembershipNumber}`
//                     } else {
//                         window.location.href = `/reservation-2?mn=${encodedMembershipNumber}`
//                     }
//                 } else {
//                     alert("로그인 실패: 계정 ID 또는 비밀번호가 틀렸습니다.")
//                 }
//             } catch (error) {
//                 alert("로그인 요청 중 오류가 발생하였습니다.")
//                 window.location.href = "/reservation-1"
//             }
//         }

//         return <Component {...props} onClick={handleClick} />
//     }
// }

// export function unsafeKeep2Login(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [decodedMembershipNumber, setDecodedMembershipNumber] = useState<
//             string | null
//         >(null)
//         const [store, setStore] = useStore()

//         useEffect(() => {
//             const verifyMembershipNumber = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const encodedMembershipNumber = queryParams.get("mn")

//                 // mn이 유효한지 체크하는 로직
//                 if (!encodedMembershipNumber) {
//                     return
//                 }

//                 try {
//                     const decoded = atob(encodedMembershipNumber)

//                     const response = await fetch(
//                         "https://terene-db-server.onrender.com/api/customers"
//                     )
//                     const data = await response.json()

//                     const matchedUser = data.find(
//                         (user) => user.membership_number === decoded
//                     )

//                     if (matchedUser) {
//                         setStore({
//                             membership_number: matchedUser.membership_number,
//                             membership: matchedUser.membership_grade,
//                             remarks: matchedUser.remarks,
//                         })
//                     } else {
//                         if (encodedMembershipNumber) {
//                             alert(
//                                 "회원 정보가 데이터베이스에서 확인되지 않았습니다."
//                             )
//                             window.location.href = "/reservation-1"
//                         } else {
//                             setStore({
//                                 membership_number: null,
//                                 membership: "Non-Member",
//                             })
//                         }
//                     }
//                 } catch (error) {
//                     if (encodedMembershipNumber) {
//                         alert(
//                             "회원 정보가 데이터베이스에서 확인되지 않았습니다."
//                         )
//                         window.location.href = "/reservation-1"
//                     } else {
//                         setStore({
//                             membership_number: null,
//                             membership: "Non-Member",
//                         })
//                     }
//                 }
//             }

//             verifyMembershipNumber()
//         }, [])

//         const isLoggedIn = !!decodedMembershipNumber

//         return <Component {...props} />
//     }
// }

// export function unsafe2to3(Component: ComponentType<any>): ComponentType<any> {
//     return (props) => {
//         const [authStore] = useAuthStore()
//         const [store] = useStore()

//         const handleClick = async () => {
//             const queryParams = new URLSearchParams(window.location.search)
//             const encodedMembershipNumber = queryParams.get("mn")
//             const decoded = atob(encodedMembershipNumber)

//             const firstDate = store.firstDate
//             const secondDate = store.secondDate

//             // first와 second 값이 둘 다 있어야만 URL에 추가하도록 조건을 설정
//             if (!firstDate || !secondDate) {
//                 alert("일정을 선택해주세요")
//                 return
//             }

//             const first = formatDate(firstDate)
//             const second = formatDate(secondDate)

//             const baseUrl = "/reservation-4"
//             const params = new URLSearchParams()
//             //////////////////////////////

//             if (encodedMembershipNumber) {
//                 params.set("mn", encodedMembershipNumber)
//             }

//             params.set("first", first)
//             params.set("second", second)

//             window.location.href = `${baseUrl}?${params.toString()}`
//             return
//         }

//         return <Component {...props} onClick={handleClick} />
//     }
// }

// export function unsafe2to3toss(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [authStore] = useAuthStore()
//         const [store] = useStore()

//         const handleClick = async () => {
//             const queryParams = new URLSearchParams(window.location.search)
//             const encodedMembershipNumber = queryParams.get("mn")
//             const decoded = atob(encodedMembershipNumber)

//             const firstDate = store.firstDate
//             const secondDate = store.secondDate

//             // first와 second 값이 둘 다 있어야만 URL에 추가하도록 조건을 설정
//             if (!firstDate || !secondDate) {
//                 alert("일정을 선택해주세요")
//                 return
//             }

//             const first = formatDate(firstDate)
//             const second = formatDate(secondDate)

//             // Toss Payments 심사를 위한 코드
//             const baseUrl =
//                 decoded && decoded === "U-99999999"
//                     ? "/reservation-3-toss"
//                     : "/reservation-3"
//             const params = new URLSearchParams()
//             //////////////////////////////

//             if (encodedMembershipNumber) {
//                 params.set("mn", encodedMembershipNumber)
//             }

//             params.set("first", first)
//             params.set("second", second)

//             window.location.href = `${baseUrl}?${params.toString()}`
//             return
//         }

//         return <Component {...props} onClick={handleClick} />
//     }
// }

// export function unsafeKeep3Login(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [decodedMembershipNumber, setDecodedMembershipNumber] = useState<
//             string | null
//         >(null)
//         const [store, setStore] = useStore()

//         useEffect(() => {
//             const verifyMembershipNumber = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const encodedMembershipNumber = queryParams.get("mn")
//                 const first = queryParams.get("first")
//                 const second = queryParams.get("second")

//                 const firstDate = first ? parseDate(first) : null
//                 const secondDate = second ? parseDate(second) : null

//                 if (!firstDate || !secondDate) {
//                     alert(
//                         "날짜가 선택되지 않은 채로 넘어와 오류가 발생했습니다. 로그인 화면으로 돌아갑니다."
//                     )
//                     window.location.href = `/reservation-1`
//                     return
//                 }

//                 try {
//                     const decoded = atob(encodedMembershipNumber)

//                     // 고객 정보 가져오기
//                     const response = await fetch(
//                         "https://terene-db-server.onrender.com/api/customers"
//                     )
//                     const data = await response.json()
//                     const matchedUser = data.find(
//                         (user) => user.membership_number === decoded
//                     )

//                     // 날짜 점유 정보 가져오기
//                     const dayRes = await fetch(
//                         "https://terene-db-server.onrender.com/api/days"
//                     )
//                     const dayData = await dayRes.json()
//                     const dayInfoMap = new Map()
//                     dayData.forEach((item) => {
//                         dayInfoMap.set(item.date, {
//                             isHoliday: item.is_holiday,
//                             checkin: item.checkin,
//                             checkout: item.checkout,
//                         })
//                     })

//                     const dateToString = ({ year, month, day }) =>
//                         `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
//                     const dateToTime = ({ year, month, day }) =>
//                         new Date(year, month, day).getTime()

//                     const today = getKSTDate()
//                     today.setHours(0, 0, 0, 0)

//                     const firstTime = new Date(
//                         firstDate.year,
//                         firstDate.month,
//                         firstDate.day
//                     )
//                     const secondTime = new Date(
//                         secondDate.year,
//                         secondDate.month,
//                         secondDate.day
//                     )

//                     const diffDays = Math.abs(
//                         (secondTime.getTime() - firstTime.getTime()) /
//                             (1000 * 60 * 60 * 24)
//                     )
//                     if (diffDays >= 4) {
//                         alert(
//                             "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     if (firstTime.getTime() < today.getTime()) {
//                         alert(
//                             "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     const firstStr = dateToString(firstDate)
//                     const secondStr = dateToString(secondDate)
//                     const firstInfo = dayInfoMap.get(firstStr)
//                     const secondInfo = dayInfoMap.get(secondStr)

//                     if (firstInfo?.checkin?.is_occupied) {
//                         alert(
//                             "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     if (secondInfo?.checkout?.is_occupied) {
//                         alert(
//                             "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     // 사이 날짜 점유 여부 확인
//                     for (
//                         let d = new Date(firstTime.getTime() + 86400000);
//                         d < secondTime;
//                         d.setDate(d.getDate() + 1)
//                     ) {
//                         const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
//                         const info = dayInfoMap.get(key)
//                         if (
//                             info?.checkin?.is_occupied ||
//                             info?.checkout?.is_occupied
//                         ) {
//                             alert(
//                                 "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                             )
//                             window.location.href = "/reservation-1"
//                             return
//                         }
//                     }

//                     if (matchedUser) {
//                         const membership = matchedUser.membership_grade
//                         if (
//                             !isReservationPairValid(
//                                 today,
//                                 firstTime,
//                                 secondTime,
//                                 membership
//                             )
//                         ) {
//                             alert(
//                                 "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                             )
//                             window.location.href = "/reservation-1"
//                             return
//                         }

//                         setStore({
//                             membership_number: matchedUser.membership_number,
//                             name: matchedUser.name_kor,
//                             birthdate: matchedUser.birthdate,
//                             phone: matchedUser.phone,
//                             email: matchedUser.email,

//                             membership: matchedUser.membership_grade,
//                             remarks: matchedUser.remarks,
//                             ownedMileage: Number(matchedUser.owned_mileage),
//                             expiredCoupons: matchedUser.used_coupons,
//                         })
//                     } else {
//                         if (encodedMembershipNumber) {
//                             alert(
//                                 "회원 정보가 데이터베이스에서 확인되지 않았습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                             )
//                             window.location.href = "/reservation-1"
//                             return
//                         } else {
//                             const membership = "Non-Member"
//                             if (
//                                 !isReservationPairValid(
//                                     today,
//                                     firstTime,
//                                     secondTime,
//                                     membership
//                                 )
//                             ) {
//                                 alert(
//                                     "예약이 불가능한 날짜가 선택된 채로 넘어왔습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                                 )
//                                 window.location.href = "/reservation-1"
//                                 return
//                             }

//                             setStore({
//                                 // firstDate: null,
//                                 // secondDate: null,
//                                 membership_number: null,
//                                 membership: "Non-Member",
//                             })
//                         }
//                     }
//                 } catch (error) {
//                     if (encodedMembershipNumber) {
//                         alert(
//                             "회원 정보가 데이터베이스에서 확인되지 않았습니다. 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return
//                     } else {
//                         alert(
//                             "데이터베이스에서 일시적인 오류가 발생하여 로그인 화면으로 돌아갑니다."
//                         )
//                         window.location.href = "/reservation-1"
//                         return

//                         setStore({
//                             // firstDate: firstDate,
//                             // secondDate: secondDate,
//                             membership_number: null,
//                             membership: "Non-Member",
//                         })
//                     }
//                 }
//             }

//             verifyMembershipNumber()
//         }, [])

//         const isLoggedIn = !!decodedMembershipNumber

//         return <Component {...props} />
//     }
// }

// export function unsafeKeepAdminLogin(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [decodedMembershipNumber, setDecodedMembershipNumber] = useState<
//             string | null
//         >(null)
//         // const [store, setStore] = useStore()

//         useEffect(() => {
//             const verifyMembershipNumber = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const encodedMembershipNumber = queryParams.get("mn")

//                 if (!encodedMembershipNumber) {
//                     window.location.href = "/reservation-1"
//                     return
//                 }

//                 const decoded = atob(encodedMembershipNumber)
//                 if (decoded !== "A-00000001") {
//                     window.location.href = "/reservation-1"
//                     return
//                 }
//             }

//             verifyMembershipNumber()
//         }, [])

//         return <Component {...props} />
//     }
// }

// export function showFinalPrice(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [finalPrice, setFinalPrice] = useState<number | null>(null)

//         useEffect(() => {
//             const findFinalPrice = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const orderId = queryParams.get("tereneOrderId")

//                 if (!orderId) {
//                     window.location.href = "/reservation-1"
//                     return
//                 }

//                 try {
//                     const response = await fetch(
//                         "https://terene-db-server.onrender.com/api/orders"
//                     )

//                     if (!response.ok) {
//                         throw new Error("Failed to fetch orders")
//                     }

//                     const orders = await response.json()

//                     const order = orders.find(
//                         (o: any) => o.order_id === orderId
//                     )

//                     if (!order) {
//                         setFinalPrice(0)
//                         alert("orderId가 유효하지 않습니다")
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     setFinalPrice(order.final_price)
//                 } catch (error) {
//                     setFinalPrice(0)
//                     alert(`orderId가 유효하지 않습니다\n에러메시지: ${error}`)
//                     window.location.href = "/reservation-1"
//                     return
//                 }
//             }

//             findFinalPrice()
//         }, [])

//         return (
//             <Component
//                 {...props}
//                 text={`입금금액 : ${Number(finalPrice).toLocaleString()}`}
//             />
//         )
//     }
// }

// export function acceptPayment(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [finalPrice, setFinalPrice] = useState<number | null>(null)

//         useEffect(() => {
//             const updatePaymentStatus = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const orderId = queryParams.get("tereneOrderId")

//                 if (!orderId) {
//                     window.location.href = "/reservation-1"
//                     return
//                 }

//                 try {
//                     const response = await fetch(
//                         "https://terene-db-server.onrender.com/api/orders"
//                     )

//                     if (!response.ok) {
//                         throw new Error("Failed to fetch orders")
//                     }

//                     const orders = await response.json()

//                     const order = orders.find(
//                         (o: any) => o.order_id === orderId
//                     )

//                     if (!order) {
//                         alert("orderId가 유효하지 않습니다")
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     order["payment_status"] = "accepted"
//                     order["payment_timeline"]["approval_datetime"] =
//                         getKSTISOString()

//                     const status_response = await fetch(
//                         `https://terene-db-server.onrender.com/api/orders/${orderId}`,
//                         {
//                             method: "PUT",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify(order),
//                         }
//                     )

//                     if (!status_response.ok) {
//                         const errorText = await status_response.text()
//                         throw new Error(
//                             `HTTP ${status_response.status} - ${errorText}`
//                         )
//                     }

//                     let client_title = null
//                     let client_message = null
//                     let admin_title = null
//                     let admin_message = null

//                     if (order["payment_status"] === "accepted") {
//                         const row = order

//                         ;({
//                             client_title,
//                             client_message,
//                             admin_title,
//                             admin_message,
//                         } = createReservationMessage("confirmed", row))

//                         if (
//                             client_title &&
//                             client_message &&
//                             admin_title &&
//                             admin_message
//                         ) {
//                             try {
//                                 for (const phone of ADMIN_PHONES) {
//                                     await sendSMS(phone, admin_message)
//                                 }

//                                 for (const email of ADMIN_EMAILS) {
//                                     await sendEmail(
//                                         email,
//                                         admin_title,
//                                         admin_message
//                                     )
//                                 }

//                                 await sendSMS(
//                                     row["reserver_contact"],
//                                     client_message
//                                 )

//                                 if (
//                                     row["refund_info"]?.["refund_phone"] &&
//                                     row["reserver_contact"].replace(
//                                         /[^0-9]/g,
//                                         ""
//                                     ) !==
//                                         row["refund_info"][
//                                             "refund_phone"
//                                         ].replace(/[^0-9]/g, "")
//                                 ) {
//                                     await sendSMS(
//                                         row["refund_info"]["refund_phone"],
//                                         client_message
//                                     )
//                                 }

//                                 await sendEmail(
//                                     row["reserver_email"],
//                                     client_title,
//                                     client_message
//                                 )
//                             } catch (notifyError) {
//                                 console.error("알림 전송 중 오류:", notifyError)
//                                 alert(
//                                     "예약은 처리되었으나 알림 전송에 실패했습니다.\n관리자에게 별도 확인을 부탁드립니다."
//                                 )
//                             }
//                         }
//                     }

//                     setFinalPrice(order.final_price)
//                 } catch (error) {
//                     alert(`orderId가 유효하지 않습니다\n에러메시지: ${error}`)
//                     window.location.href = "/reservation-1"
//                 }
//             }

//             updatePaymentStatus()
//         }, [])

//         return <Component {...props} />
//     }
// }

// export function declinePayment(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         useEffect(() => {
//             const updateCancellationStatus = async () => {
//                 const queryParams = new URLSearchParams(window.location.search)
//                 const orderId = queryParams.get("tereneOrderId")

//                 if (!orderId) {
//                     window.location.href = "/reservation-1"
//                     return
//                 }

//                 try {
//                     const response = await fetch(
//                         "https://terene-db-server.onrender.com/api/orders"
//                     )

//                     if (!response.ok) {
//                         throw new Error("Failed to fetch orders")
//                     }

//                     const orders = await response.json()
//                     const order = orders.find(
//                         (o: any) => o.order_id === orderId
//                     )

//                     if (!order) {
//                         alert("orderId가 유효하지 않습니다")
//                         window.location.href = "/reservation-1"
//                         return
//                     }

//                     // 결제 취소 처리
//                     order["payment_status"] = "cancelled"
//                     order["payment_timeline"]["cancellation_datetime"] =
//                         getKSTISOString()

//                     const cancelRes = await fetch(
//                         `https://terene-db-server.onrender.com/api/orders/${orderId}`,
//                         {
//                             method: "PUT",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify(order),
//                         }
//                     )

//                     if (!cancelRes.ok) {
//                         const errorText = await cancelRes.text()
//                         throw new Error(
//                             `HTTP ${cancelRes.status} - ${errorText}`
//                         )
//                     }

//                     // 날짜 점유 해제
//                     const getAllDaysRes = await fetch(
//                         `https://terene-db-server.onrender.com/api/days`
//                     )

//                     if (!getAllDaysRes.ok) {
//                         const errorText = await getAllDaysRes.text()
//                         throw new Error(
//                             `HTTP ${getAllDaysRes.status} - ${errorText}`
//                         )
//                     }

//                     const allDays = await getAllDaysRes.json()
//                     const dateRange = []
//                     let current = new Date(order["start_date"])
//                     const end = new Date(order["end_date"])

//                     while (current <= end) {
//                         const yyyyMMdd = current.toISOString().split("T")[0]
//                         dateRange.push(yyyyMMdd)
//                         current.setDate(current.getDate() + 1)
//                     }

//                     const targetDays = allDays.filter(
//                         (day: any) =>
//                             dateRange.includes(day.date) &&
//                             (day.checkin?.occupied_order_id === orderId ||
//                                 day.checkout?.occupied_order_id === orderId)
//                     )

//                     for (const day of targetDays) {
//                         const updatedDay = { ...day }
//                         const isFirstDate = day.date === order["start_date"]
//                         const isLastDate = day.date === order["end_date"]

//                         if (isFirstDate) {
//                             updatedDay.checkin = {
//                                 is_occupied: false,
//                                 occupied_order_id: null,
//                             }
//                         } else if (isLastDate) {
//                             updatedDay.checkout = {
//                                 is_occupied: false,
//                                 occupied_order_id: null,
//                             }
//                         } else {
//                             updatedDay.checkin = {
//                                 is_occupied: false,
//                                 occupied_order_id: null,
//                             }
//                             updatedDay.checkout = {
//                                 is_occupied: false,
//                                 occupied_order_id: null,
//                             }
//                         }

//                         const res = await fetch(
//                             `https://terene-db-server.onrender.com/api/days/${day.date}`,
//                             {
//                                 method: "PUT",
//                                 headers: {
//                                     "Content-Type": "application/json",
//                                 },
//                                 body: JSON.stringify(updatedDay),
//                             }
//                         )

//                         if (!res.ok) {
//                             const errText = await res.text()
//                             throw new Error(
//                                 `Failed to release occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
//                             )
//                         }
//                     }

//                     // 모든 작업 완료 후 리디렉션
//                     window.location.href = "/reservation-1"
//                 } catch (error) {
//                     alert(`예약 취소 중 오류 발생\n에러메시지: ${error}`)
//                     window.location.href = "/reservation-1"
//                 }
//             }

//             updateCancellationStatus()
//         }, [])

//         return <Component {...props} />
//     }
// }
