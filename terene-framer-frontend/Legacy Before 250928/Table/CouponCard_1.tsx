import * as React from "react"
import { MenuToggle } from "./MenuToggle.tsx"
import { ConditionBadge } from "./ConditionBadge.tsx"
import { motion, AnimatePresence } from "framer-motion"
import { GlobeAltIcon, UserIcon, KeyIcon } from "@heroicons/react/24/solid" // Framer 환경이면 heroicons 설치되어 있을 것

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
            ...(type === "signup_within_days" && { days: 7 }),
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
    ]

    const conditionTypeLabels: Record<string, string> = {
        date: "📅 유효기간",
        minimum_price: "💰 최소 결제 금액",
        membership: "👥 멤버십",
        seasonal: "📅 요일/시즌",
        relay: "🛏 연박 조건",
        applied_discount: "🎁 할인 금액 조건",
        phase: "⏱️ 페이즈 고객",
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
                            { label: "1박만", value: "1" },
                            { label: "2박", value: "2" },
                            { label: "3박", value: "3" },
                            { label: "매일", value: "-1" },
                        ]}
                        selected={temp.scope}
                        onChange={(val) => handleChange("scope", Number(val))}
                    />
                    <MenuToggle
                        mode="single"
                        options={[
                            { label: "1회성", value: "1" },
                            { label: "2회성", value: "2" },
                            { label: "3회성", value: "3" },
                            { label: "무제한", value: "-1" },
                        ]}
                        selected={temp.counter}
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
                        {temp.validity_type === "custom" && (
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
                    <div
                        style={{
                            marginTop: 16,
                            borderTop: "1px dashed #ccc",
                            paddingTop: 12,
                        }}
                    >
                        {/* 자동 설정 for membership 쿠폰 */}
                        {temp.type === "membership" ? (
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                <span style={{ color: "#555" }}>
                                    단체 배포 대상:
                                </span>{" "}
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
                                onChange={(val) =>
                                    handleChange("distributeMode", val)
                                }
                            />
                        )}

                        {temp.type === "membership" ||
                        temp.distributeMode === "group" ? (
                            <div style={{ marginTop: 12 }}>
                                <MenuToggle
                                    mode="multi"
                                    options={[
                                        {
                                            label: "비회원",
                                            value: "Non-Member",
                                        },
                                        {
                                            label: "TERENE 6",
                                            value: "TERENE 6",
                                        },
                                        {
                                            label: "TERENE 9",
                                            value: "TERENE 9",
                                        },
                                        {
                                            label: "TERENE 12",
                                            value: "TERENE 12",
                                        },
                                        {
                                            label: "TERENE 24",
                                            value: "TERENE 24",
                                        },
                                    ]}
                                    selected={
                                        temp.conditions_json?.find(
                                            (c: any) => c.type === "membership"
                                        )?.members || []
                                    }
                                    onChange={(val) => {
                                        const next = [
                                            ...(temp.conditions_json || []),
                                        ]
                                        const membershipIndex = next.findIndex(
                                            (c) => c.type === "membership"
                                        )
                                        if (membershipIndex !== -1) {
                                            next[membershipIndex] = {
                                                ...next[membershipIndex],
                                                members: val,
                                            }
                                        } else {
                                            next.push({
                                                type: "membership",
                                                members: val,
                                            })
                                        }
                                        handleChange("conditions_json", next)
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
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 8,
                                    }}
                                >
                                    <input
                                        placeholder="Membership Number"
                                        value={memberInfo.membership_number}
                                        onChange={(e) =>
                                            setMemberInfo({
                                                ...memberInfo,
                                                membership_number:
                                                    e.target.value,
                                            })
                                        }
                                        style={inputStyle}
                                    />

                                    <input
                                        placeholder="Signup Date"
                                        value={memberInfo.signup_date}
                                        onChange={(e) =>
                                            setMemberInfo({
                                                ...memberInfo,
                                                signup_date: e.target.value,
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
                                        placeholder="Name"
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
                                        placeholder="Birthdate"
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
                                        placeholder="Contact"
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
                                onClick={async () => {
                                    const today = new Date()
                                    const kstDate = new Date(
                                        today.getTime() + 9 * 60 * 60 * 1000
                                    )

                                    const formatDate = (d) => {
                                        const yyyy = d.getFullYear()
                                        const mm = String(
                                            d.getMonth() + 1
                                        ).padStart(2, "0")
                                        const dd = String(d.getDate()).padStart(
                                            2,
                                            "0"
                                        )
                                        return `${yyyy}-${mm}-${dd}`
                                    }

                                    const generateSafeCode = (length = 8) => {
                                        const chars =
                                            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"
                                        return Array.from(
                                            { length },
                                            () =>
                                                chars[
                                                    Math.floor(
                                                        Math.random() *
                                                            chars.length
                                                    )
                                                ]
                                        ).join("")
                                    }

                                    const generateCouponInstanceId = () => {
                                        const datePart = kstDate
                                            .toISOString()
                                            .slice(2, 10)
                                            .replace(/-/g, "")
                                        const timePart =
                                            String(kstDate.getHours()).padStart(
                                                2,
                                                "0"
                                            ) +
                                            String(
                                                kstDate.getMinutes()
                                            ).padStart(2, "0")
                                        const rand = generateSafeCode(8)
                                        return `CI-${datePart}-${timePart}-${rand}`
                                    }

                                    const addDate = (base, type, value) => {
                                        const result = new Date(base)
                                        const val = parseInt(value, 10)
                                        if (type === "day")
                                            result.setDate(
                                                result.getDate() + val
                                            )
                                        else if (type === "week")
                                            result.setDate(
                                                result.getDate() + val * 7
                                            )
                                        else if (type === "month")
                                            result.setMonth(
                                                result.getMonth() + val
                                            )
                                        else if (type === "year")
                                            result.setFullYear(
                                                result.getFullYear() + val
                                            )
                                        return result
                                    }

                                    const createInstance = (info) => {
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
                                            coupon_instance_id:
                                                generateCouponInstanceId(),
                                            coupon_definition_id:
                                                coupon.coupon_definition_id,
                                            coupon_code: generateSafeCode(
                                                8 +
                                                    Math.floor(
                                                        Math.random() * 3
                                                    )
                                            ),
                                            status: "available",
                                            membership_number:
                                                info.membership_number,
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
                                                membership_number:
                                                    info.membership_number,
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

                                    const issuedLogs: string[] = []
                                    const issueCountByMember: Record<
                                        string,
                                        number
                                    > = {}

                                    const postInstance = async (payload) => {
                                        const res = await fetch(
                                            "https://terene-db-server.onrender.com/api/v2/coupon-instances",
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                                body: JSON.stringify(payload),
                                            }
                                        )
                                        if (!res.ok)
                                            throw new Error("발급 실패")
                                        const data = await res.json()

                                        if (temp.type === "code") {
                                            // 로그: CODE → 회원번호 or 비회원
                                            const member =
                                                payload.membership_number ||
                                                "Non-Member"
                                            issuedLogs.push(
                                                `${payload.coupon_code} → ${member}`
                                            )
                                        } else if (temp.type === "membership") {
                                            // 누적 카운트
                                            const member =
                                                payload.membership_number ||
                                                "알수없음"
                                            issueCountByMember[member] =
                                                (issueCountByMember[member] ||
                                                    0) + 1
                                        }

                                        return data
                                    }

                                    const count = temp.distributeCount || 1

                                    if (
                                        temp.type === "membership" ||
                                        temp.distributeMode === "group"
                                    ) {
                                        // ✅ 단체 배포
                                        const targetGrades =
                                            temp.type === "membership"
                                                ? temp.conditions_json?.find(
                                                      (c) =>
                                                          c.type ===
                                                          "membership"
                                                  )?.members || []
                                                : temp.groupTarget || []

                                        try {
                                            const res = await fetch(
                                                "https://terene-db-server.onrender.com/api/v2/customers"
                                            )
                                            const customers = await res.json()

                                            const filtered = customers.filter(
                                                (c) =>
                                                    targetGrades.includes(
                                                        c.membership_grade
                                                    )
                                            )

                                            for (const customer of filtered) {
                                                const info = {
                                                    membership_number:
                                                        customer.membership_number,
                                                    name:
                                                        customer.name_kor ||
                                                        "알수없음",
                                                    birthdate:
                                                        customer.birthdate ||
                                                        "",
                                                    contact:
                                                        customer.phone || "",
                                                    signup_date:
                                                        customer.signup_date ||
                                                        "",
                                                }

                                                for (
                                                    let i = 0;
                                                    i < count;
                                                    i++
                                                ) {
                                                    const instance =
                                                        createInstance(info)
                                                    await postInstance(instance)
                                                    console.log(
                                                        `✅ ${info.name} (${info.membership_number}) 쿠폰 발급 완료`
                                                    )
                                                }
                                            }
                                        } catch (err) {
                                            console.error(
                                                "❌ 단체 쿠폰 발급 실패",
                                                err
                                            )
                                        }
                                    } else {
                                        // ✅ 개인 배포
                                        const info = {
                                            ...memberInfo,
                                            signup_date:
                                                memberInfo.signup_date || "",
                                        }

                                        for (let i = 0; i < count; i++) {
                                            const instance =
                                                createInstance(info)
                                            try {
                                                await postInstance(instance)
                                                console.log(
                                                    `✅ 개인 쿠폰 ${i + 1}/${count} 발급 완료`
                                                )
                                            } catch (err) {
                                                console.error(
                                                    `❌ 개인 쿠폰 ${i + 1} 실패`,
                                                    err
                                                )
                                            }
                                        }
                                    }
                                }}
                            >
                                쿠폰 배포
                            </button>
                        </div>
                    </div>
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
