
import React, { useEffect, useState } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { WeekSelector } from "./WeekSelector.tsx"
import { addPropertyControls, ControlType } from "framer"

type Mode = "customer" | "admin"

function useHolidayDataOnce(location?: string, daysVersion?: number) {
    const [dayInfoMap, setDayInfoMap] = useState<Map<string, any> | null>(null)

    useEffect(() => {
        if (!location) return

        fetch("https://terene-db-server.onrender.com/api/v3/days")
            .then((res) => res.json())
            .then((data) => {
                const filtered = data.filter(
                    (item: any) => item.location === location
                )

                const map = new Map<string, any>()
                filtered.forEach((item: any) => {
                    map.set(item.date, {
                        isHoliday: item.is_holiday,
                        category: item.category,
                    })
                })

                setDayInfoMap(map)
            })
            .catch(() => {
                alert("날짜 데이터를 불러오지 못했습니다.")
            })
    }, [location, daysVersion])

    return dayInfoMap
}

type CalendarSelectorProps = {
    thisMonth: boolean
    variant: "Default" | "Mobile"
    mode?: Mode
}

export function CalendarSelector(props: CalendarSelectorProps) {
    const [store] = useStore()
    const { thisMonth, variant, mode = "customer" } = props

    /* 🔽 store.daysVersion 전달 */
    const dayInfoMap = useHolidayDataOnce(store.location, store.daysVersion)

    return (
        <div>
            {[0, 1, 2, 3, 4, 5].map((week) => (
                <WeekSelector
                    key={`${thisMonth ? "left" : "right"}-${week}`}
                    week={week}
                    thisMonth={thisMonth}
                    variant={variant}
                    dayInfoMap={dayInfoMap ?? undefined}
                    mode={mode}
                />
            ))}
        </div>
    )
}

addPropertyControls(CalendarSelector, {
    thisMonth: {
        type: ControlType.Boolean,
        title: "Left Calendar?",
        defaultValue: true,
    },
    variant: {
        type: ControlType.Enum,
        options: ["Default", "Mobile"],
        defaultValue: "Default",
    },
    mode: {
        type: ControlType.Enum,
        options: ["customer", "admin"],
        defaultValue: "customer",
    },
})
