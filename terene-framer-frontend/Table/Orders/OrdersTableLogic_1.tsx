// // OrdersTableLogic.tsx
// import { useEffect, useMemo, useState } from "react"
// import {
//     sendSMS,
//     sendEmail,
//     sendSMSv2,
//     sendEmailv2,
//     sendKakaov2,
// } from "../../Notifier/notify.ts"
// import { ADMIN_PHONES, ADMIN_EMAILS } from "../../Notifier/adminContacts.ts"

// function getKSTDate(baseDate = new Date()) {
//     const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
//     return new Date(utc + 9 * 60 * 60 * 1000)
// }

// function getKSTISOString(date = new Date()) {
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

// export function getDiffDaysKST(checkinDateStr: string): number {
//     const nowUTC = new Date()
//     const kstNow = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000)

//     const checkinUTC = new Date(checkinDateStr)
//     const kstCheckin = new Date(checkinUTC.getTime() + 9 * 60 * 60 * 1000)

//     const msPerDay = 1000 * 60 * 60 * 24
//     return Math.floor((kstCheckin.getTime() - kstNow.getTime()) / msPerDay)
// }

// function generateRandomString(length: number) {
//     const chars =
//         "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
//     let result = ""
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length))
//     }
//     return result
// }

// export function OrdersTableLogic() {
//     const [rows, setRows] = useState<any[]>([])
//     const [currentPage, setCurrentPage] = useState(1)
//     const itemsPerPage = 5

//     const [filters, setFilters] = useState<{
//         tab?: "예약" | "완료" | "취소"
//         branch?: string
//         membership_number?: string
//         query?: string // ← 추가
//     }>({})

//     const [sortConfig, setSortConfig] = useState<{
//         key: string
//         direction: "asc" | "desc"
//     } | null>(null)

//     const toggleSort = (key: string) => {
//         setSortConfig((prev) => {
//             if (prev?.key === key) {
//                 return {
//                     key,
//                     direction: prev.direction === "asc" ? "desc" : "asc",
//                 }
//             }
//             return { key, direction: "asc" }
//         })
//     }

//     const getLatestTimestamp = (history: any[], status?: string) => {
//         if (!history || !Array.isArray(history)) return ""
//         const filtered = status
//             ? history.filter((h) => h.status === status)
//             : history
//         if (filtered.length === 0) return ""
//         return filtered.reduce((latest, curr) =>
//             new Date(curr.timestamp) > new Date(latest.timestamp)
//                 ? curr
//                 : latest
//         ).timestamp
//     }

//     function getReservationTagAndTimestamp(data: any): {
//         label: string
//         timestamp: string
//     } {
//         const cancellation = data._cancellations?.[0]
//         const settlement = data._settlements?.[0]
//         const { reservation_status, stay_status } = data

//         const cancel_type = cancellation?.cancel_type
//         const cancel_status = cancellation?.cancel_status
//         const settlement_type = settlement?.settlement_type
//         const settlement_status = settlement?.settlement_status

//         let label = "-"
//         let timestamp = ""

//         if (cancel_type === "unpaid_cancel") {
//             label = "취소 완료"
//             timestamp = getLatestTimestamp(cancellation?.cancel_history)
//         } else if (
//             cancel_type === "paid_cancel" &&
//             (cancel_status === "pending" || cancel_status === "processing")
//         ) {
//             label = "예약 취소 신청"
//             timestamp = getLatestTimestamp(cancellation?.cancel_history)
//         } else if (
//             cancel_type === "paid_cancel" &&
//             cancel_status === "completed"
//         ) {
//             label = "취소 처리 완료"
//             timestamp = getLatestTimestamp(cancellation?.cancel_history)
//         } else if (reservation_status === "pending" && !cancellation) {
//             label = "예약 대기"
//             timestamp = getLatestTimestamp(data.reservation_history, "pending")
//         } else if (
//             reservation_status === "confirmed" &&
//             !cancellation &&
//             !settlement &&
//             stay_status === "before_checkin"
//         ) {
//             label = "예약 확정"
//             timestamp = getLatestTimestamp(
//                 data.reservation_history,
//                 "confirmed"
//             )
//         } else if (
//             reservation_status === "confirmed" &&
//             !cancellation &&
//             !settlement &&
//             stay_status === "checked_in"
//         ) {
//             label = "체크인 중"
//             timestamp = getLatestTimestamp(data.stay_history, "checked_in")
//         } else if (
//             reservation_status === "confirmed" &&
//             !cancellation &&
//             !settlement &&
//             stay_status === "checked_out"
//         ) {
//             label = "체크아웃 완료"
//             timestamp = getLatestTimestamp(data.stay_history, "checked_out")
//         } else if (
//             reservation_status === "confirmed" &&
//             settlement_type === "deposit_refund" &&
//             (settlement_status === "pending" ||
//                 settlement_status === "processing")
//         ) {
//             label = "보증금 환불 진행중"
//             timestamp = getLatestTimestamp(settlement?.settlement_history)
//         } else if (
//             reservation_status === "confirmed" &&
//             settlement_type === "additional_payment" &&
//             (settlement_status === "pending" ||
//                 settlement_status === "processing")
//         ) {
//             label = "추가 결제 대기"
//             timestamp = getLatestTimestamp(settlement?.settlement_history)
//         } else if (
//             reservation_status === "confirmed" &&
//             settlement_status === "completed"
//         ) {
//             label = "숙박 완료"
//             timestamp = getLatestTimestamp(settlement?.settlement_history)
//         }

//         return { label, timestamp }
//     }

//     const reservationTagOrder: Record<string, number> = {
//         "예약 대기": 1,
//         "예약 확정": 2,
//         "체크인 중": 3,
//         "체크아웃 완료": 4,
//         "보증금 환불 진행중": 5,
//         "추가 결제 대기": 6,
//         "숙박 완료": 7,
//         "예약 취소 신청": 8,
//         "취소 완료": 9,
//         "취소 처리 완료": 10,
//         "-": 99,
//     }

//     useEffect(() => {
//         const fetchAll = async () => {
//             try {
//                 const [orders, payments, cancellations, refunds, settlements] =
//                     await Promise.all([
//                         fetch(
//                             "https://terene-db-server.onrender.com/api/v2/orders"
//                         ).then((res) => res.json()),
//                         fetch(
//                             "https://terene-db-server.onrender.com/api/v2/payments"
//                         ).then((res) => res.json()),
//                         fetch(
//                             "https://terene-db-server.onrender.com/api/v2/cancellations"
//                         ).then((res) => res.json()),
//                         fetch(
//                             "https://terene-db-server.onrender.com/api/v2/refunds"
//                         ).then((res) => res.json()),
//                         fetch(
//                             "https://terene-db-server.onrender.com/api/v2/settlements"
//                         ).then((res) => res.json()),
//                     ])

//                 const byOrderId = (arr: any[], key: string) =>
//                     arr.reduce(
//                         (acc, item) => {
//                             const id = item[key]
//                             if (!acc[id]) acc[id] = []
//                             acc[id].push(item)
//                             return acc
//                         },
//                         {} as Record<string, any[]>
//                     )

//                 const paymentsMap = byOrderId(payments, "order_id")
//                 const cancellationsMap = byOrderId(cancellations, "order_id")
//                 const refundsMap = byOrderId(refunds, "order_id")
//                 const settlementsMap = byOrderId(settlements, "order_id")

//                 const visibleOrders = orders.filter(
//                     (order: any) => !order.hidden
//                 )

