
// OrderJsonAccordion.tsx
import * as React from "react"

export function OrderJsonAccordion({ data }: { data: Record<string, any> }) {
    const sectionStyle: React.CSSProperties = {
        borderRadius: 16,
        background: "#fafafa",
        padding: "20px 24px",
        marginBottom: 24,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
        border: "1px solid #e5e7eb",
    }

    const titleStyle: React.CSSProperties = {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 16,
        color: "#111827",
    }

    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        rowGap: 12,
        columnGap: 24,
        fontSize: 14,
        color: "#374151",
    }

    const labelStyle: React.CSSProperties = {
        fontWeight: 500,
        color: "#6b7280",
    }

    const dividerStyle: React.CSSProperties = {
        gridColumn: "1 / -1",
        borderTop: "1px solid #e5e7eb",
        margin: "12px 0",
    }

    const formatDateTime = (str?: string | null) =>
        str
            ? new Date(str).toLocaleString("ko-KR", {
                  hour12: false,
              })
            : "-"

    const renderRow = (label: string, value: React.ReactNode) => (
        <>
            <div style={labelStyle}>{label}</div>
            <div>{value}</div>
        </>
    )

    return (
        <div style={{ width: "100%", fontFamily: "Pretendard, sans-serif" }}>
            {/* 예약 정보 */}
            <div style={sectionStyle}>
                <div style={titleStyle}>예약 정보</div>
                <div style={gridStyle}>
                    {renderRow("예약번호", data.order_id)}
                    {renderRow("예약 상품", data.order_product)}
                    {renderRow(
                        "숙박 일정",
                        `${data.start_date} ~ ${data.end_date}`
                    )}
                    {renderRow(
                        "숙박 인원",
                        `성인 ${data.adult}, 영유아 ${data.child}`
                    )}
                    {renderRow("결제 상태", data.payment_status)}
                    {renderRow("체크인 상태", data.stay_status)}
                </div>
            </div>

            {/* 예약자 정보 */}
            <div style={sectionStyle}>
                <div style={titleStyle}>예약자 정보</div>
                <div style={gridStyle}>
                    {renderRow("회원번호", data.membership_number || "-")}
                    {renderRow("이름", data.reserver_name)}
                    {renderRow("생년월일", data.reserver_birthdate)}
                    {renderRow("연락처", data.reserver_contact)}
                    {renderRow("이메일", data.reserver_email)}
                </div>
            </div>

            {/* 결제 정보 */}
            <div style={sectionStyle}>
                <div style={titleStyle}>결제 정보</div>
                <div style={gridStyle}>
                    {renderRow(
                        "최초 금액",
                        `${data.receipt?.initialPrice?.toLocaleString()}원`
                    )}
                    <div style={dividerStyle}></div>
                    {renderRow(
                        "할인가 적용 금액",
                        `${data.receipt?.discountedPrice?.toLocaleString()}원`
                    )}
                    {renderRow(
                        "추가 서비스 적용 금액",
                        `${data.receipt?.additionalPrice?.toLocaleString()}원`
                    )}
                    {renderRow(
                        "VAT 금액",
                        `${data.receipt?.vatPrice?.toLocaleString()}원`
                    )}
                    {renderRow("보증금 금액", `300,000원`)}
                    <div style={dividerStyle}></div>
                    {renderRow(
                        "최종 결제액",
                        `${data.receipt?.finalPrice?.toLocaleString()}원`
                    )}
                </div>
            </div>

            {/* 쿠폰 정보 */}
            {data.coupons?.length > 0 && (
                <div style={sectionStyle}>
                    <div style={titleStyle}>사용한 쿠폰</div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        {data.coupons.map((c: any, idx: number) => (
                            <div
                                key={idx}
                                style={{
                                    backgroundColor: "#f3f4f6",
                                    padding: "16px 20px",
                                    borderRadius: 12,
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div style={gridStyle}>
                                    {renderRow("쿠폰명", c.coupon_name)}
                                    {renderRow(
                                        "쿠폰 설명",
                                        c.coupon_description
                                    )}
                                    {renderRow(
                                        "할인액",
                                        `${c.amount.toLocaleString()}원`
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 추가 요청 */}
            <div style={sectionStyle}>
                <div style={titleStyle}>요청 및 추가 정보</div>
                <div style={gridStyle}>
                    {renderRow(
                        "요청사항",
                        data.order_details?.special_requests || "-"
                    )}
                    {renderRow(
                        "기념일",
                        `${data.order_details.anniversary.type} - ${data.order_details.anniversary.name || "(이름 없음)"} - ${data.order_details.anniversary.value || "(내용 없음)"}`
                    )}
                    {renderRow(
                        "추가 서비스",
                        data.order_details?.additional_services?.length > 0
                            ? data.order_details.additional_services
                                  .map(
                                      (s: any) =>
                                          `${s.type}${s.amount ? `: ${s.amount.toLocaleString()}원` : ""}`
                                  )
                                  .join(", ")
                            : "-"
                    )}
                    <div style={dividerStyle}></div>
                    {renderRow(
                        "이용규칙",
                        data.order_details.terms_agreement.facility_policy
                            ? "✅ 동의"
                            : "❌ 미동의"
                    )}
                    {renderRow(
                        "취소 및 환불정책",
                        data.order_details.terms_agreement.cancellation_policy
                            ? "✅ 동의"
                            : "❌ 미동의"
                    )}
                    {renderRow(
                        "개인정보 처리방침",
                        data.order_details.terms_agreement.privacy_policy
                            ? "✅ 동의"
                            : "❌ 미동의"
                    )}
                    {renderRow(
                        "마케팅 수신 동의",
                        data.order_details.terms_agreement.marketing_consent
                            ? "✅ 동의"
                            : "❌ 미동의"
                    )}
                </div>
            </div>

            {/* 처리 이력 */}
            <div style={sectionStyle}>
                <div style={titleStyle}>처리 이력</div>
                <div style={gridStyle}>
                    {renderRow(
                        "예약 시각",
                        formatDateTime(data.payment_timeline?.order_datetime)
                    )}
                    {renderRow(
                        "승인 시각",
                        formatDateTime(data.payment_timeline?.approval_datetime)
                    )}
                    {renderRow(
                        "취소 시각",
                        formatDateTime(
                            data.payment_timeline?.cancellation_datetime
                        )
                    )}
                    {renderRow(
                        "환불 시각",
                        formatDateTime(data.payment_timeline?.refund_datetime)
                    )}
                    <div style={dividerStyle}></div>
                    {renderRow(
                        "체크인 시각",
                        formatDateTime(data.stay_timeline?.checkin_datetime)
                    )}
                    {renderRow(
                        "체크아웃 시각",
                        formatDateTime(data.stay_timeline?.checkout_datetime)
                    )}
                </div>
            </div>
            {data.refund_info && (
                <div style={sectionStyle}>
                    <div style={titleStyle}>환불 정보</div>
                    <div style={gridStyle}>
                        {renderRow(
                            "예금주",
                            data.refund_info.refund_name || "-"
                        )}
                        {renderRow(
                            "연락처",
                            data.refund_info.refund_phone || "-"
                        )}
                        {renderRow(
                            "은행명",
                            data.refund_info.refund_bank || "-"
                        )}
                        {renderRow(
                            "계좌번호",
                            data.refund_info.refund_account || "-"
                        )}
                        <div style={dividerStyle}></div>
                        {renderRow(
                            "체크인 n일 전 (환불 기준)",
                            `${Number(
                                data.refund_info.refund_before_checkin
                            ).toLocaleString()}일 전` || "-"
                        )}
                        {renderRow(
                            "숙박요금 환불 금액",
                            `${Number(
                                data.refund_info.discounted_w_vat_refund
                            ).toLocaleString()}원` || "-"
                        )}
                        {renderRow(
                            "추가서비스요금 환불 금액",
                            `${Number(
                                data.refund_info.additional_w_vat_refund
                            ).toLocaleString()}원` || "-"
                        )}
                        {renderRow(
                            "보증금 환불 금액",
                            `${Number(
                                data.refund_info.deposit_refund
                            ).toLocaleString()}원` || "-"
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
