
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"
import { DayComponent } from "./DayComponent.tsx"
import { calculateDay } from "./MonthDisplay.tsx"
import { addPropertyControls, ControlType } from "framer"
import { getKSTDate } from "../Utils/KST.tsx"
import { dateToTime, isSameDate } from "../Utils/DateUtils.tsx"

type Mode = "customer" | "admin"

type DateObj = {
    year: number
    month: number
    day: number
}

type WeekSelectorProps = {
    week: number
    thisMonth: boolean
    variant: "Default" | "Mobile"
    dayInfoMap?: Map<string, any>
    mode?: Mode
}

export function WeekSelector(props: WeekSelectorProps) {
    const [store, setStore] = useStore()
    const { week, thisMonth, variant, dayInfoMap } = props

    const monthIndex = thisMonth
        ? store.monthIndex
        : (store.monthIndex + 1) % 12
    const year =
        thisMonth || store.monthIndex < 11 ? store.year : store.year + 1

    const width = variant === "Mobile" ? 300 : 350

    const today = getKSTDate()
    today.setHours(0, 0, 0, 0)

    const selectedDates: DateObj[] = store.selectedDates ?? []

    const modRef = React.useRef({
        ctrl: false,
        shift: false,
        meta: false,
    })

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Control") modRef.current.ctrl = true
            if (e.key === "Shift") modRef.current.shift = true
            if (e.key === "Meta") modRef.current.meta = true
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Control") modRef.current.ctrl = false
            if (e.key === "Shift") modRef.current.shift = false
            if (e.key === "Meta") modRef.current.meta = false
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    }, [])

    const isSelected = (d: DateObj) =>
        selectedDates.some((s) => isSameDate(s, d))

    const toggleDate = (d: DateObj) => {
        const exists = isSelected(d)
        const next = exists
            ? selectedDates.filter((s) => !isSameDate(s, d))
            : [...selectedDates, d]

        setStore({
            ...store,
            selectedDates: next,
            lastSelectedDate: d,
        })
    }

    const selectRange = (from: DateObj, to: DateObj) => {
        const start = dateToTime(from)
        const end = dateToTime(to)
        const min = Math.min(start, end)
        const max = Math.max(start, end)

        const range: DateObj[] = []
        let cursor = new Date(from.year, from.month, from.day)

        while (
            dateToTime({
                year: cursor.getFullYear(),
                month: cursor.getMonth(),
                day: cursor.getDate(),
            }) <= max
        ) {
            const obj = {
                year: cursor.getFullYear(),
                month: cursor.getMonth(),
                day: cursor.getDate(),
            }

            if (dateToTime(obj) >= min) range.push(obj)

            cursor.setDate(cursor.getDate() + 1)
        }

        setStore({
            ...store,
            selectedDates: Array.from(
                new Map(
                    [...selectedDates, ...range].map((d) => [dateToTime(d), d])
                ).values()
            ),
            lastSelectedDate: to,
        })
    }

    return (
        <div
            style={{
                display: "flex",
                width,
                height: 50,
            }}
        >
            {Array.from({ length: 7 }, (_, i) => {
                const { day, isCurrentMonth, actualMonth, actualYear } =
                    calculateDay(year, monthIndex, week, i)

                const dateObj = {
                    year: actualYear,
                    month: actualMonth,
                    day,
                }

                const currentDate = new Date(actualYear, actualMonth, day)
                currentDate.setHours(0, 0, 0, 0)

                const isToday =
                    isCurrentMonth && currentDate.getTime() === today.getTime()

                if (!isCurrentMonth) {
                    return (
                        <DayComponent
                            key={`${week}-${i}`}
                            index={day}
                            variant="Invisible"
                            onClick={() => {}}
                        />
                    )
                }

                const yyyy = actualYear.toString()
                const mm = String(actualMonth + 1).padStart(2, "0")
                const dd = String(day).padStart(2, "0")
                const key = `${yyyy}-${mm}-${dd}`

                const info = dayInfoMap?.get(key)
                const isHoliday = info?.isHoliday ?? false
                const category = info?.category ?? null

                const selected = isSelected(dateObj)

                const variant = selected
                    ? "Middle"
                    : isHoliday || i === 0
                      ? "Holiday"
                      : "Day"

                const handleClick = () => {
                    const isCtrl = modRef.current.ctrl || modRef.current.meta
                    const isShift = modRef.current.shift

                    if (isCtrl) {
                        toggleDate(dateObj)
                        return
                    }

                    if (isShift && selectedDates.length > 0) {
                        selectRange(
                            selectedDates[selectedDates.length - 1],
                            dateObj
                        )
                        return
                    }

                    setStore({
                        ...store,
                        selectedDates: [dateObj],
                        lastSelectedDate: dateObj,
                    })
                }

                return (
                    <DayComponent
                        key={`${week}-${i}`}
                        index={day}
                        variant={variant}
                        onClick={handleClick}
                        isToday={isToday}
                        dayCategory={category}
                    />
                )
            })}
        </div>
    )
}

addPropertyControls(WeekSelector, {
    week: {
        type: ControlType.Number,
        min: 0,
        max: 5,
        step: 1,
        defaultValue: 0,
    },
    thisMonth: {
        type: ControlType.Boolean,
        defaultValue: true,
    },
    variant: {
        type: ControlType.Enum,
        options: ["Default", "Mobile"],
        defaultValue: "Default",
    },
})
