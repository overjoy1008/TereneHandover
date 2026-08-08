
import { useEffect, useMemo, useState } from "react"
import { postQueue } from "../../Api/notifier.ts"
import { request } from "../../Api/client.ts"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function getKSTISOString(date = new Date()) {
    const kstDate = getKSTDate(date)
    const z = (n: number) => String(n).padStart(2, "0")
    return `${kstDate.getFullYear()}-${z(kstDate.getMonth() + 1)}-${z(kstDate.getDate())}T${z(kstDate.getHours())}:${z(kstDate.getMinutes())}:${z(kstDate.getSeconds())}+09:00`
}

export function getDiffDaysKST(
    checkinDateStr: string,
    baseDateStr?: string
): number {
    const baseUTC = baseDateStr ? new Date(baseDateStr) : new Date()
    const kstBase = new Date(baseUTC.getTime() + 9 * 60 * 60 * 1000)

    const checkinUTC = new Date(checkinDateStr)
    const kstCheckin = new Date(checkinUTC.getTime() + 9 * 60 * 60 * 1000)

    const msPerDay = 1000 * 60 * 60 * 24
    return Math.floor((kstCheckin.getTime() - kstBase.getTime()) / msPerDay)
}

function generateRandomString(length: number) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++)
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    return result
}

export function OrdersTableLogic() {
    const [rows, setRows] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const [filters, setFilters] = useState<{
        tab?: "예약" | "완료" | "취소"
        branch?: string
        membership_number?: string
        query?: string
    }>({})
    const [sortConfig, setSortConfig] = useState<{
        key: string
        direction: "asc" | "desc"
    } | null>(null)

    const toggleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key)
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                }
            return { key, direction: "asc" }
        })
    }

    const getLatestTimestamp = (history: any[], status?: string) => {
        if (!history || !Array.isArray(history)) return ""
        const filtered = status
            ? history.filter((h) => h.status === status)
            : history
        if (filtered.length === 0) return ""
        return filtered.reduce((latest, curr) =>
            new Date(curr.timestamp) > new Date(latest.timestamp)
                ? curr
                : latest
        ).timestamp
    }

    function getReservationTagAndTimestamp(data: any): {
        label: string
        timestamp: string
    } {
        const cancellation = data._cancellations?.[0]
        const settlement = data._settlements?.[0]
        const { reservation_status, stay_status } = data
        const cancel_type = cancellation?.cancel_type
        const cancel_status = cancellation?.cancel_status
        const settlement_type = settlement?.settlement_type
        const settlement_status = settlement?.settlement_status

        let label = "-"
        let timestamp = ""

        if (cancel_type === "unpaid_cancel") {
            label = "취소 완료"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (
            cancel_type === "paid_cancel" &&
            (cancel_status === "pending" || cancel_status === "processing")
        ) {
            label = "예약 취소 신청"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (
            cancel_type === "paid_cancel" &&
            cancel_status === "completed"
        ) {
            label = "취소 처리 완료"
            timestamp = getLatestTimestamp(cancellation?.cancel_history)
        } else if (reservation_status === "pending" && !cancellation) {
            label = "예약 대기"
            timestamp = getLatestTimestamp(data.reservation_history, "pending")
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "before_checkin"
        ) {
            label = "예약 확정"
            timestamp = getLatestTimestamp(
                data.reservation_history,
                "confirmed"
            )
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "checked_in"
        ) {
            label = "체크인 중"
            timestamp = getLatestTimestamp(data.stay_history, "checked_in")
        } else if (
            reservation_status === "confirmed" &&
            !cancellation &&
            !settlement &&
            stay_status === "checked_out"
        ) {
            label = "체크아웃 완료"
            timestamp = getLatestTimestamp(data.stay_history, "checked_out")
        } else if (
            reservation_status === "confirmed" &&
            settlement_type === "deposit_refund" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "보증금 환불 진행중"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            reservation_status === "confirmed" &&
            settlement_type === "additional_payment" &&
            (settlement_status === "pending" ||
                settlement_status === "processing")
        ) {
            label = "추가 결제 대기"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        } else if (
            reservation_status === "confirmed" &&
            settlement_status === "completed"
        ) {
            label = "숙박 완료"
            timestamp = getLatestTimestamp(settlement?.settlement_history)
        }
        return { label, timestamp }
    }

    const reservationTagOrder: Record<string, number> = {
        "예약 대기": 1,
        "예약 확정": 2,
        "체크인 중": 3,
        "체크아웃 완료": 4,
        "보증금 환불 진행중": 5,
        "추가 결제 대기": 6,
        "숙박 완료": 7,
        "예약 취소 신청": 8,
        "취소 완료": 9,
        "취소 처리 완료": 10,
        "-": 99,
    }

    const fetchAll = async () => {
        try {
            const [orders, payments, cancellations, refunds, settlements] =
                await Promise.all([
                    request("db", "/api/v2/orders").then((r) => r.json()),
                    request("db", "/api/v2/payments").then((r) => r.json()),
                    request("db", "/api/v2/cancellations").then((r) =>
                        r.json()
                    ),
                    request("db", "/api/v2/refunds").then((r) => r.json()),
                    request("db", "/api/v2/settlements").then((r) => r.json()),
                ])

            const byOrderId = (arr: any[], key: string) =>
                arr.reduce(
                    (acc, item) => {
                        const id = item[key]
                        if (!acc[id]) acc[id] = []
                        acc[id].push(item)
                        return acc
                    },
                    {} as Record<string, any[]>
                )

            const paymentsMap = byOrderId(payments, "order_id")
            const cancellationsMap = byOrderId(cancellations, "order_id")
            const refundsMap = byOrderId(refunds, "order_id")
            const settlementsMap = byOrderId(settlements, "order_id")

            const visibleOrders = orders.filter((order: any) => !order.hidden)

            const merged = visibleOrders.map((order: any) => {
                const full = {
                    ...order,
                    _payments: paymentsMap[order.order_id] || [],
                    _cancellations: cancellationsMap[order.order_id] || [],
                    _refunds: refundsMap[order.order_id] || [],
                    _settlements: settlementsMap[order.order_id] || [],
                }
                const { label, timestamp } = getReservationTagAndTimestamp(full)
                return {
                    ...full,
                    reservation_status_tag: label,
                    reservation_status_timestamp: timestamp,
                }
            })

            setRows(merged)
        } catch {}
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const { tab, branch, membership_number, query } = filters

            const tabMatch = (() => {
                if (tab === "취소")
                    return (
                        (row._cancellations?.length ?? 0) > 0 ||
                        (row._refunds?.length ?? 0) > 0
                    )
                if (tab === "완료")
                    return row.reservation_status_tag === "숙박 완료"
                const isCanceled =
                    (row._cancellations?.length ?? 0) > 0 ||
                    (row._refunds?.length ?? 0) > 0
                const isCompleted = row.reservation_status_tag === "숙박 완료"
                return !isCanceled && !isCompleted
            })()

            const branchMatch = branch
                ? row.stay_location
                      ?.toLowerCase()
                      .includes(branch.toLowerCase())
                : true
            const memberMatch = membership_number
                ? row.membership_number === membership_number
                : true

            const queryMatch = (() => {
                if (!query || !query.trim()) return true
                const TAG_DETECTORS: Array<{
                    label: string
                    test: (r: any) => boolean
                }> = [
                    {
                        label: "예약 대기",
                        test: (r) =>
                            r.reservation_status_tag === "예약 대기" &&
                            r.reserved_by_vaadd,
                    },
                    {
                        label: "미결제 상태",
                        test: (r) =>
                            r.reservation_status_tag === "예약 대기" &&
                            !r.reserved_by_vaadd,
                    },
                    {
                        label: "예약 확정",
                        test: (r) => r.reservation_status_tag === "예약 확정",
                    },
                    {
                        label: "체크인 중",
                        test: (r) => r.reservation_status_tag === "체크인 중",
                    },
                    {
                        label: "체크아웃 완료",
                        test: (r) =>
                            r.reservation_status_tag === "체크아웃 완료",
                    },
                    {
                        label: "보증금 환불 진행중",
                        test: (r) =>
                            r.reservation_status_tag === "보증금 환불 진행중",
                    },
                    {
                        label: "추가 결제 대기",
                        test: (r) =>
                            r.reservation_status_tag === "추가 결제 대기",
                    },
                    {
                        label: "숙박 완료",
                        test: (r) => r.reservation_status_tag === "숙박 완료",
                    },
                    {
                        label: "예약 취소 신청",
                        test: (r) =>
                            r.reservation_status_tag === "예약 취소 신청",
                    },
                    {
                        label: "취소 완료",
                        test: (r) => r.reservation_status_tag === "취소 완료",
                    },
                    {
                        label: "취소 처리 완료",
                        test: (r) =>
                            r.reservation_status_tag === "취소 처리 완료",
                    },
                ]
                let raw = query
                const rawNoSpace = raw.replace(/\s/g, "")
                const activeTagPredicates: Array<(row: any) => boolean> = []
                for (const tag of TAG_DETECTORS) {
                    const labelNoSpace = tag.label.replace(/\s/g, "")
                    if (rawNoSpace.includes(labelNoSpace)) {
                        activeTagPredicates.push(tag.test)
                        raw = raw.split(tag.label).join(" ")
                    }
                }
                const normalize = (str: string) =>
                    str.toLowerCase().replace(/[-.,\s]/g, "")
                const queryList = raw
                    .split(/,\s+/)
                    .map((q) => normalize(q))
                    .filter((q) => q.length > 0)
                const blob = normalize(JSON.stringify(row))
                const tokenOk = queryList.every((q) => blob.includes(q))
                const tagsOk = activeTagPredicates.every((fn) => fn(row))
                return tokenOk && tagsOk
            })()

            return tabMatch && branchMatch && memberMatch && queryMatch
        })
    }, [rows, filters])

    const sortedRows = useMemo(() => {
        const sorted = [...filteredRows]
        if (sortConfig?.key) {
            sorted.sort((a, b) => {
                let aValue: any, bValue: any
                switch (sortConfig.key) {
                    case "checkin_date":
                        aValue = new Date(a.checkin_date).getTime()
                        bValue = new Date(b.checkin_date).getTime()
                        break
                    case "reserver_name":
                        aValue = a.reserver_name?.toLowerCase() ?? ""
                        bValue = b.reserver_name?.toLowerCase() ?? ""
                        break
                    case "stay_info.name":
                        aValue = a.stay_info?.name?.toLowerCase() ?? ""
                        bValue = b.stay_info?.name?.toLowerCase() ?? ""
                        break
                    case "final_price":
                        aValue = Number(a.final_price) || 0
                        bValue = Number(b.final_price) || 0
                        break
                    case "reservation_status_tag":
                        const aOrder =
                            reservationTagOrder[a.reservation_status_tag] ?? 99
                        const bOrder =
                            reservationTagOrder[b.reservation_status_tag] ?? 99
                        if (aOrder !== bOrder)
                            return sortConfig.direction === "asc"
                                ? aOrder - bOrder
                                : bOrder - aOrder
                        const aTime = new Date(
                            a.reservation_status_timestamp || 0
                        ).getTime()
                        const bTime = new Date(
                            b.reservation_status_timestamp || 0
                        ).getTime()
                        return sortConfig.direction === "asc"
                            ? aTime - bTime
                            : bTime - aTime
                    default:
                        return 0
                }
                if (aValue < bValue)
                    return sortConfig.direction === "asc" ? -1 : 1
                if (aValue > bValue)
                    return sortConfig.direction === "asc" ? 1 : -1
                return 0
            })
        } else {
            sorted.sort((a, b) => {
                const getCurrentStatusTime = (order: any) =>
                    new Date(
                        order.reservation_history?.find(
                            (h: any) => h.status === order.reservation_status
                        )?.timestamp || 0
                    ).getTime()
                const aTime = getCurrentStatusTime(a)
                const bTime = getCurrentStatusTime(b)
                return bTime - aTime
            })
        }
        return sorted
    }, [filteredRows, sortConfig])

    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(sortedRows.length / itemsPerPage)),
        [sortedRows]
    )
    const paginatedRows = useMemo(
        () =>
            sortedRows.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ),
        [sortedRows, currentPage]
    )

    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
    const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

    const updateOrder = async (orderId: string, status: string) => {
        const now = getKSTISOString()
        let order = rows.find((o) => o.order_id === orderId)
        if (!order) {
            const fetched = await request(
                "db",
                `/api/v2/orders/${encodeURIComponent(orderId)}`
            )
            if (!fetched.ok) {
                throw new Error(
                    `Order ${orderId} not found (${fetched.status})`
                )
            }
            order = await fetched.json()
            if (!order || order.order_id == null) {
                throw new Error(`Order ${orderId} not found`)
            }
        }

        const existingHistory = Array.isArray(order.reservation_history)
            ? order.reservation_history
            : []
        let reservation_history
        if (status === "confirmed") {
            const hasConfirmed = existingHistory.some(
                (e: any) => e?.status === "confirmed"
            )
            reservation_history = hasConfirmed
                ? existingHistory.map((e: any) =>
                      e?.status === "confirmed"
                          ? { ...e, status: "confirmed", timestamp: now }
                          : e
                  )
                : [...existingHistory, { status: "confirmed", timestamp: now }]
        } else {
            reservation_history = [
                ...existingHistory,
                { status, timestamp: now },
            ]
        }

        const payload = {
            order_id: orderId,
            old_order_id: order.old_order_id,
            membership_number: order.membership_number,
            reserver_name: order.reserver_name,
            reserver_birthdate: order.reserver_birthdate,
            reserver_contact: order.reserver_contact,
            reserver_email: order.reserver_email,
            stay_info: order.stay_info,
            stay_people: order.stay_people,
            stay_location: order.stay_location,
            checkin_date: order.checkin_date,
            checkout_date: order.checkout_date,
            stay_details: order.stay_details,
            initial_price: order.initial_price,
            discounted_price: order.discounted_price,
            service_price: order.service_price,
            exchange_margin_price: order.exchange_margin_price,
            vat_price: order.vat_price,
            deposit_price: order.deposit_price,
            final_price: order.final_price,
            stay_status: order.stay_status,
            stay_history: order.stay_history,
            reservation_status: status,
            reservation_history,
            reserved_by_vaadd: order.reserved_by_vaadd,
            hidden: order.hidden,
            payment: order.payment,
            nationality: order.nationality,
        }

        const res = await request(
            "db",
            `/api/v2/orders/${encodeURIComponent(orderId)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        )
        if (res.ok)
            setRows((prev) =>
                prev.map((o) =>
                    o.order_id === orderId ? { ...o, ...payload } : o
                )
            )
    }

    const handleCancel = async (
        orderId: string,
        type: "decline" | "cancel",
        lang: string
    ) => {
        const r = await request(
            "gateway",
            `/api/admin/reservations/${encodeURIComponent(orderId)}/cancel`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cancelMode: type,
                    testMode: false,
                    lang,
                }),
                auth: true,
            }
        )
        if (!r.ok) return alert(await r.text())
        alert("취소 요청이 접수되었습니다.")
    }

    const handleCancelCustomer = async (
        orderId: string,
        type: "decline" | "cancel",
        lang: string
    ) => {
        const r = await postQueue("CD", {
            orderId,
            actor: "customer",
            cancelMode: type,
            testMode: false,
            lang,
        })
        if (!r.ok) return alert(await r.text())
        alert("고객 취소 요청이 접수되었습니다.")
    }

    const onDeclineCustomer = async (orderId: string, lang: string) =>
        handleCancelCustomer(orderId, "decline", lang)
    const onCancelCustomer = async (orderId: string, lang: string) =>
        handleCancelCustomer(orderId, "cancel", lang)

    async function handleRefund(orderId: string, lang: string) {
        const r = await postQueue("EF", {
            orderId,
            testMode: false,
            lang,
        })
        if (!r.ok) return alert(await r.text())
        alert("환불 처리가 접수되었습니다.")
    }

    const handleSettlement = async (
        orderId: string,
        type: "refund" | "additional",
        settlementInfo: {
            additional_price: number
            settlement_amount: number
            settlement_breakdown: string
        },
        settlement_url: string,
        lang: string
    ) => {
        const r = await postQueue("JK", {
            orderId,
            type,
            settlementInfo,
            settlement_url: settlement_url ?? null,
            testMode: false,
            lang,
        })
        if (!r.ok) return alert(await r.text())
        alert("정산 처리가 접수되었습니다.")
    }

    const handleComplete = async (
        orderId: string,
        type: "refund" | "additional" | "complete",
        settlementInfo?: {
            additional_price: number
            settlement_amount: number
            settlement_breakdown: string
        }
    ) => {
        const r = await postQueue("L", {
            orderId,
            type,
            settlementInfo: settlementInfo ?? null,
        })
        if (!r.ok) return alert(await r.text())
        alert("완료 처리가 접수되었습니다.")
    }

    const reload = () => {
        fetchAll()
    }

    return {
        sortedRows,
        itemsPerPage,
        currentPage,
        prevPage,
        nextPage,
        updateOrder,
        setFilters,
        toggleSort,
        sortConfig,
        handleCancel,
        handleRefund,
        handleSettlement,
        handleComplete,
        onDeclineCustomer,
        onCancelCustomer,
        reload,
    }
}
