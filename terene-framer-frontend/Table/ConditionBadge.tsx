
import * as React from "react"
import { MenuToggle } from "./MenuToggle.tsx"

function EditableField({
    value,
    onChange,
    placeholder = "",
    style,
}: {
    value: string
    onChange: (val: string) => void
    placeholder?: string
    style?: React.CSSProperties
}) {
    const [editing, setEditing] = React.useState(false)

    const badgeStyle: React.CSSProperties = {
        ...style,
        background: "#fbfbfb",
        border: "none",
        color: "#444",
        borderRadius: 6,
        padding: "3px 8px",
        height: "24px",
        fontSize: 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        textAlign: "center",
        whiteSpace: "nowrap",
    }

    const inputStyle: React.CSSProperties = {
        ...style,
        textAlign: "center", // ✅ 중앙 정렬 추가
    }

    return editing ? (
        <input
            autoFocus
            defaultValue={value}
            onBlur={(e) => {
                onChange(e.target.value)
                setEditing(false)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onChange(e.currentTarget.value)
                    setEditing(false)
                }
            }}
            placeholder={placeholder}
            style={inputStyle}
        />
    ) : (
        <div onClick={() => setEditing(true)} style={badgeStyle}>
            {value || placeholder}
        </div>
    )
}

export function ConditionBadge({
    condition,
    onUpdate,
    onDelete,
}: {
    condition: any
    onUpdate: (updatedCondition: any) => void
    onDelete: () => void
}) {
    const type = condition.type

    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        background: "#f0f0f0",
        borderRadius: 12,
        padding: "2px 14px",
        fontSize: 12,
        marginBottom: 4,
    }

    const labelStyle: React.CSSProperties = {
        fontWeight: 600,
        marginRight: 4,
        whiteSpace: "nowrap",
    }

    const tildeStyle: React.CSSProperties = {
        padding: "0 4px",
    }

    const inputStyle: React.CSSProperties = {
        height: "24px",
        lineHeight: "24px",
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 8px",
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "#fff",
        color: "#222",
        width: 100,
        flexShrink: 0,
        letterSpacing: "0.5px",
        boxShadow: "inset 0 0 2px #ddd",
    }

    const renderByType = () => {
        switch (type) {
            case "date":
                return (
                    <>
                        <span style={labelStyle}>조건 적용 기간:</span>
                        <EditableField
                            value={condition.startDate || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, startDate: val })
                            }
                            placeholder="시작일"
                            style={inputStyle}
                        />
                        <span style={tildeStyle}>~</span>
                        <EditableField
                            value={condition.endDate || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, endDate: val })
                            }
                            placeholder="종료일"
                            style={inputStyle}
                        />
                    </>
                )

            case "minimum_price":
                return (
                    <>
                        <span style={labelStyle}>최소 결제 금액:</span>
                        <EditableField
                            value={condition.min || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, min: val })
                            }
                            placeholder="최소"
                            style={inputStyle}
                        />
                        <span>₩ 이상</span>
                    </>
                )

            case "membership":
                return (
                    <>
                        <span style={labelStyle}>멤버십:</span>
                        <MenuToggle
                            mode="multi"
                            options={[
                                { label: "비회원", value: "Non-Member" },
                                { label: "TERENE 6", value: "TERENE 6" },
                                { label: "TERENE 9", value: "TERENE 9" },
                                { label: "TERENE 12", value: "TERENE 12" },
                                { label: "TERENE 24", value: "TERENE 24" },
                            ]}
                            selected={condition.members || []}
                            onChange={(next) =>
                                onUpdate({ ...condition, members: next })
                            }
                        />
                    </>
                )

            case "phase":
                return (
                    <>
                        <span style={labelStyle}>Phase-n:</span>
                        <MenuToggle
                            mode="multi"
                            options={[{ label: "Phase-1", value: "Phase-1" }]}
                            selected={condition.phases || []}
                            onChange={(next) =>
                                onUpdate({ ...condition, phases: next })
                            }
                        />
                    </>
                )

            case "revisit":
                return (
                    <>
                        <span style={labelStyle}>재방문 고객:</span>
                        <MenuToggle
                            mode="multi"
                            options={[
                                { label: "최초방문", value: "0" },
                                { label: "재방문", value: "1" },
                            ]}
                            selected={condition.days || []}
                            onChange={(next) =>
                                onUpdate({ ...condition, days: next })
                            }
                        />
                    </>
                )

            case "seasonal":
                return (
                    <>
                        <span style={labelStyle}>요일/시즌:</span>
                        <MenuToggle
                            mode="multi"
                            options={[
                                { label: "평일", value: "Weekday" },
                                { label: "주말", value: "Weekend" },
                                {
                                    label: "성수기(평일)",
                                    value: "Peak-Weekday",
                                },
                                {
                                    label: "성수기(주말)",
                                    value: "Peak-Weekend",
                                },
                            ]}
                            selected={condition.allowedCategories || []}
                            onChange={(next) =>
                                onUpdate({
                                    ...condition,
                                    allowedCategories: next,
                                })
                            }
                        />
                    </>
                )

            case "relay":
                return (
                    <>
                        <span style={labelStyle}>연박:</span>
                        <EditableField
                            value={condition.min || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, min: val })
                            }
                            placeholder="최소"
                            style={inputStyle}
                        />
                        <span style={tildeStyle}>~</span>
                        <EditableField
                            value={condition.max || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, max: val })
                            }
                            placeholder="최대"
                            style={inputStyle}
                        />
                        <span>박</span>
                    </>
                )

            case "applied_discount":
                return (
                    <>
                        <span style={labelStyle}>할인 금액:</span>
                        <EditableField
                            value={condition.min || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, min: val })
                            }
                            placeholder="최소"
                            style={inputStyle}
                        />
                        <span style={tildeStyle}>~</span>
                        <EditableField
                            value={condition.max || ""}
                            onChange={(val) =>
                                onUpdate({ ...condition, max: val })
                            }
                            placeholder="최대"
                            style={inputStyle}
                        />
                        <span>₩</span>
                    </>
                )

            default:
                return <span>조건 없음</span>
        }
    }

    return (
        <div style={containerStyle}>
            {renderByType()}
            <span
                onClick={onDelete}
                style={{
                    marginLeft: "auto",
                    cursor: "pointer",
                    color: "#999",
                }}
            >
                ✕
            </span>
        </div>
    )
}