//                 const merged = visibleOrders.map((order: any) => {
//                     const fullOrder = {
//                         ...order,
//                         _payments: paymentsMap[order.order_id] || [],
//                         _cancellations: cancellationsMap[order.order_id] || [],
//                         _refunds: refundsMap[order.order_id] || [],
//                         _settlements: settlementsMap[order.order_id] || [],
//                     }
//                     const { label, timestamp } =
//                         getReservationTagAndTimestamp(fullOrder)
//                     return {
//                         ...fullOrder,
//                         reservation_status_tag: label,
//                         reservation_status_timestamp: timestamp,
//                     }
//                 })

//                 setRows(merged)
//             } catch (err) {
//                 console.error("Failed to load orders and related data:", err)
//             }
//         }

//         fetchAll()
//     }, [])

//     const filteredRows = useMemo(() => {
//         return rows.filter((row) => {
//             const { tab, branch, membership_number, query } = filters

//             const hasCancelOrRefund =
//                 (row._cancellations?.length ?? 0) > 0 ||
//                 (row._refunds?.length ?? 0) > 0

//             const tabMatch = (() => {
//                 if (tab === "취소") {
//                     return (
//                         (row._cancellations?.length ?? 0) > 0 ||
//                         (row._refunds?.length ?? 0) > 0
//                     )
//                 }

//                 if (tab === "완료") {
//                     return row.reservation_status_tag === "숙박 완료"
//                 }

//                 const isCanceled =
//                     (row._cancellations?.length ?? 0) > 0 ||
//                     (row._refunds?.length ?? 0) > 0
//                 const isCompleted = row.reservation_status_tag === "숙박 완료"
//                 return !isCanceled && !isCompleted
//             })()

//             const branchMatch = branch
//                 ? row.stay_location
//                       ?.toLowerCase()
//                       .includes(branch.toLowerCase())
//                 : true

//             const memberMatch = membership_number
//                 ? row.membership_number === membership_number
//                 : true

//             // 검색 엔진 로직 /////////////////////////////////////////////////////////////////////
//             // const queryMatch = (() => {
//             //     if (!query || !query.trim()) return true

//             //     const normalize = (str: string) =>
//             //         str.toLowerCase().replace(/[-.,\s]/g, "")

//             //     const queryList = query
//             //         .split(/,\s+/)
//             //         .map((q) => normalize(q))
//             //         .filter((q) => q.length > 0)

//             //     const blob = normalize(JSON.stringify(row))

//             //     return queryList.every((q) => blob.includes(q))
//             // })()
//             const queryMatch = (() => {
//                 if (!query || !query.trim()) return true

//                 type Row = any

//                 // 1) 태그 정의
//                 const TAG_DETECTORS: Array<{
//                     label: string
//                     test: (row: Row) => boolean
//                 }> = [
//                     {
//                         label: "예약 대기",
//                         test: (r) =>
//                             r.reservation_status_tag === "예약 대기" &&
//                             r.reserved_by_vaadd,
//                     },
//                     {
//                         label: "미결제 상태",
//                         test: (r) =>
//                             r.reservation_status_tag === "예약 대기" &&
//                             !r.reserved_by_vaadd,
//                     },
//                     {
//                         label: "예약 확정",
//                         test: (r) => r.reservation_status_tag === "예약 확정",
//                     },
//                     {
//                         label: "체크인 중",
//                         test: (r) => r.reservation_status_tag === "체크인 중",
//                     },
//                     {
//                         label: "체크아웃 완료",
//                         test: (r) =>
//                             r.reservation_status_tag === "체크아웃 완료",
//                     },
//                     {
//                         label: "보증금 환불 진행중",
//                         test: (r) =>
//                             r.reservation_status_tag === "보증금 환불 진행중",
//                     },
//                     {
//                         label: "추가 결제 대기",
//                         test: (r) =>
//                             r.reservation_status_tag === "추가 결제 대기",
//                     },
//                     {
//                         label: "숙박 완료",
//                         test: (r) => r.reservation_status_tag === "숙박 완료",
//                     },
//                     {
//                         label: "예약 취소 신청",
//                         test: (r) =>
//                             r.reservation_status_tag === "예약 취소 신청",
//                     },
//                     {
//                         label: "취소 완료",
//                         test: (r) => r.reservation_status_tag === "취소 완료",
//                     },
//                     {
//                         label: "취소 처리 완료",
//                         test: (r) =>
//                             r.reservation_status_tag === "취소 처리 완료",
//                     },
//                 ]

//                 // 2) 태그 감지 및 query에서 제거
//                 let raw = query
//                 const rawNoSpace = raw.replace(/\s/g, "")
//                 const activeTagPredicates: Array<(row: Row) => boolean> = []

//                 for (const tag of TAG_DETECTORS) {
//                     const labelNoSpace = tag.label.replace(/\s/g, "")
//                     if (rawNoSpace.includes(labelNoSpace)) {
//                         activeTagPredicates.push(tag.test)
//                         // 실제 raw에서도 원래 label 문자열 제거
//                         raw = raw.split(tag.label).join(" ")
//                     }
//                 }

//                 // 3) 정규화 함수 (소문자, 특수문자 제거)
//                 const normalize = (str: string) =>
//                     str.toLowerCase().replace(/[-.,\s]/g, "")

//                 // 4) 나머지 query를 split → normalize → 필터링
//                 const queryList = raw
//                     .split(/,\s+/)
//                     .map((q) => normalize(q))
//                     .filter((q) => q.length > 0)

//                 // 5) 대상 row의 blob 생성
//                 const blob = normalize(JSON.stringify(row))

//                 // 6) 문자열 매칭 & 태그 predicate 매칭
//                 const tokenOk = queryList.every((q) => blob.includes(q))
//                 const tagsOk = activeTagPredicates.every((fn) => fn(row))

//                 return tokenOk && tagsOk
//             })()

//             ///////////////////////////////////////////////////////////

//             return tabMatch && branchMatch && memberMatch && queryMatch
//         })
//     }, [rows, filters])

//     const sortedRows = useMemo(() => {
//         const sorted = [...filteredRows]

//         if (sortConfig?.key) {
//             sorted.sort((a, b) => {
//                 let aValue, bValue

//                 switch (sortConfig.key) {
//                     case "checkin_date":
//                         aValue = new Date(a.checkin_date).getTime()
//                         bValue = new Date(b.checkin_date).getTime()
//                         break
//                     case "reserver_name":
//                         aValue = a.reserver_name?.toLowerCase() ?? ""
//                         bValue = b.reserver_name?.toLowerCase() ?? ""
//                         break
//                     case "stay_info.name":
//                         aValue = a.stay_info?.name?.toLowerCase() ?? ""
//                         bValue = b.stay_info?.name?.toLowerCase() ?? ""
//                         break
//                     case "final_price":
//                         aValue = Number(a.final_price) || 0
//                         bValue = Number(b.final_price) || 0
//                         break
//                     case "reservation_status_tag":
//                         const aOrder =
//                             reservationTagOrder[a.reservation_status_tag] ?? 99
//                         const bOrder =
//                             reservationTagOrder[b.reservation_status_tag] ?? 99

//                         if (aOrder !== bOrder) {
//                             return sortConfig.direction === "asc"
//                                 ? aOrder - bOrder
//                                 : bOrder - aOrder
//                         }

//                         const aTime = new Date(
//                             a.reservation_status_timestamp || 0
//                         ).getTime()
//                         const bTime = new Date(
//                             b.reservation_status_timestamp || 0
//                         ).getTime()
//                         return sortConfig.direction === "asc"
//                             ? aTime - bTime
//                             : bTime - aTime
//                     default:
//                         return 0
//                 }

