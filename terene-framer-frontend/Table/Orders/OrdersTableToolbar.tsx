// OrdersTableToolbar.tsx
import { useState } from "react"

export function OrdersTableToolbar({
    tab,
    onChangeTab,
    branch,
    onChangeBranch,
    onSearch,
    viewMode = "desktop",
}: {
    tab: "예약" | "완료" | "취소"
    onChangeTab: (v: "예약" | "완료" | "취소") => void
    branch: string
    onChangeBranch: (v: string) => void
    onSearch: (q: string) => void
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const branches = ["UNMU"]
    const periods = ["1주일", "1개월", "6개월", "1년"]

    const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [query, setQuery] = useState("")

    const handleTabClick = (label: "예약" | "완료" | "취소") => {
        onChangeTab(label)
    }

    return (
        <div
            style={{
                width: "100%",
                padding: "0",
                borderBottom: "1px solid #ccc",
                fontFamily: "Pretendard, sans-serif",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 40,
                backgroundColor: "transparent",
            }}
        >
            <div
                style={{
                    fontFamily: "Pretendard Medium, sans-serif",
                    fontSize: viewMode === "mobile" ? 14 : 18,
                    letterSpacing: "0.2em",
                    lineHeight: "1.8em",
                }}
            >
                예약 내역 조회
            </div>

            <div style={{ display: "flex", width: "100%" }}>
                {["예약", "완료", "취소"].map((label) => (
                    <div
                        key={label}
                        onClick={() =>
                            handleTabClick(label as "예약" | "완료" | "취소")
                        }
                        style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "12px 0",
                            fontFamily:
                                tab === label
                                    ? "Pretendard Medium, sans-serif"
                                    : "Pretendard Regular, sans-serif",
                            fontSize: viewMode === "mobile" ? 12 : 14,
                            backgroundColor:
                                tab === label ? "#EBEBEB" : "transparent",
                            cursor: "pointer",
                            border: "none",
                            userSelect: "none",
                        }}
                    >
                        {label} 내역
                    </div>
                ))}
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
                        fontFamily: "Pretendard Regular, sans-serif",
                        fontSize: 14,
                        color: "#000000",
                        lineHeight: "1.8em",
                        letterSpacing: "0.1em",
                        transition: "background 0.2s ease",
                    }}
                />
                <div style={{ width: 170 }}>
                    <button
                        onClick={() => onSearch(query)}
                        style={{
                            height: 36,
                            padding: "0 16px",
                            backgroundColor: "#ebebeb",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "Pretendard Medium, sans-serif",
                            fontSize: 14,
                            width: "100%",
                        }}
                    >
                        검색
                    </button>
                </div>
            </div>

            {/* <div
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 0.1fr 1fr 1fr",
                    gap: 10,
                }}
            >
                {periods.map((p) => (
                    <button
                        key={p}
                        onClick={() => {}}
                        style={{
                            height: 36,
                            padding: "0 12px",
                            fontFamily: "Pretendard Regular, sans-serif",
                            fontSize: 14,
                            border: "1px solid #000000",
                            backgroundColor: "transparent",
                            color: "#000",
                            cursor: "not-allowed",
                            width: "100%",
                        }}
                    >
                        {p}
                    </button>
                ))}

                <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={""}
                    onChange={() => {}}
                    onFocus={(e) =>
                        (e.target.style.backgroundColor = "#EBEBEB")
                    }
                    onBlur={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                    }
                    style={{
                        textAlign: "center",
                        height: 36,
                        padding: "0 8px",
                        border: "none",
                        borderBottom: "1px solid #000000",
                        fontFamily: "Pretendard Regular, sans-serif",
                        fontSize: 14,
                        width: "100%",
                        backgroundColor: "transparent",
                        outline: "none",
                    }}
                />
                <div
                    style={{
                        textAlign: "center",
                        lineHeight: "36px",
                        fontFamily: "Pretendard SemiBold, sans-serif",
                        fontSize: 14,
                    }}
                >
                    -
                </div>
                <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={""}
                    onChange={() => {}}
                    onFocus={(e) =>
                        (e.target.style.backgroundColor = "#EBEBEB")
                    }
                    onBlur={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                    }
                    style={{
                        textAlign: "center",
                        height: 36,
                        padding: "0 8px",
                        border: "none",
                        borderBottom: "1px solid #000000",
                        fontFamily: "Pretendard Regular, sans-serif",
                        fontSize: 14,
                        width: "100%",
                        backgroundColor: "transparent",
                        outline: "none",
                    }}
                />

                <button
                    onClick={() => {}}
                    style={{
                        height: 36,
                        padding: "0 16px",
                        backgroundColor: "#ebebeb",
                        border: "none",
                        cursor: "not-allowed",
                        fontFamily: "Pretendard Medium, sans-serif",
                        fontSize: 14,
                        width: "100%",
                    }}
                >
                    숙박 일정 조회
                </button>
            </div> */}

            <div style={{ position: "relative", width: "100%" }}>
                {isFocused && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "#EBEBEB",
                            borderRadius: 0,
                            zIndex: 0,
                        }}
                    />
                )}

                <select
                    value={branch}
                    onChange={(e) => onChangeBranch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        width: "100%",
                        height: 36,
                        padding: "0 12px",
                        fontFamily: "Pretendard Regular, sans-serif",
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: "1px solid #222222",
                        outline: "none",
                        color: branch === "" ? "#999999" : "#000000",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <option value="" disabled>
                        지점을 선택하세요
                    </option>
                    <option value="UNMU" style={{ color: "#000000" }}>
                        UNMU (Hwacheon, Gangwon)
                    </option>
                    {branches
                        .filter((b) => b !== "UNMU")
                        .map((b) => (
                            <option key={b} value={b}>
                                {b} (Hwacheon, Gangwon)
                            </option>
                        ))}
                </select>
            </div>
        </div>
    )
}
