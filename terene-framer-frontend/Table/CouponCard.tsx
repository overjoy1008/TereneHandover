
import * as React from "react"
import { MenuToggle } from "./MenuToggle.tsx"
import { ConditionBadge } from "./ConditionBadge.tsx"
import { motion, AnimatePresence } from "framer-motion"
import { GlobeAltIcon, UserIcon, KeyIcon } from "@heroicons/react/24/solid" // Framer 환경이면 heroicons 설치되어 있을 것
import { CouponDistributionPanel } from "./CouponDistributionPanel.tsx"

export function CouponCard({
    coupon,
    onUpdate,
    onDelete,
}: {
    coupon: any
    onUpdate?: (updated: any) => void
    onDelete?: () => void
}) {
    const [temp, setTemp] = React.useState({ ...coupon })
    const [editingName, setEditingName] = React.useState(false)
    const [editingDescription, setEditingDescription] = React.useState(false)
    const [editingValue, setEditingValue] = React.useState(false)
    const [editingValidityValue, setEditingValidityValue] =
        React.useState(false)

    const [editingCode, setEditingCode] = React.useState(false)
    const [newMember, setNewMember] = React.useState("")
    const [showMenu, setShowMenu] = React.useState(false)
    const [deleteState, setDeleteState] = React.useState<
        "none" | "pending" | "confirm" | "direct"
    >("none")
    const timeoutRef = React.useRef<any>(null)
    const ref = React.useRef<HTMLDivElement>(null)

    const [memberInfo, setMemberInfo] = React.useState({
        membership_number: "",
        name: "",
        birthdate: "",
        contact: "",
        signup_date: "",
    })

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setDeleteState("none")
                setShowMenu(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const typeCycle = ["global", "code", "membership"]
    const nextType = (current: string) =>
        typeCycle[(typeCycle.indexOf(current) + 1) % typeCycle.length]

    const isEnabled = temp.enabled === true || temp.enabled === "true"
    const currentType = (temp.type || "global").toLowerCase()

    const tagColors = {
        global: "#d0ecff",
        membership: "#ffe0e0",
        code: "#efe0ff",
    }

    const tagBorders = {
        global: "#3399ff",
        membership: "#ff6666",
        code: "#b266ff",
    }

    const tagTextColors = {
        global: "#1c4f7a",
        membership: "#7a1c1c",
        code: "#4e1c7a",
    }

    const buttonBaseStyle: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 700,
        padding: "2px 12px",
        background: "#fff",
        color: "#222",
        border: "1px solid #ccc",
        borderRadius: 999,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease-in-out",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: "1.5",
    }

    const handleChange = (key: string, value: any) => {
        const updated = { ...temp, [key]: value }
        setTemp(updated)
        if (onUpdate) onUpdate(updated)
    }

    const handleAddCondition = (type: string) => {
        if (temp.conditions_json?.some((c: any) => c.type === type)) return

        const newCondition = {
            type,
            ...(type === "date" && { startDate: "", endDate: "" }),
            ...(type === "price_condition" && { min: "", max: "" }),
            ...(type === "membership" && { members: [] }),
            ...(type === "seasonal" && { allowedCategories: [] }),
        }

        handleChange("conditions_json", [
            ...(temp.conditions_json || []),
            newCondition,
        ])
        setShowMenu(false)
    }

    const availableConditionTypes = [
        "date",
        "minimum_price",
        "membership",
        "seasonal",
        "relay",
        "applied_discount",
        "phase",
        "revisit",
    ]

    const conditionTypeLabels: Record<string, string> = {
        date: "📅 적용 기간",
        minimum_price: "💰 최소 결제 금액",
        membership: "👥 멤버십",
        seasonal: "📅 요일/시즌",
        relay: "🛏 연박 조건",
        applied_discount: "🎁 할인 금액 조건",
        phase: "⏱️ 페이즈 고객",
        revisit: "🔄️ 재방문 횟수",
    }

    const handleDeleteClick = () => {
        if (deleteState === "confirm" || deleteState === "direct") {
            onDelete?.()
        } else if (deleteState === "pending") {
            setDeleteState("confirm")
        }
    }

    React.useEffect(() => {
        if (!temp.distributeMode && temp.type !== "membership") {
            handleChange("distributeMode", "personal")
        }
        if (temp.type === "group" && !temp.groupTarget) {
            handleChange("groupTarget", [])
        }
    }, [])

    return (
        <div
            ref={ref}
            onClick={() => {
                if (deleteState !== "none") setDeleteState("none")
                if (showMenu) setShowMenu(false) // ✅ 이 줄을 추가
            }}
            style={{
                width: "100%",
                //width: 525,
                minHeight: 500,
                aspectRatio: "3.5 / 2",
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: "16px 20px 8px 20px",
                background: "#fff",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                // justifyContent: "space-between",
                fontFamily: "Pretendard, sans-serif",
                filter: !isEnabled ? "grayscale(0.6)" : "none",
                opacity: !isEnabled ? 0.6 : 1,
                transition: "0.3s ease",
            }}
        >
            {deleteState === "none" ? (
                <button
                    style={{
                        ...buttonBaseStyle,
                        fontWeight: isEnabled ? 700 : 600,
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5"
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff"
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleChange("enabled", !isEnabled)
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteState("direct")
                    }}
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            timeoutRef.current = setTimeout(() => {
                                setDeleteState("pending")
                            }, 600)
                        }
                    }}
                    onMouseUp={() => clearTimeout(timeoutRef.current)}
                    onMouseLeave={() => clearTimeout(timeoutRef.current)}
                >
                    {isEnabled ? "활성" : "비활성"}
                </button>
            ) : (
                <button
                    style={{
                        ...buttonBaseStyle,
                        color: "#d00",
                        border: "1px solid #d88",
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffeaea"
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff"
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick()
                    }}
                >
                    삭제
                </button>
            )}

            <div style={{ margin: "0 0 16px 0 " }}>
                <span
                    onClick={() => handleChange("type", nextType(currentType))}
                    style={{
                        fontSize: 11,
                        margin: "6px 4px",
                        padding: "3px 16px",
                        borderRadius: 999,
                        background: tagColors[currentType] ?? "#eee",
                        border: `1px solid ${tagBorders[currentType] ?? "#ccc"}`,
                        color: tagTextColors[currentType] ?? "#333",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                    }}
                >
                    {currentType}
                </span>

                {!editingName ? (
                    <div
                        onClick={() => setEditingName(true)}
                        style={{
                            lineHeight: "28px",
                            fontSize: 22,
                            padding: "0px 6px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {temp.name || "(제목 없음)"}
                    </div>
                ) : (
                    <input
                        autoFocus
                        type="text"
                        defaultValue={temp.name || ""}
                        onBlur={(e) => {
                            handleChange("name", e.target.value)
                            setEditingName(false)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleChange("name", e.currentTarget.value)
                                setEditingName(false)
                            }
                        }}
                        style={{
                            height: "28px",
                            fontSize: 22,
                            fontWeight: 700,
                            padding: "4px 6px",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            width: "100%",
                        }}
                    />
                )}

                {!editingDescription ? (
                    <div
                        onClick={() => setEditingDescription(true)}
                        style={{
                            lineHeight: "22px",
                            fontSize: 14,
                            padding: "0px 6px",
                            color: "#666",
                            cursor: "pointer",
                        }}
                    >
                        {temp.description || "(부제목 없음)"}
                    </div>
                ) : (
                    <input
                        autoFocus
                        type="text"
                        defaultValue={temp.description || ""}
                        onBlur={(e) => {
                            handleChange("description", e.target.value)
                            setEditingDescription(false)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleChange(
                                    "description",
                                    e.currentTarget.value
                                )
                                setEditingDescription(false)
                            }
                        }}
                        style={{
                            height: "22px",
                            fontSize: 14,
                            // marginBottom: 4,
                            padding: "4px 6px",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            width: "100%",
                        }}
                    />
                )}
            </div>

            {/* 조건 추가 및 할인 슬라이더 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 6,
                    position: "relative",
                }}
            >
                <button
                    style={{
                        ...buttonBaseStyle,
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5"
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff"
                    }}
                    onClick={() => setShowMenu((prev) => !prev)}
                >
                    조건 추가
                </button>
                {!editingValue ? (
                    <div
                        onClick={() => setEditingValue(true)}
                        style={{
                            fontSize: 13,
                            lineHeight: "24px",
                            fontWeight: 600,
                            color: "#2e7d32",
                            cursor: "pointer",
                        }}
                    >
                        −{" "}
                        {temp.discount_type === "percentage"
                            ? `${temp.discount_value}%`
                            : `${Number(temp.discount_value).toLocaleString()}₩`}
                    </div>
                ) : (
                    <input
                        type="text"
                        autoFocus
                        defaultValue={temp.discount_value}
                        onBlur={(e) => {
                            handleChange("discount_value", e.target.value)
                            setEditingValue(false)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleChange(
                                    "discount_value",
                                    e.currentTarget.value
                                )
                                setEditingValue(false)
                            }
                        }}
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "4px 6px",
                            width: 90,
                            height: 24,
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            color: "#2e7d32",
                        }}
                    />
                )}
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 6,
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginLeft: "auto",
                        marginRight: "8px",
                    }}
                >
                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "일반", value: "false" },
                            { label: "단독", value: "true" },
                        ]}
                        selected={String(temp.exclusive)}
                        onChange={(val) =>
                            handleChange("exclusive", val === "true")
                        }
                    />
                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "1박만", value: "1" },
                            { label: "2박", value: "2" },
                            { label: "3박", value: "3" },
                            { label: "매일", value: "-1" },
                        ]}
                        selected={String(temp.scope)}
                        onChange={(val) => handleChange("scope", Number(val))}
                    />

                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "1회성", value: "1" },
                            { label: "무제한", value: "-1" },
                        ]}
                        selected={String(temp.counter)}
                        onChange={(val) => handleChange("counter", Number(val))}
                    />

                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "%", value: "percentage" },
                            { label: "₩", value: "fixed" },
                        ]}
                        selected={temp.discount_type}
                        onChange={(val) => handleChange("discount_type", val)}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginLeft: "auto",
                        marginRight: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginLeft: "auto",
                            marginRight: "8px",
                            alignItems: "center",
                        }}
                    >
                        {["custom", "day", "week", "month", "year"].includes(
                            temp.validity_type
                        ) && (
                            <>
                                {!editingValidityValue ? (
                                    <div
                                        onClick={() =>
                                            setEditingValidityValue(true)
                                        }
                                        style={{
                                            fontSize: 13,
                                            lineHeight: "24px",
                                            fontWeight: 600,
                                            color: "#2e7d32",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {temp.validity_value || "입력 없음"}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        autoFocus
                                        defaultValue={temp.validity_value}
                                        onBlur={(e) => {
                                            handleChange(
                                                "validity_value",
                                                e.target.value
                                            )
                                            setEditingValidityValue(false)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleChange(
                                                    "validity_value",
                                                    e.currentTarget.value
                                                )
                                                setEditingValidityValue(false)
                                            }
                                        }}
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                            padding: "4px 6px",
                                            width: 160,
                                            height: 28,
                                            border: "1px solid #ccc",
                                            borderRadius: 6,
                                            color: "#333",
                                            backgroundColor: "#fff",
                                        }}
                                    />
                                )}
                            </>
                        )}

                        <MenuToggle
                            mode="single"
                            options={[
                                { label: "일", value: "day" },
                                { label: "주", value: "week" },
                                { label: "월", value: "month" },
                                { label: "연", value: "year" },
                                { label: "날짜", value: "custom" },
                                { label: "영구", value: "permanent" },
                            ]}
                            selected={temp.validity_type}
                            onChange={(val) =>
                                handleChange("validity_type", val)
                            }
                        />

                        <MenuToggle
                            mode="single"
                            options={[
                                { label: "재발행", value: "true" },
                                { label: "X", value: "false" },
                            ]}
                            selected={String(temp.refillable)}
                            onChange={(val) =>
                                handleChange("refillable", val === "true")
                            }
                        />
                    </div>
                </div>

                {/* 조건 메뉴 */}
                {showMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            display: "flex",
                            background: "rgba(240, 240, 240, 0.6)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(200, 200, 200, 0.4)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                            zIndex: 10,
                            flexWrap: "wrap", // ✅ 여러 줄 허용
                            rowGap: 6,
                            columnGap: 8,
                            maxWidth: 340, // ✅ 폭 제한하면 레이아웃 예쁘게 잡힘
                            marginTop: 6,
                        }}
                    >
                        {availableConditionTypes
                            .filter(
                                (type) =>
                                    !temp.conditions_json?.some(
                                        (c: any) => c.type === type
                                    )
                            ) // ✅ 이미 있는 조건은 제외
                            .map((type) => (
                                <div
                                    key={type}
                                    onClick={() => handleAddCondition(type)}
                                    style={{
                                        padding: "4px 10px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        background: "#fff",
                                        color: "#222",
                                        cursor: "pointer",
                                        transition:
                                            "background 0.2s ease-in-out",
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#f5f5f5"
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#fff"
                                    }}
                                >
                                    {conditionTypeLabels[type]}
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* 조건 뱃지 */}
            <div
                className="coupon-scrollable"
                style={{
                    minHeight: 106,
                    maxHeight: 136,
                    overflowY: "auto",
                    marginTop: 6,
                    // maskImage:
                    //     "linear-gradient(to bottom, black 0%, transparent 6%, black 12%, black 88%, transparent 94%, black 100%)",
                    // WebkitMaskImage:
                    //     "linear-gradient(to bottom, black 0%, transparent 6%, black 12%, black 88%, transparent 94%, black 100%)",
                }}
            >
                {Array.isArray(temp.conditions_json) &&
                    temp.conditions_json.map((cond, i) => (
                        <ConditionBadge
                            key={i}
                            condition={cond}
                            onUpdate={(updated) => {
                                const next = [...temp.conditions_json]
                                next[i] = updated
                                handleChange("conditions_json", next)
                            }}
                            onDelete={() => {
                                const next = temp.conditions_json.filter(
                                    (_, idx) => idx !== i
                                )
                                handleChange("conditions_json", next)
                            }}
                        />
                    ))}
            </div>

            {/* 코드 / 개인 멤버 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {["code", "membership"].includes(temp.type) && (
                    <CouponDistributionPanel
                        temp={temp}
                        coupon={coupon}
                        handleChange={handleChange}
                    />
                )}
            </div>
        </div>
    )
}

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
