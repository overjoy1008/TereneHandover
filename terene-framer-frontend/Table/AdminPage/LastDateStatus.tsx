import * as React from "react"
import { addPropertyControls } from "framer"
import { useStore } from "../../Store/MainStore.tsx"
import { formatDate } from "../../Utils/DateUtils.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"

type DateObj = {
    year: number
    month: number
    day: number
}

export default function LastDateStatus() {
    const [store] = useStore()

    const lastDate: DateObj | null = store.lastSelectedDate ?? null
    const [dayInfo, setDayInfo] = React.useState<any | null>(null)
    const [checkinOrder, setCheckinOrder] = React.useState<any | null>(null)
    const [checkoutOrder, setCheckoutOrder] = React.useState<any | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const dateStr = lastDate
        ? `${lastDate.year}-${String(lastDate.month + 1).padStart(
              2,
              "0"
          )}-${String(lastDate.day).padStart(2, "0")}`
        : "-"

    React.useEffect(() => {
        if (!store.location || dateStr === "-") {
            setDayInfo(null)
            return
        }

        setIsLoading(true)

        fetch("https://terene-db-server.onrender.com/api/v3/days")
            .then((res) => res.json())
            .then((data) => {
                const found = data.find(
                    (d: any) =>
                        d.location === store.location && d.date === dateStr
                )
                setDayInfo(found ?? null)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [store.location, dateStr])

    React.useEffect(() => {
        if (!dayInfo?.checkin_order_id) {
            setCheckinOrder(null)
            return
        }

        fetch(
            `https://terene-db-server.onrender.com/api/v2/orders/${dayInfo.checkin_order_id}`
        )
            .then((res) => res.json())
            .then(setCheckinOrder)
    }, [dayInfo?.checkin_order_id])

    React.useEffect(() => {
        if (!dayInfo?.checkout_order_id) {
            setCheckoutOrder(null)
            return
        }

        fetch(
            `https://terene-db-server.onrender.com/api/v2/orders/${dayInfo.checkout_order_id}`
        )
            .then((res) => res.json())
            .then(setCheckoutOrder)
    }, [dayInfo?.checkout_order_id])

    const renderHeader = (orderId?: string) => (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px" }}>
                <span
                    style={{ fontFamily: "Pretendard Regular", fontSize: 12 }}
                >
                    선택일자
                </span>
                <span
                    style={{
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 12,
                    }}
                >
                    {dateStr}
                </span>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
                <span
                    style={{ fontFamily: "Pretendard Regular", fontSize: 12 }}
                >
                    예약번호
                </span>
                <span
                    style={{
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 12,
                    }}
                >
                    {orderId ?? "-"}
                </span>
            </div>

            {orderId && (
                <div
                    onClick={() =>
                        (window.location.href = "/admin-checkreserve")
                    }
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "Pretendard Regular",
                        fontSize: 11,
                        color: "#888888",
                        cursor: "pointer",
                    }}
                >
                    상세 내역보기
                    <PaginationArrow
                        direction="right"
                        size={8}
                        color="#888888"
                    />
                </div>
            )}
        </div>
    )

    const renderRow = (label: string, value: string) => (
        <div style={{ display: "flex", gap: "80px" }}>
            <div
                style={{
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    color: "#949494",
                    minWidth: 90,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontFamily: "Pretendard Regular",
                    fontSize: 14,
                    color: "#000000",
                }}
            >
                {value}
            </div>
        </div>
    )

    const renderPayload = (order: any) => (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "30px 0",
                borderTop: "1px solid #E0E0E0",
            }}
        >
            {renderRow(
                "숙박 지점",
                order
                    ? `${order.stay_location} | ${order.checkin_date} ~ ${order.checkout_date}`
                    : "-"
            )}
            {renderRow(
                "숙박자",
                order
                    ? `${order.stay_info?.name} | 성인 ${order.stay_people?.adult}명, 청소년 ${order.stay_people?.teenager}명, 영유아 ${order.stay_people?.child}명 | ${order.stay_info?.contact}`
                    : "-"
            )}
            {renderRow(
                "예약자",
                order
                    ? `${order.reserver_name} | ${order.membership_number || "비회원 예약"} | ${order.reserver_contact}`
                    : "-"
            )}
            {renderRow("예약 표시 상황", order?.reservation_status ?? "-")}
            {renderRow("입실 상황", order?.stay_status ?? "-")}
        </div>
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                fontFamily: "Pretendard Regular",
            }}
        >
            {/* Top Line */}
            <div style={{ display: "flex", gap: "10px" }}>
                <div
                    style={{
                        flex: 1,
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 14,
                        lineHeight: "1.8em",
                    }}
                >
                    퇴실 정보
                </div>
                <div
                    style={{
                        flex: 1,
                        fontFamily: "Pretendard SemiBold",
                        fontSize: 14,
                        lineHeight: "1.8em",
                    }}
                >
                    입실 정보
                </div>
            </div>

            {/* Bottom Content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid #BDBDBD",
                }}
            >
                {/* Bottom Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        height: 35,
                        gap: "10px",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        {renderHeader(dayInfo?.checkout_order_id)}
                    </div>
                    <div style={{ flex: 1 }}>
                        {renderHeader(dayInfo?.checkin_order_id)}
                    </div>
                </div>

                {/* Bottom Payload */}
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        gap: "10px",
                        minHeight: 180,
                    }}
                >
                    {/* payload는 항상 렌더 */}
                    <div style={{ flex: 1 }}>
                        {renderPayload(checkoutOrder)}
                    </div>
                    <div style={{ flex: 1 }}>{renderPayload(checkinOrder)}</div>

                    {/* overlay는 위에만 덮음 */}
                    {isLoading && (
                        <LoadingOverlay
                            visible={true}
                            mode="component"
                            message="데이터를 불러오는 중입니다..."
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(LastDateStatus, {})
