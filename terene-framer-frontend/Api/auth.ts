/**
 * Shared authentication requests (Phase 2B).
 *
 * Login remains a Phase 1 placeholder and is intentionally not used by the
 * current login flows, which own session initialization and redirects.
 * Endpoint paths (do not change when wiring):
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *   GET  /api/v2/customers
 *   PUT  /api/v2/customers/:membershipNumber
 */

import { apiUrl, request } from "./client.ts"

/** @deprecated Phase 1 placeholder — not used by UI yet */
export function authLoginUrl(): string {
    return apiUrl("notifier", "/api/auth/login")
}

/** @deprecated Phase 1 placeholder — not used by UI yet */
export function authMeUrl(): string {
    return apiUrl("notifier", "/api/auth/me")
}

/** @deprecated Phase 1 placeholder — not used by UI yet */
export function authLogoutUrl(): string {
    return apiUrl("notifier", "/api/auth/logout")
}

/**
 * Placeholder wrappers. Payloads/headers must match existing Auth call sites
 * when Phase 2 migrates; no callers yet.
 */
export async function login(
    body: unknown,
    init?: RequestInit
): Promise<Response> {
    return request("notifier", "/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers as Record<string, string> | undefined),
        },
        body: JSON.stringify(body),
    })
}

/**
 * Preserve the existing /me contract: the caller reads localStorage and passes
 * the token; this helper only constructs the identical Authorization header.
 */
export async function me(token: string): Promise<Response> {
    return request("notifier", "/api/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

/**
 * Preserve the existing logout contract: POST with no Authorization header.
 * Token removal and redirects remain in the calling compatibility helpers.
 */
export async function logout(): Promise<Response> {
    return request("notifier", "/api/auth/logout", {
        method: "POST",
    })
}

/**
 * Existing password-change lookup. Kept on the DB API to preserve behavior.
 */
export async function getPasswordChangeCustomers(): Promise<Response> {
    return request("db", "/api/v2/customers")
}

/**
 * Existing password-change update. The complete customer payload is forwarded
 * unchanged; migrating to /api/auth/change-password is separate future work.
 */
export async function updatePasswordChangeCustomer(
    membershipNumber: string,
    customer: unknown
): Promise<Response> {
    return request("db", `/api/v2/customers/${membershipNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
    })
}
