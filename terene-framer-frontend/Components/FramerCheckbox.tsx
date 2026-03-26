
import * as React from "react"
import { Frame, addPropertyControls, ControlType } from "framer"

type Props = {
    checked: boolean
    onToggle: () => void
    isFocused: boolean
    width?: number
    height?: number
}

export function FramerCheckbox({
    checked,
    onToggle,
    isFocused,
    width = 20,
    height = 20,
}: Props) {
    return (
        <Frame
            width={width}
            height={height}
            background={checked ? "#000000" : "#ffffff"}
            borderRadius={0}
            onTap={onToggle}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                position: "relative",
                boxSizing: "border-box",
                flexShrink: 0,

                border: isFocused
                    ? "1.5px solid #000000"
                    : "1.5px solid #888888",
                transition: "border 0.15s ease",
            }}
        >
            {checked && (
                <svg
                    width={width >= 20 ? width - 6 : width - 5}
                    height={height >= 20 ? height - 6 : height - 5}
                    viewBox="0 0 24 24"
                    style={{ display: "block" }}
                >
                    <polyline
                        points="4 13 9.5 18.5 20 6"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </Frame>
    )
}

addPropertyControls(FramerCheckbox, {
    checked: {
        type: ControlType.Boolean,
        title: "Checked",
        defaultValue: false,
    },
    isFocused: {
        type: ControlType.Boolean,
        title: "Focused",
        defaultValue: false,
    },
    onToggle: {
        type: ControlType.EventHandler,
    },
})
