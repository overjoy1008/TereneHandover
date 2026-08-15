/**
 * Shared authentication requests (Phase 2B).
 *
 * Login remains a Phase 1 placeholder and is intentionally not used by the
 * current login flows, which own session initialization and redirects.
 * Endpoint paths (do not change when wiring):
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *   POST /api/auth/change-password
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
 * Secure password change. membership_number is taken from the JWT server-side;
 * the body must not include it. Caller supplies the current localStorage token.
 */
export async function changePassword(
    token: string,
    body: {
        currentPassword: string
        newPassword: string
        newPasswordAgain?: string
    }
): Promise<Response> {
    return request("notifier", "/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentPassword: body.currentPassword,
            newPassword: body.newPassword,
            newPasswordAgain: body.newPasswordAgain,
        }),
        token,
    })
}
