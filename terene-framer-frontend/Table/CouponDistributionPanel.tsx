
import React from "react"
import { request } from "../Api/client.ts"
import { MenuToggle } from "./MenuToggle.tsx"
import { CouponLogPopup } from "./CouponLogPopup.tsx"
import { CouponInstancesPopup } from "./CouponInstancesPopup.tsx"
import { CouponTargetsPopup } from "./CouponTargetsPopup.tsx"

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 24,
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
}

export function CouponDistributionPanel({
    temp,
    coupon,
    handleChange,
}: {
    temp: any
    coupon: any
    handleChange: (key: string, value: any) => void
}) {
    const [memberInfo, setMemberInfo] = React.useState({
        membership_number: null,
        name: null,
        birthdate: null,
        contact: null,
        signup_date: null,
        issued_date: null,
        coupon_code: null,
    })
    const [showLogPopup, setShowLogPopup] = React.useState(false)
    const [logContent, setLogContent] = React.useState("")
    const [showInstancesPopup, setShowInstancesPopup] = React.useState(false)
    const [showTargetsPopup, setShowTargetsPopup] = React.useState(false)

    React.useEffect(() => {
        if (temp.type !== "membership") return

        const predefinedCounts: Record<string, Record<string, number>> = {
            "TERENE 6": { 평일: 4, 주말: 1, 성수기: 1 },
            "TERENE 9": { 평일: 5, 주말: 2, 성수기: 2 },
            "TERENE 12": { 평일: 7, 주말: 3, 성수기: 2 },
            "TERENE 24": { 평일: 13, 주말: 6, 성수기: 5 },
        }

        const targets =
            temp.type === "membership"
                ? temp.conditions_json?.find(
                      (c: any) => c.type === "membership"
                  )?.members || []
                : temp.groupTarget || []

        const keys = Object.keys(predefinedCounts)
        const matchedKey = keys.find((k) => targets.includes(k))
        if (!matchedKey) return

        const name = coupon.name || ""
        const countMap = predefinedCounts[matchedKey]

        let keyword: string | undefined = undefined
        if (name.includes("평일")) keyword = "평일"
        else if (name.includes("주말")) keyword = "주말"
        else if (name.includes("성수기")) keyword = "성수기"

        if (keyword && countMap[keyword] != null) {
            handleChange("distributeCount", countMap[keyword])
        }
    }, [coupon.name, temp.groupTarget, temp.conditions_json, temp.type])

    const isMembershipType = temp.type === "membership"
    const isGroup = temp.distributeMode === "group"

    const handleDistribute = async () => {
        const today = new Date()
        const kstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)

        const formatDate = (d: Date) => {
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, "0")
            const dd = String(d.getDate()).padStart(2, "0")
            return `${yyyy}-${mm}-${dd}`
        }

        const generateSafeCode = (length = 8) => {
            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"
            return Array.from(
                { length },
                () => chars[Math.floor(Math.random() * chars.length)]
            ).join("")
        }

        const generateCouponInstanceId = () => {
            const datePart = kstDate
                .toISOString()
                .slice(2, 10)
                .replace(/-/g, "")
            const timePart =
                String(kstDate.getHours()).padStart(2, "0") +
                String(kstDate.getMinutes()).padStart(2, "0")
            const rand = generateSafeCode(8)
            return `CI-${datePart}-${timePart}-${rand}`
        }

        // const addDate = (base: Date, type: string, value: string) => {
        //     const result = new Date(base)
        //     const val = parseInt(value, 10)
        //     if (type === "day") result.setDate(result.getDate() + val)
        //     else if (type === "week") result.setDate(result.getDate() + val * 7)
        //     else if (type === "month") result.setMonth(result.getMonth() + val)
        //     else if (type === "year")
        //         result.setFullYear(result.getFullYear() + val)

        //     result.setDate(result.getDate() - 1)
        //     return result
        // }

        // const createInstance = (info: any) => {
        //     const baseDate =
        //         temp.type === "membership" && info.signup_date
        //             ? new Date(info.signup_date)
        //             : info.issued_date?.trim()
        //               ? new Date(info.issued_date)
        //               : kstDate

        //     // 날짜만 비교하기 위해 자정으로 맞추는 헬퍼
        //     const toYMD = (d: Date) =>
        //         new Date(d.getFullYear(), d.getMonth(), d.getDate())

        //     // 오늘(KST) 자정
        //     const todayYMD = toYMD(kstDate)

        //     // 만료일 원본 Date 계산 (포맷은 나중에)
        //     let dueDate: Date | null = null
        //     if (temp.validity_type === "custom") {
        //         // custom은 YYYY-MM-DD 같은 문자열일 수 있음
        //         dueDate = temp.validity_value
        //             ? new Date(temp.validity_value)
        //             : null
        //     } else if (temp.validity_type === "permanent") {
        //         dueDate = null
        //     } else {
        //         // day/week/month/year 기준으로 baseDate에 더한 뒤, 하루 빼는 기존 로직 사용
        //         dueDate = addDate(
        //             baseDate,
        //             temp.validity_type,
        //             temp.validity_value
        //         )
        //     }

        //     // ✅ membership 전용: 만료일이 오늘(KST) 이전이면 1년씩 더함
        //     if (temp.type === "membership" && dueDate) {
        //         let d = toYMD(dueDate)
        //         // 유효하지 않은 날짜 방지
        //         if (!isNaN(d.getTime())) {
        //             while (d < todayYMD) {
        //                 d.setFullYear(d.getFullYear() + 1)
        //             }
        //             dueDate = d
        //         }
        //     }

        //     const coupon_due = dueDate ? formatDate(dueDate) : null

        //     const isMembershipCoupon = temp.type === "membership"

        //     const coupon_code = isMembershipCoupon
        //         ? null
        //         : info.coupon_code
        //           ? info.coupon_code
        //           : generateSafeCode(8 + Math.floor(Math.random() * 3))

        //     return {
        //         coupon_instance_id: generateCouponInstanceId(),
        //         coupon_definition_id: coupon.coupon_definition_id,
        //         coupon_code,
        //         status: "available",
        //         membership_number: info.membership_number,
        //         issued_at: formatDate(kstDate),
        //         coupon_due,
        //         sender_info: {
        //             is_vaadd: true,
        //             membership_number: null,
        //             name: null,
        //             birthdate: null,
        //             contact: null,
        //         },
        //         receiver_info: {
        //             membership_number: info.membership_number ?? null,
        //             name: info.name ?? null,
        //             birthdate: info.birthdate ?? null,
        //             contact: info.contact ?? null,
        //         },
        //         order_id: null,
        //         used_location: null,
        //         used_timestamp: null,
        //         used_amount: null,
        //     }
        // }

        const addDate = (base: Date, type: string, value: string) => {
            const result = new Date(base)
            const val = parseInt(value, 10)
            if (type === "day") result.setDate(result.getDate() + val)
            else if (type === "week") result.setDate(result.getDate() + val * 7)
            else if (type === "month") result.setMonth(result.getMonth() + val)
            else if (type === "year")
                result.setFullYear(result.getFullYear() + val)

            result.setSeconds(result.getSeconds() - 1)
            return result
        }

        const createInstance = (info: any) => {
            const baseDate =
                temp.type === "membership" && info.signup_date
                    ? new Date(info.signup_date)
                    : info.issued_date?.trim()
                      ? new Date(info.issued_date)
                      : kstDate

            const toYMD = (d: Date) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate())

            const todayYMD = toYMD(kstDate)

            let dueDate: Date | null = null
            if (temp.validity_type === "custom") {
                dueDate = temp.validity_value
                    ? new Date(temp.validity_value)
                    : null
            } else if (temp.validity_type === "permanent") {
                dueDate = null
            } else {
                dueDate = addDate(
                    baseDate,
                    temp.validity_type,
                    temp.validity_value
                )
            }

            if (temp.type === "membership" && dueDate) {
                let d = toYMD(dueDate)
                if (!isNaN(d.getTime())) {
                    while (d < todayYMD) {
                        d.setFullYear(d.getFullYear() + 1)
                    }
                    d = new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1000)
                    dueDate = d
                }
            }

            const issuedAtMidnight = toYMD(kstDate)

            const coupon_due = dueDate
            const isMembershipCoupon = temp.type === "membership"
            const coupon_code = isMembershipCoupon
                ? null
                : info.coupon_code
                  ? info.coupon_code
                  : generateSafeCode(8 + Math.floor(Math.random() * 3))

            return {
                coupon_instance_id: generateCouponInstanceId(),
                coupon_definition_id: coupon.coupon_definition_id,
                coupon_code,
                status: "available",
                membership_number: info.membership_number,

                issued_at: baseDate,

                coupon_due,
                sender_info: {
                    is_vaadd: true,
                    membership_number: null,
                    name: null,
                    birthdate: null,
                    contact: null,
                },
                receiver_info: {
                    membership_number: info.membership_number ?? null,
                    name: info.name ?? null,
                    birthdate: info.birthdate ?? null,
                    contact: info.contact ?? null,
                },
                order_id: null,
                used_location: null,
                used_timestamp: null,
                used_amount: null,
            }
        }

        const postInstance = async (payload: any) => {
            const res = await request("db", "/api/v2/coupon-instances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("쿠폰 발급 실패")
            return res.json()
        }

        // ✅ 기존 인스턴스 조회
        const existingInstances = await request(
            "db",
            `/api/v2/coupon-instances?coupon_definition_id=${coupon.coupon_definition_id}`
        ).then((res) => res.json())

        const codeResults: { member: string; code: string }[] = []
        const nonMembers: typeof codeResults = []
        const members: typeof codeResults = []
        const count = temp.distributeCount || 1
        const isBulk = isGroup || isMembershipType

        const normalize = (str: string) =>
            str
                ?.replace(/[\s\-./]/g, "")
                .toLowerCase()
                .trim()

        const shouldSkipInstance = (info: any) => {
            if (info.membership_number) {
                // membership_number 기준
                return existingInstances.some(
                    (inst: any) =>
                        inst.coupon_definition_id ===
                            coupon.coupon_definition_id &&
                        normalize(inst.membership_number) ===
                            normalize(info.membership_number)
                )
            } else {
                // 이름+생년월일+연락처 기준
                return existingInstances.some(
                    (inst: any) =>
                        inst.coupon_definition_id ===
                            coupon.coupon_definition_id &&
                        normalize(inst.receiver_info?.name) ===
                            normalize(info.name) &&
                        normalize(inst.receiver_info?.birthdate) ===
                            normalize(info.birthdate) &&
                        normalize(inst.receiver_info?.contact) ===
                            normalize(info.contact)
                )
            }
        }

        if (isBulk) {
            const isIncludeNonMember = (
                temp.type === "membership"
                    ? temp.conditions_json?.find(
                          (c: any) => c.type === "membership"
                      )?.members || []
                    : temp.groupTarget || []
            ).includes("Non-Member")

            const isIncludeMembersOnly = (
                temp.type === "membership"
                    ? temp.conditions_json?.find(
                          (c: any) => c.type === "membership"
                      )?.members || []
                    : temp.groupTarget || []
            ).filter((grade: string) => grade !== "Non-Member")

            // 🔹 비회원 처리
            if (isIncludeNonMember) {
                for (let i = 0; i < count; i++) {
                    const info = {
                        membership_number: null,
                        name: null,
                        birthdate: null,
                        contact: null,
                        signup_date: "", // 이건 여전히 있어야 함. 만료일 계산에 필요
                    }

                    if (shouldSkipInstance(info)) continue

                    const instance = createInstance(info)
                    await postInstance(instance)
                    nonMembers.push({
                        member: "비회원",
                        code: instance.coupon_code,
                    })
                }
            }

            // 🔹 회원 처리
            if (isIncludeMembersOnly.length > 0) {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/customers"
                )
                const customers = await res.json()

                const filtered = customers.filter((c: any) =>
                    isIncludeMembersOnly.includes(c.membership_grade)
                )

                for (const customer of filtered) {
                    const info = {
                        membership_number:
                            customer.membership_number || "비회원",
                        name: customer.name_kor || "",
                        birthdate: customer.birthdate || "",
                        contact: customer.phone || "",
                        signup_date: customer.signup_date || "",
                    }

                    if (shouldSkipInstance(info)) continue

                    for (let i = 0; i < count; i++) {
                        const instance = createInstance(info)
                        await postInstance(instance)
                        members.push({
                            member: info.membership_number || "비회원",
                            code: instance.coupon_code,
                        })
                    }
                }
            }

            codeResults.push(...members, ...nonMembers)
        } else {
            // 🔹 개인 배포
            const info = {
                ...memberInfo,
            }

            if (!shouldSkipInstance(info)) {
                for (let i = 0; i < count; i++) {
                    const instance = createInstance(info)
                    await postInstance(instance)
                    codeResults.push({
                        member: instance.membership_number || "비회원",
                        code: instance.coupon_code,
                    })
                }
            }
        }

        const log =
            `총 ${codeResults.length}개의 쿠폰이 발급되었습니다:\n\n` +
            codeResults
                .map(
                    (r, idx) =>
                        `${idx + 1}.  발급 대상: ${r.member},  코드: ${r.code || "(멤버쉽 쿠폰)"}`
                )
                .join("\n")

        setLogContent(log)
        setShowLogPopup(true)
    }

    return (
        <>
            <CouponLogPopup
                visible={showLogPopup}
                onClose={() => setShowLogPopup(false)}
                content={logContent}
            />
            {/* 인스턴스 조회 팝업 */}
            <CouponInstancesPopup
                visible={showInstancesPopup}
                onClose={() => setShowInstancesPopup(false)}
                couponDefinitionId={coupon?.coupon_definition_id}
            />
            <CouponTargetsPopup
                visible={showTargetsPopup}
                onClose={() => setShowTargetsPopup(false)}
                coupon={coupon}
                temp={temp}
            />
            <div
                style={{
                    marginTop: 16,
                    borderTop: "1px dashed #ccc",
                    paddingTop: 12,
                }}
            >
                {temp.type === "membership" ? (
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        <span style={{ color: "#555" }}>단체 배포 대상: </span>
                        {(temp.conditions_json || [])
                            .find((c: any) => c.type === "membership")
                            ?.members?.join(", ") || "설정 없음"}
                    </div>
                ) : (
                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "개인 배포", value: "personal" },
                            { label: "단체 배포", value: "group" },
                        ]}
                        selected={temp.distributeMode || "personal"}
                        onChange={(val) => handleChange("distributeMode", val)}
                    />
                )}

                {temp.type === "membership" ||
                temp.distributeMode === "group" ? (
                    <div style={{ marginTop: 12 }}>
                        <MenuToggle
                            mode="multi"
                            options={[
                                { label: "비회원", value: "Non-Member" },
                                { label: "TERENE 6", value: "TERENE 6" },
                                { label: "TERENE 9", value: "TERENE 9" },
                                { label: "TERENE 12", value: "TERENE 12" },
                                { label: "TERENE 24", value: "TERENE 24" },
                            ]}
                            selected={
                                temp.type === "membership"
                                    ? temp.conditions_json?.find(
                                          (c: any) => c.type === "membership"
                                      )?.members || []
                                    : temp.groupTarget || []
                            }
                            onChange={(val) => {
                                if (temp.type === "membership") {
                                    const next = [
                                        ...(temp.conditions_json || []),
                                    ]
                                    const idx = next.findIndex(
                                        (c) => c.type === "membership"
                                    )
                                    if (idx !== -1) {
                                        next[idx] = {
                                            ...next[idx],
                                            members: val,
                                        }
                                    } else {
                                        next.push({
                                            type: "membership",
                                            members: val,
                                        })
                                    }
                                    handleChange("conditions_json", next)
                                } else {
                                    handleChange("groupTarget", val)
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 12,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: 8,
                            }}
                        >
                            <input
                                placeholder="회원 번호"
                                value={memberInfo.membership_number}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        membership_number: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                            <input
                                placeholder="쿠폰 발급일"
                                value={memberInfo.issued_date}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        issued_date: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                            <input
                                placeholder="쿠폰 코드"
                                value={memberInfo.coupon_code}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        coupon_code: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: 8,
                            }}
                        >
                            <input
                                placeholder="이름"
                                value={memberInfo.name}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        name: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                            <input
                                placeholder="생년월일"
                                value={memberInfo.birthdate}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        birthdate: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                            <input
                                placeholder="연락처"
                                value={memberInfo.contact}
                                onChange={(e) =>
                                    setMemberInfo({
                                        ...memberInfo,
                                        contact: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            />
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        alignItems: "center",
                    }}
                >
                    <input
                        type="number"
                        min={1}
                        placeholder="배포 개수"
                        value={temp.distributeCount || ""}
                        onChange={(e) =>
                            handleChange(
                                "distributeCount",
                                Number(e.target.value)
                            )
                        }
                        style={{ ...inputStyle, width: 100 }}
                    />
                    <button
                        style={{
                            padding: "6px 16px",
                            background: "#3399ff",
                            color: "#fff",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                        onClick={handleDistribute}
                    >
                        쿠폰 배포
                    </button>

                    {/* 다중 배포 버튼 */}
                    <button
                        style={{
                            padding: "6px 16px",
                            background: "#6cc070",
                            color: "#fff",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                        onClick={() => setShowTargetsPopup(true)}
                        disabled={!coupon?.coupon_definition_id}
                        title={
                            coupon?.coupon_definition_id
                                ? ""
                                : "쿠폰이 선택되지 않았습니다."
                        }
                    >
                        다중 배포
                    </button>

                    {/* 쿠폰 조회 버튼 */}
                    <button
                        style={{
                            padding: "6px 16px",
                            background: "#f0f0f0",
                            color: "#333",
                            fontWeight: 700,
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontFamily: "Pretendard, sans-serif",
                        }}
                        onClick={() => setShowInstancesPopup(true)}
                        disabled={!coupon?.coupon_definition_id}
                        title={
                            coupon?.coupon_definition_id
                                ? ""
                                : "쿠폰이 선택되지 않았습니다."
                        }
                    >
                        쿠폰 조회
                    </button>
                </div>
            </div>
        </>
    )
}
