// MembersTableLogic.tsx
import { useEffect, useMemo, useState } from "react"
import { request } from "../../Api/client.ts"

const API_BASE = "https://terene-db-server.onrender.com/api/v2/customers"
const CI_BASE = "https://terene-db-server.onrender.com/api/v2/coupon-instances"
const MI_BASE = "https://terene-db-server.onrender.com/api/v2/mileages"

type Tab = "전체" | "개인" | "법인" | "블랙리스트"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function ymdKST() {
    const d = getKSTDate()
    const z = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

function generateMembershipNumber(existing: Set<string>, prefix: "U" | "A") {
    for (let i = 0; i < 30; i++) {
        const n = Math.floor(10000000 + Math.random() * 90000000)
        const id = `${prefix}-${n}`
        if (!existing.has(id)) return id
    }
    const fallback = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`
    return fallback
}

export function MembersTableLogic() {
    const [rows, setRows] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const [filters, setFilters] = useState<{
        tab?: Tab
        membership_grade?: string
        member_role?: "" | "admin" | "member"
        phase?: string
        nationality?: "domestic" | "foreign"
        query?: string
    }>({ tab: "전체" })

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

    const fetchAll = async () => {
        try {
            const res = await fetch(API_BASE)
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setRows(Array.isArray(data) ? data : [])
        } catch {
            setRows([])
        }
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const { tab, membership_grade, member_role, nationality, query } =
                filters

            const tabMatch = (() => {
                if (tab === "개인") return row.is_personal === true
                if (tab === "법인") return row.is_personal === false
                if (tab === "블랙리스트") return row.blacklist === true
                return true
            })()

            const gradeMatch = membership_grade
                ? String(row.membership_grade || "") === membership_grade
                : true

            // ✅ 관리자/회원: membership_number prefix로 분류 (A / U)
            const roleMatch = (() => {
                if (!member_role) return true
                const m = String(row.membership_number || "")
                if (member_role === "admin") return m.startsWith("A-")
                if (member_role === "member") return m.startsWith("U-")
                return true
            })()

            const nationalityMatch = nationality
                ? String(row.nationality || "domestic") === nationality
                : true

            const queryMatch = (() => {
                if (!query || !query.trim()) return true
                const normalize = (str: string) =>
                    str.toLowerCase().replace(/[-.,\s]/g, "")
                const q = normalize(query)
                const blob = normalize(JSON.stringify(row))
                return blob.includes(q)
            })()

            return (
                tabMatch &&
                gradeMatch &&
                roleMatch &&
                nationalityMatch &&
                queryMatch
            )
        })
    }, [rows, filters])

    const sortedRows = useMemo(() => {
        const sorted = [...filteredRows]
        if (sortConfig?.key) {
            sorted.sort((a, b) => {
                let aValue: any = ""
                let bValue: any = ""

                switch (sortConfig.key) {
                    case "membership_number":
                        aValue = String(a.membership_number || "")
                        bValue = String(b.membership_number || "")
                        break
                    case "member_type":
                        aValue = a.is_personal ? "개인" : "법인"
                        bValue = b.is_personal ? "개인" : "법인"
                        break
                    case "name_kor":
                        aValue = String(a.name_kor || "").toLowerCase()
                        bValue = String(b.name_kor || "").toLowerCase()
                        break
                    case "membership_grade":
                        aValue = String(a.membership_grade || "")
                        bValue = String(b.membership_grade || "")
                        break
                    case "phase":
                        aValue = String(a.phase || "")
                        bValue = String(b.phase || "")
                        break
                    case "phone":
                        aValue = String(a.phone || "")
                        bValue = String(b.phone || "")
                        break
                    case "signup_date":
                        aValue = new Date(a.signup_date || 0).getTime()
                        bValue = new Date(b.signup_date || 0).getTime()
                        break
                    case "identifier":
                        aValue = String(
                            a.is_personal
                                ? a.birthdate || ""
                                : a.business_registration_number || ""
                        )
                        bValue = String(
                            b.is_personal
                                ? b.birthdate || ""
                                : b.business_registration_number || ""
                        )
                        break

                    case "address":
                        aValue = String(a.address || "")
                        bValue = String(b.address || "")
                        break

                    default:
                        aValue = ""
                        bValue = ""
                        break
                }

                if (aValue < bValue)
                    return sortConfig.direction === "asc" ? -1 : 1
                if (aValue > bValue)
                    return sortConfig.direction === "asc" ? 1 : -1
                return 0
            })
        } else {
            sorted.sort((a, b) => {
                const aTime = new Date(a.signup_date || 0).getTime()
                const bTime = new Date(b.signup_date || 0).getTime()
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

    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
    const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

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

    const syncCouponsAfterCustomerUpsert = async (
        row: any,
        opts?: { resetAvailableTereneCoupons?: boolean }
    ) => {
        const grade: string | undefined = row.membership_grade
        const phaseIs1 = row.phase === "Phase-1"
        if (!row.membership_number || !grade) return

        const ALL_TERENE_DEF_IDS = new Set(
            [
                ...Object.values(COUPON_PACKAGE).flat(),
                ...Object.values(PHASE1_PACKAGE).flat(),
            ].map(({ defId }) => defId)
        )

        const activePackage = (COUPON_PACKAGE[grade] ?? []).concat(
            phaseIs1 ? (PHASE1_PACKAGE[grade] ?? []) : []
        )
        const allowedDefIds = new Set(activePackage.map(({ defId }) => defId))

        try {
            const listRes = await request("db", "/api/v2/coupon-instances")
            if (!listRes.ok) {
                const text = await listRes.text()
                throw new Error(
                    `쿠폰 조회 실패: HTTP ${listRes.status} - ${text}`
                )
            }
            const instances = await listRes.json()

            const toDelete = instances.filter((ci: any) => {
                const sameMember =
                    ci?.membership_number === row.membership_number
                const available = ci?.status === "available"
                const isTerene = ALL_TERENE_DEF_IDS.has(
                    ci?.coupon_definition_id
                )
                if (!sameMember || !available || !isTerene) return false

                // ✅ signup_date 변경 리셋 모드: TERENE 쿠폰(available) 전부 삭제
                if (opts?.resetAvailableTereneCoupons) return true

                // ✅ 기존 로직: 등급/Phase와 안 맞는 것만 삭제
                return !allowedDefIds.has(ci?.coupon_definition_id)
            })

            for (const ci of toDelete) {
                const delRes = await request(
                    "db",
                    `/api/v2/coupon-instances/${ci.coupon_instance_id}`,
                    { method: "DELETE" }
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

        const pkgToIssue = COUPON_PACKAGE[grade] ?? []
        if (pkgToIssue.length === 0) return

        const nowKST = getKSTDate()
        const yymmdd = nowKST.toISOString().slice(2, 10).replace(/-/g, "")
        const hhmm = nowKST.toISOString().slice(11, 16).replace(":", "")

        const makeRandom = () => {
            const chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            return Array.from({ length: 8 }, () =>
                chars.charAt(Math.floor(Math.random() * chars.length))
            ).join("")
        }

        const makeIssuedAt = () => {
            const mmdd = row.signup_date?.slice(5) ?? ymdKST().slice(5)
            return new Date(`${nowKST.getFullYear()}-${mmdd}T00:00:00+09:00`)
        }

        const createCouponPayload = (defId: string) => {
            const issuedAt = makeIssuedAt()
            const couponDue = new Date(issuedAt)
            couponDue.setFullYear(couponDue.getFullYear() + 1)
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
                    membership_number: row.membership_number,
                },
            }
        }

        try {
            for (const { defId, count } of pkgToIssue) {
                for (let i = 0; i < count; i++) {
                    const res = await request("db", "/api/v2/coupon-instances", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(createCouponPayload(defId)),
                    })
                    if (!res.ok) {
                        const text = await res.text()
                        throw new Error(
                            `쿠폰 발급 실패 (${defId}): HTTP ${res.status} - ${text}`
                        )
                    }
                }
            }
        } catch (e: any) {
            console.error("쿠폰 발급 중 오류:", e)
            alert(`쿠폰 발급 중 오류가 발생했습니다.\n${e?.message ?? e}`)
        }
    }

    const buildPayload = (membershipNumber: string, next: any) => {
        return {
            membership_number: next.membership_number ?? membershipNumber,
            id: next.id ?? null,
            password: next.password,
            name_kor: next.name_kor ?? null,
            name_eng: next.name_eng ?? null,
            is_personal: Boolean(next.is_personal),
            birthdate: next.birthdate ?? null,
            gender: next.gender ?? null,
            business_registration_number:
                next.business_registration_number ?? null,
            contact_person_name: next.contact_person_name ?? null,
            contact_person_phone: next.contact_person_phone ?? null,
            address: next.address,
            phone: next.phone,
            email: next.email,
            membership_grade: next.membership_grade,
            phase: next.phase,
            signup_date: next.signup_date ?? null,
            remarks: Array.isArray(next.remarks) ? next.remarks : null,
            blacklist: Boolean(next.blacklist),
            nationality: next.nationality ?? "domestic",
        }
    }

    const validateRequired = (p: any) => {
        const requiredKeys = [
            "membership_number",
            "password",
            "address",
            "phone",
            "email",
            "membership_grade",
            "phase",
            "nationality",
            "is_personal",
        ]
        for (const k of requiredKeys) {
            const v = p[k]
            const empty =
                v === null ||
                v === undefined ||
                (typeof v === "string" && v.trim() === "")
            if (empty) throw new Error(`필수 입력 누락: '${k}'`)
        }
        if (!/^[UA]-\d{8}$/.test(String(p.membership_number || ""))) {
            throw new Error(
                "회원번호 형식이 올바르지 않습니다 (예: U-20260115)"
            )
        }
    }

    const isTerenePackageGrade = (g: any) => {
        const grade = String(g || "")
        return Object.prototype.hasOwnProperty.call(COUPON_PACKAGE, grade)
    }

    const updateMember = async (membershipNumber: string, next: any) => {
        try {
            // ✅ 업데이트 전 row(기존 값) 확보
            const prevRow =
                rows.find((m) => m.membership_number === membershipNumber) ??
                null

            const payload = buildPayload(membershipNumber, next)
            validateRequired(payload)

            const res = await fetch(
                `${API_BASE}/${encodeURIComponent(membershipNumber)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )

            if (!res.ok) {
                const text = await res.text().catch(() => "")
                alert(text || `HTTP ${res.status}`)
                return
            }

            setRows((prev) =>
                prev.map((m) =>
                    m.membership_number === membershipNumber
                        ? { ...m, ...payload }
                        : m
                )
            )

            // ✅ 쿠폰 로직은 "TERENE n이 바뀔 때만" 실행 (중복 방지)
            const prevGrade = prevRow?.membership_grade
            const nextGrade = payload.membership_grade

            const prevSignup = String(prevRow?.signup_date || "")
            const nextSignup = String(payload?.signup_date || "")

            const hasTerene =
                isTerenePackageGrade(prevGrade) ||
                isTerenePackageGrade(nextGrade)

            const shouldSyncCoupons =
                hasTerene &&
                (String(prevGrade || "") !== String(nextGrade || "") ||
                    prevSignup !== nextSignup)

            if (shouldSyncCoupons) {
                try {
                    await syncCouponsAfterCustomerUpsert(payload, {
                        resetAvailableTereneCoupons: prevSignup !== nextSignup,
                    })
                } catch (e) {
                    alert(
                        `syncCouponsAfterCustomerUpsert error: ${JSON.stringify(e)}`
                    )
                }
            }
        } catch (e: any) {
            alert(e?.message ?? e)
        }
    }

    const createMember = async (next: any) => {
        try {
            const payload = buildPayload(next.membership_number, next)
            validateRequired(payload)

            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const text = await res.text().catch(() => "")
                alert(text || `HTTP ${res.status}`)
                return null
            }

            setRows((prev) => [payload, ...prev])
            setCurrentPage(1)

            // ✅ 신규 생성은 TERENE 패키지 등급일 때만 1회 발급
            if (isTerenePackageGrade(payload.membership_grade)) {
                try {
                    await syncCouponsAfterCustomerUpsert(payload)
                } catch (e) {
                    alert(
                        `syncCouponsAfterCustomerUpsert error: ${JSON.stringify(e)}`
                    )
                }
            }

            return payload
        } catch (e: any) {
            alert(e?.message ?? e)
            return null
        }
    }

    const deleteCouponsAndMileagesForMember = async (
        membershipNumber: string
    ) => {
        // 1) 쿠폰 인스턴스 삭제 (membership_number 같은 것만!)
        try {
            const listRes = await request("db", "/api/v2/coupon-instances")
            if (!listRes.ok) {
                const text = await listRes.text().catch(() => "")
                throw new Error(
                    `쿠폰 조회 실패: HTTP ${listRes.status} - ${text}`
                )
            }
            const instances = await listRes.json()

            const targets = (Array.isArray(instances) ? instances : []).filter(
                (ci: any) =>
                    String(ci?.membership_number || "") === membershipNumber
            )

            for (const ci of targets) {
                const id = ci?.coupon_instance_id
                if (!id) continue

                // ⚠️ 반드시 membership_number 같은 것만 삭제해야 하므로
                // 프론트에서 1차로 필터링하고, 서버에서도 membership_number 검증이 되도록 유지하는 전제
                const delRes = await request(
                    "db",
                    `/api/v2/coupon-instances/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE",
                    }
                )
                if (!delRes.ok) {
                    const text = await delRes.text().catch(() => "")
                    throw new Error(
                        `쿠폰 삭제 실패 (${id}): HTTP ${delRes.status} - ${text}`
                    )
                }
            }
        } catch (e: any) {
            throw new Error(e?.message ?? e)
        }

        // 2) 마일리지 삭제 (membership_number 같은 것만!)
        try {
            const listRes = await fetch(MI_BASE)
            if (!listRes.ok) {
                const text = await listRes.text().catch(() => "")
                throw new Error(
                    `마일리지 조회 실패: HTTP ${listRes.status} - ${text}`
                )
            }
            const mileages = await listRes.json()

            const targets = (Array.isArray(mileages) ? mileages : []).filter(
                (mi: any) =>
                    String(mi?.membership_number || "") === membershipNumber
            )

            for (const mi of targets) {
                const id = mi?.mileage_id
                if (!id) continue

                const delRes = await fetch(
                    `${MI_BASE}/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE",
                    }
                )
                if (!delRes.ok) {
                    const text = await delRes.text().catch(() => "")
                    throw new Error(
                        `마일리지 삭제 실패 (${id}): HTTP ${delRes.status} - ${text}`
                    )
                }
            }
        } catch (e: any) {
            throw new Error(e?.message ?? e)
        }
    }

    const deleteMember = async (membershipNumber: string) => {
        const ok = window.confirm(
            "해당 회원을 삭제하시겠습니까?\n\n* 회원과 관련된 모든 쿠폰/마일리지 내역이 삭제됩니다!\n* 해당 회원으로 진행한 예약 내역은 삭제되지 않습니다"
        )
        if (!ok) return false

        try {
            // ✅ 1) 먼저 쿠폰/마일리지 삭제
            await deleteCouponsAndMileagesForMember(membershipNumber)

            // ✅ 2) 그 다음 회원 삭제
            const res = await fetch(
                `${API_BASE}/${encodeURIComponent(membershipNumber)}`,
                { method: "DELETE" }
            )

            if (!res.ok) {
                const text = await res.text().catch(() => "")
                console.error(text || `HTTP ${res.status}`)
                return false
            }

            setRows((prev) =>
                prev.filter((m) => m.membership_number !== membershipNumber)
            )

            return true
        } catch (err: any) {
            console.error("회원 삭제 실패:", err)
            alert(err?.message ?? err)
            return false
        }
    }

    const makeNewMemberTemplate = () => {
        const existing = new Set(rows.map((r) => String(r.membership_number)))
        const prefix: "U" | "A" = "U"
        const membership_number = generateMembershipNumber(existing, prefix)

        return {
            membership_number,
            id: null,
            password: "",
            name_kor: null,
            name_eng: null,
            is_personal: true,
            birthdate: null,
            gender: null,
            business_registration_number: null,
            contact_person_name: null,
            contact_person_phone: null,
            address: "",
            phone: "",
            email: "",
            membership_grade: "Non-Member",
            phase: "Phase-1",
            signup_date: ymdKST(),
            remarks: [],
            blacklist: false,
            nationality: "domestic",
        }
    }

    const reload = () => fetchAll()

    return {
        sortedRows,
        itemsPerPage,
        currentPage,
        prevPage,
        nextPage,
        setFilters,
        toggleSort,
        sortConfig,
        updateMember,
        createMember,
        deleteMember,
        makeNewMemberTemplate,
        reload,
    }
}
