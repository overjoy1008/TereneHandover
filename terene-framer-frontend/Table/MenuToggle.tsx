
import * as React from "react"

type Mode = "single" | "multi"

interface ToggleOption {
    label: string
    value: string
}

interface MenuToggleProps {
    mode: Mode
    options: ToggleOption[]
    selected: string[] | string
    onChange: (next: string[] | string) => void
}

export function MenuToggle({
    mode,
    options,
    selected,
    onChange,
}: MenuToggleProps) {
    const isMulti = mode === "multi"

    const isSelected = (val: string) =>
        isMulti ? (selected as string[]).includes(val) : selected === val

    const handleClick = (val: string) => {
        if (isMulti) {
            const list = selected as string[]
            const next = list.includes(val)
                ? list.filter((v) => v !== val)
                : [...list, val]
            onChange(next)
        } else {
            if (selected !== val) onChange(val)
        }
    }

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: 999,
                background: "#fff",
                fontSize: 12,
                overflow: "hidden",
                height: 24,
                boxShadow: "inset 0 0 0 0.5px #ddd",
            }}
        >
            {options.map((opt, idx) => {
                const selectedNow = isSelected(opt.value)
                return (
                    <React.Fragment key={opt.value}>
                        <div
                            onClick={() => handleClick(opt.value)}
                            style={{
                                background: selectedNow
                                    ? "#e6f2ff"
                                    : "transparent",
                                color: selectedNow ? "#2a5ca3" : "#999",
                                fontWeight: selectedNow ? 700 : 500,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                userSelect: "none",
                                height: "100%",
                                padding: "0 14px",
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            {opt.label}
                        </div>
                        {idx < options.length - 1 && (
                            <div
                                style={{
                                    width: 1,
                                    height: "60%",
                                    background: "#ddd",
                                    alignSelf: "center",
                                }}
                            />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