//                 if (aValue < bValue)
//                     return sortConfig.direction === "asc" ? -1 : 1
//                 if (aValue > bValue)
//                     return sortConfig.direction === "asc" ? 1 : -1
//                 return 0
//             })
//         } else {
//             // 디폴트 정렬: 현재 reservation_status에 해당하는 timestamp 기준 최신순
//             sorted.sort((a, b) => {
//                 const getCurrentStatusTime = (order: any) =>
//                     new Date(
//                         order.reservation_history?.find(
//                             (h: any) => h.status === order.reservation_status
//                         )?.timestamp || 0
//                     ).getTime()

//                 const aTime = getCurrentStatusTime(a)
//                 const bTime = getCurrentStatusTime(b)

//                 return bTime - aTime // 최신순 정렬
//             })
//         }

//         return sorted
//     }, [filteredRows, sortConfig])

//     useEffect(() => {
//         setCurrentPage(1)
//     }, [filters])

//     const totalPages = useMemo(() => {
//         return Math.max(1, Math.ceil(sortedRows.length / itemsPerPage))
//     }, [sortedRows])

//     // const paginatedRows = sortedRows.slice(
//     //     (currentPage - 1) * itemsPerPage,
//     //     currentPage * itemsPerPage
//     // )

//     const paginatedRows = useMemo(() => {
//         return sortedRows.slice(
//             (currentPage - 1) * itemsPerPage,
//             currentPage * itemsPerPage
//         )
//     }, [sortedRows, currentPage])

//     const prevPage = () => setCurrentPage(Math.max(1, currentPage - 1))
//     const nextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))

//     const updateOrder = async (orderId: string, status: string) => {
//         const now = getKSTISOString()
//         const order = rows.find((o) => o.order_id === orderId)
//         if (!order) return

//         const newHistory = [
//             ...(order.reservation_history || []),
//             { status, timestamp: now },
//         ]

//         const updatedOrder = {
//             ...order,
//             reservation_status: status,
//             reservation_history: newHistory,
//         }

//         const res = await fetch(
//             `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`,
//             {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(updatedOrder),
//             }
//         )

//         if (res.ok) {
//             setRows((prev) =>
//                 prev.map((o) => (o.order_id === orderId ? updatedOrder : o))
//             )
//         } else {
//             alert("Failed to update order")
//         }
//     }

//     //////////////////////////////////////////////////////////////////
//     // 지점 취소 로직 //////////////////////////////////////////////////
//     const handleCancel = async (
//         orderId: string,
//         type: "decline" | "cancel"
//     ) => {
//         try {
//             console.log("toggle 지점 취소")
//             const orderRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
//             )

//             if (!orderRes.ok) throw new Error("예약 정보를 불러올 수 없습니다")
//             const orderData = await orderRes.json()

//             const now = getKSTDate()
//             const nowISOString = getKSTISOString(now)

//             const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
//             const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
//                 now.getMinutes()
//             ).padStart(2, "0")}`
//             const randStr = generateRandomString(6)
//             const cancellationId = `C-${dateStr}-${timeStr}-${randStr}`

//             // ✨ 공통 환불 계산
//             const diffDays = getDiffDaysKST(orderData.checkin_date)

//             const lodgingBase = (orderData.discounted_price?.amount || 0) * 1.1
//             const serviceBase = (orderData.service_price?.amount || 0) * 1.1
//             const deposit = orderData.deposit_price || 0

//             const lodgingRate =
//                 diffDays >= 31
//                     ? 1.0
//                     : diffDays >= 15
//                       ? 0.8
//                       : diffDays >= 10
//                         ? 0.6
//                         : 0.0
//             const serviceRate = diffDays >= 10 ? 1.0 : 0.0

//             const lodgingRefund = lodgingBase * 1.0 // 관리자 측 취소 시 100% 환불
//             const serviceRefund = serviceBase * 1.0 // 관리자 측 취소 시 100% 환불
//             const depositRefund = deposit * 1.0
//             const totalRefund = lodgingRefund + serviceRefund + depositRefund

//             // 📌 1. CANCELLATION
//             const cancellationPayload =
//                 type === "decline"
//                     ? {
//                           cancellation_id: cancellationId,
//                           order_id: orderId,
//                           cancel_person: "admin",
//                           cancel_type: "unpaid_cancel",
//                           cancel_status: "completed",
//                           cancel_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: nowISOString },
//                               { status: "completed", timestamp: nowISOString },
//                           ],
//                       }
//                     : {
//                           cancellation_id: cancellationId,
//                           order_id: orderId,
//                           cancel_person: "admin",
//                           cancel_type: "paid_cancel",
//                           cancel_status: "pending",
//                           cancel_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }

//             const cancellationRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/cancellations`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(cancellationPayload),
//                 }
//             )

//             if (!cancellationRes.ok) throw new Error("취소 생성 실패")

//             // ✅ 이후 단계는 paid_cancel일 경우만 실행
//             if (type === "cancel") {
//                 const allPayments = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments`
//                 ).then((res) => res.json())

//                 const originalPayment = allPayments.find(
//                     (p) => p.order_id === orderId && p.payment_type === "order"
//                 )

//                 if (!originalPayment) {
//                     throw new Error("기존 결제 정보를 찾을 수 없습니다")
//                 }

//                 const paymentId = `P-${dateStr}-${timeStr}-${generateRandomString(
//                     6
//                 )}`
//                 const refundId = `R-${dateStr}-${timeStr}-${generateRandomString(
//                     6
//                 )}`

//                 // 📌 2. PAYMENTS 생성
//                 const paymentPayload = {
//                     payment_id: paymentId,
//                     payment_type: "refund",
//                     order_id: orderId,
//                     payment_info: originalPayment.payment_info,
//                     payment_method: "Toss Payments Refund",
//                     payment_account: originalPayment.receiver_account,
//                     receiver_account: originalPayment.payment_account,
//                     payment_due: getKSTISOString(
//                         new Date(now.getTime() + 24 * 60 * 60 * 1000)
//                     ),
//                     price_paid: Math.round(totalRefund),
//                     payment_status: "pending",
//                     payment_history: [
//                         { status: "pending", timestamp: nowISOString },
//                         { status: "processing", timestamp: null },
//                         { status: "completed", timestamp: null },
//                     ],
//                 }

//                 const paymentRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments`,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(paymentPayload),
//                     }
//                 )

//                 if (!paymentRes.ok) throw new Error("환불 결제 생성 실패")
//             }

//             // 📌 최종 로컬 반영
//             const updatedOrder = {
//                 ...orderData,
//                 _cancellations: [
//                     ...(orderData._cancellations || []),
//                     cancellationPayload,
//                 ],
//             }

//             const { label, timestamp } =
//                 getReservationTagAndTimestamp(updatedOrder)

//             setRows((prev) =>
//                 prev.map((o) =>
//                     o.order_id === orderId
//                         ? {
//                               ...updatedOrder,
//                               reservation_status_tag: label,
//                               reservation_status_timestamp: timestamp,
//                           }
//                         : o
//                 )
//             )

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // 쿠폰 사용 가능 상태로 변환하는 로직
//             try {
//                 const couponRes = await fetch(
//                     "https://terene-db-server.onrender.com/api/v2/coupon-instances"
//                 )
//                 if (!couponRes.ok) {
//                     throw new Error("쿠폰 인스턴스를 불러오지 못했습니다")
//                 }
//                 const allCoupons = await couponRes.json()

//                 const primary =
//                     orderData.discounted_price?.primary_coupons || []
//                 const secondary =
//                     orderData.discounted_price?.secondary_coupons || []

