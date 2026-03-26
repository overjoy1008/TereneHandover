// AdminPage/DaysCategory.tsx
import * as React from "react"
import { addPropertyControls } from "framer"
import { useStore } from "../../Store/MainStore.tsx"
import MinimalButton from "../../Components/MinimalButton.tsx"
import MultiPurposeInput from "../../Components/MultiPurposeInput.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"

type Category = {
    eng_name: string
    kor_name: string
    unmu_price: number
    bg_color: string
    custom: boolean
}

const STANDARD = ["Weekday", "Weekend", "Peak-Weekday", "Peak-Weekend"]

const sortCategories = (items: Category[], isEditing: boolean) => {
    const standard = items
        .filter((c) => STANDARD.includes(c.eng_name))
        .sort(
            (a, b) =>
                STANDARD.indexOf(a.eng_name) - STANDARD.indexOf(b.eng_name)
        )

    const customRaw = items.filter((c) => !STANDARD.includes(c.eng_name))

    const custom = isEditing
        ? customRaw // 수정중: 기존 순서 유지
        : customRaw.sort((a, b) =>
              (a.kor_name || "").localeCompare(b.kor_name || "", "ko")
          ) // 완료: 이름순 정렬

    return [...standard, ...custom]
}

const chunk = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }
    return result
}

export default function DaysCategory() {
    const [store, setStore] = useStore()
    const [items, setItems] = React.useState<Category[]>([])
    const [isEditing, setIsEditing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchCategories = async () => {
        setIsLoading(true)
        const res = await fetch(
            "https://terene-db-server.onrender.com/api/v3/days-category"
        )
        const data = await res.json()
        setItems(data)
        setIsLoading(false)
    }

    React.useEffect(() => {
        fetchCategories()
    }, [])

    const updateItem = (eng: string, patch: Partial<Category>) => {
        setItems((prev) =>
            prev.map((c) => (c.eng_name === eng ? { ...c, ...patch } : c))
        )
    }

    const handleAdd = () => {
        const id = `Custom-${Date.now()}`
        setItems((prev) => [
            ...prev,
            {
                eng_name: id,
                kor_name: "",
                unmu_price: 0,
                bg_color: "#FFFFFF",
                custom: true,
            },
        ])
        setIsEditing(true)
    }

    const handleSave = async () => {
        setIsLoading(true)

        for (const item of items) {
            await fetch(
                "https://terene-db-server.onrender.com/api/v3/days-category",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...item,
                        custom: !STANDARD.includes(item.eng_name),
                    }),
                }
            )
        }

        await fetchCategories()
        setStore({ daysVersion: store.daysVersion + 1 })
        setIsEditing(false)
        setIsLoading(false)
    }

    const sortedItems = React.useMemo(
        () => sortCategories(items, isEditing),
        [items, isEditing]
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
                    기본 날짜 설정
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                    }}
                >
                    <MinimalButton
                        label="추가"
                        variant="background"
                        color="#E6E6E6"
                        width={200}
                        height={35}
                        fontSize={14}
                        fontFamily="Pretendard Medium"
                        onClick={handleAdd}
                    />

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
            </div>

            {/* BOTTOM */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    paddingTop: 20,
                    borderTop: "1px solid #000000",
                }}
            >
                {chunk(sortedItems, 4).map((row, rowIndex) => (
                    <div key={rowIndex}>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                padding: "30px 0",
                            }}
                        >
                            {/* LEFT */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    minWidth: 100,
                                    fontFamily: "Pretendard SemiBold",
                                    fontSize: 14,
                                }}
                            >
                                <div
                                    style={{
                                        height: 35,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    유형
                                </div>
                                <div
                                    style={{
                                        height: 35,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    기본 요금
                                </div>
                                <div
                                    style={{
                                        height: 35,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    컬러값
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flex: 1,
                                }}
                            >
                                {row.map((c) => (
                                    <div
                                        key={c.eng_name}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 10,
                                            width: "calc((100% - 30px) / 4)",
                                        }}
                                    >
                                        <MultiPurposeInput
                                            type="text"
                                            value={c.kor_name}
                                            height={35}
                                            disabled={!isEditing}
                                            onChange={(v) =>
                                                updateItem(c.eng_name, {
                                                    kor_name: v,
                                                })
                                            }
                                        />

                                        <MultiPurposeInput
                                            type="number"
                                            value={String(c.unmu_price)}
                                            height={35}
                                            disabled={!isEditing}
                                            onChange={(v) =>
                                                updateItem(c.eng_name, {
                                                    unmu_price: Number(v),
                                                })
                                            }
                                        />

                                        <MultiPurposeInput
                                            type="colorcode"
                                            value={c.bg_color}
                                            height={35}
                                            disabled={!isEditing}
                                            onChange={(v) =>
                                                updateItem(c.eng_name, {
                                                    bg_color: v,
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {rowIndex !== chunk(sortedItems, 4).length - 1 && (
                            <div
                                style={{
                                    borderTop: "1px solid #E0E0E0",
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {isLoading && (
                <LoadingOverlay
                    visible
                    mode="component"
                    message="저장 중입니다..."
                />
            )}
        </div>
    )
}

addPropertyControls(DaysCategory, {})
