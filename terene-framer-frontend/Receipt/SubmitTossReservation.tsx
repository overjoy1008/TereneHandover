
// import { forwardRef, useEffect, useState, type ComponentType } from "react"
// import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
// import * as React from "react"
// import { useStore } from "../Calendar/MonthDisplay.tsx"
// import { useFormStore } from "./ReservationForm.tsx"
// import { formatDate, parseDate } from "./CheckAuth.tsx"
// import {
//     useAdditionalServiceStore,
//     createAdditionalServiceList,
// } from "./AdditionalService.tsx"
// import {
//     useHolidayCategoryMap,
//     useCoupons,
//     toCategoryMap,
// } from "./PriceDisplay.tsx"
// import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
// import { sendSMS, sendEmail } from "../Notifier/notify.ts"
// import {
//     createClientReservationMessage,
//     createAdminReservationMessage,
// } from "../Notifier/messages.ts"
// import { LoadingOverlay } from "./LoadingOverlay.tsx"

// function getKSTDate(baseDate = new Date()) {
//     const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
//     return new Date(utc + 9 * 60 * 60 * 1000)
// }

// function getKSTISOString(date = new Date()): string {
//     const kstDate = getKSTDate(date)

//     const pad = (n: number) => String(n).padStart(2, "0")

//     const year = kstDate.getFullYear()
//     const month = pad(kstDate.getMonth() + 1)
//     const day = pad(kstDate.getDate())
//     const hours = pad(kstDate.getHours())
//     const minutes = pad(kstDate.getMinutes())
//     const seconds = pad(kstDate.getSeconds())

//     return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`
// }

// export function submitReservationToss(
//     Component: ComponentType<any>
// ): ComponentType<any> {
//     return (props) => {
//         const [isLoading, setIsLoading] = useState(false)

//         const queryParams = new URLSearchParams(window.location.search)
//         const first = queryParams.get("first")
//         const second = queryParams.get("second")
//         const firstDate = first ? parseDate(first) : null
//         const secondDate = second ? parseDate(second) : null

//         const [store] = useStore()
//         const [formStore] = useFormStore()
//         const [additionalServiceStore] = useAdditionalServiceStore()

//         const { coupons } = useCoupons()

//         const isValidPhone = (phone: string) => {
//             const internationalRegex = /^\+?[0-9]{7,15}$/ // +포함, 7~15자리 숫자
//             const koreanRegex = /^(01[016789]|0[2-9][0-9]?)-?\d{3,4}-?\d{4}$/

//             return (
//                 internationalRegex.test(phone.replace(/-/g, "")) ||
//                 koreanRegex.test(phone)
//             )
//         }

//         const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

//         const isValidBirthdate = (yyyymmdd: string) => {
//             if (!/^\d{8}$/.test(yyyymmdd)) return false

//             const year = parseInt(yyyymmdd.substring(0, 4), 10)
//             const month = parseInt(yyyymmdd.substring(4, 6), 10)
//             const day = parseInt(yyyymmdd.substring(6, 8), 10)

//             // 날짜 유효성 확인
//             const date = new Date(year, month - 1, day)
//             if (
//                 date.getFullYear() !== year ||
//                 date.getMonth() !== month - 1 ||
//                 date.getDate() !== day
//             ) {
//                 return false
//             }

//             // 미래 날짜 방지
//             const today = new Date()
//             if (date > today) return false

//             return true
//         }

//         const transformedCoupons = (store.couponDetails || []).map(
//             (couponDetail) => {
//                 if (couponDetail.id.startsWith("mileage")) {
//                     return {
//                         coupon_id: couponDetail.id,
//                         coupon_name: "마일리지 포인트 사용",
//                         coupon_description: `마일리지 (-${couponDetail.amount}p)`,
//                         amount: couponDetail.amount,
//                     }
//                 }
//                 if (couponDetail.id.startsWith("phase-1")) {
//                     return {
//                         coupon_id: couponDetail.id,
//                         coupon_name: "Phase-1 전액 할인",
//                         coupon_description: `Phase-1 계정 숙박비 전액 할인`,
//                         amount: couponDetail.amount,
//                     }
//                 }
//                 if (couponDetail.id.startsWith("all-free")) {
//                     return {
//                         coupon_id: couponDetail.id,
//                         coupon_name: "Admin 계정 전액 할인",
//                         coupon_description: `Admin 계정 전액 할인`,
//                         amount: couponDetail.amount,
//                     }
//                 }

