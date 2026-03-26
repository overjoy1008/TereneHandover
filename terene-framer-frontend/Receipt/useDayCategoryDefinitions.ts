
import * as React from "react"

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
        fetch("https://terene-db-server.onrender.com/api/v3/days-category")
            .then((res) => res.json())
            .then((rows: DayCategoryDef[]) => {
                const next: Record<string, DayCategoryDef> = {}
                for (const row of rows) {
                    next[row.eng_name] = row
                }
                setMap(next)
            })
            .catch((e) => console.error("days-category fetch error", e))
            .finally(() => setIsLoading(false))
    }, [])

    return { categoryDefs: map, isLoading }
}
