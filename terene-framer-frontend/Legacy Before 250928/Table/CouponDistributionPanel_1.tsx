import React from "react"
import { MenuToggle } from "./MenuToggle.tsx"
import { CouponLogPopup } from "./CouponLogPopup.tsx" // ✅ 팝업 컴포넌트 사용

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
        membership_number: "",
        name: "",
        birthdate: "",
        contact: "",
        signup_date: "",
    })
    const [showLogPopup, setShowLogPopup] = React.useState(false)
    const [logContent, setLogContent] = React.useState("")

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

        const addDate = (base: Date, type: string, value: string) => {
            const result = new Date(base)
            const val = parseInt(value, 10)
            if (type === "day") result.setDate(result.getDate() + val)
            else if (type === "week") result.setDate(result.getDate() + val * 7)
            else if (type === "month") result.setMonth(result.getMonth() + val)
            else if (type === "year")
                result.setFullYear(result.getFullYear() + val)
            return result
        }

        const createInstance = (info: any) => {
            const baseDate = info.signup_date
                ? new Date(info.signup_date)
                : kstDate
            const coupon_due =
                temp.validity_type === "custom"
                    ? temp.validity_value
                    : formatDate(
                          addDate(
                              baseDate,
                              temp.validity_type,
                              temp.validity_value
                          )
                      )

            return {
                coupon_instance_id: generateCouponInstanceId(),
                coupon_definition_id: coupon.coupon_definition_id,
                coupon_code: generateSafeCode(
                    8 + Math.floor(Math.random() * 3)
                ),
                status: "available",
                membership_number: info.membership_number,
                issued_at: formatDate(kstDate),
                coupon_due,
                sender_info: {
                    is_vaadd: true,
                    membership_number: null,
                    name: null,
                    birthdate: null,
                    contact: null,
                },
                receiver_info: {
                    membership_number: info.membership_number,
                    name: info.name,
                    birthdate: info.birthdate,
                    contact: info.contact,
                },
                order_id: null,
                used_location: null,
                used_timestamp: null,
                used_amount: null,
            }
        }

        const postInstance = async (payload: any) => {
            const res = await fetch(
                "https://terene-db-server.onrender.com/api/v2/coupon-instances",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )
            if (!res.ok) throw new Error("쿠폰 발급 실패")
            return res.json()
        }

        const count = temp.distributeCount || 1
        const isBulk = isGroup || isMembershipType

        const codeResults: { member: string; code: string }[] = []

        if (isBulk) {
            const targetGrades = isMembershipType
                ? temp.conditions_json?.find(
                      (c: any) => c.type === "membership"
                  )?.members || []
                : temp.groupTarget || []

            const res = await fetch(
                "https://terene-db-server.onrender.com/api/v2/customers"
            )
            const customers = await res.json()

            const filtered = customers.filter((c: any) =>
                targetGrades.includes(c.membership_grade)
            )

            for (const customer of filtered) {
                const info = {
                    membership_number: customer.membership_number,
                    name: customer.name_kor || "알수없음",
                    birthdate: customer.birthdate || "",
                    contact: customer.phone || "",
                    signup_date: customer.signup_date || "",
                }

                for (let i = 0; i < count; i++) {
                    const instance = createInstance(info)
                    await postInstance(instance)
                    codeResults.push({
                        member: info.membership_number || "비회원",
                        code: instance.coupon_code,
                    })
                }
            }
        } else {
            const info = {
                ...memberInfo,
                signup_date: memberInfo.signup_date || "",
            }

            for (let i = 0; i < count; i++) {
                const instance = createInstance(info)
                await postInstance(instance)
                codeResults.push({
                    member: instance.membership_number || "비회원",
                    code: instance.coupon_code,
                })
            }
        }

        const log =
            `총 ${codeResults.length}개의 쿠폰이 발급되었습니다:\n\n` +
            codeResults
                .map((r, idx) => `#${idx + 1} → ${r.member} 에게 [${r.code}]`)
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
            <div
                style={{
                    marginTop: 16,
                    borderTop: "1px dashed #ccc",
                    paddingTop: 12,
                }}
            >
                {/* ... 기존 UI 생략 ... */}
                <button
                    onClick={handleDistribute}
                    style={
                        {
                            /* 스타일 생략 */
                        }
                    }
                >
                    쿠폰 배포
                </button>
            </div>
        </>
    )
}