//                 const matching = coupons.find((c) => c.id === couponDetail.id)
//                 return {
//                     coupon_id: couponDetail.id,
//                     coupon_name: matching?.name || couponDetail.id,
//                     coupon_description:
//                         matching?.description || couponDetail.id,
//                     amount: couponDetail.amount,
//                 }
//             }
//         )

//         const handleClick = async () => {
//             // alert(JSON.stringify(store))
//             const { membership_number } = store
//             const { name, birthdate, phone, email, payment } = formStore

//             if (!store.finalPrice) {
//                 alert(
//                     "가격이 계산되는 중입니다. 조금만 기다렸다가 다시 시도해주십시오"
//                 )
//                 return
//             }

//             if (!name || !birthdate || !phone || !email) {
//                 alert(
//                     "필수사항(예약자 및 숙박인원 정보 등)을 입력하셔야 결제가 가능합니다"
//                 )
//                 return
//             }

//             if (!isValidBirthdate(birthdate)) {
//                 alert(`생년월일이 올바르지 않습니다

// 형식: YYYYMMDD`)
//                 return
//             }

//             // inside submitReservation
//             if (!isValidPhone(phone)) {
//                 alert(
//                     `전화번호 형식이 올바르지 않습니다

// 가능한 형식:
// 01x-xxxx-xxxx 혹은 02-xxxx-xxxx
// 010xxxxxxxx
// +8210xxxxxxxx 등`
//                 )
//                 return
//             }

//             if (
//                 !isValidEmail(
//                     formStore.emailDomain
//                         ? `${email.split("@")[0]}${formStore.emailDomain}`
//                         : email
//                 )
//             ) {
//                 alert("이메일 형식이 올바르지 않습니다")
//                 return
//             }

//             if (!payment) {
//                 alert("결제 방법을 선택해주시기 바랍니다")
//                 return
//             }

//             if (membership_number !== "U-99999999" && payment !== "transfer") {
//                 alert("현재는 무통장입금만 이용이 가능합니다")
//                 return
//             }

//             if (
//                 payment === "transfer" &&
//                 (!formStore.refund_name ||
//                     !formStore.refund_phone ||
//                     !formStore.refund_bank ||
//                     !formStore.refund_account)
//             ) {
//                 alert(
//                     "무통장입금을 선택하신 경우, 환불 계좌 정보를 전부 작성해주세요"
//                 )
//                 return
//             }

//             if (
//                 !formStore.facility_policy ||
//                 !formStore.cancellation_policy ||
//                 !formStore.privacy_policy
//             ) {
//                 alert("필수 이용약관을 동의하시기 바랍니다")
//                 return
//             }

//             const couponDetails = store.couponDetails

//             const confirmationMessage = `[이름] ${name}, [생년월일] ${birthdate},
// [전화번호] ${phone}, [이메일] ${
//                 formStore.emailDomain
//                     ? `${email.split("@")[0]}${formStore.emailDomain}`
//                     : email
//             }

// [지점] UNMU
// [숙박 일정] ${formatDate(firstDate)} ~ ${formatDate(secondDate)}
// [숙박 인원] 성인 ${additionalServiceStore.adult}명, 영유아 ${additionalServiceStore.child}명

// [결제 금액] ${store.finalPrice.toLocaleString()}원 (${payment === "transfer" ? "무통장 입금" : "일반 결제"})
// 이대로 예약을 진행할까요?`

//             const isConfirmed = window.confirm(confirmationMessage)

//             if (isConfirmed) {
//                 setIsLoading(true)

//                 try {
//                     const now = getKSTDate()
//                     const orderId = `O-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(
//                         Math.random() * 100000000
//                     )
//                         .toString()
//                         .padStart(8, "0")}`

