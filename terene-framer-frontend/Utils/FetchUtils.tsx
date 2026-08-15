import { getReservationSettings } from "../Api/reservations.ts"

export async function fetchSettings() {
    const res = await getReservationSettings()

    if (!res.ok) {
        throw new Error(`Failed to fetch settings: ${res.status}`)
    }

    const list = await res.json()

    return list.reduce((acc: any, s: any) => {
        acc[s.id] = s
        return acc
    }, {})
}

export async function fetchAdminBypassCode(): Promise<string | null> {
    const res = await getReservationSettings()

    if (!res.ok) return null

    const list = await res.json()
    const bypass = list.find((s: any) => s.id === "AdminBypassCode")

    return bypass?.text_setting ?? null
}