//                 const allUsedCouponEntries =
//                     primary.length === 0
//                         ? [...secondary]
//                         : [...primary, ...secondary]

//                 const nowKST = getKSTISOString()

//                 for (const entry of allUsedCouponEntries) {
//                     const matchingInstances = allCoupons.filter(
//                         (instance) =>
//                             instance.coupon_instance_id === entry.coupon_id &&
//                             instance.status === "used"
//                     )

//                     for (const instance of matchingInstances) {
//                         try {
//                             // ✅ 쿠폰 정의 정보 조회
//                             const defRes = await fetch(
//                                 `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${instance.coupon_definition_id}`
//                             )
//                             if (!defRes.ok) {
//                                 console.warn(
//                                     `⚠️ 쿠폰 정의(${instance.coupon_definition_id}) 조회 실패`
//                                 )
//                                 continue
//                             }
//                             const couponDef = await defRes.json()

//                             // counter 값 확인: 1이면 사용 처리, -1이면 스킵
//                             if (couponDef.counter >= 1) {
//                                 const updatedCoupon = {
//                                     ...instance,
//                                     status: "available",
//                                     order_id: null,
//                                     used_location: null,
//                                     used_timestamp: null,
//                                     used_amount: null,
//                                 }

//                                 const patchRes = await fetch(
//                                     `https://terene-db-server.onrender.com/api/v2/coupon-instances/${instance.coupon_instance_id}`,
//                                     {
//                                         method: "PUT",
//                                         headers: {
//                                             "Content-Type": "application/json",
//                                         },
//                                         body: JSON.stringify(updatedCoupon),
//                                     }
//                                 )

//                                 if (!patchRes.ok) {
//                                     console.warn(
//                                         `⚠️ 쿠폰 ${instance.coupon_instance_id} 사용 처리 실패`
//                                     )
//                                 }
//                             }
//                         } catch (err) {
//                             console.error(
//                                 `쿠폰 처리 중 오류 (instance_id: ${instance.coupon_instance_id}):`,
//                                 err
//                             )
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error("쿠폰 처리 중 오류 발생:", err)
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // -------------------------------------------------------
//             // Update daily occupancy
//             // -------------------------------------------------------

//             try {
//                 const getAllDaysRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/days`
//                 )
//                 if (!getAllDaysRes.ok) {
//                     const errorText = await getAllDaysRes.text()
//                     throw new Error(
//                         `HTTP ${getAllDaysRes.status} - ${errorText}`
//                     )
//                 }

//                 const allDays = await getAllDaysRes.json()

//                 // 3. dateList에 포함된 날짜들만 필터링
//                 const dateRange = []
//                 let current = new Date(orderData.checkin_date)
//                 const end = new Date(orderData.checkout_date)

//                 while (current <= end) {
//                     const yyyyMMdd = current.toISOString().split("T")[0] // "YYYY-MM-DD"
//                     dateRange.push(yyyyMMdd)
//                     current.setDate(current.getDate() + 1)
//                 }

//                 const targetDays = allDays.filter((day) =>
//                     dateRange.includes(day.date)
//                 )

//                 // 4. 각 날짜 정보 업데이트
//                 for (const day of targetDays) {
//                     let updatedDay = { ...day }

//                     if (day.date === orderData.checkin_date) {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else if (day.date === orderData.checkout_date) {
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     }

//                     try {
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
//                                 `Failed to update occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
//                             )
//                         }
//                     } catch (err) {
//                         console.error(
//                             "날짜 점유 정보 업데이트 중 오류 발생:",
//                             err
//                         )
//                         alert(
//                             `예약 날짜(${day.date}) 점유 정보 업데이트 중 오류가 발생했습니다.\n에러메시지: ${err}`
//                         )
//                         return
//                     }
//                 }
//             } catch (error) {
//                 console.error("전체 날짜 데이터 가져오는 중 오류 발생:", error)
//                 alert(
//                     `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
//                 )
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////

//             alert(
//                 "예약 취소가 확정되었습니다.\n환불 절차를 진행하시기 바랍니다."
//             )
//         } catch (err) {
//             console.error(err)
//             alert("예약 취소 처리 중 문제가 발생했습니다.")
//         }
//     }

//     //////////////////////////////////////////////////////////////////
//     // 고객 취소 로직 //////////////////////////////////////////////////
//     const handleCancelCustomer = async (
//         orderId: string,
//         type: "decline" | "cancel"
//     ) => {
//         try {
//             const orderRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
//             )
//             if (!orderRes.ok) throw new Error("예약 정보를 불러올 수 없습니다")
//             const orderData = await orderRes.json()

//             const now = getKSTDate()
//             const nowISOString = getKSTISOString(now)

//             const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
//             const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
//                 now.getMinutes()
//             ).padStart(2, "0")}`
//             const randStr = generateRandomString(6)
//             const cancellationId = `C-${dateStr}-${timeStr}-${randStr}`

//             const diffDays = getDiffDaysKST(orderData.checkin_date)

//             const lodgingBase = (orderData.discounted_price?.amount || 0) * 1.1
//             const serviceBase = (orderData.service_price?.amount || 0) * 1.1
//             const deposit = orderData.deposit_price || 0

//             const lodgingRate =
//                 diffDays >= 31
//                     ? 1.0
//                     : diffDays >= 15
//                       ? 0.8
//                       : diffDays >= 10
//                         ? 0.6
//                         : 0.0
//             const serviceRate = diffDays >= 10 ? 1.0 : 0.0

//             const lodgingRefund = lodgingBase * lodgingRate
//             const serviceRefund = serviceBase * serviceRate
//             const depositRefund = deposit * 1.0
//             const totalRefund = lodgingRefund + serviceRefund + depositRefund

//             const cancellationPayload =
//                 type === "decline"
//                     ? {
//                           cancellation_id: cancellationId,
//                           order_id: orderId,
//                           cancel_person: "customer",
//                           cancel_type: "unpaid_cancel",
//                           cancel_status: "completed",
//                           cancel_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: nowISOString },
//                               { status: "completed", timestamp: nowISOString },
//                           ],
//                       }
//                     : {
//                           cancellation_id: cancellationId,
//                           order_id: orderId,
//                           cancel_person: "customer",
//                           cancel_type: "paid_cancel",
//                           cancel_status: "pending",
//                           cancel_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }

//             const cancellationRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/cancellations`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(cancellationPayload),
//                 }
//             )

//             if (!cancellationRes.ok) throw new Error("취소 생성 실패")

//             if (type === "cancel") {
//                 const allPayments = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments`
//                 ).then((res) => res.json())

//                 const originalPayment = allPayments.find(
//                     (p) => p.order_id === orderId && p.payment_type === "order"
//                 )

//                 if (!originalPayment) throw new Error("기존 결제 정보 없음")

//                 const paymentId = `P-${dateStr}-${timeStr}-${generateRandomString(6)}`
//                 const paymentPayload = {
//                     payment_id: paymentId,
//                     payment_type: "refund",
//                     order_id: orderId,
//                     payment_info: originalPayment.payment_info,
//                     payment_method: "Toss Payments Refund",
//                     payment_account: originalPayment.receiver_account,
//                     receiver_account: originalPayment.payment_account,
//                     payment_due: getKSTISOString(
//                         new Date(now.getTime() + 24 * 60 * 60 * 1000)
//                     ),
//                     price_paid: Math.round(totalRefund),
//                     payment_status: "pending",
//                     payment_history: [
//                         { status: "pending", timestamp: nowISOString },
//                         { status: "processing", timestamp: null },
//                         { status: "completed", timestamp: null },
//                     ],
//                 }

