// notify.ts
export async function sendSMS(phone: string, message: string) {
    const response = await fetch(
        "https://terene-notifier-server.onrender.com/api/sms",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                receiver_phone: phone.replace(/-/g, ""),
                phone_message: message,
            }),
        }
    )

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(
            `SMS 전송 실패 (${phone}): ${response.status} - ${errText}`
        )
    }

    return response
}

export async function sendEmail(email: string, title: string, message: string) {
    const response = await fetch(
        "https://terene-notifier-server.onrender.com/api/email",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                platform: "gmail",
                receiver_email: email,
                email_title: title,
                email_message: message,
            }),
        }
    )

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(
            `이메일 전송 실패 (${email}): ${response.status} - ${errText}`
        )
    }

    return response
}

/////////////////////////////////////////////////////////////
// v2 notifier functions ////////////////////////////////////

export async function sendSMSv2(phone: string, type: string, params: any) {
    const response = await fetch(
        "https://terene-notifier-server.onrender.com/api/sms/v2",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                receiver_phone: phone.replace(/-/g, ""),
                template_type: type,
                params,
            }),
        }
    )
    if (!response.ok) throw new Error("SMS v2 전송 실패")
}

export async function sendEmailv2(email: string, type: string, params: any) {
    const response = await fetch(
        "https://terene-notifier-server.onrender.com/api/email/v2",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                receiver_email: email,
                template_type: type,
                platform: "gmail",
                params,
            }),
        }
    )
    if (!response.ok) throw new Error("이메일 v2 전송 실패")
}

export async function sendKakaov2(phone: string, type: string, params: any) {
    const response = await fetch(
        "https://terene-notifier-server.onrender.com/api/kakao/v2",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                receiver_phone: phone.replace(/-/g, ""),
                template_type: type,
                params,
            }),
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => null) // 파싱 실패 시 null 반환
        const message =
            errorData?.error?.message ||
            errorData?.error ||
            response.statusText ||
            "카카오 알림톡 전송 실패"

        console.error("💥 카카오 알림톡 전송 실패:", errorData) // 전체 로그도 확인 가능

        throw new Error(message)
    }
}
