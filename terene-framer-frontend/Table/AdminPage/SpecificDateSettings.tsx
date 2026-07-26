import * as React from "react"
import { addPropertyControls } from "framer"
import { useStore } from "../../Store/MainStore.tsx"
import MinimalButton from "../../Components/MinimalButton.tsx"
import SpecificDateRow from "./SpecificDateRow.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"
import {
    getReservationDays,
    invalidateReservationDays,
} from "../../Api/reservations.ts"

type DateObj = {
    year: number
    month: number
    day: number
}

export default function SpecificDateSettings() {
    const [store, setStore] = useStore()

    const [dayInfoMap, setDayInfoMap] = React.useState<Map<string, any> | null>(
        null
    )
    const [isLoading, setIsLoading] = React.useState(false)
    const [customCategories, setCustomCategories] = React.useState<string[]>([])
    const [editingKeys, setEditingKeys] = React.useState<Set<string>>(new Set())

    const [categoryKorToEng, setCategoryKorToEng] = React.useState<
        Map<string, string>
    >(new Map())
    const [categoryEngToKor, setCategoryEngToKor] = React.useState<
        Map<string, string>
    >(new Map())

    const selectedDates: DateObj[] = store.selectedDates ?? []

    const sortedDates = [...selectedDates].sort((a, b) => {
        const da = new Date(a.year, a.month, a.day).getTime()
        const db = new Date(b.year, b.month, b.day).getTime()
        return da - db
    })

    const sortedDatesKey = React.useMemo(() => {
        return sortedDates
            .map(
                (d) =>
                    `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(
                        d.day
                    ).padStart(2, "0")}`
            )
            .join("|")
    }, [sortedDates])

    const isBulkEditing = editingKeys.size > 0

    const editingDates = React.useMemo(() => {
        const set = new Set<string>()
        editingKeys.forEach((key) => {
            key.split("|").forEach((d) => set.add(d))
        })
        return set
    }, [editingKeys])

    const fetchDays = React.useCallback(async () => {
        if (!store.location) return
        if (sortedDates.length === 0) return

        setIsLoading(true)

        const res = await getReservationDays()
        const data = await res.json()

        const dateKeySet = new Set(
            sortedDates.map(
                (d) =>
                    `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(
                        d.day
                    ).padStart(2, "0")}`
            )
        )

        const filtered = data
            .filter(
                (item: any) =>
                    item.location === store.location &&
                    dateKeySet.has(item.date)
            )
            .sort((a: any, b: any) =>
                a.date < b.date ? -1 : a.date > b.date ? 1 : 0
            )

        const map = new Map<string, any>()
        filtered.forEach((item: any) => {
            map.set(item.date, {
                category: categoryEngToKor.get(item.category) ?? item.category,
                isHoliday: item.is_holiday,
                checkin_allowed: item.checkin_allowed,
                checkout_allowed: item.checkout_allowed,
                location: item.location,
            })
        })

        setDayInfoMap(map)
        setIsLoading(false)
    }, [store.location, sortedDatesKey])

    React.useEffect(() => {
        fetchDays()
    }, [fetchDays])

    /* custom category */
    React.useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/v3/days-category")
            .then((r) => r.json())
            .then((data) => {
                const korNames: string[] = []
                const korToEng = new Map<string, string>()
                const engToKor = new Map<string, string>()

                data.forEach((c: any) => {
                    if (c.custom) {
                        korNames.push(c.kor_name)
                        korToEng.set(c.kor_name, c.eng_name)
                        engToKor.set(c.eng_name, c.kor_name)
                    }
                })

                setCustomCategories(korNames)
                setCategoryKorToEng(korToEng)
                setCategoryEngToKor(engToKor)
            })
    }, [])

    const mapCategoryToProps = (cat: string) => {
        switch (cat) {
            case "Weekday":
                return { weekday: "left", peak: "right" }
            case "Weekend":
                return { weekday: "right", peak: "right" }
            case "Peak-Weekday":
                return { weekday: "left", peak: "left" }
            case "Peak-Weekend":
                return { weekday: "right", peak: "left" }
            default:
                return { weekday: null, peak: null }
        }
    }

    const getGroupKey = (info: any) => {
        return [
            info.category,
            info.checkin_allowed,
            info.checkout_allowed,
        ].join("|")
    }

    const grouped = React.useMemo(() => {
        if (!dayInfoMap) return []

        const map = new Map<
            string,
            { dates: string[]; info: any; isEditing: boolean }
        >()

        dayInfoMap.forEach((info, dateStr) => {
            const key = getGroupKey(info)

            const dateIsEditing = editingDates.has(dateStr)

            if (!map.has(key)) {
                map.set(key, {
                    dates: [dateStr],
                    info,
                    isEditing: dateIsEditing,
                })
            } else {
                const group = map.get(key)!
                group.dates.push(dateStr)

                if (dateIsEditing) {
                    group.isEditing = true
                }
            }
        })

        return Array.from(map.values())
    }, [dayInfoMap, editingDates])

    function sameSet(a: Set<string>, b: Set<string>) {
        if (a.size !== b.size) return false
        for (const v of a) if (!b.has(v)) return false
        return true
    }

    React.useEffect(() => {
        if (editingKeys.size === 0) return

        const next = new Set<string>()

        grouped.forEach((g) => {
            if (g.isEditing) next.add(g.dates.join("|"))
        })

        if (sameSet(editingKeys, next)) return
        setEditingKeys(next)
    }, [grouped, editingKeys])

    const updateGroupInfo = (dates: string[], updates: any) => {
        setDayInfoMap((prev) => {
            if (!prev) return prev
            const newMap = new Map(prev)

            dates.forEach((d) => {
                const old = newMap.get(d)
                newMap.set(d, { ...old, ...updates })
            })

            return newMap
        })
    }

    const saveGroup = async (dates: string[]) => {
        if (!dayInfoMap || !store.location) return

        for (const date of dates) {
            const info = dayInfoMap.get(date)
            if (!info) continue

            const dateId = `${date}_${store.location}`

            const categoryToSave =
                categoryKorToEng.get(info.category) ?? info.category

            await fetch(
                `https://terene-db-server.onrender.com/api/v3/days/${dateId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date_id: dateId,
                        date,
                        location: store.location,
                        category: categoryToSave,
                        is_holiday: info.isHoliday ?? false,
                        checkin_allowed: info.checkin_allowed,
                        checkout_allowed: info.checkout_allowed,
                    }),
                }
            )
        }
    }

    const saveAllGroups = async () => {
        if (!dayInfoMap || !store.location) return

        for (const key of editingKeys) {
            const dates = key.split("|")

            for (const date of dates) {
                const info = dayInfoMap.get(date)
                if (!info) continue

                const dateId = `${date}_${store.location}`

                const categoryToSave =
                    categoryKorToEng.get(info.category) ?? info.category

                await fetch(
                    `https://terene-db-server.onrender.com/api/v3/days/${dateId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date_id: dateId,
                            date,
                            location: store.location,
                            category: categoryToSave,
                            is_holiday: info.isHoliday ?? false,
                            checkin_allowed: info.checkin_allowed,
                            checkout_allowed: info.checkout_allowed,
                        }),
                    }
                )
            }
        }
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 25,
                width: "100%",
                fontFamily: "Pretendard Regular",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 203px",
                    alignItems: "center",
                    height: 35,
                }}
            >
                <div
                    style={{
                        fontSize: 18,
                        fontFamily: "Pretendard SemiBold",
                    }}
                >
                    특정 날짜 설정
                </div>

                <MinimalButton
                    label={isBulkEditing ? "일괄 저장" : "일괄 수정"}
                    variant="border"
                    color="#FF4D4D"
                    width={203}
                    height={35}
                    fontSize={14}
                    onClick={async () => {
                        if (isBulkEditing) {
                            await saveAllGroups()
                            setEditingKeys(new Set())
                            invalidateReservationDays()
                            await fetchDays()
                            setStore({ daysVersion: store.daysVersion + 1 })
                        } else {
                            if (!grouped.length || !dayInfoMap) return

                            const baseInfo = grouped[0].info

                            setDayInfoMap((prev) => {
                                if (!prev) return prev
                                const next = new Map(prev)

                                prev.forEach((_, date) => {
                                    next.set(date, { ...baseInfo })
                                })

                                return next
                            })

                            setEditingKeys(
                                new Set([grouped[0].dates.join("|")])
                            )
                        }
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    borderTop: "1px solid #222",
                    paddingTop: 20,
                    gap: 25,
                    position: "relative",
                    minHeight: 120,
                }}
            >
                {grouped.map(({ dates, info }) => {
                    const mapped = mapCategoryToProps(info.category)
                    const isStandardCategory = [
                        "Weekday",
                        "Weekend",
                        "Peak-Weekday",
                        "Peak-Weekend",
                    ].includes(info.category)

                    return (
                        <SpecificDateRow
                            key={dates.join("|")}
                            dates={dates}
                            peak={mapped.peak}
                            weekday={mapped.weekday}
                            holidayValue={
                                isStandardCategory ? "" : info.category
                            }
                            dropdownOptions={customCategories}
                            disabled={!editingKeys.has(dates.join("|"))}
                            isEditing={editingKeys.has(dates.join("|"))}
                            onToggleEdit={async () => {
                                const key = dates.join("|")

                                if (editingKeys.has(key)) {
                                    await saveGroup(dates)
                                    setEditingKeys((prev) => {
                                        const next = new Set(prev)
                                        next.delete(key)
                                        return next
                                    })
                                    invalidateReservationDays()
                                    await fetchDays()
                                    setStore({
                                        daysVersion: store.daysVersion + 1,
                                    })
                                } else {
                                    setEditingKeys((prev) =>
                                        new Set(prev).add(key)
                                    )
                                }
                            }}
                            canCheckin={info.checkin_allowed ? "left" : "right"}
                            canCheckout={
                                info.checkout_allowed ? "left" : "right"
                            }
                            onChangePeak={(v) =>
                                updateGroupInfo(dates, {
                                    category:
                                        v === "left"
                                            ? mapped.weekday === "left"
                                                ? "Peak-Weekday"
                                                : "Peak-Weekend"
                                            : mapped.weekday === "left"
                                              ? "Weekday"
                                              : "Weekend",
                                    isHoliday: false,
                                })
                            }
                            onChangeWeekday={(v) =>
                                updateGroupInfo(dates, {
                                    category:
                                        mapped.peak === "left"
                                            ? v === "left"
                                                ? "Peak-Weekday"
                                                : "Peak-Weekend"
                                            : v === "left"
                                              ? "Weekday"
                                              : "Weekend",
                                    isHoliday: false,
                                })
                            }
                            onChangeHoliday={(v) =>
                                updateGroupInfo(dates, { category: v })
                            }
                            onChangeCanCheckin={(v) =>
                                updateGroupInfo(dates, {
                                    checkin_allowed: v === "left",
                                })
                            }
                            onChangeCanCheckout={(v) =>
                                updateGroupInfo(dates, {
                                    checkout_allowed: v === "left",
                                })
                            }
                        />
                    )
                })}

                {isLoading && (
                    <LoadingOverlay
                        visible
                        mode="component"
                        message="날짜 정보를 불러오는 중입니다..."
                    />
                )}
            </div>
        </div>
    )
}

addPropertyControls(SpecificDateSettings, {})
