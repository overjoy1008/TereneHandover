
// useTableLogic.ts
import { useState, useEffect, useMemo } from "react"
import { fieldsByVariant } from "./fieldsByVariant.ts"
import { formatDate, parseDate } from "../Utils/DateUtils.tsx"
import { createReservationMessage } from "../Notifier/messages.ts"
import { sendSMS, sendEmail } from "../Notifier/notify.ts"
import { ADMIN_PHONES, ADMIN_EMAILS } from "../Notifier/adminContacts.ts"
import { request } from "../Api/client.ts"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

const generateRandomID = (): string => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function useTableLogic(
    variant: string,
    itemsPerPage: number,
    parsedFields: any[],
    resetKey: number // 👈 추가된 파라미터
) {
    const apiBase =
        variant === "customers"
            ? `https://terene-db-server.onrender.com/api/v2/${variant}`
            : variant === "coupons"
              ? `https://terene-db-server.onrender.com/api/v2/coupon-definitions`
              : `https://terene-db-server.onrender.com/api/${variant}`

    const fields = fieldsByVariant[variant] || []
    const idKey = fields.find((field) => field.isPrimary)?.key || "id"
    const defaultSortKey = idKey

    const [rows, setRows] = useState<any[]>([])
    const [justAddedID, setJustAddedID] = useState<string | null>(null)
    const [editedIDs, setEditedIDs] = useState<Set<string>>(new Set())
    const [deletedIDs, setDeletedIDs] = useState<Set<string>>(new Set())
    const [updating, setUpdating] = useState(false)
    const [updated, setUpdated] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [customSortedIDs, setCustomSortedIDs] = useState<string[] | null>(
        null
    )

    const [sortConfig, setSortConfig] = useState<{
        key: string
        direction: "asc" | "desc" | null
        custom: boolean
    }>({
        key: defaultSortKey,
        direction: "asc",
        custom: false,
    })

    // ✅ Reload 및 variant 변경 시 데이터 초기화
    useEffect(() => {
        setRows([])
        setJustAddedID(null)
        setEditedIDs(new Set())
        setDeletedIDs(new Set())
        setCustomSortedIDs(null)
        setCurrentPage(1)
        setSortConfig({
            key: defaultSortKey,
            direction: "asc",
            custom: false,
        })

        const listPromise =
            variant === "coupons"
                ? request("db", "/api/v2/coupon-definitions")
                : fetch(apiBase)

        listPromise
            .then((res) => res.json())
            .then((data) => setRows(data))
            .catch((err) => console.error("Fetch error:", err))
    }, [variant, resetKey]) // 👈 resetKey 추가

    const toggleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev.key !== key)
                return { key, direction: "asc", custom: false }
            if (prev.direction === "asc")
                return { key, direction: "desc", custom: false }
            return { key: defaultSortKey, direction: "asc", custom: false }
        })
        setCustomSortedIDs(null)
    }

    const sortedRows = useMemo(() => {
        if (sortConfig.custom && customSortedIDs) {
            const rowMap = new Map(rows.map((r) => [r[idKey], r]))
            return customSortedIDs.map((id) => rowMap.get(id)).filter(Boolean)
        }

        // orders 전용 커스텀 정렬
        if (variant === "orders") {
            const statusPriority = {
                pending: 1,
                cancelled: 2,
                accepted: 3,
                refunded: 4,
            }

            const getTimelineKey = (status: string) => {
                switch (status) {
                    case "pending":
                        return "order_datetime"
                    case "cancelled":
                        return "cancellation_datetime"
                    case "accepted":
                        return "approval_datetime"
                    case "refunded":
                        return "refund_datetime"
                    default:
                        return "order_datetime"
                }
            }

            return [...rows].sort((a, b) => {
                const aStatus = a["payment_status"] || "pending"
                const bStatus = b["payment_status"] || "pending"

                const aPriority = statusPriority[aStatus] || 99
                const bPriority = statusPriority[bStatus] || 99

                if (aPriority !== bPriority) {
                    return aPriority - bPriority
                }

                const aTimeKey = getTimelineKey(aStatus)
                const bTimeKey = getTimelineKey(bStatus)

                const aTime = new Date(
                    a["payment_timeline"]?.[aTimeKey] || 0
                ).getTime()
                const bTime = new Date(
                    b["payment_timeline"]?.[bTimeKey] || 0
                ).getTime()

                return bTime - aTime
            })
        }

        // 기본 정렬
        if (!sortConfig.key || !sortConfig.direction) return rows

        return [...rows].sort((a, b) => {
            const aVal = a[sortConfig.key]
            const bVal = b[sortConfig.key]
            return aVal < bVal
                ? sortConfig.direction === "asc"
                    ? -1
                    : 1
                : aVal > bVal
                  ? sortConfig.direction === "asc"
                      ? 1
                      : -1
                  : 0
        })
    }, [rows, sortConfig, customSortedIDs])

    const totalPages = Math.ceil(sortedRows.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRows = sortedRows.slice(
        startIndex,
        startIndex + itemsPerPage
    )
    const emptySlots = itemsPerPage - paginatedRows.length

    const addElement = () => {
        const newRow = parsedFields.reduce((obj, field) => {
            obj[field.key] = ""
            return obj
        }, {} as any)

        let newID: string

        if (variant === "customers") {
            newID = "U-"
            newRow["membership_number"] = newID
        } else if (variant === "days") {
            const sortedDates = rows
                .map((r) => getKSTDate(new Date(r.date)))
                .filter((d) => !isNaN(d.getTime()))
                .sort((a, b) => a.getTime() - b.getTime())

            const lastDate = sortedDates.at(-1)
            const nextDate = new Date(
                lastDate
                    ? lastDate.getTime() + 86400000
                    : getKSTDate().getTime()
            )

            newID = nextDate.toISOString().slice(0, 10)
            newRow["date"] = newID
        } else if (variant === "coupons") {
            const existingIDs = new Set(rows.map((r) => r["id"]))
            do {
                newID = generateRandomID()
            } while (existingIDs.has(newID))
            newRow["id"] = newID
        }

        if (justAddedID) {
            setRows((prev) => prev.filter((r) => r[idKey] !== justAddedID))
        }

        const currentSorted =
            sortConfig.custom && customSortedIDs
                ? customSortedIDs
                : sortedRows.map((r) => r[idKey])

        const newSortedIDs = [
            newID,
            ...currentSorted.filter((id) => id !== justAddedID),
        ]

        setRows((prev) => [...prev, newRow])
        setJustAddedID(newID)
        setCustomSortedIDs(newSortedIDs)
        setSortConfig({ key: "", direction: null, custom: true })
        setCurrentPage(1)
    }

    const editElement = (prevID: string, updatedRow: any) => {
        const newID = updatedRow[idKey]

        const updatedRows = rows.map((row) =>
            row[idKey] === prevID ? updatedRow : row
        )
        setRows(updatedRows)

        setEditedIDs((prev) => {
            const next = new Set(prev)
            next.delete(prevID)
            next.add(newID)
            return next
        })

        if (prevID === justAddedID) {
            setJustAddedID(null)
        }

        setCustomSortedIDs((prev) =>
            prev ? prev.map((id) => (id === prevID ? newID : id)) : null
        )

        setSortConfig({ key: "", direction: null, custom: true })
    }

    const deleteElement = (id: string) => {
        setRows((prev) => prev.filter((r) => r[idKey] !== id))
        setCustomSortedIDs((prev) => prev?.filter((x) => x !== id) || null)

        if (id === justAddedID) {
            setJustAddedID(null)
        } else {
            setDeletedIDs((prev) => new Set(prev).add(id))
        }

        const newTotalPages = Math.ceil((rows.length - 1) / itemsPerPage)
        if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, newTotalPages))
        }
    }

    // const updateBackend = async (targetIDs?: string[]) => {
    //     setUpdating(true)
    //     setUpdated(false)
    //     setUpdateError(null)

    //     try {
    //         for (const row of rows) {
    //             const id = row[idKey]
    //             const shouldUpdate =
    //                 targetIDs?.includes(id) || (!targetIDs && editedIDs.has(id))

    //             if (!shouldUpdate) continue

    //             for (const field of parsedFields) {
    //                 if (field.notNull) {
    //                     const value = row[field.key]
    //                     const isEmpty =
    //                         value === null ||
    //                         value === undefined ||
    //                         (typeof value === "string" && value.trim() === "")
    //                     if (isEmpty) {
    //                         throw new Error(
    //                             `필수 입력 누락: '${field.key}' (ID: ${id})`
    //                         )
    //                     }
    //                 }
    //             }

    //             const response = await fetch(`${apiBase}/${id}`, {
    //                 method: "PUT",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify(row),
    //             })

    //             if (!response.ok) {
    //                 const errorText = await response.text()
    //                 throw new Error(`HTTP ${response.status} - ${errorText}`)
    //             }
    //         }

    //         for (const id of deletedIDs) {
    //             await fetch(`${apiBase}/${id}`, { method: "DELETE" })
    //         }

    //         setEditedIDs(new Set())
    //         setDeletedIDs(new Set())
    //         setUpdated(true)
    //     } catch (error) {
    //         setUpdateError(error.message)
    //         console.error(error.message)
    //         alert(`${error.message}`)
    //     } finally {
    //         setUpdating(false)
    //         setTimeout(() => {
    //             setUpdated(false)
    //             setUpdateError(null)
    //         }, 5000)
    //     }
    // }

    const updateBackend = async (targetIDs?: string[]) => {
        setUpdating(true)
        setUpdated(false)
        setUpdateError(null)

        try {
            for (const row of rows) {
                const id = row[idKey]
                const shouldUpdate =
                    targetIDs?.includes(id) || (!targetIDs && editedIDs.has(id))

                if (!shouldUpdate) continue

                for (const field of parsedFields) {
                    if (field.notNull) {
                        const value = row[field.key]
                        const isEmpty =
                            value === null ||
                            value === undefined ||
                            (typeof value === "string" && value.trim() === "")
                        if (isEmpty) {
                            throw new Error(
                                `필수 입력 누락: '${field.key}' (ID: ${id})`
                            )
                        }
                    }
                }

                // ✅ 먼저 customer PUT 요청
                const response = await fetch(`${apiBase}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row),
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`HTTP ${response.status} - ${errorText}`)
                }

                // ✅ customers PUT 성공 직후에 실행되는 "쿠폰 정리 + 발급" 블록 (PHASE1는 정리만, 발급 X)
                if (variant === "customers") {
                    const grade: string | undefined = row.membership_grade
                    const phaseIs1 = row.phase === "Phase-1"

                    // 등급별 기본 발급 패키지 (발급에만 사용)
                    const COUPON_PACKAGE: Record<
                        string,
                        Array<{ defId: string; count: number }>
                    > = {
                        "TERENE 6": [
                            { defId: "CD-250717-0300-06wd0000", count: 4 },
                            { defId: "CD-250717-0300-06we0000", count: 1 },
                            { defId: "CD-250717-0300-06ps0000", count: 1 },
                        ],
                        "TERENE 9": [
                            { defId: "CD-250717-0300-09wd0000", count: 5 },
                            { defId: "CD-250717-0300-09we0000", count: 2 },
                            { defId: "CD-250717-0300-09ps0000", count: 2 },
                        ],
                        "TERENE 12": [
                            { defId: "CD-250717-0300-12wd0000", count: 7 },
                            { defId: "CD-250717-0300-12we0000", count: 3 },
                            { defId: "CD-250717-0300-12ps0000", count: 2 },
                        ],
                        "TERENE 24": [
                            { defId: "CD-250717-0300-24wd0000", count: 13 },
                            { defId: "CD-250717-0300-24we0000", count: 6 },
                            { defId: "CD-250717-0300-24ps0000", count: 5 },
                        ],
                    }

                    // Phase-1 전용 패키지 (정리용으로만 사용, 발급에는 사용하지 않음)
                    const PHASE1_PACKAGE: Record<
                        string,
                        Array<{ defId: string; count: number }>
                    > = {
                        "TERENE 6": [
                            { defId: "CD-250806-0500-06wd0ph1", count: 4 },
                            { defId: "CD-250806-0500-06we0ph1", count: 1 },
                            { defId: "CD-250806-0500-06ps0ph1", count: 1 },
                        ],
                        "TERENE 9": [
                            { defId: "CD-250806-0500-09wd0ph1", count: 5 },
                            { defId: "CD-250806-0500-09we0ph1", count: 2 },
                            { defId: "CD-250806-0500-09ps0ph1", count: 2 },
                        ],
                        "TERENE 12": [
                            { defId: "CD-250806-0500-12wd0ph1", count: 7 },
                            { defId: "CD-250806-0500-12we0ph1", count: 3 },
                            { defId: "CD-250806-0500-12ps0ph1", count: 2 },
                        ],
                        "TERENE 24": [
                            { defId: "CD-250806-0500-24wd0ph1", count: 13 },
                            { defId: "CD-250806-0500-24we0ph1", count: 6 },
                            { defId: "CD-250806-0500-24ps0ph1", count: 5 },
                        ],
                    }

                    // 🧹 1) 현재 등급/Phase 조건에 맞지 않는 "available" TERENE/PHASE1 쿠폰 정리
                    const ALL_TERENE_DEF_IDS = new Set(
                        [
                            ...Object.values(COUPON_PACKAGE).flat(),
                            ...Object.values(PHASE1_PACKAGE).flat(), // PHASE1도 정리 대상 풀에 포함
                        ].map(({ defId }) => defId)
                    )

                    // 허용 집합: 기본 패키지 + (Phase-1인 경우에만) PHASE1 패키지
                    const activePackage = (
                        grade ? (COUPON_PACKAGE[grade] ?? []) : []
                    ).concat(
                        phaseIs1 ? (PHASE1_PACKAGE[grade ?? ""] ?? []) : []
                    )
                    const allowedDefIds = new Set(
                        activePackage.map(({ defId }) => defId)
                    )

                    if (row.membership_number) {
                        try {
                            const listRes = await request(
                                "db",
                                "/api/v2/coupon-instances"
                            )
                            if (!listRes.ok) {
                                const text = await listRes.text()
                                throw new Error(
                                    `쿠폰 조회 실패: HTTP ${listRes.status} - ${text}`
                                )
                            }
                            const instances = await listRes.json()

                            const toDelete = instances.filter(
                                (ci: any) =>
                                    ci?.membership_number ===
                                        row.membership_number &&
                                    ci?.status === "available" &&
                                    ALL_TERENE_DEF_IDS.has(
                                        ci?.coupon_definition_id
                                    ) &&
                                    !allowedDefIds.has(ci?.coupon_definition_id)
                            )

                            for (const ci of toDelete) {
                                const delRes = await request(
                                    "db",
                                    `/api/v2/coupon-instances/${ci.coupon_instance_id}`,
                                    {
                                        method: "DELETE",
                                    }
                                )
                                if (!delRes.ok) {
                                    const text = await delRes.text()
                                    throw new Error(
                                        `쿠폰 정리 실패 (${ci.coupon_instance_id}): HTTP ${delRes.status} - ${text}`
                                    )
                                }
                            }
                        } catch (cleanupErr: any) {
                            console.error("쿠폰 정리 중 오류:", cleanupErr)
                            alert(
                                `등급/Phase와 맞지 않는 쿠폰 정리 중 오류가 발생했습니다.\n${cleanupErr}`
                            )
                        }
                    }

                    // 🎟️ 2) 등급별 '기본' 패키지만 발급 (PHASE1는 발급하지 않음)
                    if (row.membership_number && grade) {
                        const pkgToIssue = COUPON_PACKAGE[grade] ?? []
                        if (pkgToIssue.length > 0) {
                            const nowKST = getKSTDate()
                            const yymmdd = nowKST
                                .toISOString()
                                .slice(2, 10)
                                .replace(/-/g, "")
                            const hhmm = nowKST
                                .toISOString()
                                .slice(11, 16)
                                .replace(":", "")

                            const makeRandom = () => {
                                const chars =
                                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                                return Array.from({ length: 8 }, () =>
                                    chars.charAt(
                                        Math.floor(Math.random() * chars.length)
                                    )
                                ).join("")
                            }

                            const makeIssuedAt = () => {
                                const mmdd =
                                    row.signup_date?.slice(5) ??
                                    nowKST.toISOString().slice(5, 10)
                                return new Date(
                                    `${nowKST.getFullYear()}-${mmdd}T00:00:00+09:00`
                                )
                            }

                            const createCouponPayload = (defId: string) => {
                                const issuedAt = makeIssuedAt()
                                const couponDue = new Date(issuedAt)
                                couponDue.setFullYear(
                                    couponDue.getFullYear() + 1
                                )
                                couponDue.setDate(couponDue.getDate() - 1)
                                return {
                                    coupon_instance_id: `CI-${yymmdd}-${hhmm}-${makeRandom()}`,
                                    coupon_definition_id: defId,
                                    coupon_code: null,
                                    status: "available",
                                    membership_number: row.membership_number,
                                    issued_at: issuedAt.toISOString(),
                                    coupon_due: couponDue.toISOString(),
                                    sender_info: {
                                        name: null,
                                        contact: null,
                                        is_vaadd: true,
                                        birthdate: null,
                                        membership_number: null,
                                    },
                                    receiver_info: {
                                        name: row.name_kor ?? null,
                                        contact: row.phone ?? null,
                                        birthdate: row.birthdate ?? null,
                                        membership_number:
                                            row.membership_number,
                                    },
                                }
                            }

                            for (const { defId, count } of pkgToIssue) {
                                for (let i = 0; i < count; i++) {
                                    const res = await request(
                                        "db",
                                        "/api/v2/coupon-instances",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify(
                                                createCouponPayload(defId)
                                            ),
                                        }
                                    )
                                    if (!res.ok) {
                                        const text = await res.text()
                                        throw new Error(
                                            `쿠폰 발급 실패 (${defId}): HTTP ${res.status} - ${text}`
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (const id of deletedIDs) {
                await fetch(`${apiBase}/${id}`, { method: "DELETE" })
            }

            setEditedIDs(new Set())
            setDeletedIDs(new Set())
            setUpdated(true)
        } catch (error) {
            setUpdateError(error.message)
            console.error(error.message)
            alert(`${error.message}`)
        } finally {
            setUpdating(false)
            setTimeout(() => {
                setUpdated(false)
                setUpdateError(null)
            }, 5000)
        }
    }

    const updateOrder = async (
        targetIDs: string[],
        payment_status: string,
        payment_timeline: string,
        payment_datetime: any,
        stay_status: string,
        stay_timeline: string,
        stay_datetime: any
    ) => {
        setUpdating(true)
        setUpdated(false)
        setUpdateError(null)

        try {
            for (const row of rows) {
                const id = row[idKey]
                const shouldUpdate =
                    targetIDs.includes(id) || (!targetIDs && editedIDs.has(id))

                if (!shouldUpdate) continue

                if (payment_status) {
                    if (payment_status === "cancelled") {
                        const baseDate = getKSTDate() // 기본값은 오늘 날짜

                        const checkinDate = getKSTDate(
                            new Date(row["start_date"])
                        )

                        const daysBeforeCheckin = Math.ceil(
                            // 체크인 날짜가 0시로 설정되어있기에, 그 전날 밤도 1일로 계산되어야 하기 때문
                            (checkinDate.getTime() - baseDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                        )

                        const discountedPrice = Number(
                            row["receipt"]["discountedPrice"] || 0
                        )
                        const additionalPrice = Number(
                            row["receipt"]["additional_price"] || 0
                        )
                        const deposit = 300_000

                        let refundRateRoom = 0
                        let refundRateAdd = 0
                        const refundRateDeposit = 1

                        if (daysBeforeCheckin >= 31) {
                            refundRateRoom = 1
                            refundRateAdd = 1
                        } else if (daysBeforeCheckin >= 15) {
                            refundRateRoom = 0.8
                            refundRateAdd = 1
                        } else if (daysBeforeCheckin >= 10) {
                            refundRateRoom = 0.6
                            refundRateAdd = 1
                        }

                        // VAT를 포함해서 환불하기 위해 1.1을 곱함
                        const refundAmount =
                            Math.round(discountedPrice * 1.1 * refundRateRoom) +
                            Math.round(additionalPrice * 1.1 * refundRateAdd) +
                            Math.round(deposit * refundRateDeposit)

                        row["refund_info"]["refund_before_checkin"] =
                            Number(daysBeforeCheckin)
                        row["refund_info"]["discounted_w_vat_refund"] =
                            Math.round(discountedPrice * 1.1 * refundRateRoom)
                        row["refund_info"]["additional_w_vat_refund"] =
                            Math.round(additionalPrice * 1.1 * refundRateAdd)
                        row["refund_info"]["deposit_refund"] = Math.round(
                            deposit * refundRateDeposit
                        )
                    }

                    row["payment_status"] = payment_status
                    row["payment_timeline"][payment_timeline] = payment_datetime
                }
                if (stay_status) {
                    row["stay_status"] = stay_status
                    row["stay_timeline"][stay_timeline] = stay_datetime
                }

                for (const field of parsedFields) {
                    if (field.notNull) {
                        const value = row[field.key]
                        const isEmpty =
                            value === null ||
                            value === undefined ||
                            (typeof value === "string" && value.trim() === "")
                        if (isEmpty) {
                            throw new Error(
                                `필수 입력 누락: '${field.key}' (ID: ${id})`
                            )
                        }
                    }
                }

                const membership_number = row["membership_number"] || null

                const status_response = await fetch(`${apiBase}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row),
                })

                if (!status_response.ok) {
                    const errorText = await status_response.text()
                    throw new Error(
                        `HTTP ${status_response.status} - ${errorText}`
                    )
                }

                // 메시지 생성 (공통)
                let client_title = null
                let client_message = null
                let admin_title = null
                let admin_message = null
                let refundAmount = null
                let daysBeforeCheckin = null

                if (payment_status === "accepted") {
                    ;({
                        client_title,
                        client_message,
                        admin_title,
                        admin_message,
                    } = createReservationMessage("confirmed", row))
                }

                if (
                    payment_status === "cancelled" ||
                    payment_status === "refunded"
                ) {
                    if (row["refund_info"]["refund_before_checkin"]) {
                        daysBeforeCheckin =
                            row["refund_info"]["refund_before_checkin"]
                    } else {
                        const baseDate = getKSTDate()

                        const checkinDate = getKSTDate(
                            new Date(row["start_date"])
                        )
                        daysBeforeCheckin = Math.ceil(
                            // 체크인 날짜가 0시로 설정되어있기에, 그 전날 밤도 1일로 계산되어야 하기 때문
                            (checkinDate.getTime() - baseDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                        )
                    }

                    const discountedPrice = Number(
                        row["receipt"]?.["discountedPrice"] || 0
                    )
                    const additionalPrice = Number(
                        row["receipt"]?.["additional_price"] || 0
                    )
                    const deposit = 300_000

                    let refundRateRoom = 0
                    let refundRateAdd = 0
                    const refundRateDeposit = 1

                    if (daysBeforeCheckin >= 31) {
                        refundRateRoom = 1
                        refundRateAdd = 1
                    } else if (daysBeforeCheckin >= 15) {
                        refundRateRoom = 0.8
                        refundRateAdd = 1
                    } else if (daysBeforeCheckin >= 10) {
                        refundRateRoom = 0.6
                        refundRateAdd = 1
                    }

                    // VAT를 포함해서 환불하기 위해 1.1을 곱함
                    refundAmount =
                        Math.round(discountedPrice * 1.1 * refundRateRoom) +
                        Math.round(additionalPrice * 1.1 * refundRateAdd) +
                        Math.round(deposit * refundRateDeposit)

                    if (payment_status === "cancelled") {
                        try {
                            const getAllDaysRes = await fetch(
                                `https://terene-db-server.onrender.com/api/days`
                            )
                            if (!getAllDaysRes.ok) {
                                const errorText = await getAllDaysRes.text()
                                throw new Error(
                                    `HTTP ${getAllDaysRes.status} - ${errorText}`
                                )
                            }

                            const allDays = await getAllDaysRes.json()

                            const dateRange = []
                            let current = new Date(row["start_date"])
                            const end = new Date(row["end_date"])

                            while (current <= end) {
                                const yyyyMMdd = current
                                    .toISOString()
                                    .split("T")[0]
                                dateRange.push(yyyyMMdd)
                                current.setDate(current.getDate() + 1)
                            }

                            const targetDays = allDays.filter(
                                (day: any) =>
                                    dateRange.includes(day.date) &&
                                    (day.checkin?.occupied_order_id ===
                                        row["order_id"] ||
                                        day.checkout?.occupied_order_id ===
                                            row["order_id"])
                            )

                            for (const day of targetDays) {
                                const updatedDay = { ...day }

                                const isFirstDate =
                                    day.date === row["start_date"]
                                const isSecondDate =
                                    day.date === row["end_date"]

                                if (isFirstDate) {
                                    updatedDay.checkin = {
                                        is_occupied: false,
                                        occupied_order_id: null,
                                    }
                                } else if (isSecondDate) {
                                    updatedDay.checkout = {
                                        is_occupied: false,
                                        occupied_order_id: null,
                                    }
                                } else {
                                    updatedDay.checkin = {
                                        is_occupied: false,
                                        occupied_order_id: null,
                                    }
                                    updatedDay.checkout = {
                                        is_occupied: false,
                                        occupied_order_id: null,
                                    }
                                }

                                try {
                                    const res = await fetch(
                                        `https://terene-db-server.onrender.com/api/days/${day.date}`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify(updatedDay),
                                        }
                                    )

                                    if (!res.ok) {
                                        const errText = await res.text()
                                        throw new Error(
                                            `Failed to release occupancy for ${day.date}: HTTP ${res.status} - ${errText}`
                                        )
                                    }
                                } catch (err) {
                                    console.error(
                                        "날짜 점유 해제 중 오류 발생:",
                                        err
                                    )
                                    alert(
                                        `예약 날짜(${day.date}) 점유 정보 해제 중 오류가 발생했습니다.\n에러메시지: ${err}`
                                    )
                                    return
                                }
                            }
                        } catch (error) {
                            console.error(
                                "날짜 데이터 불러오는 중 오류 발생:",
                                error
                            )
                            alert(
                                `날짜 데이터를 불러오는 데 실패했습니다.\n에러메시지: ${error}`
                            )
                            return
                        }

                        // 메시지 생성
                        ;({
                            client_title,
                            client_message,
                            admin_title,
                            admin_message,
                        } = createReservationMessage(
                            "cancelled",
                            row,
                            daysBeforeCheckin,
                            refundAmount,
                            refundRateRoom,
                            refundRateAdd,
                            refundRateDeposit
                        ))
                    }

                    if (payment_status === "refunded") {
                        ;({
                            client_title,
                            client_message,
                            admin_title,
                            admin_message,
                        } = createReservationMessage(
                            "refunded",
                            row,
                            daysBeforeCheckin,
                            refundAmount,
                            refundRateRoom,
                            refundRateAdd,
                            refundRateDeposit
                        ))
                    }
                }

                // 알림 전송 (모든 상태 공통)
                if (
                    client_title &&
                    client_message &&
                    admin_title &&
                    admin_message
                ) {
                    try {
                        // 관리자 연락
                        for (const phone of ADMIN_PHONES) {
                            await sendSMS(phone, admin_message)
                        }

                        for (const email of ADMIN_EMAILS) {
                            await sendEmail(email, admin_title, admin_message)
                        }

                        // 클라이언트 연락 - 예약 확정과 취소는 결제자와 예약자에게, 환불은 결제자에게만
                        if (
                            payment_status === "accepted" ||
                            payment_status === "cancelled"
                        ) {
                            await sendSMS(
                                row["reserver_contact"],
                                client_message
                            )
                            if (
                                row["refund_info"]["refund_phone"] &&
                                row["reserver_contact"].replace(
                                    /[^0-9]/g,
                                    ""
                                ) !==
                                    row["refund_info"]["refund_phone"].replace(
                                        /[^0-9]/g,
                                        ""
                                    )
                            )
                                await sendSMS(
                                    row["refund_info"]["refund_phone"],
                                    client_message
                                )
                        }
                        if (payment_status === "refunded") {
                            await sendSMS(
                                row["refund_info"]["refund_phone"],
                                client_message
                            )
                        }

                        await sendEmail(
                            row["reserver_email"],
                            client_title,
                            client_message
                        )
                    } catch (notifyError) {
                        console.error("알림 전송 중 오류:", notifyError)
                        alert(
                            "예약은 처리되었으나 알림 전송에 실패했습니다.\n관리자에게 별도 확인을 부탁드립니다."
                        )
                    }
                }
            }

            for (const id of deletedIDs) {
                alert(`${apiBase}/${id}를 삭제합니다`)
                await fetch(`${apiBase}/${id}`, { method: "DELETE" })
            }

            setEditedIDs(new Set())
            setDeletedIDs(new Set())
            setUpdated(true)
        } catch (error) {
            setUpdateError(error.message)
            console.error(error.message)
            alert(`${error.message}`)
        } finally {
            setUpdating(false)
            setTimeout(() => {
                setUpdated(false)
                setUpdateError(null)
            }, 5000)
        }
    }

    return {
        rows,
        paginatedRows,
        emptySlots,
        justAddedID,
        updating,
        updated,
        currentPage,
        totalPages,
        sortConfig,
        toggleSort,
        addElement,
        editElement,
        deleteElement,
        updateBackend,
        updateOrder,
        setCurrentPage,
        idKey,
        updateError,
    }
}
