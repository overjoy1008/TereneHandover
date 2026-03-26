
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { FramerRadio } from "./FramerRadio.tsx"

type Option = {
    label: string
    value: string
    description?: string
}

export default function RadioGroup(props) {
    const {
        options,
        selectedValue,
        onChange,
        name,
        disabled,
        radioGap,
        labelGap,
        direction,
        variant,
        labelFontSize,
        descFontSize,
    } = props

    const [internalSelected, setInternalSelected] =
        React.useState(selectedValue)

    React.useEffect(() => {
        setInternalSelected(selectedValue)
    }, [selectedValue])

    const handleSelect = (value: string) => {
        if (disabled) return
        setInternalSelected(value)
        onChange && onChange(value)
    }

    const isMobile = variant === "mobile"

    return (
        <div
            style={{
                display: "flex",
                flexDirection: direction,
                gap: radioGap,
                width: "100%",
            }}
        >
            {options.map((opt: Option, i: number) => {
                const isChecked = internalSelected === opt.value

                return (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: 10,
                            cursor: disabled ? "default" : "pointer",
                            userSelect: "none",
                        }}
                        onClick={() => handleSelect(opt.value)}
                    >
                        <FramerRadio
                            name={name}
                            value={opt.value}
                            labelHeight={20}
                            blackCircleWidth={isMobile ? 16 : 20}
                            whiteCircleWidth={isMobile ? 6 : 10}
                            checked={isChecked}
                            disabled={disabled}
                            onChange={handleSelect}
                        />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                gap: labelGap,
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "Pretendard Regular",
                                    fontSize: labelFontSize,
                                    letterSpacing: "0.1em",
                                    lineHeight: "1.2em",
                                    color: "#000000",
                                }}
                            >
                                {opt.label}
                            </div>

                            {opt.description && (
                                <div
                                    style={{
                                        fontFamily: "Pretendard Regular",
                                        fontSize: descFontSize,
                                        letterSpacing: "0em",
                                        lineHeight: "1.2em",
                                        color: "#888888",
                                    }}
                                >
                                    {opt.description}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

addPropertyControls(RadioGroup, {
    options: {
        type: ControlType.Array,
        title: "Options",
        propertyControl: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                value: { type: ControlType.String, title: "Value" },
                description: { type: ControlType.String, title: "Description" },
            },
        },
        defaultValue: [
            { label: "옵션 1", value: "opt1", description: "옵션 설명 1" },
            { label: "옵션 2", value: "opt2", description: "옵션 설명 2" },
        ],
    },

    selectedValue: {
        type: ControlType.String,
        title: "Initial",
        defaultValue: "opt1",
    },

    name: {
        type: ControlType.String,
        title: "Name",
        defaultValue: "radioGroup1",
    },

    variant: {
        type: ControlType.SegmentedEnum,
        title: "Variant",
        options: ["default", "mobile"],
        optionTitles: ["Default", "Mobile"],
        defaultValue: "default",
    },

    labelFontSize: {
        type: ControlType.Number,
        title: "Label Size",
        defaultValue: 14,
        min: 8,
        max: 32,
    },

    descFontSize: {
        type: ControlType.Number,
        title: "Desc Size",
        defaultValue: 12,
        min: 6,
        max: 24,
    },

    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
    },

    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["column", "row"],
        optionTitles: ["Vertical", "Horizontal"],
        defaultValue: "column",
    },

    radioGap: {
        type: ControlType.Number,
        title: "Radio Gap",
        defaultValue: 20,
        min: 0,
        max: 100,
    },

    labelGap: {
        type: ControlType.Number,
        title: "Label Gap",
        defaultValue: 10,
        min: 0,
        max: 100,
    },

    onChange: {
        type: ControlType.EventHandler,
    },
})
