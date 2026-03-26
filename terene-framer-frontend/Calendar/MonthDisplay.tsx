import { forwardRef, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { useStore } from "../Store/MainStore.tsx"
import { getKSTDate } from "../Utils/KST.tsx"

const now = getKSTDate()

// helper to centralize your year-based variant rules
function getMonthVariants(monthIndex: number, year: number) {
    const today = getKSTDate()
    const ty = today.getFullYear()
    const tm = today.getMonth()

    const isPastOrCurrent = year < ty || (year === ty && monthIndex <= tm)

    return {
        prevMonthVariant: isPastOrCurrent ? "Disabled" : "Default",
        nextMonthVariant: "Default",
    }
}

export const MONTH_NAMES = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
]

export function displayThisMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const monthName = MONTH_NAMES[store.monthIndex]
        const text = `${store.year}. ${monthName}`
        return <Component {...props} text={text} />
    }
}

export function displayNextMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        // store.monthIndex/store.year 기준으로 +1달 계산
        const nextIndex = (store.monthIndex + 1) % 12
        const nextYear = store.monthIndex === 11 ? store.year + 1 : store.year
        const monthName = MONTH_NAMES[nextIndex]
        const text = `${nextYear}. ${monthName}`
        return <Component {...props} text={text} />
    }
}

export function toggleNextMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        const handleClick = () => {
            // variant가 Default가 아니면 무시
            if (store.nextMonthVariant !== "Default") return

            // syncPrevVariant()

            const { monthIndex, year } = store
            const nextIndex = (monthIndex + 1) % 12
            const nextYear = monthIndex === 11 ? year + 1 : year

            setStore({ monthIndex: nextIndex, year: nextYear })
            setStore(getMonthVariants(nextIndex, nextYear))
        }

        return (
            <Component
                {...props}
                onClick={handleClick}
                variant={store.nextMonthVariant}
            />
        )
    }
}

export function togglePrevMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        const handleClick = () => {
            // variant가 default가 아니면 무시
            if (store.prevMonthVariant !== "Default") return

            // syncPrevVariant()

            const { monthIndex, year } = store
            const prevIndex = (monthIndex + 11) % 12
            const prevYear = monthIndex === 0 ? year - 1 : year

            setStore({ monthIndex: prevIndex, year: prevYear })
            setStore(getMonthVariants(prevIndex, prevYear))
        }

        return (
            <Component
                {...props}
                onClick={handleClick}
                variant={store.prevMonthVariant}
            />
        )
    }
}

export function calculateDay(
    year: number,
    monthIndex: number,
    row: number,
    col: number
) {
    // 이 달 1일의 요일 (0=일,1=월,…6=토)
    const firstWeekday = new Date(year, monthIndex, 1).getDay()
    // 이 달의 총 일수
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    // 이전 달의 총 일수
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

    // 전체 그리드 상에서의 인덱스
    const cellIndex = row * 7 + col
    // "1일"을 기준 삼아 상대적인 날짜 계산
    const relativeDay = cellIndex - firstWeekday + 1

    let day: number
    let isCurrentMonth: boolean
    let actualDate: Date

    if (relativeDay < 1) {
        day = daysInPrevMonth + relativeDay
        isCurrentMonth = false
        actualDate = new Date(year, monthIndex - 1, day)
    } else if (relativeDay > daysInMonth) {
        day = relativeDay - daysInMonth
        isCurrentMonth = false
        actualDate = new Date(year, monthIndex + 1, day)
    } else {
        day = relativeDay
        isCurrentMonth = true
        actualDate = new Date(year, monthIndex, day)
    }

    return {
        day,
        isCurrentMonth,
        actualMonth: actualDate.getMonth(),
        actualYear: actualDate.getFullYear(),
    }
}

export { useStore }
