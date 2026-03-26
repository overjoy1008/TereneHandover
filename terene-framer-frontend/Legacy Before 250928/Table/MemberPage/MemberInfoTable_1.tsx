import * as React from "react"
import { useEffect, useState } from "react"
import { useStore } from "../../Calendar/MonthDisplay.tsx"

type Customer = {
    membership_number: string
    password: string
    name_kor: string
    name_eng: string
    is_personal: boolean
    birthdate?: string
    gender?: string
    business_registration_number?: string
    contact_person_name?: string
    contact_person_phone?: string
    address: string
    phone: string
    email: string
}

export function MemberInfoTable() {
    const [store] = useStore()
    const [member, setMember] = useState<Customer | null>(null)

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
        action,
    }: {
        label: string
        value?: string | number
        action?: React.ReactNode
    }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div
                style={{
                    minWidth: 165,
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    letterSpacing: "0em",
                    lineHeight: "1.2em",
                    color: "#949494",
                }}
            >
                {label}
            </div>
            <div
                style={{
                    flex: 1,
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    letterSpacing: "0em",
                    lineHeight: "1.2em",
                    color: "#000000",
                    whiteSpace: "pre-wrap",
                }}
            >
                {value || "-"}
            </div>
            {action}
        </div>
    )

    const FieldGroup = ({
        label,
        lines,
    }: {
        label: string
        lines: string[]
    }) => (
        <div style={{ display: "flex", gap: 15 }}>
            <div
                style={{
                    minWidth: 165,
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    letterSpacing: "0em",
                    lineHeight: "1.2em",
                    color: "#949494",
                    paddingTop: 2,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    letterSpacing: "0em",
                    lineHeight: "1.2em",
                    color: "#000000",
                    whiteSpace: "pre-wrap",
                }}
            >
                {lines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                ))}
            </div>
        </div>
    )

    const Section = ({
        children,
        first = false,
    }: {
        children: React.ReactNode
        first?: boolean
    }) => (
        <div
            style={{
                paddingTop: first ? 30 : 15,
                paddingBottom: 15,
                borderTop: first ? "1px solid #e0e0e0" : "1px solid #ebebeb",
                display: "flex",
                flexDirection: "column",
                gap: 15,
            }}
        >
            {children}
        </div>
    )

    const maskPassword = (password: string) => "*".repeat(password.length)

    const formatAddress = (text?: string) =>
        text
            ? text
                  .split(", ")
                  .map((line) => line + ",")
                  .join("\n")
                  .replace(/,$/, "")
            : "-"

    const formatContractInfo = (text?: string) => {
        if (!text) return "-"
        const [name, position] = text.split(" / ")
        return `${name} | ${position || ""}`
    }

    const formatGender = (gender?: string) =>
        gender === "Male" ? "남성" : gender === "Female" ? "여성" : "-"

    const formatBirth = (b?: string) => {
        if (!b || b.length !== 8) return "-"
        return `${b.slice(0, 4)}년 ${b.slice(4, 6)}월 ${b.slice(6, 8)}일`
    }

    const formatType = (isPersonal: boolean) =>
        isPersonal ? "개인회원" : "법인회원"

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                width: "100%",
            }}
        >
            {/* Section 1: 계정 */}
            <Section first>
                <Field label="회원번호" value={member.membership_number} />
                <Field
                    label="비밀번호"
                    value={maskPassword(member.password)}
                    action={
                        <button
                            onClick={() => {
                                window.location.href = "/find-password"
                            }}
                            style={{
                                fontFamily: "Pretendard",
                                fontSize: 14,
                                color: "#000000",
                                textDecoration: "underline",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            비밀번호 변경
                        </button>
                    }
                />
            </Section>

            {/* Section 2: 회원 정보 */}
            <Section>
                <Field
                    label="회원 유형"
                    value={formatType(member.is_personal)}
                />
                <Field label="상호 (한글)" value={member.name_kor} />
                <Field label="상호 (영문)" value={member.name_eng} />
                {member.is_personal ? (
                    <>
                        <Field
                            label="생년월일"
                            value={formatBirth(member.birthdate)}
                        />
                        <Field
                            label="성별"
                            value={formatGender(member.gender)}
                        />
                    </>
                ) : (
                    <Field
                        label="법인사업자등록번호"
                        value={member.business_registration_number}
                    />
                )}
            </Section>

            {/* Section 3: 계약 담당자 */}
            {!member.is_personal && (
                <Section>
                    <Field
                        label="계약 담당자 성명 | 직위"
                        value={formatContractInfo(member.contact_person_name)}
                    />
                    <Field
                        label="계약 담당자 연락처"
                        value={member.contact_person_phone}
                    />
                </Section>
            )}

            {/* Section 4: 연락 정보 */}
            <Section>
                <FieldGroup
                    label="주소"
                    lines={
                        member.address
                            ? member.address
                                  .split(", ")
                                  .map((line, i, arr) =>
                                      i !== arr.length - 1 ? `${line},` : line
                                  )
                            : ["-"]
                    }
                />

                <Field label="연락처" value={member.phone} />
                <Field label="이메일" value={member.email} />
            </Section>
        </div>
    )
}
