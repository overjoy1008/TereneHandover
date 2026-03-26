
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    name?: string
    type?: string
    placeholder?: string
    value?: string
    onChange?: (v: string) => void
    width?: number | string
    height?: number | string
    fontSize?: number
    fontColor?: string
    placeholderColor?: string
    backgroundColor?: string
    focusBackgroundColor?: string
    borderColor?: string
    focusBorderColor?: string
    paddingX?: number
    disabled?: boolean
}

export default function FramerInput({
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    width = "100%",
    height = 40,
    fontSize = 14,
    fontColor = "#000000",
    placeholderColor = "#999999",
    backgroundColor = "#FFFFFF",
    focusBackgroundColor = "#EBEBEB",
    borderColor = "#000000",
    focusBorderColor = "#000000",
    paddingX = 12,
    disabled = false,
}: Props) {
    const [isFocused, setIsFocused] = React.useState(false)

    // ✅ placeholder 색상 적용
    React.useEffect(() => {
        if (typeof document === "undefined") return

        const style = document.createElement("style")
        style.innerHTML = `
        input::placeholder {
            color: ${placeholderColor};
        }
    `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [placeholderColor])

    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value ?? ""}
            readOnly={disabled}
            onChange={
                disabled
                    ? undefined
                    : (e) => onChange && onChange(e.target.value)
            }
            style={{
                width,
                height,
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize,
                color: disabled ? "#888888" : fontColor,
                backgroundColor: isFocused
                    ? focusBackgroundColor
                    : backgroundColor,
                border: "none",
                borderBottom: `1px solid ${
                    isFocused ? focusBorderColor : borderColor
                }`,
                outline: "none",
                padding: `0 ${paddingX}px`,
                transition: "all 0.2s ease",
                cursor: disabled ? "not-allowed" : "text",
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
    )
}

addPropertyControls(FramerInput, {
    name: { type: ControlType.String, title: "Name" },
    type: {
        type: ControlType.Enum,
        title: "Type",
        options: ["text", "number", "password"],
        optionTitles: ["Text", "Number", "Password"],
        defaultValue: "text",
    },
    placeholder: { type: ControlType.String, title: "Placeholder" },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 14,
    },
    fontColor: {
        type: ControlType.Color,
        title: "Font Color",
        defaultValue: "#000000",
    },
    placeholderColor: {
        type: ControlType.Color,
        title: "Placeholder",
        defaultValue: "#999999",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    focusBackgroundColor: {
        type: ControlType.Color,
        title: "Focus BG",
        defaultValue: "#EBEBEB",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#000000",
    },
    focusBorderColor: {
        type: ControlType.Color,
        title: "Focus Border",
        defaultValue: "#000000",
    },
    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
    },
})
