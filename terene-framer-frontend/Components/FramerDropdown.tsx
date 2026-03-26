
// Components/FramerDropdown.tsx

import * as React from "react"

type Props = {
    value: string
    onChange: (value: string) => void
    unit: string
    max: number
    defaultText: string
    defaultAllowed: boolean
    selectRef?: (el: HTMLSelectElement | null) => void
}

export default function FramerDropdown({
    value,
    onChange,
    unit,
    max,
    defaultText,
    defaultAllowed,
    selectRef,
}: Props) {
    const options = [
        defaultText,
        ...Array.from({ length: max }, (_, i) => `${i + 1}${unit}`),
    ]

    return (
        <div
            style={{
                position: "relative",
                display: "inline-block",
                backgroundColor: "#ffffff",
            }}
        >
            <select
                ref={selectRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: 0,
                    padding: "8px 28px 8px 12px",
                    fontFamily: "Pretendard Regular",
                    fontSize: "12px",
                    color: "#000000",
                    letterSpacing: "0.1em",
                    lineHeight: "1.2em",
                    outline: "none",
                    width: "100%",
                    cursor: "pointer",
                }}
            >
                {options.map((opt, i) => (
                    <option
                        key={opt}
                        value={opt}
                        disabled={i === 0 && !defaultAllowed}
                    >
                        {opt}
                    </option>
                ))}
            </select>

            {/* SVG 기반 화살표 */}
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
