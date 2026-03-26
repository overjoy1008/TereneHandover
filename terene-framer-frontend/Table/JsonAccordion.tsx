
import React from "react"

export function JsonAccordion({
    label,
    data,
    onChange,
    level = 0,
    editable = false,
}: {
    label?: string
    data: Record<string, any>
    onChange?: (updated: Record<string, any>) => void
    level?: number
    editable?: boolean
}) {
    const [expanded, setExpanded] = React.useState(true)
    const [adding, setAdding] = React.useState(false)
    const [newKey, setNewKey] = React.useState("")
    const [newValue, setNewValue] = React.useState("")

    const toggle = () => setExpanded(!expanded)

    const handleFieldChange = (key: string, value: string) => {
        if (!onChange) return
        const updated = { ...data, [key]: value }
        onChange(updated)
    }

    const handleNestedChange = (key: string, updatedNested: any) => {
        if (!onChange) return
        const updated = { ...data, [key]: updatedNested }
        onChange(updated)
    }

    const confirmAddField = () => {
        if (!newKey.trim() || newKey in data) return
        if (!onChange) return
        const updated = { ...data, [newKey]: newValue }
        onChange(updated)
        setNewKey("")
        setNewValue("")
        setAdding(false)
    }

    return (
        <div
            style={{
                fontFamily: "sans-serif",
                fontSize: "13px",
                color: "#333",
            }}
        >
            {label && (
                <div
                    onClick={toggle}
                    style={{
                        cursor: "pointer",
                        userSelect: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 500,
                        paddingLeft: level * 12,
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            transform: expanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                        }}
                    >
                        ▶
                    </span>
                    {label}
                </div>
            )}

            {expanded && (
                <div
                    style={{
                        background: "#fafafa",
                        border: "1px solid #eee",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        marginTop: label ? 6 : 0,
                        marginLeft: level > 0 ? 12 : 0,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: 6 }}>
                            {typeof value === "object" && value !== null ? (
                                <JsonAccordion
                                    label={key}
                                    data={value}
                                    onChange={(v) => handleNestedChange(key, v)}
                                    editable={editable}
                                    level={level + 1}
                                />
                            ) : editable ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                    <span style={{ minWidth: 60 }}>{key}:</span>
                                    <input
                                        type="text"
                                        value={String(value ?? "")}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                key,
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            fontSize: "13px",
                                            padding: "4px 6px",
                                            border: "1px solid #ccc",
                                            borderRadius: 4,
                                            background: "#fff",
                                        }}
                                    />
                                </div>
                            ) : (
                                <span>
                                    • <strong>{key}</strong>: {String(value)}
                                </span>
                            )}
                        </div>
                    ))}

                    {editable && adding && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            <input
                                placeholder="Key"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                style={{
                                    flex: 1,
                                    fontSize: "13px",
                                    padding: "4px 6px",
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                }}
                            />
                            <input
                                placeholder="Value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                style={{
                                    flex: 1,
                                    fontSize: "13px",
                                    padding: "4px 6px",
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                }}
                            />
                            <button
                                onClick={confirmAddField}
                                style={{
                                    fontSize: "13px",
                                    padding: "4px 8px",
                                    background: "#4CAF50",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setAdding(false)
                                    setNewKey("")
                                    setNewValue("")
                                }}
                                style={{
                                    fontSize: "13px",
                                    padding: "4px 8px",
                                    background: "#ccc",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {editable && !adding && (
                        <button
                            onClick={() => setAdding(true)}
                            style={{
                                fontSize: "13px",
                                padding: "4px 8px",
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                background: "#f0f0f0",
                                cursor: "pointer",
                                marginTop: 6,
                            }}
                        >
                            + Add field
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export function OrderJsonAccordion({
    label,
    data,
    onChange,
    level = 0,
    editable = false,
}: {
    label?: string
    data: Record<string, any>
    onChange?: (updated: Record<string, any>) => void
    level?: number
    editable?: boolean
}) {
    const [expanded, setExpanded] = React.useState(true)

    const toggle = () => setExpanded(!expanded)

    const handleFieldChange = (key: string, value: string) => {
        if (!onChange) return
        const updated = { ...data, [key]: value }
        onChange(updated)
    }

    const handleNestedChange = (key: string, updatedNested: any) => {
        if (!onChange) return
        const updated = { ...data, [key]: updatedNested }
        onChange(updated)
    }

    return (
        <div
            style={{
                fontFamily: "sans-serif",
                fontSize: "13px",
                color: "#333",
            }}
        >
            {label && (
                <div
                    onClick={toggle}
                    style={{
                        cursor: "pointer",
                        userSelect: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 500,
                        paddingLeft: level * 12,
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            transform: expanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                        }}
                    >
                        ▶
                    </span>
                    {label}
                </div>
            )}

            {expanded && (
                <div
                    style={{
                        background: "#fafafa",
                        border: "1px solid #eee",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        marginTop: label ? 6 : 0,
                        marginLeft: level > 0 ? 12 : 0,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: 6 }}>
                            {typeof value === "object" && value !== null ? (
                                <OrderJsonAccordion
                                    label={key}
                                    data={value}
                                    onChange={(v) => handleNestedChange(key, v)}
                                    editable={editable}
                                    level={level + 1}
                                />
                            ) : editable ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                    <span style={{ minWidth: 60 }}>{key}:</span>
                                    <input
                                        type="text"
                                        value={String(value ?? "")}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                key,
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            fontSize: "13px",
                                            padding: "4px 6px",
                                            border: "1px solid #ccc",
                                            borderRadius: 4,
                                            background: "#fff",
                                        }}
                                    />
                                </div>
                            ) : (
                                <span>
                                    • <strong>{key}</strong>: {String(value)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
