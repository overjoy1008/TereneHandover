
//OrderElementComponent.tsx
import * as React from "react"

export function OrderElementComponent({
    data,
    onOpenDetails,
}: {
    data: Record<string, any>
    onOpenDetails: () => void
}) {
    const Tag = ({ value }: { value: string }) => {
        const statusColors = {
            pending: "#999999", // gray
            accepted: "#22b463", // green
            cancelled: "#ea5455", // red
            refunded: "#ff9f43", // yellow
            before_checkin: "#999999", // gray
            checked_in: "#4b7bec", // blue
            checked_out: "#7B5E57", // brown
        }

        const color = statusColors[value] || "#555555"

        return (
            <span
                style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: "#f9f9f9",
                    fontSize: 12,
                    fontWeight: 500,
                    color,
                    border: `1px solid ${color}`,
                }}
            >
                {value}
            </span>
        )
    }
    const formatDatetime = (datetime: string | undefined) =>
        datetime ? datetime.replace("T", " ").slice(0, 16) : "시간 없음"

    const paymentStatusDatetimeMap: Record<string, string | undefined> = {
        pending: data?.payment_timeline?.order_datetime,
        accepted: data?.payment_timeline?.approval_datetime,
        cancelled: data?.payment_timeline?.cancellation_datetime,
        refunded: data?.payment_timeline?.refund_datetime,
    }

    const paymentDatetimeRaw =
        paymentStatusDatetimeMap[data.payment_status] || ""
    const paymentDatetimeFormatted = formatDatetime(paymentDatetimeRaw)

    // Stay status에 따라 보여줄 날짜 선택
    let stayDatetimeFormatted = ""
    if (data.stay_status === "checked_in") {
        stayDatetimeFormatted = formatDatetime(
            data?.stay_timeline?.checkin_datetime
        )
    } else if (data.stay_status === "checked_out") {
        stayDatetimeFormatted = formatDatetime(
            data?.stay_timeline?.checkout_datetime
        )
    }

    const isGuest = !data.membership_number

    // Additional services name list
    const additionalServiceNames =
        data?.order_details?.additional_services
            ?.filter((service: any) => service?.name)
            .map((service: any) => service.name) || []

    return (
        <div
            style={{
                borderBottom: "1px solid #eee",
                padding: "20px 16px",
                display: "grid",
                gridTemplateColumns: "140px 140px 2fr 2.5fr 1.5fr",
                gap: "20px",
                alignItems: "start",
                fontSize: 14,
                fontFamily: "Pretendard, sans-serif",
                cursor: "pointer",
                opacity:
                    data.payment_status === "refunded" ||
                    data.stay_status === "checked_out"
                        ? 0.5
                        : 1, // 흐리게 처리
            }}
            onClick={onOpenDetails}
        >
            {/* Payment */}
            <div>
                <div>
                    <strong style={{ fontSize: 13 }}>Payment</strong>
                    <div style={{ marginTop: 4 }}>
                        <Tag value={data.payment_status} />
                    </div>
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
                    {paymentDatetimeFormatted}
                </div>
            </div>

            {/* Stay */}
            <div>
                <div>
                    <strong style={{ fontSize: 13 }}>Stay</strong>
                    <div style={{ marginTop: 4 }}>
                        <Tag value={data.stay_status} />
                    </div>
                </div>
                {stayDatetimeFormatted && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
                        {stayDatetimeFormatted}
                    </div>
                )}
            </div>

            {/* 예약자 정보 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 600 }}>{data.reserver_name}</div>
                <div style={{ fontWeight: 600, color: "#777", fontSize: 13 }}>
                    {isGuest ? "비회원 예약" : data.membership_number}
                </div>
                <div style={{ color: "#777", fontSize: 13 }}>
                    {data.reserver_contact}
                </div>
                {data.reserver_email && (
                    <div style={{ color: "#777", fontSize: 13 }}>
                        {data.reserver_email}
                    </div>
                )}
            </div>

            {/* 숙박 정보 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div>{data.order_product}</div>
                <div
                    style={{
                        fontSize: 13,
                        color: "#777",
                        fontWeight: 600,
                    }}
                >
                    {data.start_date} ~ {data.end_date}
                </div>
                {/* 인원 정보 */}
                <div style={{ fontSize: 13, color: "#777" }}>
                    성인 {data.adult ?? 0}명 / 아동 {data.child ?? 0}명
                </div>
                {/* 추가 서비스 */}
                {additionalServiceNames.length > 0 && (
                    <div style={{ fontSize: 13, color: "#777" }}>
                        추가 서비스: {additionalServiceNames.join(", ")}
                    </div>
                )}
            </div>

            {/* 금액 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration:
                        data.payment_status === "refunded"
                            ? "line-through"
                            : "none", // 취소선
                }}
            >
                ₩{Number(data.final_price).toLocaleString()}
            </div>
        </div>
    )
}
