
// PaginationArrow.tsx
import React from "react"

interface PaginationArrowProps {
    direction: "left" | "right"
    disabled?: boolean
    onClick?: () => void
    size?: number // 너비/높이
    color?: string // 선 색상
    style?: React.CSSProperties // 외부 스타일 override
}

export const PaginationArrow: React.FC<PaginationArrowProps> = ({
    direction,
    disabled = false,
    onClick,
    size = 10,
    color = "#888",
    style = {},
}) => {
    const base: React.CSSProperties = {
        width: size,
        height: size,
        borderTop: `2px solid ${color}`,
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-block",
        transition: "opacity 0.2s",
    }

    const arrowStyle: React.CSSProperties =
        direction === "left"
            ? {
                  ...base,
                  borderLeft: `2px solid ${color}`,
                  transform: "rotate(-45deg)",
              }
            : {
                  ...base,
                  borderRight: `2px solid ${color}`,
                  transform: "rotate(45deg)",
              }

    return (
        <div
            onClick={disabled ? undefined : onClick}
            style={{ ...arrowStyle, ...style }}
        />
    )
}
