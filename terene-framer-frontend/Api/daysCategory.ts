/**
 * Shared GET /api/v3/days-category with in-flight dedupe and TTL success cache.
 *
 * Production endpoint (ACTIVE_ENV=PROD):
 *   https://terene-db-server.onrender.com/api/v3/days-category
 */

import { ApiError, request } from "./client.ts"

/** Single logical cache key for v1. */
const DAYS_CATEGORY_CACHE_KEY = "days-category:v3:ALL"
const DAYS_CATEGORY_CACHE_TTL_MS = 300_000

export type DaysCategoryRow = {
    eng_name: string
    kor_name: string
    custom: boolean
    unmu_price: number
    bg_color: string
}

export type GetDaysCategoryOptions = {
    forceRefresh?: boolean
}

type DaysCategoryCacheEntry = {
    data: DaysCategoryRow[]
    fetchedAt: number
}

const successCache = new Map<string, DaysCategoryCacheEntry>()
let inFlight: Promise<DaysCategoryRow[]> | null = null
/**
 * Bumped when a new network fetch starts or when the cache is invalidated.
 * A completing request may write the success cache only if its epoch still matches.
 */
let fetchEpoch = 0

function startFetch(): Promise<DaysCategoryRow[]> {
    fetchEpoch += 1
    const myEpoch = fetchEpoch

    const promise: Promise<DaysCategoryRow[]> = (async () => {
        try {
            const response = await request("db", "/api/v3/days-category")
            if (!response.ok) {
                const bodyText = await response.text()
                throw new ApiError(
                    `days-category GET failed: ${response.status} ${response.statusText}`,
                    response.status,
                    bodyText
                )
            }
            const data = (await response.json()) as DaysCategoryRow[]
            if (myEpoch === fetchEpoch) {
                successCache.set(DAYS_CATEGORY_CACHE_KEY, {
                    data,
                    fetchedAt: Date.now(),
                })
            }
            return data
        } finally {
            if (inFlight === promise) {
                inFlight = null
            }
        }
    })()

    inFlight = promise
    return promise
}

/**
 * GET /api/v3/days-category with module-level in-flight dedupe and success cache.
 */
export async function getDaysCategory(
    options?: GetDaysCategoryOptions
): Promise<DaysCategoryRow[]> {
    const forceRefresh = options?.forceRefresh === true

    if (!forceRefresh) {
        const entry = successCache.get(DAYS_CATEGORY_CACHE_KEY)
        if (entry) {
            if (Date.now() - entry.fetchedAt < DAYS_CATEGORY_CACHE_TTL_MS) {
                return entry.data
            }
            successCache.delete(DAYS_CATEGORY_CACHE_KEY)
        }
    }

    if (!forceRefresh && inFlight) {
        return inFlight
    }

    return startFetch()
}

/**
 * Clear the days-category success cache. Next normal getDaysCategory() hits the network.
 * Does not cancel an in-flight request; that request cannot repopulate the cache
 * after this call (epoch bump). Clears the in-flight slot so the next call does
 * not join a pre-invalidation request.
 */
export function invalidateDaysCategory(): void {
    successCache.delete(DAYS_CATEGORY_CACHE_KEY)
    fetchEpoch += 1
    inFlight = null
}