//                 const paymentRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments`,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(paymentPayload),
//                     }
//                 )

//                 if (!paymentRes.ok) throw new Error("환불 결제 생성 실패")
//             }

//             const updatedOrder = {
//                 ...orderData,
//                 _cancellations: [
//                     ...(orderData._cancellations || []),
//                     cancellationPayload,
//                 ],
//             }

//             const { label, timestamp } =
//                 getReservationTagAndTimestamp(updatedOrder)

//             setRows((prev) =>
//                 prev.map((o) =>
//                     o.order_id === orderId
//                         ? {
//                               ...updatedOrder,
//                               reservation_status_tag: label,
//                               reservation_status_timestamp: timestamp,
//                           }
//                         : o
//                 )
//             )

//             // ✅ 템플릿 전송 - C 코드 사용
//             const templateParams = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.reserver_name,
//                 order_id: orderData.order_id,
//                 membership_number: orderData.membership_number || "비회원 예약",
//                 reserver_contact: String(orderData.reserver_contact),
//                 checkin_date: orderData.checkin_date,
//                 checkout_date: orderData.checkout_date,
//                 adult: String(orderData.stay_people?.adult),
//                 youth: String(orderData.stay_people?.teenager || "0"),
//                 child: String(orderData.stay_people?.child),
//                 final_price: String(
//                     Number(orderData.final_price ?? "0").toLocaleString()
//                 ),
//             }

//             const templateParamsB = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.stay_info.name,
//                 order_id: orderData.order_id,
//                 membership_number: orderData.membership_number || "비회원 예약",
//                 reserver_contact: String(orderData.stay_info.contact),
//                 checkin_date: orderData.checkin_date,
//                 checkout_date: orderData.checkout_date,
//                 adult: String(orderData.stay_people?.adult),
//                 youth: String(orderData.stay_people?.teenager || "0"),
//                 child: String(orderData.stay_people?.child),
//                 final_price: String(
//                     Number(orderData.final_price ?? "0").toLocaleString()
//                 ),
//             }

//             // ✅ 관리자에게 SMS/이메일 전송
//             for (const adminPhone of ADMIN_PHONES) {
//                 await sendKakaov2(adminPhone, "C", templateParamsB)
//             }
//             // for (const adminEmail of ADMIN_EMAILS) {
//             //     await sendEmailv2(adminEmail, "C", templateParams)
//             // }

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // 쿠폰 사용 가능 상태로 변환하는 로직
//             try {
//                 const couponRes = await fetch(
//                     "https://terene-db-server.onrender.com/api/v2/coupon-instances"
//                 )
//                 if (!couponRes.ok) {
//                     throw new Error("쿠폰 인스턴스를 불러오지 못했습니다")
//                 }
//                 const allCoupons = await couponRes.json()

//                 const primary =
//                     orderData.discounted_price?.primary_coupons || []
//                 const secondary =
//                     orderData.discounted_price?.secondary_coupons || []

//                 const allUsedCouponEntries =
//                     primary.length === 0
//                         ? [...secondary]
//                         : [...primary, ...secondary]

//                 const nowKST = getKSTISOString()

//                 for (const entry of allUsedCouponEntries) {
//                     const matchingInstances = allCoupons.filter(
//                         (instance) =>
//                             instance.coupon_instance_id === entry.coupon_id &&
//                             instance.status === "used"
//                     )

//                     for (const instance of matchingInstances) {
//                         try {
//                             // ✅ 쿠폰 정의 정보 조회
//                             const defRes = await fetch(
//                                 `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${instance.coupon_definition_id}`
//                             )
//                             if (!defRes.ok) {
//                                 console.warn(
//                                     `⚠️ 쿠폰 정의(${instance.coupon_definition_id}) 조회 실패`
//                                 )
//                                 continue
//                             }
//                             const couponDef = await defRes.json()

//                             // counter 값 확인: 1이면 사용 처리, -1이면 스킵
//                             if (couponDef.counter >= 1) {
//                                 const updatedCoupon = {
//                                     ...instance,
//                                     status: "available",
//                                     order_id: null,
//                                     used_location: null,
//                                     used_timestamp: null,
//                                     used_amount: null,
//                                 }

//                                 const patchRes = await fetch(
//                                     `https://terene-db-server.onrender.com/api/v2/coupon-instances/${instance.coupon_instance_id}`,
//                                     {
//                                         method: "PUT",
//                                         headers: {
//                                             "Content-Type": "application/json",
//                                         },
//                                         body: JSON.stringify(updatedCoupon),
//                                     }
//                                 )

//                                 if (!patchRes.ok) {
//                                     console.warn(
//                                         `⚠️ 쿠폰 ${instance.coupon_instance_id} 사용 처리 실패`
//                                     )
//                                 }
//                             }
//                         } catch (err) {
//                             console.error(
//                                 `쿠폰 처리 중 오류 (instance_id: ${instance.coupon_instance_id}):`,
//                                 err
//                             )
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error("쿠폰 처리 중 오류 발생:", err)
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // -------------------------------------------------------
//             // Update daily occupancy
//             // -------------------------------------------------------

//             try {
//                 const getAllDaysRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/days`
//                 )
//                 if (!getAllDaysRes.ok) {
//                     const errorText = await getAllDaysRes.text()
//                     throw new Error(
//                         `HTTP ${getAllDaysRes.status} - ${errorText}`
//                     )
//                 }

//                 const allDays = await getAllDaysRes.json()

//                 // 3. dateList에 포함된 날짜들만 필터링
//                 const dateRange = []
//                 let current = new Date(orderData.checkin_date)
//                 const end = new Date(orderData.checkout_date)

//                 while (current <= end) {
//                     const yyyyMMdd = current.toISOString().split("T")[0] // "YYYY-MM-DD"
//                     dateRange.push(yyyyMMdd)
//                     current.setDate(current.getDate() + 1)
//                 }

//                 const targetDays = allDays.filter((day) =>
//                     dateRange.includes(day.date)
//                 )

//                 // 4. 각 날짜 정보 업데이트
//                 for (const day of targetDays) {
//                     let updatedDay = { ...day }

//                     if (day.date === orderData.checkin_date) {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else if (day.date === orderData.checkout_date) {
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     }

//                     try {
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
//                                 `Failed to update occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
//                             )
//                         }
//                     } catch (err) {
//                         console.error(
//                             "날짜 점유 정보 업데이트 중 오류 발생:",
//                             err
//                         )
//                         alert(
//                             `예약 날짜(${day.date}) 점유 정보 업데이트 중 오류가 발생했습니다.\n에러메시지: ${err}`
//                         )
//                         return
//                     }
//                 }
//             } catch (error) {
//                 console.error("전체 날짜 데이터 가져오는 중 오류 발생:", error)
//                 alert(
//                     `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
//                 )
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////
//         } catch (err) {
//             console.error(err)
//             alert("예약 취소 처리 중 오류가 발생했습니다.")
//         }
//     }

//     const onDeclineCustomer = async (orderId: string) =>
//         handleCancelCustomer(orderId, "decline")

//     const onCancelCustomer = async (orderId: string) =>
//         handleCancelCustomer(orderId, "cancel")
//     //////////////////////////////////////////////////////////////////

//     //////////////////////////////////////////////////////////////////
//     // 환불 로직 ///////////////////////////////////////////////////////
//     async function handleRefund(orderId: string) {
//         try {
//             const now = getKSTDate()
//             const nowISOString = getKSTISOString(now)

//             const orderRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
//             )
//             if (!orderRes.ok) throw new Error("예약 정보를 불러올 수 없습니다.")
//             const orderData = await orderRes.json()

