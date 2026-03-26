
// UnmuMembership.tsx
import { forwardRef, type ComponentType } from "react"

import { useStore } from "../Store/MainStore.tsx"

import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"

const membershipCycle = [
    "Non-Member",
    "UNMU 6",
    "UNMU 9",
    "UNMU 12",
    "UNMU 24",
    "TERENE 6",
    "TERENE 9",
    "TERENE 12",
    "TERENE 24",
]

export function displayMembership(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useStore()

        const handleTap = () => {
            const currentIndex = membershipCycle.indexOf(store.membership)
            const nextIndex = (currentIndex + 1) % membershipCycle.length
            setStore({ membership: membershipCycle[nextIndex] })
        }

        return (
            <Component {...props} text={store.membership} onTap={handleTap} />
        )
    }
}

export const membershipLimits: Record<string, number> = {
    "Non-Member": 2, // 만2개월
    "UNMU 6": 3, // 만3개월
    "UNMU 9": 6, // 만6개월
    "UNMU 12": 8, // 만8개월
    "UNMU 24": 12, // 만12개월
    "TERENE 6": 3, // 만3개월
    "TERENE 9": 6, // 만6개월
    "TERENE 12": 8, // 만8개월
    "TERENE 24": 12, // 만12개월
}

// UNDER CONSTRUCTION /////////////////////////////////////
export const membershipPrices: Record<
    "Non-Member",
    Record<"Weekday" | "Weekend" | "Peak-Weekday" | "Peak-Weekend", number>
> = {
    "Non-Member": {
        Weekday: 1_350_000,
        Weekend: 1_800_000,
        "Peak-Weekday": 1_800_000,
        "Peak-Weekend": 2_100_000,
    },
}

export const unmuDayLimits: Record<
    | "UNMU 6"
    | "UNMU 9"
    | "UNMU 12"
    | "UNMU 24"
    | "TERENE 6"
    | "TERENE 9"
    | "TERENE 12"
    | "TERENE 24",
    {
        Weekday: number
        Weekend: number
        Peak: number // Peak-Weekday + Peak-Weekend
    }
> = {
    "UNMU 6": { Weekday: 4, Weekend: 1, Peak: 1 },
    "UNMU 9": { Weekday: 5, Weekend: 2, Peak: 2 },
    "UNMU 12": { Weekday: 7, Weekend: 3, Peak: 2 },
    "UNMU 24": { Weekday: 13, Weekend: 6, Peak: 5 },
    "TERENE 6": { Weekday: 4, Weekend: 1, Peak: 1 },
    "TERENE 9": { Weekday: 5, Weekend: 2, Peak: 2 },
    "TERENE 12": { Weekday: 7, Weekend: 3, Peak: 2 },
    "TERENE 24": { Weekday: 13, Weekend: 6, Peak: 5 },
}
