
// Components/MinimalButton.tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Variant = "border" | "background"

type Props = {
    label: string
    variant: Variant
    color: string
    width: number
    height: number
    fontSize: number
    fontFamily?: string
    onClick?: () => void
}

export default function MinimalButton({
    label,
    variant,
    color,
    width,
    height,
    fontSize,
    fontFamily = "Pretendard SemiBold",
    onClick,
}: Props) {
    // 배경 강조형일 때 대비용 텍스트 컬러 자동 설정
    const isDark = isDarkColor(color)
    const textColor =
        variant === "border" ? color : isDark ? "#FFFFFF" : "#000000"

    const style: React.CSSProperties = {
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        fontSize,
        cursor: "pointer",
        borderRadius: 0,
        transition: "all 0.2s ease",
        border: variant === "border" ? `1px solid ${color}` : "none",
        backgroundColor: variant === "border" ? "transparent" : color,
        color: textColor,
    }

    return (
        <div style={style} onClick={onClick}>
            {label}
        </div>
    )
}

// HEX 밝기 계산 → 밝으면 true, 어두우면 false
function isDarkColor(hex: string): boolean {
    const c = hex.replace("#", "")
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
}

addPropertyControls(MinimalButton, {
    label: { type: ControlType.String, title: "Label", defaultValue: "버튼" },
    variant: {
        type: ControlType.Enum,
        title: "Style",
        options: ["border", "background"],
        optionTitles: ["Border 강조형", "Background 강조형"],
        defaultValue: "border",
    },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#0022FF" },
    width: { type: ControlType.Number, title: "Width", defaultValue: 140 },
    height: { type: ControlType.Number, title: "Height", defaultValue: 40 },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 16,
    },
})
