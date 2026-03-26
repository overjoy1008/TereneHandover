
import React, { useEffect, useState } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { WeekComponent } from "./WeekComponent.tsx"
import { addPropertyControls, ControlType } from "framer"

type Mode = "customer" | "admin"

function useHolidayAndOccupyDataOnce(location?: string) {
    const [dayInfoMap, setDayInfoMap] = useState<Map<string, any> | null>(null)

    useEffect(() => {
        if (!location) return

        fetch("https://terene-db-server.onrender.com/api/v3/days")
            .then((res) => res.json())
            .then((data) => {
                const filtered = data
                    .filter((item: any) => item.location === location)
                    .sort((a: any, b: any) => {
                        if (a.date === b.date) return 0
                        return a.date < b.date ? -1 : 1
                    })

                const map = new Map<string, any>()
                filtered.forEach((item: any) => {
                    map.set(item.date, {
                        category: item.category,
                        isHoliday: item.is_holiday,
                        checkin_occupied: item.checkin_occupied,
                        checkout_occupied: item.checkout_occupied,
                        checkin_order_id: item.checkin_order_id,
                        checkout_order_id: item.checkout_order_id,
                        checkin_allowed: item.checkin_allowed,
                        checkout_allowed: item.checkout_allowed,
                        location: item.location,
                    })
                })
                setDayInfoMap(map)
            })
            .catch((err) => {
                alert(
                    "날짜 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요."
                )
                console.error("Failed to fetch day data", err)
            })
    }, [location])

    return dayInfoMap
}

type CalendarContainerProps = {
    thisMonth: boolean
    variant: "Default" | "Mobile"
    mode?: Mode
}

export function CalendarContainer(props: CalendarContainerProps) {
    const [store] = useStore()
    const { thisMonth, variant, mode = "customer" } = props

    const dayInfoMap = useHolidayAndOccupyDataOnce(store.location)

    return (
        <div>
            {[0, 1, 2, 3, 4, 5].map((week) => (
                <WeekComponent
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

addPropertyControls(CalendarContainer, {
    thisMonth: {
        type: ControlType.Boolean,
        title: "Left Calendar?",
        defaultValue: true,
        description: "Yes = 왼쪽 달력, No = 오른쪽 달력",
    },
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: ["Default", "Mobile"],
        optionTitles: ["Default (350px)", "Mobile (300px)"],
        defaultValue: "Default",
    },
    mode: {
        type: ControlType.Enum,
        title: "Mode",
        options: ["customer", "admin"],
        optionTitles: ["Customer", "Admin"],
        defaultValue: "customer",
    },
})