//             const cancellationsRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/cancellations`
//             )
//             const paymentsRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/payments`
//             )

//             const [cancellations, payments] = await Promise.all([
//                 cancellationsRes.json(),
//                 paymentsRes.json(),
//             ])

//             const targetCancellation = cancellations.find(
//                 (c) => c.order_id === orderId && c.cancel_type === "paid_cancel"
//             )
//             if (!targetCancellation) throw new Error("유효한 취소 데이터 없음.")

//             const targetPayment = payments.find(
//                 (p) =>
//                     p.order_id === orderId &&
//                     p.payment_type === "refund" &&
//                     p.payment_status !== "completed"
//             )
//             if (!targetPayment) throw new Error("환불 결제 정보가 없습니다.")

//             // ✅ diffDays 계산 (checkin_date - cancel_history[pending])
//             const checkinDate = new Date(orderData.checkin_date)
//             const pendingTimestampStr = targetCancellation.cancel_history?.find(
//                 (h: any) => h.status === "pending"
//             )?.timestamp
//             if (!pendingTimestampStr)
//                 throw new Error("취소 이력에 pending 항목이 없습니다.")
//             const pendingTimestamp = new Date(pendingTimestampStr)

//             const msPerDay = 1000 * 60 * 60 * 24
//             const diffDays = Math.floor(
//                 (checkinDate.getTime() - pendingTimestamp.getTime()) / msPerDay
//             )

//             // ✅ 환불 금액 계산
//             const lodgingBase = (orderData.discounted_price?.amount || 0) * 1.1
//             const serviceBase = (orderData.service_price?.amount || 0) * 1.1
//             const deposit = orderData.deposit_price || 0

//             let lodgingRefund, serviceRefund, depositRefund, totalRefund

//             if (targetCancellation.cancel_person === "customer") {
//                 const lodgingRate =
//                     diffDays >= 31
//                         ? 1.0
//                         : diffDays >= 15
//                           ? 0.8
//                           : diffDays >= 10
//                             ? 0.6
//                             : 0.0
//                 const serviceRate = diffDays >= 10 ? 1.0 : 0.0

//                 lodgingRefund = lodgingBase * lodgingRate
//                 serviceRefund = serviceBase * serviceRate
//                 depositRefund = deposit * 1.0
//             } else {
//                 lodgingRefund = lodgingBase * 1.0
//                 serviceRefund = serviceBase * 1.0
//                 depositRefund = deposit * 1.0
//             }

//             totalRefund = lodgingRefund + serviceRefund + depositRefund

//             // ✅ 1. Update payment
//             const updatedPayment = {
//                 ...targetPayment,
//                 payment_status: "completed",
//                 payment_history: [
//                     {
//                         status: "pending",
//                         timestamp:
//                             targetPayment.payment_history?.find(
//                                 (h: any) => h.status === "pending"
//                             )?.timestamp || nowISOString,
//                     },
//                     { status: "processing", timestamp: nowISOString },
//                     { status: "completed", timestamp: nowISOString },
//                 ],
//             }

//             const paymentUpdateRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/payments/${targetPayment.payment_id}`,
//                 {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(updatedPayment),
//                 }
//             )
//             if (!paymentUpdateRes.ok) throw new Error("환불 결제 업데이트 실패")

//             // ✅ 2. Update cancellation
//             const updatedCancellation = {
//                 ...targetCancellation,
//                 cancel_status: "completed",
//                 cancel_history: [
//                     {
//                         status: "pending",
//                         timestamp:
//                             targetCancellation.cancel_history?.find(
//                                 (h: any) => h.status === "pending"
//                             )?.timestamp || nowISOString,
//                     },
//                     { status: "processing", timestamp: nowISOString },
//                     { status: "completed", timestamp: nowISOString },
//                 ],
//             }

//             const cancellationUpdateRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/cancellations/${targetCancellation.cancellation_id}`,
//                 {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(updatedCancellation),
//                 }
//             )
//             if (!cancellationUpdateRes.ok)
//                 throw new Error("취소 상태 업데이트 실패")

//             // ✅ 3. Create refund
//             const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
//             const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
//                 now.getMinutes()
//             ).padStart(2, "0")}`
//             const refundId = `R-${dateStr}-${timeStr}-${generateRandomString(6)}`

//             const refundPayload = {
//                 refund_id: refundId,
//                 order_id: orderId,
//                 payment_id: targetPayment.payment_id,
//                 refund_price: Math.round(totalRefund),
//                 refund_details: {
//                     days_before_checkin: diffDays,
//                     discounted_w_vat: Math.round(lodgingRefund),
//                     service_w_vat: Math.round(serviceRefund),
//                     deposit: Math.round(depositRefund),
//                 },
//                 refund_status: "completed",
//                 refund_history: [
//                     { status: "pending", timestamp: nowISOString },
//                     { status: "processing", timestamp: nowISOString },
//                     { status: "completed", timestamp: nowISOString },
//                 ],
//             }

//             const refundRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/refunds`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(refundPayload),
//                 }
//             )
//             if (!refundRes.ok) throw new Error("환불 정보 생성 실패")

//             // ✅ 4. 템플릿 전송 (E/F 코드)
//             const templateCode =
//                 targetCancellation.cancel_person === "customer" ? "E" : "F"

//             const templateParams = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.reserver_name,
//                 order_id: orderData.order_id,
//                 membership_number: orderData.membership_number || "비회원 예약",
//                 reserver_contact: String(orderData.reserver_contact),
//                 checkin_date: orderData.checkin_date,
//                 checkout_date: orderData.checkout_date,
//                 adult: String(orderData.stay_people?.adult),
//                 youth: String(orderData.stay_people?.teenager || "0"),
//                 child: String(orderData.stay_people?.child),
//             }

//             const templateParamsB = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.stay_info.name,
//                 order_id: orderData.order_id,
//                 membership_number: orderData.membership_number || "비회원 예약",
//                 reserver_contact: String(orderData.stay_info.contact),
//                 checkin_date: orderData.checkin_date,
//                 checkout_date: orderData.checkout_date,
//                 adult: String(orderData.stay_people?.adult),
//                 youth: String(orderData.stay_people?.teenager || "0"),
//                 child: String(orderData.stay_people?.child),
//             }

//             // 관리자에게 발송
//             for (const adminPhone of ADMIN_PHONES) {
//                 await sendKakaov2(adminPhone, templateCode, templateParamsB)
//             }
//             // for (const adminEmail of ADMIN_EMAILS) {
//             //     await sendEmailv2(adminEmail, templateCode, templateParams)
//             // }

//             // 예약자에게 발송
//             // await sendSMSv2(
//             //     orderData.reserver_contact,
//             //     templateCode,
//             //     templateParams
//             // )
//             await sendKakaov2(
//                 orderData.reserver_contact,
//                 templateCode,
//                 templateParamsB
//             )
//             await sendEmailv2(
//                 orderData.reserver_email,
//                 templateCode,
//                 templateParamsB
//             )

//             // 숙박자가 예약자와 다를 경우 추가 발송
//             if (!orderData.stay_info?.same_as_reserver) {
//                 const stayContact = orderData.stay_info?.contact
//                 if (stayContact) {
//                     // await sendSMSv2(stayContact, templateCode, templateParams)
//                     await sendKakaov2(
//                         stayContact,
//                         templateCode,
//                         templateParamsB
//                     )
//                 }
//             }

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // 쿠폰 사용 가능 상태로 변환하는 로직
//             try {
//                 const couponRes = await fetch(
//                     "https://terene-db-server.onrender.com/api/v2/coupon-instances"
//                 )
//                 if (!couponRes.ok) {
//                     throw new Error("쿠폰 인스턴스를 불러오지 못했습니다")
//                 }
//                 const allCoupons = await couponRes.json()

