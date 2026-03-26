// Utils/DateUtils.tsx
export function dateToTime(date) {
    return new Date(date.year, date.month, date.day).getTime()
}

export function isSameDate(a, b) {
    return a?.year === b?.year && a?.month === b?.month && a?.day === b?.day
}

export function formatDate({
    year,
    month,
    day,
}: {
    year: number
    month: number
    day: number
}): string {
    const paddedMonth = String(month + 1).padStart(2, "0") // month는 0-based
    const paddedDay = String(day).padStart(2, "0")
    return `${year}-${paddedMonth}-${paddedDay}`
}

export function parseDate(
    dateStr: string
): { year: number; month: number; day: number } | null {
    const [yearStr, monthStr, dayStr] = dateStr.split("-")
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1 // zero-based
    const day = parseInt(dayStr)

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null

    return { year, month, day }
}
