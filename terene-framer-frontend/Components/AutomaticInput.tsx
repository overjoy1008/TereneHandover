
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Mode = "default" | "autofill"

type Props = {
    name: string
    placeholder: string
    fontSize: number
    fontColor: string
    backgroundColor: string
    autofillBackgroundColor: string
    placeholderColor: string
    focusBorderColor: string
    mode: Mode
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function AutomaticInput({
    name,
    placeholder,
    fontSize,
    fontColor,
    backgroundColor,
    autofillBackgroundColor,
    placeholderColor,
    focusBorderColor,
    mode,
    value,
    onChange,
}: Props) {
    const [isFocused, setIsFocused] = React.useState(false)

    const bgColor =
        mode === "autofill" ? autofillBackgroundColor : backgroundColor

    return (
        <input
            name={name}
            placeholder={placeholder}
            value={mode === "autofill" ? (value ?? "") : undefined}
            readOnly={mode === "autofill"}
            onChange={mode === "default" ? onChange : undefined}
            style={{
                width: "100%",
                height: "100%",
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize: `${fontSize}px`,
                color: fontColor,
                padding: "8px 12px",
                backgroundColor: bgColor,
                border: isFocused ? `1px solid ${focusBorderColor}` : "none",
                borderRadius: "0px",
                letterSpacing: "0.1em",
                lineHeight: "1.2em",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: mode === "autofill" ? "default" : "text",
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
    )
}

addPropertyControls(AutomaticInput, {
    name: {
        type: ControlType.String,
        title: "Input Name",
        defaultValue: "Name",
    },
    placeholder: {
        type: ControlType.String,
        title: "Placeholder",
        defaultValue: "이름",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 12,
        min: 8,
        max: 48,
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
    autofillBackgroundColor: {
        type: ControlType.Color,
        title: "Autofill BG",
        defaultValue: "#EDEDED", // 연회색 적용
        hidden(props) {
            return props.mode !== "autofill"
        },
    },
    placeholderColor: {
        type: ControlType.Color,
        title: "Placeholder Color",
        defaultValue: "#999999",
    },
    focusBorderColor: {
        type: ControlType.Color,
        title: "Focus Border",
        defaultValue: "#000000",
    },
    mode: {
        type: ControlType.Enum,
        title: "Mode",
        options: ["default", "autofill"],
        optionTitles: ["Default", "Autofill"],
        defaultValue: "default",
    },
    value: {
        type: ControlType.String,
        title: "Autofill Value",
        defaultValue: "",
        hidden(props) {
            return props.mode !== "autofill"
        },
    },
})