//                 const primary =
//                     orderData.discounted_price?.primary_coupons || []
//                 const secondary =
//                     orderData.discounted_price?.secondary_coupons || []

//                 const allUsedCouponEntries =
//                     primary.length === 0
//                         ? [...secondary]
//                         : [...primary, ...secondary]

//                 const nowKST = getKSTISOString()

//                 for (const entry of allUsedCouponEntries) {
//                     const matchingInstances = allCoupons.filter(
//                         (instance) =>
//                             instance.coupon_instance_id === entry.coupon_id &&
//                             instance.status === "used"
//                     )

//                     for (const instance of matchingInstances) {
//                         try {
//                             // ✅ 쿠폰 정의 정보 조회
//                             const defRes = await fetch(
//                                 `https://terene-db-server.onrender.com/api/v2/coupon-definitions/${instance.coupon_definition_id}`
//                             )
//                             if (!defRes.ok) {
//                                 console.warn(
//                                     `⚠️ 쿠폰 정의(${instance.coupon_definition_id}) 조회 실패`
//                                 )
//                                 continue
//                             }
//                             const couponDef = await defRes.json()

//                             // counter 값 확인: 1이면 사용 처리, -1이면 스킵
//                             if (couponDef.counter >= 1) {
//                                 const updatedCoupon = {
//                                     ...instance,
//                                     status: "available",
//                                     order_id: null,
//                                     used_location: null,
//                                     used_timestamp: null,
//                                     used_amount: null,
//                                 }

//                                 const patchRes = await fetch(
//                                     `https://terene-db-server.onrender.com/api/v2/coupon-instances/${instance.coupon_instance_id}`,
//                                     {
//                                         method: "PUT",
//                                         headers: {
//                                             "Content-Type": "application/json",
//                                         },
//                                         body: JSON.stringify(updatedCoupon),
//                                     }
//                                 )

//                                 if (!patchRes.ok) {
//                                     console.warn(
//                                         `⚠️ 쿠폰 ${instance.coupon_instance_id} 사용 처리 실패`
//                                     )
//                                 }
//                             }
//                         } catch (err) {
//                             console.error(
//                                 `쿠폰 처리 중 오류 (instance_id: ${instance.coupon_instance_id}):`,
//                                 err
//                             )
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error("쿠폰 처리 중 오류 발생:", err)
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////

//             //////////////////////////////////////////////////////////////////////////////////////////////////
//             // -------------------------------------------------------
//             // Update daily occupancy
//             // -------------------------------------------------------

//             try {
//                 const getAllDaysRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/days`
//                 )
//                 if (!getAllDaysRes.ok) {
//                     const errorText = await getAllDaysRes.text()
//                     throw new Error(
//                         `HTTP ${getAllDaysRes.status} - ${errorText}`
//                     )
//                 }

//                 const allDays = await getAllDaysRes.json()

//                 // 3. dateList에 포함된 날짜들만 필터링
//                 const dateRange = []
//                 let current = new Date(orderData.checkin_date)
//                 const end = new Date(orderData.checkout_date)

//                 while (current <= end) {
//                     const yyyyMMdd = current.toISOString().split("T")[0] // "YYYY-MM-DD"
//                     dateRange.push(yyyyMMdd)
//                     current.setDate(current.getDate() + 1)
//                 }

//                 const targetDays = allDays.filter((day) =>
//                     dateRange.includes(day.date)
//                 )

//                 // 4. 각 날짜 정보 업데이트
//                 for (const day of targetDays) {
//                     let updatedDay = { ...day }

