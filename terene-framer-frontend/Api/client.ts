/**
 * Shared fetch helper for the Framer frontend API layer.
 *
 * Phase 1: available for domain modules; no UI call sites use this yet.
 * Does not alter paths or payloads — callers pass path + body as today.
 */

import { getOrigin, type ApiService } from "./config.ts"

export type RequestOptions = {
    method?: string
    headers?: Record<string, string>
    body?: BodyInit | null
    /** When true, attach Authorization: Bearer <localStorage token> if present */
    auth?: boolean
    /** Override token source; defaults to localStorage "token" when auth is true */
    token?: string | null
}

export class ApiError extends Error {
    readonly status: number
    readonly bodyText: string

    constructor(message: string, status: number, bodyText: string) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.bodyText = bodyText
    }
}

function joinUrl(origin: string, path: string): string {
    if (/^https?:\/\//i.test(path)) return path
    const base = origin.replace(/\/$/, "")
    const suffix = path.startsWith("/") ? path : `/${path}`
    return `${base}${suffix}`
}

function resolveToken(options: RequestOptions): string | null {
    if (options.token !== undefined) return options.token
    if (!options.auth) return null
    try {
        return localStorage.getItem("token")
    } catch {
        return null
    }
}

/**
 * Build an absolute URL for a configured service + path.
 * Path must be the same endpoint path used today (e.g. "/api/v2/orders").
 */
export function apiUrl(service: ApiService, path: string): string {
    return joinUrl(getOrigin(service), path)
}

/**
 * Low-level request. Returns the raw Response (caller decides parse / error handling).
 */
export async function request(
    service: ApiService,
    path: string,
    options: RequestOptions = {}
): Promise<Response> {
    const headers: Record<string, string> = { ...(options.headers ?? {}) }
    const token = resolveToken(options)
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    return fetch(apiUrl(service, path), {
        method: options.method ?? "GET",
        headers,
        body: options.body ?? undefined,
    })
}

/**
 * JSON convenience: sets Content-Type when body is a plain object,
 * parses JSON on success, throws ApiError on non-OK.
 */
export async function requestJson<T = unknown>(
    service: ApiService,
    path: string,
    options: RequestOptions & { json?: unknown } = {}
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers ?? {}),
    }

    let body = options.body ?? null
    if (options.json !== undefined) {
        headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
        body = JSON.stringify(options.json)
    }

    const res = await request(service, path, {
        ...options,
        headers,
        body,
    })

    const text = await res.text()
    if (!res.ok) {
        throw new ApiError(
            `Request failed (${res.status}) ${apiUrl(service, path)}`,
            res.status,
            text
        )
    }

    if (!text) return undefined as T
    try {
        return JSON.parse(text) as T
    } catch {
        return text as unknown as T
    }
}
