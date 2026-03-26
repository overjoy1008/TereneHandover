import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useStore } from "../../Store/MainStore.tsx"
import MinimalButton from "../../Components/MinimalButton.tsx"
import MultiPurposeInput from "../../Components/MultiPurposeInput.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"

type Setting = {
    id: string
    rule: string
    description?: string
    type: "boolean" | "numeric" | "text" | "selection"

    boolean_setting?: boolean | null

    numeric_setting?: number | null
    numeric_min?: number | null
    numeric_max?: number | null
    numberic_step?: number | null

    text_setting?: string | null

    selection_setting?: string[] | null
    selection_default?: string | null
}

type Props = {
    visibleSettings?: string[]
}

export default function AdminSettings({ visibleSettings = [] }: Props) {
    const [store, setStore] = useStore()
    const [items, setItems] = React.useState<Setting[]>([])
    const [isEditing, setIsEditing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showBypassCode, setShowBypassCode] = React.useState(false)

    const fetchSettings = async () => {
        setIsLoading(true)
        const res = await fetch(
            "https://terene-db-server.onrender.com/api/v3/settings"
        )
        const data = await res.json()
        setItems(data)
        setIsLoading(false)
    }

    React.useEffect(() => {
        fetchSettings()
    }, [])

    const updateItem = (id: string, patch: Partial<Setting>) => {
        setItems((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
        )
    }

    const handleSave = async () => {
        setIsLoading(true)

        for (const item of items) {
            await fetch(
                "https://terene-db-server.onrender.com/api/v3/settings",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                }
            )
        }

        await fetchSettings()
        setStore({ settingsVersion: (store as any).settingsVersion + 1 || 1 })
        setIsEditing(false)
        setIsLoading(false)
    }

    const renderInput = (s: Setting) => {
        const isBypassCode = s.id === "AdminBypassCode"

        switch (s.type) {
            case "text":
                if (isBypassCode) {
                    return (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <MultiPurposeInput
                                type={showBypassCode ? "text" : "password"}
                                value={s.text_setting ?? ""}
                                disabled={!isEditing}
                                onChange={(v) =>
                                    updateItem(s.id, { text_setting: v })
                                }
                                height={35}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowBypassCode((prev) => !prev)
                                }
                                style={{
                                    fontFamily: "Pretendard Regular",
                                    fontSize: 12,
                                    background: "none",
                                    border: "none",
                                    color: "#666",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {showBypassCode ? "숨기기" : "보기"}
                            </button>
                        </div>
                    )
                }

                return (
                    <MultiPurposeInput
                        type="text"
                        value={s.text_setting ?? ""}
                        disabled={!isEditing}
                        onChange={(v) => updateItem(s.id, { text_setting: v })}
                        height={35}
                    />
                )

            case "boolean":
                return (
                    <MultiPurposeInput
                        type="dropdown"
                        value={s.boolean_setting ? "true" : "false"}
                        disabled={!isEditing}
                        dropdownOptions={["true", "false"]}
                        dropdownDefaultAllowed={false}
                        onChange={(v) =>
                            updateItem(s.id, {
                                boolean_setting: v === "true",
                            })
                        }
                        height={35}
                    />
                )

            case "numeric":
                return (
                    <MultiPurposeInput
                        type="number"
                        value={String(s.numeric_setting ?? "")}
                        disabled={!isEditing}
                        onChange={(v) =>
                            updateItem(s.id, {
                                numeric_setting: v === "" ? null : Number(v),
                            })
                        }
                        height={35}
                    />
                )

            case "selection":
                return (
                    <MultiPurposeInput
                        type="dropdown"
                        value={s.selection_default ?? ""}
                        disabled={!isEditing}
                        dropdownOptions={s.selection_setting ?? []}
                        dropdownDefaultAllowed={false}
                        onChange={(v) =>
                            updateItem(s.id, {
                                selection_default: v,
                            })
                        }
                        height={35}
                    />
                )

            default:
                return null
        }
    }

    const filteredItems = items.filter(
        (s) => visibleSettings.length === 0 || visibleSettings.includes(s.id)
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                paddingTop: 30,
                borderTop: "1px solid #000000",
                fontFamily: "Pretendard Regular",
                position: "relative",
            }}
        >
            {/* TOP */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        fontFamily: "Pretendard Medium",
                        fontSize: 18,
                    }}
                >
                    관리자 설정
                </div>

                <MinimalButton
                    label={isEditing ? "저장" : "수정"}
                    variant="background"
                    color="#555555"
                    width={200}
                    height={35}
                    fontSize={14}
                    fontFamily="Pretendard Medium"
                    onClick={() => {
                        if (isEditing) handleSave()
                        else setIsEditing(true)
                    }}
                />
            </div>

            {/* LIST */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    paddingTop: 20,
                    borderTop: "1px solid #000000",
                }}
            >
                {filteredItems.map((s, index) => {
                    const isLast = index === filteredItems.length - 1

                    return (
                        <div
                            key={s.id}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                padding: "20px 0",
                                borderBottom: isLast
                                    ? "none"
                                    : "1px solid #E0E0E0",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 30,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                        flex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "Pretendard SemiBold",
                                            fontSize: 14,
                                        }}
                                    >
                                        {s.rule}
                                    </div>

                                    {s.description && (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#888888",
                                            }}
                                        >
                                            {s.description}
                                        </div>
                                    )}
                                </div>

                                <div style={{ width: 400 }}>
                                    {renderInput(s)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {isLoading && (
                <LoadingOverlay
                    visible
                    mode="component"
                    message="설정을 저장 중입니다..."
                />
            )}
        </div>
    )
}

addPropertyControls(AdminSettings, {
    visibleSettings: {
        type: ControlType.Array,
        title: "표시 설정",
        propertyControl: {
            type: ControlType.Enum,
            options: ["AdminBypassCode", "ExcessDiscountRate"],
        },
        defaultValue: ["AdminBypassCode", "ExcessDiscountRate"],
    },
})
