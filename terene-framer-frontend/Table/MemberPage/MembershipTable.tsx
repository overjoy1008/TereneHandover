import * as React from "react"
import { useEffect, useState } from "react"
import { useStore } from "../../Store/MainStore.tsx"
import { addPropertyControls, ControlType } from "framer"

type Customer = {
    membership_number: string
    name_kor: string
    is_personal: boolean
    // 등급을 나타내는 필드를 명확히 정의하지 않아 예시로 사용
    membership_grade?: string
}

export function MembershipTable({
    viewMode = "desktop",
}: {
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const [store] = useStore()
    const [member, setMember] = useState<Customer | null>(null)

    // 📌 사용 시작일 추출 (signup_date → '매년 MM월 DD일')
    const getSignupDateText = (dateStr?: string) => {
        if (!dateStr) return "-"
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return "-"
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `매년 ${month}월 ${day}일`
    }

    // 📌 기준 사용일 추출 ('UNMU 6', 'TERENE 4' 등 → '매년 6박')
    const getUsageDaysText = (grade?: string) => {
        if (!grade) return "-"
        const match = grade.match(/\b(?:UNMU|TERENE)\s*(\d+)/i)
        if (!match) return "-"
        return `매년 ${match[1]}박`
    }

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/customers"
                )
                const all = await res.json()
                const found = all.find(
                    (item: Customer) =>
                        item.membership_number === store.membership_number
                )
                if (found) setMember(found)
            } catch (e) {
                console.error("회원 정보를 불러오지 못했습니다.", e)
            }
        }

        fetchMember()
    }, [store.membership_number])

    if (!member)
        return (
            <div style={{ fontFamily: "Pretendard", fontSize: 16 }}>
                로딩 중...
            </div>
        )

    const Field = ({
        label,
        value,
    }: {
        label: string
        value?: string | number
    }) => (
        <div style={{ display: "flex", gap: 15 }}>
            <div
                style={{
                    minWidth: 165,
                    fontFamily: "Pretendard Regular",
                    fontSize: viewMode === "mobile" ? 13 : 14,
                    color: "#949494",
                }}
            >
                {label}
            </div>
            <div
                style={{
                    flex: 1,
                    fontFamily: "Pretendard Regular",
                    fontSize: viewMode === "mobile" ? 13 : 14,
                    color: "#000000",
                }}
            >
                {value || "-"}
            </div>
        </div>
    )

    const Section = ({
        children,
        first = false,
        hasBottomBorder = false,
    }: {
        children: React.ReactNode
        first?: boolean
        hasBottomBorder?: boolean
    }) => (
        <div
            style={{
                paddingTop: first ? 30 : 15,
                paddingBottom: 15,
                borderTop: first ? "1px solid #e0e0e0" : "1px solid #ebebeb",
                borderBottom: hasBottomBorder ? "1px solid #ebebeb" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 15,
            }}
        >
            {children}
        </div>
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
            }}
        >
            {/* Section 1: 회원번호 및 등급 */}
            <Section first>
                <Field label="회원번호" value={member.membership_number} />
                <Field label="회원등급" value={member.membership_grade} />
            </Section>

            {/* Section 2: 사용 정보 */}
            <Section hasBottomBorder>
                <Field
                    label="사용 시작일"
                    value={getSignupDateText((member as any).signup_date)}
                />
                <Field
                    label="기준 사용일"
                    value={getUsageDaysText(member.membership_grade)}
                />
            </Section>
        </div>
    )
}

addPropertyControls(MembershipTable, {
    viewMode: {
        type: ControlType.Enum,
        title: "View",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop", "Tablet", "Mobile"],
        defaultValue: "desktop",
    },
})
