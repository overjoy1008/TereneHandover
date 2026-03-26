
// VacationDisplay.tsx
import { ComponentType } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { MONTH_NAMES } from "./MonthDisplay.tsx"
import { formatDate, parseDate } from "../Utils/DateUtils.tsx"

const transitionStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    color: "inherit",
    transition: "opacity 0.3s ease-in-out",
    display: "inline-block",
})

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

function formatFullDate(date: { year: number; month: number; day: number }) {
    const d = new Date(date.year, date.month, date.day)
    const weekday = WEEKDAYS[d.getDay()]
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${weekday})`
}

function calculatePeriod(start: Date, end: Date): string {
    const msPerDay = 1000 * 60 * 60 * 24
    const days = Math.round((end.getTime() - start.getTime()) / msPerDay)
    const nights = days
    const fullDays = days + 1
    return `${nights}박 ${fullDays}일`
}

export function displayStartMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const start = store.firstDate
        const end = store.secondDate
        const show = !!start
        const showYear = start && end && start.year !== end.year
        const text = start
            ? `${showYear ? `${start.year}` : `${start.year}`}. ${MONTH_NAMES[start.month]}`
            : ""
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayStartDay(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const start = store.firstDate
        const text = start ? String(start.day).padStart(2, "0") : ""
        const show = !!start
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayEndMonth(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const start = store.firstDate
        const end = store.secondDate
        const show = !!end
        const showYear = start && end && start.year !== end.year
        const text = end
            ? `${showYear ? `${end.year}` : `${end.year}`}. ${MONTH_NAMES[end.month]}`
            : ""
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayEndDay(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useStore()
        const end = store.secondDate
        const text = end ? String(end.day).padStart(2, "0") : ""
        const show = !!end
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayStartDate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const start = store.firstDate || firstDate
        const end = store.secondDate || secondDate
        const show = !!start && !!end
        const text = show ? formatFullDate(start) : ""
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayEndDate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const start = store.firstDate || firstDate
        const end = store.secondDate || secondDate
        const show = !!start && !!end
        const text = show ? formatFullDate(end) : ""
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}

export function displayTilde(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const start = store.firstDate || firstDate
        const end = store.secondDate || secondDate
        const show = !!start && !!end
        return (
            <Component
                {...props}
                text={show ? " ~ " : ""}
                style={transitionStyle(show)}
            />
        )
    }
}

export function displayPeriod(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const start = store.firstDate || firstDate
        const end = store.secondDate || secondDate
        const show = !!start && !!end
        const text = show
            ? calculatePeriod(
                  new Date(start.year, start.month, start.day),
                  new Date(end.year, end.month, end.day)
              )
            : ""
        return (
            <Component {...props} text={text} style={transitionStyle(show)} />
        )
    }
}
