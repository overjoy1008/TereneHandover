// ManagementTableLogic.tsx
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { getReservationDays } from "../../Api/reservations.ts"

const V3_BASE = "https://terene-db-server.onrender.com/api/v3"
const V2_BASE = "https://terene-db-server.onrender.com/api/v2"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function z2(n: number) {
    return String(n).padStart(2, "0")
}

function fmtYMD(d: Date) {
    return `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`
}

function parseYMD(s: string) {
    const [y, m, d] = s.split("-").map((v) => Number(v))
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
}

function diffNights(checkinYMD?: string, checkoutYMD?: string) {
    if (!checkinYMD || !checkoutYMD) return ""
    const a = parseYMD(checkinYMD).getTime()
    const b = parseYMD(checkoutYMD).getTime()
    const ms = 24 * 60 * 60 * 1000
    const n = Math.max(0, Math.round((b - a) / ms))
    return n ? `${n}박` : ""
}

function makeMonthRangesKST(todayKST = getKSTDate()) {
    const out: Array<{
        id: string
        start: string
        end: string
        label: string
    }> = []
    for (let i = 0; i < 12; i++) {
        const end = new Date(todayKST)
        end.setDate(end.getDate() - i * 30)
        const start = new Date(end)
        start.setDate(start.getDate() - 29)
        const startYMD = fmtYMD(start)
        const endYMD = fmtYMD(end)
        out.push({
            id: `${startYMD}__${endYMD}`,
            start: startYMD,
            end: endYMD,
            label: `${startYMD} ~ ${endYMD}`,
        })
    }
    return out
}

type DayRow = {
    date_id: string
    date: string
    location: string
    category: string
    is_holiday: boolean
    checkin_occupied?: boolean | null
    checkin_order_id?: string | null
    checkout_occupied?: boolean | null
    checkout_order_id?: string | null
}

type Order = any
type Settlement = any
type Location = any

type DraftAttendanceSlot = { name: string; attend: boolean }
type DraftRow = {
    date_id: string
    date: string
    location: string
    category: string
    checkout: boolean
    checkin: boolean
    reserver: string
    membershipNumber: string
    people: string
    phone: string
    kind: string
    nights: string
    settlementFinal: number | null
    managers: [
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
    ]
    hqStaff: string
    _dirty?: boolean
}

function defaultManagersDummy(
    dateYMD: string
): [
    DraftAttendanceSlot,
    DraftAttendanceSlot,
    DraftAttendanceSlot,
    DraftAttendanceSlot,
] {
    const inDummy = dateYMD >= "2025-12-16" && dateYMD <= "2026-01-15"
    const base: [
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
    ] = [
        { name: inDummy ? "관리인 A" : "", attend: inDummy ? true : false },
        { name: inDummy ? "관리인 B" : "", attend: false },
        { name: inDummy ? "관리인 C" : "", attend: false },
        { name: inDummy ? "관리인 D" : "", attend: false },
    ]
    return base
}

function defaultHQDummy(dateYMD: string) {
    const inDummy = dateYMD >= "2025-12-16" && dateYMD <= "2026-01-15"
    return inDummy ? "본사 1, 본사 2" : ""
}

function encodeRemarks(
    managers: [
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
    ],
    hqStaff: string
): string[] {
    const arr: string[] = []
    managers.forEach((m, idx) => {
        const name = (m.name || "").trim()
        const v = m.attend ? "1" : "0"
        arr.push(`mgr${idx + 1}:${name}|${v}`)
    })
    arr.push(`hq:${(hqStaff || "").trim()}`)
    return arr
}

function decodeRemarks(remarks?: any): {
    managers?: [
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
        DraftAttendanceSlot,
    ]
    hqStaff?: string
} {
    const raw: string[] = Array.isArray(remarks)
        ? remarks.map((v) => String(v))
        : []
    const mgr: DraftAttendanceSlot[] = [
        { name: "", attend: false },
        { name: "", attend: false },
        { name: "", attend: false },
        { name: "", attend: false },
    ]
    let hq = ""
    for (const item of raw) {
        if (item.startsWith("mgr")) {
            const [left, right] = item.split(":")
            const n = Number(left.replace("mgr", ""))
            if (!n || n < 1 || n > 4) continue
            const [name, flag] = (right || "").split("|")
            mgr[n - 1] = {
                name: (name || "").trim(),
                attend: (flag || "").trim() === "1",
            }
        }
        if (item.startsWith("hq:")) {
            hq = item.slice(3).trim()
        }
    }
    return {
        managers: mgr as any,
        hqStaff: hq,
    }
}

