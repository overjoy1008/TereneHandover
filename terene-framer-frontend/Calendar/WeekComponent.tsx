
// WeekComponent.tsx
import * as React from "react"
import { useEffect, useState } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { DayComponent } from "./DayComponent.tsx"
import { calculateDay } from "./MonthDisplay.tsx"

import { addPropertyControls, ControlType } from "framer"

import { useCalendarStore } from "../Store/CalendarStore.tsx"

import { getKSTDate } from "../Utils/KST.tsx"
import { dateToTime, isSameDate } from "../Utils/DateUtils.tsx"
import {
    isExceeding4Nights,
    isBeyondReservationLimit,
    isReservationPairValid,
} from "../Utils/ReservationUtils.tsx"
import { useDayCategoryDefinitions } from "../Receipt/useDayCategoryDefinitions.ts"

type Mode = "customer" | "admin"

type WeekComponentProps = {
    week: number
    thisMonth: boolean
    variant: "Default" | "Mobile"
    dayInfoMap: Map<string, any> | undefined
    mode?: Mode // <-- 추가
}

export function WeekComponent(props: WeekComponentProps) {
    const [store, setStore] = useStore()
    const { week, thisMonth, variant, dayInfoMap, mode = "customer" } = props
    const { categoryDefs } = useDayCategoryDefinitions()

    const monthIndex = thisMonth
        ? store.monthIndex
        : (store.monthIndex + 1) % 12
    const year =
        thisMonth || store.monthIndex < 11 ? store.year : store.year + 1
    const width = props.variant === "Mobile" ? 300 : 350

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: 0,
        width: width,
        height: 50,
    }

    const today = getKSTDate()
    today.setHours(0, 0, 0, 0)

    return (
        <div style={containerStyle}>
            {Array.from({ length: 7 }, (_, i) => {
                const { day, isCurrentMonth, actualMonth, actualYear } =
                    calculateDay(year, monthIndex, week, i)
                const dateObj = { year: actualYear, month: actualMonth, day }

                const isSelectedFirst = isSameDate(store.firstDate, dateObj)
                const isSelectedSecond = isSameDate(store.secondDate, dateObj)

                const isBetween =
                    store.firstDate &&
                    store.secondDate &&
                    isCurrentMonth &&
                    (() => {
                        const d = dateToTime(dateObj)
                        const f = dateToTime(store.firstDate)
                        const s = dateToTime(store.secondDate)
                        return d > f && d < s
                    })()

                const currentDate = new Date(year, monthIndex, day)
                currentDate.setHours(0, 0, 0, 0)

                const isTodayDate =
                    isCurrentMonth &&
                    currentDate.getFullYear() === today.getFullYear() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getDate() === today.getDate()

                const isPast =
                    mode === "admin" || store.membership === "All-Free"
                        ? false
                        : currentDate <= today

                const isBeyondLimit = isBeyondReservationLimit(
                    today,
                    currentDate,
                    store.membership,
                    store,
                    mode
                )

                const yyyy = dateObj.year.toString()
                const mm = String(dateObj.month + 1).padStart(2, "0")
                const dd = String(dateObj.day).padStart(2, "0")
                const key = `${yyyy}-${mm}-${dd}`
                const dayInfo = dayInfoMap?.get(key)

                const checkinOccupied =
                    dayInfo?.checkin_occupied === true ||
                    dayInfo?.checkin_allowed === false

                const checkoutOccupied =
                    dayInfo?.checkout_occupied === true ||
                    dayInfo?.checkout_allowed === false

                const isHoliday = dayInfo?.isHoliday ?? false
                const category = dayInfo?.category ?? null

                const bgColor = category
                    ? (categoryDefs?.[category]?.bg_color ?? null)
                    : null

                let baseVariant: "Day" | "Holiday" | "Disabled" = "Day"

                const isPotentialCheckout =
                    store.firstDate &&
                    !store.secondDate &&
                    dateToTime(dateObj) > dateToTime(store.firstDate)

                const hasDisabledBetween = (() => {
                    if (!isPotentialCheckout) return false
                    const start = store.firstDate
                    const end = dateObj

                    for (
                        let d = new Date(
                            start.year,
                            start.month,
                            start.day + 1
                        );
                        d < new Date(end.year, end.month, end.day);
                        d.setDate(d.getDate() + 1)
                    ) {
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        const info = dayInfoMap?.get(key)

                        const dayIsDisabled =
                            !info ||
                            info.checkin_occupied ||
                            info.checkout_occupied

                        if (dayIsDisabled) return true
                    }
                    return false
                })()

                const shouldBeDisabled =
                    !isCurrentMonth ||
                    isPast ||
                    isBeyondLimit ||
                    !dayInfoMap ||
                    (checkinOccupied && checkoutOccupied) ||
                    (checkinOccupied &&
                        !checkoutOccupied &&
                        (!isPotentialCheckout ||
                            hasDisabledBetween ||
                            isExceeding4Nights(store.firstDate, dateObj, mode))) // ← mode 전달

                if (shouldBeDisabled) {
                    baseVariant = "Disabled"
                } else if (i === 0 || isHoliday) {
                    baseVariant = "Holiday"
                }

                const isSelectable = !(
                    isPast ||
                    isBeyondLimit ||
                    (checkinOccupied && checkoutOccupied) ||
                    !isCurrentMonth
                )

                const effectiveVariant = !isCurrentMonth
                    ? "Invisible"
                    : isSelectedFirst
                      ? "Start"
                      : isSelectedSecond
                        ? "End"
                        : isBetween
                          ? "Middle"
                          : baseVariant

                const handleClick = () => {
                    if (!dayInfoMap || !isSelectable) return

                    const clickedTime = dateToTime(dateObj)

                    const first = store.firstDate
                    const second = store.secondDate

                    const checkOccupiedBetween = (start, end) => {
                        const startDate = new Date(
                            start.year,
                            start.month,
                            start.day
                        )
                        const endDate = new Date(end.year, end.month, end.day)

                        for (
                            let d = new Date(startDate.getTime() + 86400000);
                            d < endDate;
                            d.setDate(d.getDate() + 1)
                        ) {
                            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                            const info = dayInfoMap?.get(key)
                            const checkinOcc = info?.checkin_occupied ?? false
                            const checkoutOcc = info?.checkout_occupied ?? false

                            if (checkinOcc || checkoutOcc) return true
                        }

                        return false
                    }

                    if (!first && !second) {
                        if (checkinOccupied) return
                        setStore({ ...store, firstDate: dateObj })
                        return
                    }

                    if (first && !second && clickedTime === dateToTime(first)) {
                        setStore({ ...store, firstDate: null })
                        return
                    }

                    if (first && !second && clickedTime < dateToTime(first)) {
                        if (checkinOccupied) return
                        setStore({ ...store, firstDate: dateObj })
                        return
                    }

                    if (first && !second && clickedTime > dateToTime(first)) {
                        const start = first
                        const end = dateObj

                        if (isExceeding4Nights(start, end, mode)) {
                            alert(
                                "4박 이상 예약은 별도로 문의해주시기 바랍니다.\n[문의처] 카카오톡 채널(ID: TERENE)"
                            )
                            return
                        }
                        if (checkOccupiedBetween(start, end)) return

                        setStore({
                            ...store,
                            firstDate: start,
                            secondDate: end,
                        })
                        return
                    }

                    if (first && second) {
                        if (checkinOccupied) return
                        setStore({
                            ...store,
                            firstDate: dateObj,
                            secondDate: null,
                        })
                        return
                    }
                }

                return (
                    <DayComponent
                        key={`${week}-${i}`}
                        index={day}
                        variant={effectiveVariant}
                        onClick={isSelectable ? handleClick : undefined}
                        isToday={isTodayDate}
                        dayCategory={category}
                        bgColor={bgColor}
                    />
                )
            })}
        </div>
    )
}

// ---- Framer Controls ----
addPropertyControls(WeekComponent, {
    week: {
        type: ControlType.Number,
        defaultValue: 0,
        min: 0,
        max: 5,
        step: 1,
        title: "Week",
        displayStepper: true,
    },
    thisMonth: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Left Calendar?",
        description: "Yes = 왼쪽 달력, No = 오른쪽 달력",
    },
    variant: {
        type: ControlType.Enum,
        options: ["Default", "Mobile"],
        optionTitles: ["Default (350px)", "Mobile (300px)"],
        defaultValue: "Default",
        title: "Variant",
    },
    mode: {
        type: ControlType.Enum,
        options: ["customer", "admin"],
        optionTitles: ["Customer", "Admin"],
        defaultValue: "customer",
        title: "Mode",
    },
})
