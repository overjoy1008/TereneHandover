
import * as React from "react"
import { useEffect, useState } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { DayComponent } from "./DayComponent.tsx"
import { calculateDay } from "./MonthDisplay.tsx"
import { addPropertyControls, ControlType } from "framer"
import { getKSTDate } from "../Utils/KST.tsx"
import { dateToTime, isSameDate } from "../Utils/DateUtils.tsx"
import { useDayCategoryDefinitions } from "../Receipt/useDayCategoryDefinitions.ts"
import { getOrder, getCustomer } from "../Api/reservations.ts"

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
    const { categoryDefs } = useDayCategoryDefinitions()
    const [orderAllFreeMap, setOrderAllFreeMap] = useState<
        Map<string, boolean>
    >(new Map())
    const [orderAllFreeLoading, setOrderAllFreeLoading] = useState(false)

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

    useEffect(() => {
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

    useEffect(() => {
        if (!dayInfoMap) return

        const ids = new Set<string>()
        dayInfoMap.forEach((info) => {
            if (info?.checkin_order_id) ids.add(info.checkin_order_id)
            if (info?.checkout_order_id) ids.add(info.checkout_order_id)
        })

        const idList = Array.from(ids)
        if (idList.length === 0) return

        const missing = idList.filter((id) => !orderAllFreeMap.has(id))
        if (missing.length === 0) return

        let cancelled = false
        setOrderAllFreeLoading(true)

        Promise.all(
            missing.map(async (orderId) => {
                try {
                    const orderRes = await getOrder(orderId)
                    const order = await orderRes.json()

                    const membershipNumber = order?.membership_number
                    if (!membershipNumber) return [orderId, false] as const

                    const customerRes = await getCustomer(membershipNumber)
                    const customer = await customerRes.json()

                    const isAllFree = customer?.membership_grade === "All-Free"
                    return [orderId, isAllFree] as const
                } catch {
                    return [orderId, false] as const
                }
            })
        )
            .then((pairs) => {
                if (cancelled) return
                setOrderAllFreeMap((prev) => {
                    const next = new Map(prev)
                    pairs.forEach(([id, v]) => next.set(id, v))
                    return next
                })
            })
            .finally(() => {
                if (cancelled) return
                setOrderAllFreeLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [dayInfoMap, orderAllFreeMap])

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
                const bgColor = category
                    ? (categoryDefs?.[category]?.bg_color ?? null)
                    : null

                let checkinStatus:
                    | "blocked"
                    | "allfree"
                    | "unavailable"
                    | null = null
                let checkoutStatus:
                    | "blocked"
                    | "allfree"
                    | "unavailable"
                    | null = null

                const hasCheckinBlocked = info?.checkin_allowed === false
                const hasCheckoutBlocked = info?.checkout_allowed === false

                const hasCheckinOrder = Boolean(info?.checkin_order_id)
                const hasCheckoutOrder = Boolean(info?.checkout_order_id)

                // 체크인 상태
                if (hasCheckinBlocked) {
                    checkinStatus = "blocked"
                } else if (hasCheckinOrder) {
                    const isAllFree =
                        info?.checkin_order_id &&
                        orderAllFreeMap.get(info.checkin_order_id) === true

                    checkinStatus = isAllFree ? "allfree" : "unavailable"
                }

                // 체크아웃 상태
                if (hasCheckoutBlocked) {
                    checkoutStatus = "blocked"
                } else if (hasCheckoutOrder) {
                    const isAllFree =
                        info?.checkout_order_id &&
                        orderAllFreeMap.get(info.checkout_order_id) === true

                    checkoutStatus = isAllFree ? "allfree" : "unavailable"
                }

                const selected = isSelected(dateObj)

                const variant = selected
                    ? "Middle"
                    : isHoliday || i === 0
                      ? "Holiday"
                      : "Day"

                const handleClick = () => {
                    console.log("color: ", bgColor)
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
                        bgColor={bgColor}
                        checkinStatus={checkinStatus}
                        checkoutStatus={checkoutStatus}
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
