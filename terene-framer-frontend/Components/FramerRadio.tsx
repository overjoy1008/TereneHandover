
import * as React from "react"

type FramerRadioProps = {
    name: string
    value: string
    blackCircleWidth?: number
    whiteCircleWidth?: number
    labelHeight?: number
    checked: boolean
    onChange?: (value: string) => void
    label?: string
    disabled?: boolean
}

export const FramerRadio: React.FC<FramerRadioProps> = ({
    name,
    value,
    blackCircleWidth = 16,
    whiteCircleWidth = blackCircleWidth - 10,
    labelHeight = 40,
    checked,
    onChange,
    label,
    disabled = false,
}) => {
    const handleClick = () => {
        if (disabled) return
        onChange?.(value)
    }

    return (
        <label
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: labelHeight,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.4 : 1,
                userSelect: "none",
            }}
            onClick={handleClick}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                readOnly
                style={{ display: "none" }}
            />
            <span
                style={{
                    position: "relative",
                    width: blackCircleWidth,
                    height: blackCircleWidth,
                    borderRadius: "50%",
                    border: `1px solid ${checked ? "#000000" : "#888888"}`,
                    backgroundColor: checked ? "#363636" : "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: checked
                        ? "0px 0px 4px rgba(0,0,0,0.15)"
                        : "none",
                    flexShrink: 0,
                }}
            >
                {checked && (
                    <span
                        style={{
                            width: whiteCircleWidth,
                            height: whiteCircleWidth,
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                        }}
                    />
                )}
            </span>
            {label && (
                <span
                    style={{
                        color: "#000000",
                        fontFamily: "Pretendard Regular",
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        lineHeight: "1.8em",
                    }}
                >
                    {label}
                </span>
            )}
        </label>
    )
}
