// MembersTableToolbar.tsx
import { useState } from "react"

type Tab = "전체" | "개인" | "법인" | "블랙리스트"

export function MembersTableToolbar({
    tab,
    onChangeTab,
    onSearch,
    onCreate,
    onChangeGrade,
    onChangeRole, // ✅ 새로 추가: 관리자/회원
    onChangeNationality,
    onReload,
    viewMode = "desktop",
}: {
    tab: Tab
    onChangeTab: (v: Tab) => void
    onSearch: (q: string) => void
    onCreate: () => void
    onChangeGrade: (v: string) => void
    onChangeRole: (v: "" | "admin" | "member") => void // ✅ phase 제거
    onChangeNationality: (v: "" | "domestic" | "foreign") => void
    onReload: () => void
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
    const [query, setQuery] = useState("")
    const [grade, setGrade] = useState("")
    const [role, setRole] = useState<"" | "admin" | "member">("")
    const [nationality, setNationality] = useState<"" | "domestic" | "foreign">(
        ""
    )

    const tabs: Tab[] = ["전체", "개인", "법인", "블랙리스트"]

    return (
        <div
            style={{
                width: "100%",
                padding: "0",
                fontFamily: "Pretendard Regular",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                backgroundColor: "transparent",
            }}
        >
            <div
                style={{
                    fontFamily: "Pretendard SemiBold",
                    fontSize: viewMode === "mobile" ? 14 : 18,
                    letterSpacing: "0.2em",
                    lineHeight: "1.8em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <span>전체 회원 조회</span>
                <button
                    type="button"
                    onClick={onReload}
                    style={{
                        all: "unset",
                        cursor: "pointer",
                        fontFamily: "Pretendard Regular",
                        fontSize: 14,
                        color: "#666",
                        borderBottom: "1px solid #666",
                        paddingBottom: 2,
                        letterSpacing: "0.06em",
                    }}
                >
                    Reload
                </button>
            </div>

            <div style={{ display: "flex", width: "100%" }}>
                {tabs.map((label) => (
                    <div
                        key={label}
                        onClick={() => onChangeTab(label)}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "12px 0",
                            fontFamily:
                                tab === label
                                    ? "Pretendard SemiBold"
                                    : "Pretendard Regular",
                            fontSize: viewMode === "mobile" ? 12 : 14,
                            backgroundColor:
                                tab === label ? "#EBEBEB" : "transparent",
                            cursor: "pointer",
                            border: "none",
                            userSelect: "none",
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <select
                    value={role}
                    onChange={(e) => {
                        const v = e.target.value as "" | "admin" | "member"
                        setRole(v)
                        onChangeRole(v)
                    }}
                    style={selectStyle}
                >
                    <option value="">회원 전체</option>
                    <option value="admin">관리자 (A-)</option>
                    <option value="member">고객 (U-)</option>
                </select>

                <select
                    value={grade}
                    onChange={(e) => {
                        setGrade(e.target.value)
                        onChangeGrade(e.target.value)
                    }}
                    style={selectStyle}
                >
                    <option value="">등급 전체</option>
                    <option value="Non-Member">Non-Member</option>
                    <option value="TERENE 6">TERENE 6</option>
                    <option value="TERENE 9">TERENE 9</option>
                    <option value="TERENE 12">TERENE 12</option>
                    <option value="TERENE 24">TERENE 24</option>
                    <option value="All-Free">All-Free</option>
                </select>

                <select
                    value={nationality}
                    onChange={(e) => {
                        const v = e.target.value as "" | "domestic" | "foreign"
                        setNationality(v)
                        onChangeNationality(v)
                    }}
                    style={selectStyle}
                >
                    <option value="">국적 전체</option>
                    <option value="domestic">내국인</option>
                    <option value="foreign">외국인</option>
                </select>
            </div>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSearch(query)
                    }}
                    onFocus={() => setIsSearchBarFocused(true)}
                    onBlur={() => setIsSearchBarFocused(false)}
                    placeholder=""
                    style={{
                        flex: 1,
                        height: 36,
                        padding: "0 12px",
                        background: isSearchBarFocused
                            ? "#f5f5f5"
                            : "transparent",
                        border: "none",
                        borderBottom: "1px solid #222222",
                        outline: "none",
                        fontFamily: "Pretendard Regular",
                        fontSize: 14,
                        color: "#000000",
                        lineHeight: "1.8em",
                        letterSpacing: "0.1em",
                        transition: "background 0.2s ease",
                    }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 170 }}>
                        <button
                            onClick={() => onSearch(query)}
                            style={btnStyleBright}
                        >
                            검색
                        </button>
                    </div>
                    <div style={{ width: 170 }}>
                        <button onClick={onCreate} style={btnStyleDark}>
                            등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const selectStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    fontFamily: "Pretendard Regular",
    fontSize: 12,
    letterSpacing: "0.1em",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid #222222",
    outline: "none",
    color: "#000000",
}

const btnStyleBright: React.CSSProperties = {
    height: 36,
    padding: "0 16px",
    backgroundColor: "#ebebeb",
    border: "none",
    cursor: "pointer",
    fontFamily: "Pretendard SemiBold",
    fontSize: 14,
    width: "100%",
}

const btnStyleDark: React.CSSProperties = {
    height: 36,
    padding: "0 16px",
    color: "#ffffff",
    backgroundColor: "#545454",
    border: "none",
    cursor: "pointer",
    fontFamily: "Pretendard SemiBold",
    fontSize: 14,
    width: "100%",
}
