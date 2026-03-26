import { getKSTDate } from "./KST.tsx"
import { dateToTime } from "./DateUtils.tsx"
import { membershipLimits } from "../Calendar/UnmuMembership_1231.tsx"

type Mode = "customer" | "admin"

export function isExceeding4Nights(date1, date2, mode: Mode = "customer") {
    const time1 = dateToTime(date1)
    const time2 = dateToTime(date2)
    const diffDays = Math.abs((time2 - time1) / (1000 * 60 * 60 * 24))
    // Customer: 4박 이상(>=4) 차단, Admin: 제한 없음
    return mode !== "admin" && diffDays >= 4
}

export function getLastAvailableDate(today: Date, monthLimit: number): Date {
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    const targetMonth = month + monthLimit
    const tempDate = new Date(year, targetMonth, 0)
    tempDate.setHours(23, 59, 59, 999)

    return tempDate
}

export function isBeyondReservationLimit(
    today: Date,
    target: Date,
    membership: string,
    store?,
    mode: Mode = "customer"
): boolean {
    // All-Free 멤버십이면 항상 허용
    if (store && store.membership === "All-Free") {
        return false
    }

    // Admin 모드이면 항상 허용
    if (mode === "admin") {
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

    // ---- "월 제한" 로직 ----
    const monthLimit = membershipLimits[membership] ?? 0
    const lastAvailableDate = getLastAvailableDate(today, monthLimit)

    // 입실일 기준으로 3박까지는 허용 (퇴실만 예외)
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
    store?,
    mode: Mode = "customer"
): boolean {
    const checkinOK = !isBeyondReservationLimit(
        today,
        first,
        membership,
        store,
        mode
    )

    if (mode === "admin") {
        // Admin: 3박 제한 미적용 → 체크아웃은 입실 이후면 OK
        const checkoutOK = second.getTime() > first.getTime()
        return checkinOK && checkoutOK
    }

    // Customer: 기존 3박 제한 유지
    const maxCheckoutTime = first.getTime() + 3 * 86400000
    const checkoutOK =
        second.getTime() <= maxCheckoutTime &&
        second.getTime() > first.getTime()

    return checkinOK && checkoutOK
}
