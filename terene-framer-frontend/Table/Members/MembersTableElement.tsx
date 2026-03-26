// MembersTableElement.tsx
import React, { useMemo, useState } from "react"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"

const Tag = ({
    value,
    color,
    borderThickness,
    fontFamily,
}: {
    value: string
    color: string
    borderThickness: number
    fontFamily: string
}) => (
    <span
        style={{
            height: 27,
            width: "fit-content",
            padding: "5px 10px",
            display: "inline-block",
            fontSize: 14,
            border: `${borderThickness}px solid ${color}`,
            color,
            fontFamily,
        }}
    >
        {value}
    </span>
)

const normalize = (s: any) => (s == null ? "-" : String(s))

export function MembersTableElement({
    data,
    onOpenDetail,
    onUpdateMember,
}: {
    data: any
    onOpenDetail: () => void
    onUpdateMember: (
        membershipNumber: string,
        next: any
    ) => Promise<void> | void
}) {
    const [toggling, setToggling] = useState(false)

    const memberType = data.is_personal ? "개인" : "법인"
    const memberTypeColor = data.is_personal ? "#3551ff" : "#777777"

    const blacklistTag = useMemo(() => {
        if (!data.blacklist) return null
        return (
            <Tag
                value="BLACKLIST"
                color="#000000"
                borderThickness={2}
                fontFamily="Pretendard Bold, sans-serif"
            />
        )
    }, [data.blacklist])

    const nationalityTag = useMemo(() => {
        const v = data.nationality || "domestic"
        return (
            <Tag
                value={v === "foreign" ? "외국인" : "내국인"}
                color={v === "foreign" ? "#6b186b" : "#2f7048"}
                borderThickness={1}
                fontFamily="Pretendard Medium, sans-serif"
            />
        )
    }, [data.nationality])

    const masked = (v: any) => {
        const s = v == null ? "" : String(v)
        if (!s) return "-"
        if (s.length <= 2) return "••"
        return "•".repeat(Math.max(4, Math.min(10, s.length)))
    }

    const identifier = data.is_personal
        ? normalize(data.birthdate)
        : normalize(data.business_registration_number)

    const handleToggleBlacklist = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const ok = window.confirm(
            data.blacklist
                ? "블랙리스트 해제하시겠습니까?"
                : "블랙리스트로 설정하시겠습니까?"
        )
        if (!ok) return
        try {
            setToggling(true)
            await onUpdateMember(data.membership_number, {
                ...data,
                blacklist: !Boolean(data.blacklist),
            })
        } finally {
            setToggling(false)
        }
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 10,
                borderTop: "1px solid #BDBDBD",
                fontFamily: "Pretendard Medium, sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 20,
                    cursor: "pointer",
                }}
                onClick={onOpenDetail}
            >
                <div
                    style={{ fontSize: 12, color: "#000", lineHeight: "35px" }}
                >
                    회원번호: {normalize(data.membership_number)}
                </div>
                <div
                    style={{ fontSize: 12, color: "#000", lineHeight: "35px" }}
                >
                    등급: {normalize(data.membership_grade)}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        lineHeight: "35px",
                    }}
                >
                    <span style={{ fontSize: 11, color: "#888" }}>
                        상세 보기
                    </span>
                    <PaginationArrow direction="right" size={8} color="#888" />
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    columnGap: 10,
                    fontSize: 13,
                    padding: "30px 0",
                    borderTop: "1px solid #E0E0E0",
                }}
                onClick={onOpenDetail}
            >
                {/* 1) 회원번호 + 가입일(밑) */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {normalize(data.membership_number)}
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {normalize(data.signup_date)}
                    </div>
                </div>

                {/* 2) 구분 + 태그들 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <Tag
                        value={memberType}
                        color={memberTypeColor}
                        borderThickness={1}
                        fontFamily="Pretendard Regular, sans-serif"
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {nationalityTag}
                        {blacklistTag}
                    </div>
                </div>

                {/* 3) 이름/상호 */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {normalize(data.name_kor)}
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {normalize(data.name_eng)}
                    </div>
                </div>

                {/* 4) 식별 번호 (개인: 생년월일 / 법인: 사업자등록번호) */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {identifier}
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {data.is_personal ? "생년월일" : "사업자등록번호"}
                    </div>
                </div>

                {/* 5) 회원 등급(등급 + Phase 통합) */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {normalize(data.membership_grade)}
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {normalize(data.phase)}
                    </div>
                </div>

                {/* 6) 연락처 */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {normalize(data.phone)}
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {normalize(data.email)}
                    </div>
                </div>

                {/* 7) 주소 */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    {normalize(data.address)}
                </div>

                {/* 8) ID | PW */}
                <div style={{ fontFamily: "Pretendard SemiBold, sans-serif" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        ID: {normalize(data.id)}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        PW: {masked(data.password)}
                    </div>
                </div>
            </div>
        </div>
    )
}