//                     // -------------------------------------------------------
//                     // Create Payload
//                     // -------------------------------------------------------

//                     const payload = {
//                         order_id: orderId,
//                         membership_number: store.membership_number || null,
//                         order_product: "UNMU",
//                         start_date: formatDate(firstDate),
//                         end_date: formatDate(secondDate),
//                         reserver_name: name,
//                         reserver_birthdate: birthdate,
//                         reserver_contact: phone,
//                         reserver_email: formStore.emailDomain
//                             ? `${email.split("@")[0]}${formStore.emailDomain}`
//                             : email,
//                         payment_status: "pending",
//                         payment_timeline: {
//                             order_datetime: getKSTISOString(),
//                             approval_datetime: null,
//                             cancellation_datetime: null,
//                             refund_datetime: null,
//                         },
//                         stay_status: "before_checkin",
//                         stay_timeline: {
//                             checkin_datetime: null,
//                             checkout_datetime: null,
//                         },
//                         adult: Number(additionalServiceStore.adult),
//                         child: Number(additionalServiceStore.child),
//                         order_details: {
//                             special_requests:
//                                 formStore.special_requests || null,
//                             anniversary:
//                                 formStore.anniversary_type === "기념일 종류" ||
//                                 !formStore.anniversary_type
//                                     ? {
//                                           type: "미선택",
//                                           name: formStore.anniversary_name,
//                                           value: formStore.anniversary_value,
//                                       }
//                                     : {
//                                           type: formStore.anniversary_type,
//                                           name: formStore.anniversary_name,
//                                           value: formStore.anniversary_value,
//                                       },
//                             terms_agreement: {
//                                 facility_policy: formStore.facility_policy,
//                                 cancellation_policy:
//                                     formStore.cancellation_policy,
//                                 privacy_policy: formStore.privacy_policy,
//                                 marketing_consent:
//                                     formStore.marketing_consent || false,
//                             },
//                             additional_services: createAdditionalServiceList(
//                                 additionalServiceStore,
//                                 store
//                             ),
//                         },
//                         final_price: Number(store.finalPrice),
//                         receipt: {
//                             initialPrice: Number(store.initialPrice),
//                             discountedPrice: Number(store.discountedPrice),
//                             additionalPrice: Number(store.additionalPrice),
//                             integratedPrice: Number(store.integratedPrice),
//                             vatPrice: Number(store.vatPrice),
//                             finalPrice: Number(store.finalPrice),
//                         },
//                         coupons: transformedCoupons,
//                         refund_info: {
//                             refund_name: formStore.refund_name,
//                             refund_phone: formStore.refund_phone,
//                             refund_bank: formStore.refund_bank,
//                             refund_account: formStore.refund_account,
//                             refund_before_checkin: null,
//                             discounted_w_vat_refund: null,
//                             additional_w_vat_refund: null,
//                             deposit_refund: null,
//                         },
//                     }

//                     // // -------------------------------------------------------
//                     // // 연락 돌리기
//                     // // -------------------------------------------------------
//                     // const reservation_client_title = `[TERENE UNMU] ${name}님 예약 신청 완료`

//                     // const reservation_client_message =
//                     //     createClientReservationMessage({
//                     //         name,
//                     //         firstDate: formatDate(firstDate),
//                     //         secondDate: formatDate(secondDate),
//                     //         adult: additionalServiceStore.adult,
//                     //         child: additionalServiceStore.child,
//                     //         finalPrice: store.finalPrice,
//                     //     })

//                     // const reservation_admin_title = `[TERENE UNMU] ${store.membership_number || "비회원"} ${name}님 예약 신청 접수`

//                     // const reservation_admin_message =
//                     //     createAdminReservationMessage({
//                     //         orderId,
//                     //         membershipNumber: store.membership_number,
//                     //         name,
//                     //         firstDate: formatDate(firstDate),
//                     //         secondDate: formatDate(secondDate),
//                     //         adult: additionalServiceStore.adult,
//                     //         child: additionalServiceStore.child,
//                     //         finalPrice: store.finalPrice,
//                     //     })

