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
    return request("db", "/api/v2/orders", {
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

export async function getReservationDays(): Promise<Response> {
    return request("gateway", "/api/v3/days")
}

export async function getReservationSettings(): Promise<Response> {
    return request("db", "/api/v3/settings")
}
