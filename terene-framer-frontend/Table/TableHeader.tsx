
// TableHeader.tsx
import * as React from "react"

export function TableHeader({ fields, sortConfig, toggleSort }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                height: 40,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 14,
                background: "#f8f8f8",
                borderBottom: "1px solid #ccc",
                gap: 8,
                position: "relative",
            }}
        >
            {fields.map((field) => {
                const isSorted = sortConfig.key === field.key
                const arrow = isSorted
                    ? sortConfig.direction === "asc"
                        ? "↑"
                        : sortConfig.direction === "desc"
                          ? "↓"
                          : ""
                    : ""

                return (
                    <div
                        key={field.key}
                        onClick={() => toggleSort(field.key)}
                        style={{
                            minWidth: 200,
                            flex: "0 0 160px",
                            padding: "0 8px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                            cursor: "pointer",
                        }}
                    >
                        <span>
                            {field.key}
                            {(field.isPrimary || field.notNull) && (
                                <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                </span>
                            )}
                        </span>{" "}
                        {arrow}
                    </div>
                )
            })}

            <div
                style={{
                    position: "sticky",
                    right: 0,
                    minWidth: 160,
                    paddingLeft: 12,
                    background: "#f8f8f8",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    borderLeft: "1px solid #ddd",
                    zIndex: 3,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                }}
            >
                Actions
            </div>
        </div>
    )
}
