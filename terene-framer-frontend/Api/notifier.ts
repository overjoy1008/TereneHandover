/**
 * Notifier domain — legacy-compatible implementation (Phase 2A).
 *
 * Preserves the original Notifier/notify.ts signatures, requests, return values,
 * and error behavior. Notifier/notify.ts re-exports these functions so existing
 * UI imports remain unchanged.
 */

import { request } from "./client.ts"

export async function sendSMS(phone: string, message: string) {
    const response = await request("notifier", "/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_phone: phone.replace(/-/g, ""),
            phone_message: message,
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(
            `SMS 전송 실패 (${phone}): ${response.status} - ${errText}`
        )
    }

    return response
}

export async function sendEmail(email: string, title: string, message: string) {
    const response = await request("notifier", "/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            platform: "gmail",
            receiver_email: email,
            email_title: title,
            email_message: message,
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(
            `이메일 전송 실패 (${email}): ${response.status} - ${errText}`
        )
    }

    return response
}

export async function sendSMSv2(phone: string, type: string, params: any) {
    const response = await request("notifier", "/api/sms/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_phone: phone.replace(/-/g, ""),
            template_type: type,
            params,
        }),
    })
    if (!response.ok) throw new Error("SMS v2 전송 실패")
}

export async function sendEmailv2(email: string, type: string, params: any) {
    const response = await request("notifier", "/api/email/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_email: email,
            template_type: type,
            platform: "gmail",
            params,
        }),
    })
    if (!response.ok) throw new Error("이메일 v2 전송 실패")
}

export async function sendKakaov2(phone: string, type: string, params: any) {
    const response = await request("notifier", "/api/kakao/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_phone: phone.replace(/-/g, ""),
            template_type: type,
            params,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message =
            errorData?.error?.message ||
            errorData?.error ||
            response.statusText ||
            "카카오 알림톡 전송 실패"

        console.error("💥 카카오 알림톡 전송 실패:", errorData)

        throw new Error(message)
    }
}

/** Queue path helper — path must remain /api/queue/:job (e.g. A, CD, N, O). */
export function queueUrl(job: string): string {
    const suffix = job.startsWith("/") ? job : `/${job}`
    return `/api/queue${suffix}`
}

/** Placeholder queue POST — unused by UI in Phase 1 */
export async function postQueue(
    job: string,
    body: unknown
): Promise<Response> {
    return request("notifier", queueUrl(job), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
}