//                     // try {
//                     //     // 관리자 연락
//                     //     for (const adminPhone of ADMIN_PHONES) {
//                     //         await sendSMS(adminPhone, reservation_admin_message)
//                     //     }
//                     //     for (const adminEmail of ADMIN_EMAILS) {
//                     //         await sendEmail(
//                     //             adminEmail,
//                     //             reservation_admin_title,
//                     //             reservation_admin_message
//                     //         )
//                     //     }

//                     //     // 클라이언트 연락 - Only 결제자만
//                     //     // const refund_phone = formStore.refund_phone
//                     //     //     ? formStore.refund_phone
//                     //     //     : phone
//                     //     // await sendSMS(phone, reservation_client_message)
//                     //     await sendSMS(
//                     //         formStore.refund_phone,
//                     //         reservation_client_message
//                     //     )
//                     //     await sendEmail(
//                     //         formStore.emailDomain
//                     //             ? `${email.split("@")[0]}${formStore.emailDomain}`
//                     //             : email,
//                     //         reservation_client_title,
//                     //         reservation_client_message
//                     //     )
//                     // } catch (notifyError) {
//                     //     console.error("연락 전송 중 오류:", notifyError)
//                     //     alert(
//                     //         "예약 접수 알림 전송에 실패했습니다.\n연락처를 다시 확인해보시거나 관리자에게 별도 확인을 부탁드립니다."
//                     //     )
//                     // }

//                     // -------------------------------------------------------
//                     // Fetch to DB
//                     // -------------------------------------------------------
//                     const order_response = await fetch(
//                         "https://terene-db-server.onrender.com/api/orders",
//                         {
//                             method: "POST",
//                             headers: {
//                                 "Content-Type": "application/json",
//                             },
//                             body: JSON.stringify(payload),
//                         }
//                     )

//                     if (!order_response.ok) {
//                         const errorText = await order_response.text()
//                         throw new Error(
//                             `HTTP $ order_response.status} - ${errorText}`
//                         )
//                     }

//                     if (store.membership_number) {
//                         try {
//                             // 1. 전체 고객 목록 가져오기
//                             const getAllCustomersRes = await fetch(
//                                 `https://terene-db-server.onrender.com/api/customers`
//                             )

//                             if (!getAllCustomersRes.ok) {
//                                 const errorText =
//                                     await getAllCustomersRes.text()
//                                 throw new Error(
//                                     `HTTP ${getAllCustomersRes.status} - ${errorText}`
//                                 )
//                             }

//                             const customers = await getAllCustomersRes.json()

//                             // 2. membership_number로 고객 찾기
//                             const existingCustomer = customers.find(
//                                 (customer) =>
//                                     customer.membership_number ===
//                                     store.membership_number
//                             )

//                             if (!existingCustomer) {
//                                 throw new Error(
//                                     `해당 멤버십 번호(${store.membership_number})를 가진 고객을 찾을 수 없습니다.`
//                                 )
//                             }

//                             // 3. 기존 정보 기반으로 업데이트
//                             const updatedCustomer = {
//                                 ...existingCustomer,
//                                 owned_mileage:
//                                     store.ownedMileage - store.usedMileage,
//                                 used_coupons: [
//                                     ...(existingCustomer.used_coupons || []),
//                                     ...(store.enteredCouponCode || []),
//                                 ],
//                             }

//                             // 4. 수정된 정보로 고객 정보 업서트 (PUT)
//                             const upsertRes = await fetch(
//                                 `https://terene-db-server.onrender.com/api/customers/${existingCustomer.membership_number}`,
//                                 {
//                                     method: "PUT",
//                                     headers: {
//                                         "Content-Type": "application/json",
//                                     },
//                                     body: JSON.stringify(updatedCustomer),
//                                 }
//                             )

//                             if (!upsertRes.ok) {
//                                 const errorText = await upsertRes.text()
//                                 throw new Error(
//                                     `HTTP ${upsertRes.status} - ${errorText}`
//                                 )
//                             }
//                         } catch (error) {
//                             console.error("고객 정보 처리 중 오류 발생:", error)
//                             alert(
//                                 `고객 정보 업데이트 중 오류가 발생하였습니다. 다시 시도해주세요.\n에러메시지: ${error}`
//                             )
//                             return
//                         }
//                     }

