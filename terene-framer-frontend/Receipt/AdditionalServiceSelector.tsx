
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { FramerCheckbox } from "../Components/FramerCheckbox.tsx"
import FramerDropdown from "../Components/FramerDropdown.tsx"
import { useAdditionalServiceStore } from "./AdditionalService.tsx"

type Variant = "Default" | "Mobile"

export default function AdditionalServiceSelector({
    onChange,
    variant = "Default",
}: {
    onChange?: any
    variant?: Variant
}) {
    const [items, setItems] = React.useState([])
    const [store, setStore] = useAdditionalServiceStore()
    const [focusedId, setFocusedId] = React.useState<string | null>(null)

    const dropdownRefs = React.useRef<Record<string, HTMLSelectElement | null>>(
        {}
    )

    React.useEffect(() => {
        fetch(
            "https://terene-db-server.onrender.com/api/v3/additional-services"
        )
            .then((r) => r.json())
            .then((data) => {
                const filtered = data.filter((d) => !d.hidden)
                const sorted = filtered.sort((a, b) => {
                    if (a.available !== b.available) return a.available ? -1 : 1
                    if (a.manual_order !== b.manual_order)
                        return a.manual_order - b.manual_order
                    return a.title.localeCompare(b.title)
                })
                setItems(sorted)

                const initialSelected = {}
                sorted
                    .filter((d) => d.available)
                    .forEach((d, index) => {
                        const isFirstPackage =
                            d.category === "package" &&
                            !Object.values(initialSelected).some(
                                (v: any) =>
                                    v.category === "package" && v.checked
                            )

                        initialSelected[d.id] = {
                            id: d.id,
                            title: d.title,
                            category: d.category,
                            type: d.type,
                            price: d.price,
                            show_dropdown: d.show_dropdown,
                            default_allowed: d.default_allowed,
                            checked: isFirstPackage,
                            dropdownValue:
                                !d.show_dropdown || d.default_allowed === false
                                    ? 1
                                    : 0,
                        }
                    })

                setStore((prev) => ({
                    ...prev,
                    selectedServices: initialSelected,
                }))
            })
    }, [])

    const toggleItem = (id: string) => {
        setFocusedId(id)

        setStore((prev) => {
            const current = prev.selectedServices?.[id] || {}
            const targetItem = items.find((i) => i.id === id)
            const isPackage = targetItem?.category === "package"

            let updatedSelected = { ...prev.selectedServices }

            if (isPackage) {
                Object.keys(updatedSelected).forEach((key) => {
                    const item = items.find((i) => i.id === key)
                    if (item?.category === "package") {
                        updatedSelected[key] = {
                            ...updatedSelected[key],
                            checked: false,
                        }
                    }
                })

                updatedSelected[id] = {
                    ...updatedSelected[id],
                    checked: true,
                }
            } else {
                updatedSelected[id] = {
                    ...updatedSelected[id],
                    checked: !current.checked,
                }
            }

            return {
                ...prev,
                selectedServices: updatedSelected,
            }
        })

        requestAnimationFrame(() => {
            dropdownRefs.current[id]?.focus()
        })
    }

    const updateDropdown = (id: string, value: number) => {
        setStore((prev) => {
            const current = prev.selectedServices?.[id] || {}
            const targetItem = items.find((i) => i.id === id)
            const isPackage = targetItem?.category === "package"

            let updatedSelected = { ...prev.selectedServices }

            if (value !== 0) {
                if (isPackage) {
                    Object.keys(updatedSelected).forEach((key) => {
                        const item = items.find((i) => i.id === key)
                        if (item?.category === "package") {
                            updatedSelected[key] = {
                                ...updatedSelected[key],
                                checked: false,
                            }
                        }
                    })
                }

                updatedSelected[id] = {
                    ...current,
                    dropdownValue: value,
                    checked: true,
                }
            } else {
                updatedSelected[id] = {
                    ...current,
                    dropdownValue: value,
                }
            }

            return {
                ...prev,
                selectedServices: updatedSelected,
            }
        })
    }

    const dropdownNumberToLabel = (value: number, item: any) => {
        if (value === 0) return item.default_text
        return `${value}${item.unit}`
    }

    const dropdownLabelToNumber = (value: string, item: any) => {
        if (value === item.default_text) return 0
        const n = parseInt(value, 10)
        return isNaN(n) ? 0 : n
    }

    React.useEffect(() => {
        onChange?.(store.selectedServices)
    }, [store.selectedServices])

    const isMobile = variant === "Mobile"

    const renderItem = (item) => {
        const disabled = !item.available
        const state = store.selectedServices?.[item.id] || {}
        const checked = state.checked || false

        const value =
            state.dropdownValue === 0
                ? item.default_text
                : `${state.dropdownValue}${item.unit}`
        const descriptionText =
            typeof item.description === "string"
                ? item.description
                      .replace(/\\n/g, "\n")
                      .replace(/<br\s*\/?>/gi, "\n")
                : ""

        return (
            <div
                key={item.id}
                style={{
                    opacity: disabled ? 0.4 : 1,
                    pointerEvents: disabled ? "none" : "auto",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: isMobile ? "15px" : "25px",
                }}
            >
                {/* 왼쪽 파트: 체크박스 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        marginTop: isMobile ? 2 : 0,
                    }}
                >
                    <FramerCheckbox
                        width={isMobile ? 16 : 20}
                        height={isMobile ? 16 : 20}
                        checked={checked}
                        onToggle={() => toggleItem(item.id)}
                        isFocused={focusedId === item.id}
                    />
                </div>

                {/* 오른쪽 파트 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? "15px" : "20px",
                        flex: 1,
                        alignItems: "stretch",
                    }}
                >
                    {item.image_url && (
                        <img
                            src={item.image_url}
                            alt={item.title}
                            style={{
                                width: isMobile ? "100%" : 140,
                                height: isMobile ? 313 : "100%",
                                borderRadius: 0,
                                objectFit: "cover",
                                flexShrink: 0,
                            }}
                        />
                    )}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "Pretendard SemiBold",
                                    fontSize: 12,
                                    letterSpacing: "0.1em",
                                    lineHeight: "1.8em",
                                    color: "#000",
                                }}
                            >
                                {item.title}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "Pretendard Light",
                                        fontSize: 12,
                                        letterSpacing: "0em",
                                        lineHeight: "1.8em",
                                        color: "#000000",
                                        minWidth: 60,
                                        textAlign: "right",
                                    }}
                                >
                                    {item.displayed_price_kor}
                                </div>
                                {item.show_dropdown && (
                                    <div
                                        style={{
                                            border:
                                                focusedId === item.id
                                                    ? "1px solid #000000"
                                                    : "1px solid transparent",
                                            transition: "border 0.15s ease",
                                        }}
                                    >
                                        <FramerDropdown
                                            value={dropdownNumberToLabel(
                                                state.dropdownValue,
                                                item
                                            )}
                                            onChange={(v) => {
                                                const num =
                                                    dropdownLabelToNumber(
                                                        v,
                                                        item
                                                    )

                                                setFocusedId(item.id)

                                                updateDropdown(item.id, num)
                                            }}
                                            unit={item.unit}
                                            max={item.max_unit || 8}
                                            defaultText={item.default_text}
                                            defaultAllowed={
                                                item.default_allowed
                                            }
                                            selectRef={(el) => {
                                                dropdownRefs.current[item.id] =
                                                    el
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                fontFamily: "Pretendard Light",
                                fontSize: isMobile ? 10 : 12,
                                letterSpacing: "0.07em",
                                lineHeight: "1.6em",
                                color: "#000000",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {parseDescription(item.description)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const packages = items.filter((i) => i.category === "package")
    const additionals = items.filter((i) => i.category === "additional")

    const hasAvailableAdditionals = additionals.some((i) => i.available)

    function parseDescription(text: string) {
        if (!text) return null

        // 줄바꿈 및 <br> 처리
        const normalized = text
            .replace(/\\n/g, "\n")
            .replace(/<br\s*\/?>/gi, "\n")

        // 커스텀 태그 파싱: <red> ... </red>, <a50> ... </a50>
        const parts = []
        let remaining = normalized
        const tagRegex = /<(red|a50|highlight|muted)>(.*?)<\/\1>/gs

        let lastIndex = 0
        let match

        while ((match = tagRegex.exec(normalized)) !== null) {
            const [full, tag, inner] = match
            const start = match.index

            if (start > lastIndex) {
                parts.push(normalized.slice(lastIndex, start))
            }

            let style = {}
            if (tag === "red" || tag === "highlight")
                style = { color: "#ff4e4e" }
            if (tag === "a50" || tag === "muted") style = { opacity: 0.5 }

            parts.push(<span style={style}>{inner}</span>)
            lastIndex = start + full.length
        }

        if (lastIndex < normalized.length) {
            parts.push(normalized.slice(lastIndex))
        }

        // 줄바꿈 반영
        return parts.flatMap((part, i) =>
            typeof part === "string"
                ? part.split("\n").map((line, j, arr) => (
                      <React.Fragment key={`${i}-${j}`}>
                          {line}
                          {j < arr.length - 1 && <br />}
                      </React.Fragment>
                  ))
                : part
        )
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "25px" : "20px",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? "25px" : "20px",
                }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        fontSize: 14,
                        letterSpacing: "0.1em",
                        lineHeight: "1.2em",
                        color: "#000",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "Pretendard Regular",
                        }}
                    >
                        패키지 선택
                    </span>
                    <span
                        style={{
                            fontFamily: "Pretendard SemiBold",
                        }}
                    >
                        *
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: isMobile ? "25px" : "20px",
                    }}
                >
                    {packages.map(renderItem)}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {hasAvailableAdditionals && (
                    <div
                        style={{
                            fontFamily: "Pretendard Regular",
                            fontSize: 14,
                            letterSpacing: "0.1em",
                            lineHeight: "1.2em",
                            color: "#000",
                        }}
                    >
                        추가 서비스 선택
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                    }}
                >
                    {additionals.map(renderItem)}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(AdditionalServiceSelector, {
    variant: {
        type: ControlType.Enum,
        options: ["Default", "Mobile"],
        optionTitles: ["Default", "Mobile"],
        title: "Variant",
    },
})
