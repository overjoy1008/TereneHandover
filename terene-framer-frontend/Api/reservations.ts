/**
 * Shared reservation HTTP API (Phase 2C).
 *
 * Returns raw Response objects so existing callers retain their own parsing and
 * error behavior. Endpoint paths and payloads match the legacy fetch calls.
 * Shared paths:
 *   /api/v2/orders
 *   /api/v2/customers
 *   /api/v2/coupon-definitions
 *   /api/v2/coupon-instances
 *   /api/v2/mileages
 *   /api/v3/days
 *   /api/v3/days-category
 *   /api/v3/settings
 *   /api/v3/additional-services
 *   /api/v3/refund-policy
 */

import { apiUrl, request } from "./client.ts"

export function ordersUrl(orderId?: string): string {
    return orderId
        ? apiUrl("db", `/api/v2/orders/${orderId}`)
        : apiUrl("db", "/api/v2/orders")
}

export function customersUrl(): string {
    return apiUrl("db", "/api/v2/customers")
}

export function daysV3Url(): string {
    return apiUrl("db", "/api/v3/days")
}

export function settingsV3Url(): string {
    return apiUrl("db", "/api/v3/settings")
}

export async function getOrders(): Promise<Response> {
    return request("db", "/api/v2/orders")
}

export async function getOrder(orderId: string): Promise<Response> {
    return request("db", `/api/v2/orders/${orderId}`)
}

export async function createOrder(body: unknown): Promise<Response> {
    return request("gateway", "/api/v2/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
}

export async function getCustomer(
    membershipNumber: string
): Promise<Response> {
    return request("db", `/api/v2/customers/${membershipNumber}`)
}

export async function getCustomers(): Promise<Response> {
    return request("db", "/api/v2/customers")
}

/** Single logical cache key for v1 (full list; client filters by location). */
const DAYS_CACHE_KEY = "days:v3:ALL"
const DAYS_CACHE_TTL_MS = 30_000

export type GetReservationDaysOptions = {
    forceRefresh?: boolean
}

type DaysCacheEntry = {
    data: unknown
    fetchedAt: number
}

type DaysLoadResult =
    | { type: "success"; data: unknown }
    | {
          type: "http-error"
          status: number
          statusText: string
          body: string
          contentType: string | null
      }

/** Parsed JSON success cache (key: DAYS_CACHE_KEY only in v1). */
const daysSuccessCache = new Map<string, DaysCacheEntry>()
/** Shared in-flight load of parsed data (never a live Response). */
let daysInFlight: Promise<DaysLoadResult> | null = null
/**
 * Bumped when a new network fetch starts or when the cache is invalidated.
 * A completing request may write the success cache only if its epoch still matches.
 */
let daysFetchEpoch = 0

function syntheticDaysOkResponse(data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}

function syntheticDaysErrorResponse(result: {
    status: number
    statusText: string
    body: string
    contentType: string | null
}): Response {
    const headers: HeadersInit = {}
    if (result.contentType) {
        headers["Content-Type"] = result.contentType
    }
    return new Response(result.body, {
        status: result.status,
        statusText: result.statusText,
        headers,
    })
}

function responseFromDaysLoad(result: DaysLoadResult): Response {
    if (result.type === "success") {
        return syntheticDaysOkResponse(result.data)
    }
    return syntheticDaysErrorResponse(result)
}

function startDaysFetch(): Promise<DaysLoadResult> {
    daysFetchEpoch += 1
    const myEpoch = daysFetchEpoch

    const promise: Promise<DaysLoadResult> = (async () => {
        try {
            const response = await request("gateway", "/api/v3/days")
            if (!response.ok) {
                const contentType = response.headers.get("Content-Type")
                const body = await response.text()
                return {
                    type: "http-error" as const,
                    status: response.status,
                    statusText: response.statusText,
                    body,
                    contentType,
                }
            }
            const data = await response.json()
            if (myEpoch === daysFetchEpoch) {
                daysSuccessCache.set(DAYS_CACHE_KEY, {
                    data,
                    fetchedAt: Date.now(),
                })
            }
            return { type: "success" as const, data }
        } finally {
            if (daysInFlight === promise) {
                daysInFlight = null
            }
        }
    })()

    daysInFlight = promise
    return promise
}

/**
 * GET /api/v3/days with module-level in-flight dedupe and success cache.
 * Always returns a fresh Response so callers may call .json() independently.
 */
export async function getReservationDays(
    options?: GetReservationDaysOptions
): Promise<Response> {
    const forceRefresh = options?.forceRefresh === true

    if (!forceRefresh) {
        const entry = daysSuccessCache.get(DAYS_CACHE_KEY)
        if (entry) {
            if (Date.now() - entry.fetchedAt < DAYS_CACHE_TTL_MS) {
                return syntheticDaysOkResponse(entry.data)
            }
            daysSuccessCache.delete(DAYS_CACHE_KEY)
        }
    }

    if (!forceRefresh && daysInFlight) {
        return responseFromDaysLoad(await daysInFlight)
    }

    return responseFromDaysLoad(await startDaysFetch())
}

/**
 * Clear the days success cache. Next normal getReservationDays() hits the network.
 * Does not cancel an in-flight request; that request cannot repopulate the cache
 * after this call (epoch bump). Clears the in-flight slot so the next call does
 * not join a pre-invalidation request.
 */
export function invalidateReservationDays(): void {
    daysSuccessCache.delete(DAYS_CACHE_KEY)
    daysFetchEpoch += 1
    daysInFlight = null
}

export async function getReservationSettings(): Promise<Response> {
    return request("db", "/api/v3/settings")
}