//                     if (day.date === orderData.checkin_date) {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else if (day.date === orderData.checkout_date) {
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     } else {
//                         updatedDay.checkin = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                         updatedDay.checkout = {
//                             is_occupied: false,
//                             occupied_order_id: null,
//                         }
//                     }

//                     try {
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
//                                 `Failed to update occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
//                             )
//                         }
//                     } catch (err) {
//                         console.error(
//                             "날짜 점유 정보 업데이트 중 오류 발생:",
//                             err
//                         )
//                         alert(
//                             `예약 날짜(${day.date}) 점유 정보 업데이트 중 오류가 발생했습니다.\n에러메시지: ${err}`
//                         )
//                         return
//                     }
//                 }
//             } catch (error) {
//                 console.error("전체 날짜 데이터 가져오는 중 오류 발생:", error)
//                 alert(
//                     `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
//                 )
//             }
//             //////////////////////////////////////////////////////////////////////////////////////////////////

//             alert("환불 처리가 완료되었습니다.")
//         } catch (err) {
//             console.error(err)
//             alert("환불 처리 중 오류가 발생했습니다.")
//         }
//     }
//     //////////////////////////////////////////////////////////////////

//     //////////////////////////////////////////////////////////////////
//     // 정산 로직 ///////////////////////////////////////////////////////
//     const handleSettlement = async (
//         orderId: string,
//         type: "refund" | "additional",
//         settlementInfo: {
//             additional_price: number
//             settlement_amount: number
//             settlement_breakdown: string
//         },
//         settlement_url?: string // ✅ 새로 추가
//     ) => {
//         try {
//             const now = getKSTDate()
//             const nowISOString = getKSTISOString(now)

//             const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
//             const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
//                 now.getMinutes()
//             ).padStart(2, "0")}`
//             const randStr = generateRandomString(6)

//             const settlementId = `S-${dateStr}-${timeStr}-${randStr}`
//             const paymentId = `P-${dateStr}-${timeStr}-${generateRandomString(6)}`

//             const orderRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
//             )
//             if (!orderRes.ok) throw new Error("주문 정보를 불러올 수 없습니다.")
//             const orderData = await orderRes.json()

//             const originalPaymentRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/payments`
//             )
//             const allPayments = await originalPaymentRes.json()
//             const originalPayment = allPayments.find(
//                 (p) => p.order_id === orderId && p.payment_type === "order"
//             )

//             if (!originalPayment)
//                 throw new Error("기존 결제 정보를 찾을 수 없습니다.")

//             const {
//                 additional_price,
//                 settlement_amount,
//                 settlement_breakdown,
//             } = settlementInfo

//             // 1. SETTLEMENT 생성
//             const settlementPayload =
//                 type === "refund"
//                     ? {
//                           settlement_id: settlementId,
//                           settlement_type: "deposit_refund",
//                           order_id: orderId,
//                           additional_price,
//                           settlement_amount,
//                           settlement_breakdown,
//                           settlement_status: "pending",
//                           settlement_url: null,
//                           settlement_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }
//                     : {
//                           settlement_id: settlementId,
//                           settlement_type: "additional_payment",
//                           order_id: orderId,
//                           additional_price,
//                           settlement_amount,
//                           settlement_breakdown,
//                           settlement_status: "pending",
//                           settlement_url: settlement_url,
//                           settlement_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }
//             // alert(JSON.stringify(settlementPayload))

//             const settlementRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/settlements`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(settlementPayload),
//                 }
//             )
//             if (!settlementRes.ok) throw new Error("정산 정보 생성 실패")

//             // 2. PAYMENT 생성
//             const paymentPayload =
//                 type === "refund"
//                     ? {
//                           payment_id: paymentId,
//                           payment_type: "settlement",
//                           order_id: orderId,
//                           payment_info: originalPayment.payment_info,
//                           payment_method: "Toss Payments Refund",
//                           payment_account: originalPayment.receiver_account,
//                           receiver_account: originalPayment.payment_account,
//                           payment_due: getKSTISOString(
//                               new Date(now.getTime() + 24 * 60 * 60 * 1000)
//                           ),
//                           price_paid: settlement_amount,
//                           payment_status: "pending",
//                           payment_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }
//                     : {
//                           payment_id: paymentId,
//                           payment_type: "settlement",
//                           order_id: orderId,
//                           payment_info: originalPayment.payment_info,
//                           payment_method: "Link Pay",
//                           payment_account: originalPayment.payment_account,
//                           receiver_account: originalPayment.receiver_account,
//                           payment_due: getKSTISOString(
//                               new Date(now.getTime() + 24 * 60 * 60 * 1000)
//                           ),
//                           price_paid: settlement_amount,
//                           payment_status: "pending",
//                           payment_history: [
//                               { status: "pending", timestamp: nowISOString },
//                               { status: "processing", timestamp: null },
//                               { status: "completed", timestamp: null },
//                           ],
//                       }

//             // alert(JSON.stringify(paymentPayload))

//             const paymentRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/payments`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(paymentPayload),
//                 }
//             )
//             if (!paymentRes.ok) throw new Error("결제 정보 생성 실패")

//             // 3. 템플릿 전송
//             const templateCode = type === "refund" ? "J" : "K"

//             const templateParams: Record<string, string> = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.reserver_name,
//                 order_id: orderData.order_id,
//                 deposit_price: Number(
//                     orderData.deposit_price ?? "0"
//                 ).toLocaleString(),
//                 additional_price: Number(
//                     additional_price ?? "0"
//                 ).toLocaleString(),
//                 settlement_breakdown: String(settlement_breakdown ?? ""),
//                 settlement_amount: Number(
//                     settlement_amount ?? "0"
//                 ).toLocaleString(),
//             }

//             if (type === "additional") {
//                 templateParams.settlement_url = settlement_url
//             }

//             await sendKakaov2(
//                 orderData.reserver_contact,
//                 templateCode,
//                 templateParams
//             )
//             await sendEmailv2(
//                 orderData.reserver_email,
//                 templateCode,
//                 templateParams
//             )

//             alert("정산 처리가 완료되었습니다.")
//         } catch (err) {
//             console.error(err)
//             alert("정산 처리 중 오류가 발생했습니다.")
//         }
//     }
//     //////////////////////////////////////////////////////////////////

//     //////////////////////////////////////////////////////////////////
//     // 숙박 완료 로직 ///////////////////////////////////////////////////
//     const handleComplete = async (
//         orderId: string,
//         type: "refund" | "additional" | "complete",
//         settlementInfo?: {
//             additional_price: number
//             settlement_amount: number
//             settlement_breakdown: string
//         }
//     ) => {
//         try {
//             const now = getKSTDate()
//             const nowISOString = getKSTISOString(now)

//             const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
//             const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
//                 now.getMinutes()
//             ).padStart(2, "0")}`
//             const randStr = generateRandomString(6)

//             const settlementId = `S-${dateStr}-${timeStr}-${randStr}`

//             const orderRes = await fetch(
//                 `https://terene-db-server.onrender.com/api/v2/orders/${orderId}`
//             )
//             if (!orderRes.ok) throw new Error("예약 정보를 불러올 수 없습니다.")
//             const orderData = await orderRes.json()

//             if (type === "refund" || type === "additional") {
//                 const paymentsRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments`
//                 )
//                 const settlementsRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/settlements`
//                 )
//                 const [payments, settlements] = await Promise.all([
//                     paymentsRes.json(),
//                     settlementsRes.json(),
//                 ])

//                 const targetPayment = payments.find(
//                     (p: any) =>
//                         p.order_id === orderId &&
//                         p.payment_type === "settlement"
//                 )
//                 const targetSettlement = settlements.find(
//                     (s: any) =>
//                         s.order_id === orderId &&
//                         s.settlement_type ===
//                             (type === "refund"
//                                 ? "deposit_refund"
//                                 : "additional_payment")
//                 )

//                 if (!targetPayment || !targetSettlement)
//                     throw new Error("정산 또는 결제 정보를 찾을 수 없습니다.")

//                 const updatedPayment = {
//                     ...targetPayment,
//                     payment_status: "completed",
//                     payment_history: [
//                         {
//                             status: "pending",
//                             timestamp:
//                                 targetPayment.payment_history?.find(
//                                     (h: any) => h.status === "pending"
//                                 )?.timestamp || nowISOString,
//                         },
//                         {
//                             status: "processing",
//                             timestamp: nowISOString,
//                         },
//                         { status: "completed", timestamp: nowISOString },
//                     ],
//                 }

//                 const updatedSettlement = {
//                     ...targetSettlement,
//                     settlement_status: "completed",
//                     settlement_history: [
//                         {
//                             status: "pending",
//                             timestamp:
//                                 targetSettlement.settlement_history?.find(
//                                     (h: any) => h.status === "pending"
//                                 )?.timestamp || nowISOString,
//                         },
//                         {
//                             status: "processing",
//                             timestamp: nowISOString,
//                         },
//                         { status: "completed", timestamp: nowISOString },
//                     ],
//                 }

//                 await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/payments/${updatedPayment.payment_id}`,
//                     {
//                         method: "PUT",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(updatedPayment),
//                     }
//                 )

//                 await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/settlements/${updatedSettlement.settlement_id}`,
//                     {
//                         method: "PUT",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(updatedSettlement),
//                     }
//                 )
//             } else if (type === "complete") {
//                 if (!settlementInfo) throw new Error("정산 정보가 필요합니다.")

//                 const { additional_price, settlement_breakdown } =
//                     settlementInfo

//                 const settlementPayload = {
//                     settlement_id: settlementId,
//                     settlement_type: "others",
//                     order_id: orderId,
//                     additional_price,
//                     settlement_amount: 0,
//                     settlement_breakdown,
//                     settlement_status: "completed",
//                     settlement_url: null,
//                     settlement_history: [
//                         { status: "pending", timestamp: nowISOString },
//                         { status: "processing", timestamp: nowISOString },
//                         { status: "completed", timestamp: nowISOString },
//                     ],
//                 }

//                 const settlementRes = await fetch(
//                     `https://terene-db-server.onrender.com/api/v2/settlements`,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify(settlementPayload),
//                     }
//                 )

//                 if (!settlementRes.ok) throw new Error("정산 정보 생성 실패")
//             }

//             // ✅ 템플릿 전송 - L 코드 사용
//             const templateParams = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.reserver_name,
//                 order_id: orderData.order_id,
//             }

//             const templateParamsB = {
//                 stay_location: `${orderData.stay_location}`,
//                 reserver_name: orderData.stay_info.name,
//                 order_id: orderData.order_id,
//             }

//             for (const adminPhone of ADMIN_PHONES) {
//                 await sendKakaov2(adminPhone, "L", templateParamsB)
//             }

//             alert("정산 완료 처리되었습니다.")
//         } catch (err) {
//             console.error(err)
//             alert("정산 완료 처리 중 오류가 발생했습니다.")
//         }
//     }
//     //////////////////////////////////////////////////////////////////

//     return {
//         sortedRows, // ✅ 추가
//         itemsPerPage, // ✅ 추가
//         currentPage,
//         prevPage,
//         nextPage,
//         updateOrder,
//         setFilters,
//         toggleSort,
//         sortConfig,
//         handleCancel,
//         handleRefund,
//         handleSettlement,
//         handleComplete,
//         onDeclineCustomer,
//         onCancelCustomer,
//     }
// }
