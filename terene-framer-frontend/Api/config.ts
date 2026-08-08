/**
 * Central environment + origin map for the Framer frontend API layer.
 *
 * Phase 1: origins only. Existing call sites are unchanged and still hardcode URLs.
 * ACTIVE_ENV defaults to PROD so behavior stays identical when this module is unused.
 *
 * LOCAL / DEV hosts are placeholders until real local/dev backends are wired.
 * DEV currently mirrors PROD (no separate DEV hosts exist in the handover codebase).
 */

export type ApiEnv = "LOCAL" | "DEV" | "PROD"

export type ApiOrigins = {
    /** PostgreSQL / DB HTTP API (terene-db-server) */
    db: string
    /** Notifier (auth + SMS/email/kakao + queues) */
    notifier: string
    /** Toss confirm proxy (terene-toss-server-api) */
    tossProxy: string
    /** Official Toss Payments REST API */
    tossApi: string
    /** Toss browser SDK script host */
    tossJs: string
    /** Public website (redirects, admin links) */
    site: string
    /** ImageKit upload endpoint host */
    imagekitUpload: string
    /** ImageKit management API host */
    imagekitApi: string
    /** Future BFF (terene-gateway) — unused in Phase 1 */
    gateway: string
}

/** Switch environments here. Default must remain PROD. */
export const ACTIVE_ENV: ApiEnv = "PROD"

const PROD_ORIGINS: ApiOrigins = {
    db: "https://terene-db-server.onrender.com",
    notifier: "https://terene-notifier-server.onrender.com",
    tossProxy: "https://terene-toss-server-api.onrender.com",
    tossApi: "https://api.tosspayments.com",
    tossJs: "https://js.tosspayments.com",
    site: "https://terene.kr",
    imagekitUpload: "https://upload.imagekit.io",
    imagekitApi: "https://api.imagekit.io",
    gateway: "https://terene-gateway.onrender.com",
}

const DEV_ORIGINS: ApiOrigins = {
    ...PROD_ORIGINS,
    db: "https://terene-db-server-dev.onrender.com",
}

/**
 * Local placeholders — adjust ports to match your local stack.
 * Not used while ACTIVE_ENV === "PROD".
 */
const LOCAL_ORIGINS: ApiOrigins = {
    db: "http://localhost:4000",
    notifier: "http://localhost:3001",
    tossProxy: "http://localhost:3002",
    tossApi: "https://api.tosspayments.com",
    tossJs: "https://js.tosspayments.com",
    site: "http://localhost:3000",
    imagekitUpload: "https://upload.imagekit.io",
    imagekitApi: "https://api.imagekit.io",
    gateway: "http://localhost:8080",
}

const ENV_ORIGINS: Record<ApiEnv, ApiOrigins> = {
    LOCAL: LOCAL_ORIGINS,
    DEV: DEV_ORIGINS,
    PROD: PROD_ORIGINS,
}

export function getOrigins(env: ApiEnv = ACTIVE_ENV): ApiOrigins {
    return ENV_ORIGINS[env]
}

export const origins: ApiOrigins = getOrigins()

export type ApiService = keyof ApiOrigins

export function getOrigin(
    service: ApiService,
    env: ApiEnv = ACTIVE_ENV
): string {
    return getOrigins(env)[service]
}
