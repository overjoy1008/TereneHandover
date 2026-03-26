// WeekComponent.tsx
import * as React from "react"
import { useEffect, useState } from "react"
import { DayComponent } from "./DayComponent.tsx"
import { useStore, calculateDay } from "./MonthDisplay.tsx"
import { membershipLimits } from "./UnmuMembership.tsx"
import { addPropertyControls, ControlType } from "framer"

function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

function getLastAvailableDate(today: Date, monthLimit: number): Date {
    const year = today.getFullYear()
    const month = today.getMonth()
    const date = today.getDate()

    const targetMonth = month + monthLimit
    const tempDate = new Date(year, targetMonth, date)

    // 2월 예외 처리: 날짜가 밀려 다음 달로 넘어간 경우
    if (tempDate.getMonth() !== targetMonth % 12) {
        // 해당 달의 마지막 날로 보정
        const corrected = new Date(year, targetMonth + 1, 0) // 다음 달의 0일 → 해당 달의 마지막 날
        corrected.setHours(23, 59, 59, 999)
        return corrected
    }

    // 일반적인 경우 (날짜가 유효하게 유지된 경우)
    tempDate.setHours(23, 59, 59, 999)
    return new Date(tempDate.getTime() - 24 * 60 * 60 * 1000) // 전날까지 허용
}

export function isBeyondReservationLimit(
    today: Date,
    target: Date,
    membership: string,
    store?
): boolean {
    if (store && store.membership === "All-Free") {
        return false
    }

    const now = getKSTDate()

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)
    dayAfterTomorrow.setHours(0, 0, 0, 0)

    const deadlineForAfterTomorrow = new Date(today)
    deadlineForAfterTomorrow.setHours(15, 0, 0, 0)

    const isTryingToReserveTomorrow =
        target.getFullYear() === tomorrow.getFullYear() &&
        target.getMonth() === tomorrow.getMonth() &&
        target.getDate() === tomorrow.getDate()

    const isTryingToReserveDayAfterTomorrow =
        target.getFullYear() === dayAfterTomorrow.getFullYear() &&
        target.getMonth() === dayAfterTomorrow.getMonth() &&
        target.getDate() === dayAfterTomorrow.getDate()

    // 내일은 항상 비활성화
    if (isTryingToReserveTomorrow) {
        return true
    }

    // 내일모레는 15시부터는 예약 불가
    if (
        isTryingToReserveDayAfterTomorrow &&
        now.getTime() >= deadlineForAfterTomorrow.getTime()
    ) {
        return true
    }

    const monthLimit = membershipLimits[membership] ?? 0
    const lastAvailableDate = getLastAvailableDate(today, monthLimit)

    // ✅ [추가] 입실일 기준으로 3박까지는 허용 (퇴실만 예외)
    if (store?.firstDate && !store?.secondDate) {
        const checkinTime = dateToTime(store.firstDate)
        const maxCheckoutTime = checkinTime + 3 * 86400000 // 3박
        const targetTime = target.getTime()

        if (
            targetTime > lastAvailableDate.getTime() &&
            targetTime <= maxCheckoutTime
        ) {
            return false
        }
    }

    return target.getTime() > lastAvailableDate.getTime()
}

// reservation-3에서 first와 second 동시에 판별하기 위한 함수, reservation-2에선 영향 X
export function isReservationPairValid(
    today: Date,
    first: Date,
    second: Date,
    membership: string,
    store?
): boolean {
    const monthLimit = membershipLimits[membership] ?? 0
    const lastAvailableDate = getLastAvailableDate(today, monthLimit)

    const checkinOK = !isBeyondReservationLimit(today, first, membership, store)

    const maxCheckoutTime = first.getTime() + 3 * 86400000 // 3박
    const checkoutOK =
        second.getTime() <= maxCheckoutTime &&
        second.getTime() > first.getTime()

    return checkinOK && checkoutOK
}

function isSameDate(a, b) {
    return a?.year === b?.year && a?.month === b?.month && a?.day === b?.day
}

function dateToTime(date) {
    return new Date(date.year, date.month, date.day).getTime()
}

