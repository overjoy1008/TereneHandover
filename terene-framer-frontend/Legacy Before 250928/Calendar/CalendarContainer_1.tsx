import React, { useEffect, useState } from "react"
import { WeekComponent } from "./WeekComponent.tsx"
import { addPropertyControls, ControlType } from "framer"

function useHolidayAndOccupyDataOnce() {
    const [dayInfoMap, setDayInfoMap] = useState<Map<string, any> | null>(null)

    useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/days")
            .then((res) => res.json())
            .then((data) => {
                const map = new Map()
                data.forEach((item) => {
                    map.set(item.date, {
                        category: item.category,
                        isHoliday: item.is_holiday,
                        checkin: item.checkin,
                        checkout: item.checkout,
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
    }, [])

    return dayInfoMap
}

export function CalendarContainer(props) {
    const dayInfoMap = useHolidayAndOccupyDataOnce()
    const { thisMonth, variant } = props

    return (
        <div>
            {[0, 1, 2, 3, 4, 5].map((week) => (
                <WeekComponent
                    key={`${thisMonth ? "left" : "right"}-${week}`}
                    week={week}
                    thisMonth={thisMonth}
                    variant={variant}
                    dayInfoMap={dayInfoMap}
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
})
