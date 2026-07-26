
import * as React from "react"
import { getDaysCategory } from "../Api/daysCategory.ts"

export type DayCategoryDef = {
    eng_name: string
    kor_name: string
    custom: boolean
    unmu_price: number
    bg_color: string
}

export function useDayCategoryDefinitions() {
    const [map, setMap] = React.useState<Record<string, DayCategoryDef>>({})
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        let cancelled = false

        getDaysCategory()
            .then((rows) => {
                if (cancelled) return
                const next: Record<string, DayCategoryDef> = {}
                for (const row of rows) {
                    next[row.eng_name] = row
                }
                setMap(next)
            })
            .catch((e) => {
                if (!cancelled) {
                    console.error("days-category fetch error", e)
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return { categoryDefs: map, isLoading }
}