function isExceeding4Nights(date1, date2) {
    const time1 = dateToTime(date1)
    const time2 = dateToTime(date2)
    const diffDays = Math.abs((time2 - time1) / (1000 * 60 * 60 * 24))
    return diffDays >= 4
}

export function WeekComponent(props) {
    const [store, setStore] = useStore()
    const { week, thisMonth, variant, dayInfoMap } = props

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

                const isPast = currentDate <= today
                const isBeyondLimit = isBeyondReservationLimit(
                    today,
                    currentDate,
                    store.membership,
                    store
                )

                const yyyy = dateObj.year.toString()
                const mm = String(dateObj.month + 1).padStart(2, "0")
                const dd = String(dateObj.day).padStart(2, "0")
                const key = `${yyyy}-${mm}-${dd}`
                const dayInfo = dayInfoMap?.get(key)

                const checkinOccupied = dayInfo?.checkin?.is_occupied ?? false
                const checkoutOccupied = dayInfo?.checkout?.is_occupied ?? false
                const isHoliday = dayInfo?.isHoliday ?? false
                const category = dayInfo?.category ?? null

                // 스타일 표현용: baseVariant는 "회색 처리"에만 사용
                let baseVariant: "Day" | "Holiday" | "Disabled" = "Day"
                // isPotentialCheckout: firstDate가 선택된 상태에서 이 날짜가 그 다음 날짜인 경우
                const isPotentialCheckout =
                    store.firstDate &&
                    !store.secondDate &&
                    dateToTime(dateObj) > dateToTime(store.firstDate)

                // 사이에 Disabled 날짜가 있는지 확인
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
                            info.checkin?.is_occupied ||
                            info.checkout?.is_occupied

                        if (dayIsDisabled) return true
                    }
                    return false
                })()

                // 최종 Disabled 여부 결정
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
                            isExceeding4Nights(store.firstDate, dateObj)))

                if (shouldBeDisabled) {
                    baseVariant = "Disabled"
                } else if (i === 0 || isHoliday) {
                    // 일요일 및 공휴일 로직
                    baseVariant = "Holiday"
                }

                // isBeyondLimit이거나, 체크인 체크아웃 둘 다 점유된 경우, 선택 불가
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
                            let d = new Date(startDate.getTime() + 86400000); // 다음날부터 검사
                            d < endDate;
                            d.setDate(d.getDate() + 1)
                        ) {
                            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                            const info = dayInfoMap?.get(key)
                            const checkinOcc =
                                info?.checkin?.is_occupied ?? false
                            const checkoutOcc =
                                info?.checkout?.is_occupied ?? false

                            if (checkinOcc || checkoutOcc) return true
                        }

                        return false
                    }

                    // 0. 아무것도 없는 상태에서 선택 -> 입실
                    if (!first && !second) {
                        if (checkinOccupied) return // 입실이 이미 점유된 경우

                        setStore({ ...store, firstDate: dateObj })
                        return
                    }

                    // 1. 입실만 선택된 상태에서 동일한 날짜 클릭 -> 입실 해제
                    if (first && !second && clickedTime === dateToTime(first)) {
                        setStore({ ...store, firstDate: null })
                        return
                    }

                    // 2. 입실만 선택된 상태에서 과거 클릭 -> 입실 변경
                    if (first && !second && clickedTime < dateToTime(first)) {
                        if (checkinOccupied) return // 입실이 이미 점유된 경우

                        setStore({ ...store, firstDate: dateObj })
                        return
                    }

                    // 3. 입실만 선택된 상태에서 미래 클릭 -> 퇴실 설정
                    if (first && !second && clickedTime > dateToTime(first)) {
                        const start = first
                        const end = dateObj

                        if (isExceeding4Nights(start, end)) {
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

                    // 4. 입실/퇴실 모두 선택된 상태에서 클릭 -> 입실 재설정, 퇴실 해제
                    if (first && second) {
                        if (checkinOccupied) return // 입실이 이미 점유된 경우

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
                    />
                )
            })}
        </div>
    )
}

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
})
