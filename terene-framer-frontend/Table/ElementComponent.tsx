
// ElementComponent.tsx
import * as React from "react"

export function ElementComponent({
    data,
    fields,
    onEdit,
    onDelete,
    isNew = false,
    idKey,
    isPlaceholder = false,
}: {
    data: Record<string, string>
    fields: { key: string; type: string; options?: string[] }[]
    onEdit: (updatedData: Record<string, string>) => void
    onDelete: () => void
    isNew?: boolean
    idKey: string
    isPlaceholder?: boolean
}) {
    const [editing, setEditing] = React.useState(isNew)
    const [tempData, setTempData] = React.useState({ ...data })

    const handleChange = (key: string, value: string) => {
        setTempData((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        const cleanedData = Object.fromEntries(
            Object.entries(tempData).map(([key, value]) => {
                if (typeof value === "string" && value.trim() === "") {
                    return [key, null]
                }

                try {
                    const original = data[key]
                    if (typeof original === "object" && original !== null) {
                        return [key, JSON.parse(value)]
                    }
                } catch {
                    // fallback to string if parsing fails
                }

                return [key, value]
            })
        )

        onEdit(cleanedData)
        setEditing(false)
    }

    const handleCancel = () => {
        if (isNew) {
            onDelete()
        } else {
            setEditing(false)
            setTempData({ ...data })
        }
    }

    const columnStyle: React.CSSProperties = {
        minWidth: 200,
        flex: "0 0 160px",
        padding: "0 8px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                gap: "8px",
                position: "relative",
            }}
        >
            {fields.map((field) => {
                const isPrimary = field.key === idKey
                const isPKEditable = isNew && isPrimary
                const isEditable = editing && (isPKEditable || !isPrimary)
                const value = tempData[field.key]

                return (
                    <div key={field.key} style={columnStyle}>
                        {isEditable ? (
                            typeof data[field.key] === "object" &&
                            data[field.key] !== null ? (
                                <textarea
                                    value={
                                        typeof value === "object" &&
                                        value !== null
                                            ? JSON.stringify(value, null, 2)
                                            : value
                                    }
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    style={textareaStyle}
                                />
                            ) : field.type === "category" ? (
                                <select
                                    value={value}
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option value="">선택</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    value={value}
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    style={inputStyle}
                                />
                            )
                        ) : (
                            <span
                                style={{
                                    color:
                                        data[field.key] == null
                                            ? "#999"
                                            : undefined,
                                    fontFamily:
                                        typeof data[field.key] === "object"
                                            ? "monospace"
                                            : undefined,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {data[field.key] == null
                                    ? "–"
                                    : typeof data[field.key] === "object"
                                      ? JSON.stringify(data[field.key], null, 2)
                                      : String(data[field.key])}
                            </span>
                        )}
                    </div>
                )
            })}

            <div
                style={{
                    position: "sticky",
                    right: 0,
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex",
                    gap: 6,
                    minWidth: 160,
                    paddingLeft: 12,
                    zIndex: 2,
                    borderLeft: "1px solid #ddd",
                }}
            >
                {isPlaceholder ? (
                    <>
                        <button
                            style={{ ...buttonStyle, opacity: 0.4 }}
                            disabled
                        >
                            Edit
                        </button>
                        <button
                            style={{ ...buttonStyle, opacity: 0.4 }}
                            disabled
                        >
                            Delete
                        </button>
                    </>
                ) : editing ? (
                    <>
                        <button onClick={handleSave} style={buttonStyle}>
                            Save
                        </button>
                        <button onClick={handleCancel} style={buttonStyle}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setEditing(true)}
                            style={buttonStyle}
                        >
                            Edit
                        </button>
                        <button onClick={onDelete} style={buttonStyle}>
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "180px",
    fontSize: "13px",
    padding: "6px 8px",
    border: "1px solid #ddd",
    background: "#fefefe",
    boxSizing: "border-box",
}

const selectStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "180px",
    fontSize: "13px",
    padding: "6px 8px",
    border: "1px solid #ddd",
    background: "#fefefe",
    boxSizing: "border-box",
}

const textareaStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "180px",
    fontSize: "12px",
    padding: "6px 8px",
    border: "1px solid #ccc",
    fontFamily: "monospace",
    height: "60px",
    resize: "vertical",
    boxSizing: "border-box",
}

const buttonStyle: React.CSSProperties = {
    fontSize: "12px",
    padding: "6px 12px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
}
