
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    name?: string
    type?: "text" | "number" | "password" | "colorcode" | "dropdown"
    placeholder?: string
    value?: string
    onChange?: (v: string) => void
    width?: number | string
    height?: number | string
    fontSize?: number
    fontFamily?: string
    fontColor?: string
    placeholderColor?: string
    backgroundColor?: string
    focusBackgroundColor?: string
    borderColor?: string
    focusBorderColor?: string
    paddingX?: number
    disabled?: boolean
    dropdownUnit?: string
    dropdownMax?: number
    dropdownDefaultText?: string
    dropdownDefaultAllowed?: boolean
    dropdownOptions?: string[]
}

export default function MultiPurposeInput({
    name,
    type = "text",
    placeholder,
    value = "#278390",
    onChange,
    width = "100%",
    height = 40,
    fontSize = 14,
    fontFamily = "Pretendard SemiBold",
    fontColor = "#000000",
    placeholderColor = "#999999",
    backgroundColor = "#FFFFFF",
    focusBackgroundColor = "#FFFFFF",
    borderColor = "#E6E6E6",
    focusBorderColor = "#D4D4D4",
    paddingX = 12,
    disabled = false,
    dropdownUnit = "",
    dropdownMax = 10,
    dropdownDefaultText = "Select",
    dropdownDefaultAllowed = true,
    dropdownOptions,
}: Props) {
    const [isFocused, setIsFocused] = React.useState(false)

    const disabledBg = "#F5F5F5"
    const disabledColor = "#888888"

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

    if (type === "number") {
        const [raw, setRaw] = React.useState(value ?? "")

        React.useEffect(() => {
            setRaw(value ?? "")
        }, [value])

        const formatNumber = (v: string) => {
            if (!v) return ""
            return v.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }

        const unformatNumber = (v: string) => {
            return v.replace(/,/g, "")
        }

        return (
            <input
                type="text"
                value={formatNumber(raw)}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                    const v = e.target.value

                    // 숫자 + 콤마만 허용
                    if (!/^[0-9,]*$/.test(v)) return

                    const numeric = unformatNumber(v)
                    setRaw(numeric)

                    onChange && onChange(numeric)
                }}
                placeholder={placeholder}
                style={{
                    width,
                    height,
                    fontFamily: "Pretendard Regular",
                    fontSize,
                    textAlign: "center",
                    color: disabled ? disabledColor : fontColor,
                    backgroundColor: disabled
                        ? disabledBg
                        : isFocused
                          ? focusBackgroundColor
                          : backgroundColor,
                    border: `1px solid ${
                        isFocused ? focusBorderColor : borderColor
                    }`,
                    outline: "none",
                    padding: `0 ${paddingX}px`,
                    transition: "all 0.2s ease",
                    cursor: "text",
                    opacity: disabled ? 0.7 : 1,
                }}
            />
        )
    }

    if (type === "dropdown") {
        const options =
            dropdownOptions && dropdownOptions.length > 0
                ? [dropdownDefaultText, ...dropdownOptions]
                : [
                      dropdownDefaultText,
                      ...Array.from(
                          { length: dropdownMax },
                          (_, i) => `${i + 1}${dropdownUnit}`
                      ),
                  ]

        return (
            <div
                style={{
                    width,
                    height,
                    position: "relative",
                    backgroundColor: disabled
                        ? disabledBg
                        : isFocused
                          ? focusBackgroundColor
                          : backgroundColor,
                    border: `1px solid ${
                        isFocused ? focusBorderColor : borderColor
                    }`,
                    display: "flex",
                    alignItems: "center",
                    fontFamily,
                    cursor: "pointer",
                    opacity: disabled ? 0.7 : 1,
                }}
            >
                <select
                    value={value}
                    disabled={disabled}
                    onChange={(e) =>
                        !disabled && onChange && onChange(e.target.value)
                    }
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        backgroundColor: "transparent",
                        border: "none",
                        width: "100%",
                        height: "100%",
                        padding: `0 ${paddingX}px`,
                        fontFamily: "Pretendard Regular",
                        fontSize,
                        color: disabled ? disabledColor : fontColor,
                        textAlign: "center",
                        outline: "none",
                        cursor: "pointer",
                    }}
                >
                    {options.map((opt, i) => (
                        <option
                            key={opt}
                            value={opt}
                            disabled={i === 0 && !dropdownDefaultAllowed}
                        >
                            {opt}
                        </option>
                    ))}
                </select>

                <svg
                    width="12"
                    height="8"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                    }}
                >
                    <path
                        d="M1 1L5 5L9 1"
                        stroke="#888888"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        )
    }

    if (type === "colorcode") {
        const [raw, setRaw] = React.useState(value ?? "")

        React.useEffect(() => {
            setRaw(value ?? "")
        }, [value])

        const normalizeHexForPreview = (v: string) => {
            if (/^#[0-9A-Fa-f]{8}$/.test(v)) return v
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v + "FF"
            return "#00000000"
        }

        const hex8 = normalizeHexForPreview(raw)
        const hex6 = hex8.slice(0, 7)
        const alpha = parseInt(hex8.slice(7, 9), 16) / 255

        const r = parseInt(hex6.slice(1, 3), 16)
        const g = parseInt(hex6.slice(3, 5), 16)
        const b = parseInt(hex6.slice(5, 7), 16)

        return (
            <div
                style={{
                    width,
                    height,
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 8,
                    alignItems: "center",
                    padding: `0 ${paddingX}px`,
                    border: `1px solid ${
                        isFocused ? focusBorderColor : borderColor
                    }`,
                    backgroundColor: disabled
                        ? disabledBg
                        : isFocused
                          ? focusBackgroundColor
                          : backgroundColor,
                    fontFamily: "Pretendard Regular",
                    opacity: disabled ? 0.7 : 1,
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                {/* Preview (alpha reflected) */}
                <div
                    style={{
                        width: 24,
                        height: 24,
                        backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
                        border: "1px solid #CCC",
                    }}
                />

                {/* FREE text input */}
                <input
                    type="text"
                    value={raw}
                    disabled={disabled}
                    onChange={(e) => {
                        const v = e.target.value
                        setRaw(v)

                        if (
                            /^#[0-9A-Fa-f]{6}$/.test(v) ||
                            /^#[0-9A-Fa-f]{8}$/.test(v)
                        ) {
                            onChange && onChange(v)
                        }
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontFamily: "Pretendard Regular",
                        fontSize,
                        color: disabled ? disabledColor : fontColor,
                        textAlign: "center",
                        cursor: "text",
                    }}
                />
            </div>
        )
    }

    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value ?? ""}
            readOnly={disabled}
            onChange={(e) => !disabled && onChange && onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
                width,
                height,
                fontFamily: "Pretendard Regular",
                fontSize,
                textAlign: "center",
                color: disabled ? disabledColor : fontColor,
                backgroundColor: disabled
                    ? disabledBg
                    : isFocused
                      ? focusBackgroundColor
                      : backgroundColor,
                border: `1px solid ${
                    isFocused ? focusBorderColor : borderColor
                }`,
                outline: "none",
                padding: `0 ${paddingX}px`,
                transition: "all 0.2s ease",
                cursor: "text",
                opacity: disabled ? 0.7 : 1,
            }}
        />
    )
}

addPropertyControls(MultiPurposeInput, {
    name: { type: ControlType.String, title: "Name" },
    type: {
        type: ControlType.Enum,
        title: "Type",
        options: ["text", "number", "password", "colorcode", "dropdown"],
        optionTitles: ["Text", "Number", "Password", "Color Code", "Dropdown"],
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
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    focusBackgroundColor: {
        type: ControlType.Color,
        title: "Focus BG",
        defaultValue: "#FFFFFF",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#E6E6E6",
    },
    focusBorderColor: {
        type: ControlType.Color,
        title: "Focus Border",
        defaultValue: "#D4D4D4",
    },
    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
    },
    dropdownUnit: {
        type: ControlType.String,
        title: "Dropdown Unit",
        defaultValue: "",
    },
    dropdownMax: {
        type: ControlType.Number,
        title: "Dropdown Max",
        defaultValue: 10,
    },
    dropdownDefaultText: {
        type: ControlType.String,
        title: "Dropdown Default",
        defaultValue: "Select",
    },
    dropdownDefaultAllowed: {
        type: ControlType.Boolean,
        title: "Allow Default",
        defaultValue: true,
    },
})