function computeSettlementFinal(order: any, settlement: any) {
    const finalPrice = Number(order?.final_price || 0)
    if (!settlement) return finalPrice
    const type = settlement?.settlement_type
    const amt = Number(settlement?.settlement_amount || 0)
    if (type === "deposit_refund") return finalPrice - amt
    if (type === "additional_payment") return finalPrice + amt
    return finalPrice
}

async function safeJson(r: Response) {
    try {
        return await r.json()
    } catch {
        return null
    }
}

export function ManagementsTableLogic() {
    const [locations, setLocations] = useState<Location[]>([])
    const [rowsAll, setRowsAll] = useState<DraftRow[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const [filters, setFilters] = useState<{
        location?: string
        monthRange?: string
    }>({})
    const monthRanges = useMemo(() => makeMonthRangesKST(), [])

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const draftsRef = useRef<Record<string, DraftRow>>({})

    const loadLocations = async () => {
        const r = await fetch(`${V3_BASE}/locations`)
        const data = (await safeJson(r)) || []
        setLocations(Array.isArray(data) ? data : [])
    }

    const load = async (location: string, start: string, end: string) => {
        if (!location || !start || !end) {
            setRowsAll([])
            return
        }
        setIsLoading(true)
        setError("")
        try {
            const [daysRes, mgmtRes, ordersRes, settlementsRes] =
                await Promise.all([
                    getReservationDays(),
                    fetch(`${V3_BASE}/managements`),
                    fetch(`${V2_BASE}/orders`),
                    fetch(`${V2_BASE}/settlements`),
                ])

            const daysRaw = (await safeJson(daysRes)) || []
            const mgmtRaw = (await safeJson(mgmtRes)) || []
            const ordersRaw = (await safeJson(ordersRes)) || []
            const settlementsRaw = (await safeJson(settlementsRes)) || []

            const days: DayRow[] = Array.isArray(daysRaw) ? daysRaw : []
            const managements: any[] = Array.isArray(mgmtRaw) ? mgmtRaw : []
            const orders: Order[] = Array.isArray(ordersRaw) ? ordersRaw : []
            const settlements: Settlement[] = Array.isArray(settlementsRaw)
                ? settlementsRaw
                : []

            const mgmtMap = managements.reduce(
                (acc, m) => {
                    const key = `${String(m.date)}__${String(m.location)}`
                    acc[key] = m
                    return acc
                },
                {} as Record<string, any>
            )

            const orderMap = orders.reduce(
                (acc, o) => {
                    acc[String(o.order_id)] = o
                    return acc
                },
                {} as Record<string, any>
            )

            const settlementMap = settlements.reduce(
                (acc, s) => {
                    const orderId = String(s.order_id)
                    if (!acc[orderId]) acc[orderId] = []
                    acc[orderId].push(s)
                    return acc
                },
                {} as Record<string, any[]>
            )

            const filteredDays = days
                .filter((d) => String(d.location) === String(location))
                .filter((d) => {
                    const ymd = String(d.date)
                    return ymd >= start && ymd <= end
                })
                .sort((a, b) => String(a.date).localeCompare(String(b.date)))

            const nextRows: DraftRow[] = filteredDays.map((d) => {
                const dateYMD = String(d.date)
                const mgmt = mgmtMap[`${dateYMD}__${location}`]
                const decoded = mgmt
                    ? decodeRemarks(mgmt.attendace_remarks)
                    : {}
                const managers =
                    decoded.managers || defaultManagersDummy(dateYMD)
                const hqStaff =
                    (decoded.hqStaff ?? defaultHQDummy(dateYMD)) || ""

                const checkout = Boolean(d.checkout_occupied)
                const checkin = Boolean(d.checkin_occupied)

                let reserver = ""
                let people = ""
                let phone = ""
                let kind = ""
                let membershipNumber = ""
                let nights = ""
                let settlementFinal: number | null = null

                if (checkin && d.checkin_order_id) {
                    const o = orderMap[String(d.checkin_order_id)]
                    const ss = settlementMap[String(d.checkin_order_id)] || []
                    const s0 = ss[0] || null

                    reserver = String(
                        o?.reserver_name || o?.stay_info?.name || ""
                    )
                    const adult = o?.stay_people?.adult ?? ""
                    const child = o?.stay_people?.child ?? ""
                    const teen = o?.stay_people?.teenager ?? ""
                    const parts: string[] = []
                    if (adult !== "" && adult !== null && adult !== undefined)
                        parts.push(`일반 ${adult}`)
                    if (child !== "" && child !== null && child !== undefined)
                        parts.push(`유아 ${child}`)
                    people = parts.join(", ")

                    phone = String(
                        o?.reserver_contact || o?.stay_info?.contact || ""
                    )
                    kind = String(d.category || "")
                    membershipNumber =
                        o?.membership_number === "vaadd"
                            ? "관리자"
                            : String(o?.membership_number || "비회원")
                    nights = diffNights(o?.checkin_date, o?.checkout_date)
                    settlementFinal = computeSettlementFinal(o, s0)
                } else {
                    kind = String(d.category || "")
                }

                const base: DraftRow = {
                    date_id: String(d.date_id),
                    date: dateYMD,
                    location: String(location),
                    category: String(d.category || ""),
                    checkout,
                    checkin,
                    reserver,
                    people,
                    phone,
                    kind,
                    membershipNumber,
                    nights,
                    settlementFinal,
                    managers: managers as any,
                    hqStaff,
                    _dirty: false,
                }

                const existingDraft = draftsRef.current[base.date_id]
                return existingDraft ? { ...base, ...existingDraft } : base
            })

            draftsRef.current = nextRows.reduce(
                (acc, r) => {
                    acc[r.date_id] = r
                    return acc
                },
                {} as Record<string, DraftRow>
            )

            setRowsAll(nextRows)
            setCurrentPage(1)
        } catch (e: any) {
            setError(e?.message ?? String(e))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadLocations().catch(() => {})
    }, [])

    useEffect(() => {
        const loc = (filters.location || "").trim()
        const rangeId = (filters.monthRange || "").trim()
        const found = monthRanges.find((r) => r.id === rangeId)
        if (!loc || !found) {
            setRowsAll([])
            return
        }
        load(loc, found.start, found.end).catch(() => {})
    }, [filters.location, filters.monthRange])

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(rowsAll.length / itemsPerPage))
    }, [rowsAll.length])

    const paginated = useMemo(() => {
        return rowsAll.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [rowsAll, currentPage])

    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
    const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

    const updateRowDraft = (dateId: string, patch: Partial<DraftRow>) => {
        setRowsAll((prev) =>
            prev.map((r) => {
                if (r.date_id !== dateId) return r
                const next = { ...r, ...patch, _dirty: true }
                draftsRef.current[dateId] = next
                return next
            })
        )
    }

    const saveRow = async (dateId: string) => {
        const row = draftsRef.current[dateId]
        if (!row) return
        const payload = {
            date: row.date,
            location: row.location,
            sefi_price:
                typeof row.settlementFinal === "number"
                    ? row.settlementFinal
                    : null,
            attendace_remarks: encodeRemarks(row.managers, row.hqStaff),
        }

        setIsLoading(true)
        setError("")
        try {
            const r = await fetch(`${V3_BASE}/managements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!r.ok) {
                const t = await r.text().catch(() => "")
                throw new Error(t || `HTTP ${r.status}`)
            }
            setRowsAll((prev) =>
                prev.map((x) =>
                    x.date_id === dateId ? { ...x, _dirty: false } : x
                )
            )
            draftsRef.current[dateId] = { ...row, _dirty: false }
        } catch (e: any) {
            setError(e?.message ?? String(e))
        } finally {
            setIsLoading(false)
        }
    }

    const saveAll = async () => {
        const dirty = Object.values(draftsRef.current).filter((r) => r._dirty)
        if (dirty.length === 0) return

        setIsLoading(true)
        setError("")
        try {
            for (const row of dirty) {
                const payload = {
                    date: row.date,
                    location: row.location,
                    sefi_price:
                        typeof row.settlementFinal === "number"
                            ? row.settlementFinal
                            : null,
                    attendace_remarks: encodeRemarks(row.managers, row.hqStaff),
                }
                const r = await fetch(`${V3_BASE}/managements`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!r.ok) {
                    const t = await r.text().catch(() => "")
                    throw new Error(t || `HTTP ${r.status}`)
                }
                draftsRef.current[row.date_id] = { ...row, _dirty: false }
            }
            setRowsAll((prev) => prev.map((r) => ({ ...r, _dirty: false })))
        } catch (e: any) {
            setError(e?.message ?? String(e))
        } finally {
            setIsLoading(false)
        }
    }

    const reload = async () => {
        const loc = (filters.location || "").trim()
        const rangeId = (filters.monthRange || "").trim()
        const found = monthRanges.find((r) => r.id === rangeId)
        if (!loc || !found) return
        await load(loc, found.start, found.end)
    }

    return {
        rows: paginated,
        locations,
        monthRanges,
        isLoading,
        error,
        itemsPerPage,
        currentPage,
        totalPages,
        prevPage,
        nextPage,
        setFilters,
        updateRowDraft,
        saveRow,
        saveAll,
        reload,
    }
}
