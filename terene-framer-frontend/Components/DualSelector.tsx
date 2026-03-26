
import * as React from "react"

type Props = {
    leftLabel: string
    rightLabel: string
    color: string
    value: "left" | "right" | null
    disabled?: boolean
    onChange?: (v: "left" | "right") => void
}

export default function DualSelector({
    leftLabel,
    rightLabel,
    color = "#E6E6E6",
    value,
    disabled = false,
    onChange,
}: Props) {
    const baseStyle: React.CSSProperties = {
        flex: 1,
        height: 35,
        fontFamily: "Pretendard Regular",
        fontSize: 14,
        borderRadius: 0,
        border: `1px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        color: disabled ? "#999999" : "#000",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
    }

    const selectedStyle: React.CSSProperties = {
        backgroundColor: color,
    }

    const unselectedStyle: React.CSSProperties = {
        backgroundColor: "transparent",
    }

    const handleClick = (v: "left" | "right") => {
        if (disabled) return
        onChange?.(v)
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                pointerEvents: disabled ? "none" : "auto",
            }}
        >
            <div
                style={{
                    ...baseStyle,
                    ...(value === "left" ? selectedStyle : unselectedStyle),
                }}
                onClick={() => handleClick("left")}
            >
                {leftLabel}
            </div>

            <div
                style={{
                    ...baseStyle,
                    ...(value === "right" ? selectedStyle : unselectedStyle),
                }}
                onClick={() => handleClick("right")}
            >
                {rightLabel}
            </div>
        </div>
    )
}