//                     // -------------------------------------------------------
//                     // Update daily occupancy
//                     // -------------------------------------------------------
//                     try {
//                         const getAllDaysRes = await fetch(
//                             `https://terene-db-server.onrender.com/api/days`
//                         )
//                         if (!getAllDaysRes.ok) {
//                             const errorText = await getAllDaysRes.text()
//                             throw new Error(
//                                 `HTTP ${getAllDaysRes.status} - ${errorText}`
//                             )
//                         }

//                         const allDays = await getAllDaysRes.json()

//                         // 3. dateList에 포함된 날짜들만 필터링
//                         const dateRange = []
//                         let current = new Date(formatDate(firstDate))
//                         const end = new Date(formatDate(secondDate))

//                         while (current <= end) {
//                             const yyyyMMdd = current.toISOString().split("T")[0] // "YYYY-MM-DD"
//                             dateRange.push(yyyyMMdd)
//                             current.setDate(current.getDate() + 1)
//                         }

//                         const targetDays = allDays.filter((day) =>
//                             dateRange.includes(day.date)
//                         )

//                         // 4. 각 날짜 정보 업데이트
//                         for (const day of targetDays) {
//                             let updatedDay = { ...day }

//                             if (day.date === formatDate(firstDate)) {
//                                 updatedDay.checkin = {
//                                     is_occupied: true,
//                                     occupied_order_id: orderId,
//                                 }
//                             } else if (day.date === formatDate(secondDate)) {
//                                 updatedDay.checkout = {
//                                     is_occupied: true,
//                                     occupied_order_id: orderId,
//                                 }
//                             } else {
//                                 updatedDay.checkin = {
//                                     is_occupied: true,
//                                     occupied_order_id: orderId,
//                                 }
//                                 updatedDay.checkout = {
//                                     is_occupied: true,
//                                     occupied_order_id: orderId,
//                                 }
//                             }

//                             try {
//                                 const res = await fetch(
//                                     `https://terene-db-server.onrender.com/api/days/${day.date}`,
//                                     {
//                                         method: "PUT",
//                                         headers: {
//                                             "Content-Type": "application/json",
//                                         },
//                                         body: JSON.stringify(updatedDay),
//                                     }
//                                 )

//                                 if (!res.ok) {
//                                     const errText = await res.text()
//                                     throw new Error(
//                                         `Failed to update occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
//                                     )
//                                 }
//                             } catch (err) {
//                                 console.error(
//                                     "날짜 점유 정보 업데이트 중 오류 발생:",
//                                     err
//                                 )
//                                 alert(
//                                     `예약 날짜(${day.date}) 점유 정보 업데이트 중 오류가 발생했습니다.\n에러메시지: ${err}`
//                                 )
//                                 return
//                             }
//                         }
//                     } catch (error) {
//                         console.error(
//                             "전체 날짜 데이터 가져오는 중 오류 발생:",
//                             error
//                         )
//                         alert(
//                             `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
//                         )
//                     }

//                     window.location.href =
//                         payment === "toss" &&
//                         membership_number &&
//                         membership_number === "U-99999999"
//                             ? `/toss-payments?orderId=${orderId}`
//                             : `/reservation-waiting?orderId=${orderId}`
//                 } catch (error) {
//                     console.error("예약 전송 실패:", error)
//                     alert(
//                         `예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.\n에러메시지: ${error}`
//                     )
//                     setIsLoading(false)
//                 }
//             }
//         }

//         return (
//             <>
//                 <LoadingOverlay
//                     visible={isLoading || store.finalPrice == null}
//                     message={
//                         store.finalPrice != null
//                             ? "예약 처리중입니다...\n약 10초 정도 소요될 수 있습니다"
//                             : "가격 계산중입니다\n잠시만 기다려주세요..."
//                     }
//                 />
//                 <Component {...props} onClick={handleClick} />
//             </>
//         )
//     }
// }
