export function getKSTDate(baseDate = new Date()) {
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
    return new Date(utc + 9 * 60 * 60 * 1000)
}

export function getKSTISOString(date = new Date()): string {
    const kstDate = getKSTDate(date)

    const pad = (n: number) => String(n).padStart(2, "0")

    const year = kstDate.getFullYear()
    const month = pad(kstDate.getMonth() + 1)
    const day = pad(kstDate.getDate())
    const hours = pad(kstDate.getHours())
    const minutes = pad(kstDate.getMinutes())
    const seconds = pad(kstDate.getSeconds())

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`
}
