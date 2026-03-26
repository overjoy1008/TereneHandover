// OrdersTableDetailList.tsx
import * as React from "react"
import { useEffect, useState } from "react"
import { getDiffDaysKST } from "./OrdersTableLogic.tsx"

export function OrdersTableDetailList({
    data,
    onSettlementChange,
    onSettlementDataChange,
    mode = "admin",
}: {
    data: Record<string, any>
    onSettlementChange: (
        result: "refund" | "payment" | "complete" | null
    ) => void
    onSettlementDataChange: (info: {
        additional_price: number
        settlement_amount: number
        settlement_breakdown: string
    }) => void
    mode?: "admin" | "customer"
}) {
    const [customer, setCustomer] = useState<any | null>(null)
    const [tossPaymentJSON, setTossPaymentJSON] = useState<any>(null)
    const [tossError, setTossError] = useState<string | null>(null)

    const [isEditingStayPerson, setIsEditingStayPerson] = useState(false)
    const [isEditingStayInfo, setIsEditingStayInfo] = useState(false)

    const [editStayName, setEditStayName] = useState(
        data.stay_info.same_as_reserver
            ? data.reserver_name
            : data.stay_info.name
    )
    const [editStayBirthdate, setEditStayBirthdate] = useState(
        data.stay_info.same_as_reserver
            ? data.reserver_birthdate
            : data.stay_info.birthdate
    )
    const [editStayContact, setEditStayContact] = useState(
        data.stay_info.same_as_reserver
            ? data.reserver_contact
            : data.stay_info.contact
    )

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!data?.membership_number) return
            try {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/customers"
                )
                const customers = await res.json()
                const matched = customers.find(
                    (c: any) => c.membership_number === data.membership_number
                )
                setCustomer(matched || null)
            } catch (err) {
                console.error("Failed to fetch customer:", err)
            }
        }

        fetchCustomer()
    }, [data?.membership_number])

    useEffect(() => {
        if (mode !== "admin") return

        const paymentKey = data._payments?.[0]?.payment_info?.paymentKey
        if (!paymentKey) return

        async function fetchTossPayment() {
            try {
                const secretKey = "live_sk_vZnjEJeQVxRAMWJkEPXb8PmOoBN0"
                const authHeader = "Basic " + btoa(`${secretKey}:`)

                const res = await fetch(
                    `https://api.tosspayments.com/v1/payments/${paymentKey}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: authHeader,
                            "Content-Type": "application/json",
                        },
                    }
                )

                if (!res.ok) {
                    const text = await res.text()
                    setTossError(`Toss API Error: ${text}`)
                    return
                }

                const json = await res.json()
                setTossPaymentJSON(json)
            } catch (err: any) {
                setTossError("Failed to load Toss Payment Info")
                console.error(err)
            }
        }

        fetchTossPayment()
    }, [mode, data._payments?.[0]?.payment_info?.paymentKey])

    const [adminNotes, setAdminNotes] = useState<string>(
        data?.stay_details?.admin_notes ?? ""
    )

    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<null | {
        type: "ok" | "err"
        text: string
    }>(null)

    const handleSaveAdminNotes = async () => {
        try {
            setIsSaving(true)
            setSaveMessage(null)

            // ✅ 필요한 필드만 추려내기
            const {
                order_id,
                old_order_id,
                membership_number,
                reserver_name,
                reserver_birthdate,
                reserver_contact,
                reserver_email,
                stay_info,
                stay_people,
                stay_location,
                checkin_date,
                checkout_date,
                initial_price,
                discounted_price,
                service_price,
                vat_price,
                deposit_price,
                final_price,
                stay_status,
                stay_history,
                reservation_status,
                reservation_history,
                reserved_by_vaadd,
                hidden,
            } = data

            const payload = {
                order_id,
                old_order_id,
                membership_number,
                reserver_name,
                reserver_birthdate,
                reserver_contact,
                reserver_email,
                stay_info: {
                    ...stay_info,
                    name: editStayName,
                    birthdate: editStayBirthdate,
                    contact: editStayContact,
                    same_as_reserver:
                        editStayName === reserver_name &&
                        editStayBirthdate === reserver_birthdate &&
                        editStayContact === reserver_contact,
                },
                stay_people,
                stay_location,
                checkin_date,
                checkout_date,
                initial_price,
                discounted_price,
                service_price,
                vat_price,
                deposit_price,
                final_price,
                stay_status,
                stay_history,
                reservation_status,
                reservation_history,
                reserved_by_vaadd,
                hidden,
                stay_details: {
                    ...(data?.stay_details ?? {}),
                    admin_notes: adminNotes,
                },
            }

            const res = await fetch(
                "https://terene-db-server.onrender.com/api/v2/orders",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || `HTTP ${res.status}`)
            }

            // setSaveMessage({ type: "ok", text: "특이사항이 저장되었습니다." })
        } catch (err: any) {
            console.error(err)
            // setSaveMessage({
            //     type: "err",
            //     text: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
            // })
        } finally {
            setIsSaving(false)
        }
    }

    const sectionStyle: React.CSSProperties = {
        marginBottom: 32,
        fontFamily: "Pretendard, sans-serif",
    }

    const titleWrapperStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: "2px solid #e5e7eb",
    }

    const titleStyle: React.CSSProperties = {
        fontSize: 18,
        fontWeight: 600,
        color: "#111827",
    }

    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        rowGap: 12,
        columnGap: 24,
        fontSize: 14,
        color: "#374151",
    }

    const labelStyle: React.CSSProperties = {
        fontWeight: 500,
        color: "#6b7280",
    }

    const formatDateTime = (str?: string | null) =>
        str
            ? new Date(str).toLocaleString("ko-KR", {
                  hour12: false,
              })
            : "-"

    const renderRow = (
        label: string,
        value: React.ReactNode,
        editable?: {
            value: string
            onChange: (v: string) => void
            isEditing: boolean
        }
    ) => {
        const renderValue = () => {
            if (mode === "admin" && editable?.isEditing) {
                return (
                    <input
                        value={editable.value}
                        onChange={(e) => editable.onChange(e.target.value)}
                        placeholder={`${label} 수정`}
                        style={{
                            width: "100%",
                            padding: "6px 10px",
                            fontSize: 14,
                            border: "1px solid #d1d5db",
                            fontFamily: "Pretendard Regular",
                        }}
                    />
                )
            }

            if (typeof value === "string") {
                return value.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br />
                    </React.Fragment>
                ))
            }

            return value ?? "-"
        }

        return (
            <>
                <div style={labelStyle}>{label}</div>
                <div>{renderValue()}</div>
            </>
        )
    }

    const getReservationDate = () => {
        const found = data.reservation_history?.find(
            (h: any) => h.status === data.reservation_status
        )
        return formatDateTime(found?.timestamp)
    }

    const [inputAmount, setInputAmount] = useState("")
    const [inputBreakdown, setInputBreakdown] = useState("")
    const [finalSettlementAmount, setFinalSettlementAmount] = useState<
        number | null
    >(null)
    const [settlementDirection, setSettlementDirection] = useState<
        "refund" | "payment" | null
    >(null)

    const handleFinalizeInput = () => {
        const entered = parseInt(inputAmount)
        const deposit = Number(data.deposit_price) || 0

        if (isNaN(entered)) return

        const diff = deposit - entered

        const payload = {
            additional_price: entered,
            settlement_amount: Math.abs(diff),
            settlement_breakdown: inputBreakdown,
        }

        if (diff > 0) {
            setSettlementDirection("refund")
            setFinalSettlementAmount(diff)
            onSettlementChange("refund")
        } else if (diff < 0) {
            setSettlementDirection("payment")
            setFinalSettlementAmount(Math.abs(diff))
            onSettlementChange("payment")
        } else {
            setSettlementDirection(null)
            setFinalSettlementAmount(null)
            onSettlementChange("complete")
        }

        onSettlementDataChange(payload)
    }

    const getReservationStatus = (status) => {
        switch (status) {
            case "pending":
                return "예약 대기"
            case "confirmed":
                return "예약 확정"
            default:
                return status || "-"
        }
    }

    const getPaymentStatus = (status) => {
        switch (status) {
            case "pending":
            case "processing":
                return "결제 대기"
            case "completed":
                return "결제 완료"
            default:
                return status || "-"
        }
    }

    const getStayStatus = (status) => {
        switch (status) {
            case "before_checkin":
                return "체크인 대기"
            case "checked_in":
                return "체크인 중"
            case "checked_out":
                return "체크아웃 완료"
            default:
                return status || "-"
        }
    }

    const settlement_final_price =
        data._settlements &&
        data._settlements?.[0]?.settlement_type === "deposit_refund"
            ? data.final_price - data._settlements[0]?.settlement_amount
            : data._settlements &&
                data._settlements?.[0]?.settlement_type === "additional_payment"
              ? data.final_price + data._settlements[0]?.settlement_amount
              : data.final_price

    return (
        <div style={{ width: "100%", fontFamily: "Pretendard, sans-serif" }}>
            {/* 예약 헤더 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "start",
                    marginBottom: 32,
                    padding: "4px 0",
                    gap: 20,
                    fontSize: 15,
                    color: "#4b5563",
                }}
            >
                <div>
                    <strong>예약번호</strong>{" "}
                    {mode === "admin"
                        ? data.old_order_id
                            ? `${data.order_id} (구 ${data.old_order_id})`
                            : data.order_id || "-"
                        : data.order_id || "-"}
                </div>
                <div>
                    <strong>예약일자</strong> {getReservationDate()}
                </div>
                {mode === "admin" &&
                    data._payments?.[0]?.payment_info?.paymentKey && (
                        <div>
                            <strong>토스 식별자 키</strong>{" "}
                            {data._payments?.[0]?.payment_info?.paymentKey ||
                                "-"}
                        </div>
                    )}
            </div>

            {/* 예약 정보 */}
            <div style={sectionStyle}>
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>예약 정보</div>
                </div>
                <div style={gridStyle}>
                    {/*renderRow("전체 JSON", JSON.stringify(data, null, 2))*/}
                    {renderRow(
                        "숙박 지점",
                        `${data.stay_location} | ${data.checkin_date || "-"} - ${data.checkout_date || "-"}`
                    )}
                    {renderRow(
                        "숙박자",
                        `${data.stay_info.same_as_reserver ? data.reserver_name : data.stay_info.name} | 성인 ${data.stay_people.adult}명, 청소년/아동 ${data.stay_people.teenager}명, 영유아 ${data.stay_people.child}명 | ${data.stay_info.same_as_reserver ? data.reserver_contact : data.stay_info.contact}`
                    )}
                    {renderRow(
                        "예약자",
                        `${customer?.name_kor || data.reserver_name} | ${customer?.membership_grade || "비회원"} | ${customer?.phone || data.reserver_contact}`
                    )}
                    {renderRow(
                        "예약 표시 상황",
                        getReservationStatus(data.reservation_status)
                    )}
                    {renderRow(
                        "결제 상황",
                        getPaymentStatus(data._payments?.[0]?.payment_status)
                    )}
                    {renderRow("입실 상황", getStayStatus(data.stay_status))}
                </div>
            </div>

            {/* 예약자 정보 */}
            <div style={sectionStyle}>
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>예약자 정보</div>
                </div>
                <div style={gridStyle}>
                    {data.membership_number ? (
                        <>
                            {renderRow("회원번호", data.membership_number)}

                            {renderRow(
                                "회원유형",
                                customer
                                    ? customer.is_personal
                                        ? "개인회원"
                                        : "법인회원"
                                    : "-"
                            )}

                            {customer ? (
                                customer.is_personal ? (
                                    <>
                                        {renderRow(
                                            "회원명",
                                            customer.name_kor || "-"
                                        )}
                                        {renderRow(
                                            "생년월일",
                                            customer.birthdate || "-"
                                        )}
                                        {renderRow(
                                            "연락처",
                                            customer.phone || "-"
                                        )}
                                        {renderRow(
                                            "이메일",
                                            customer.email || "-"
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {renderRow(
                                            "법인명",
                                            customer.name_kor || "-"
                                        )}
                                        {renderRow(
                                            "법인등록번호",
                                            customer.business_registration_number ||
                                                "-"
                                        )}
                                        {renderRow(
                                            "연락처",
                                            customer.phone || "-"
                                        )}
                                        {renderRow(
                                            "이메일",
                                            customer.email || "-"
                                        )}
                                    </>
                                )
                            ) : (
                                <>
                                    {renderRow("회원명/법인명", "-")}
                                    {renderRow("연락처", "-")}
                                    {renderRow("이메일", "-")}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {renderRow("회원번호", "비회원 예약")}
                            {renderRow("회원명", data.reserver_name || "-")}
                            {renderRow(
                                "생년월일",
                                data.reserver_birthdate || "-"
                            )}
                            {renderRow("연락처", data.reserver_contact || "-")}
                            {renderRow("이메일", data.reserver_email || "-")}
                        </>
                    )}
                </div>
            </div>

            {/* 숙박자 정보 */}
            <div style={sectionStyle}>
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>숙박자 정보</div>
                    {mode === "admin" && (
                        <button
                            onClick={async () => {
                                if (!isEditingStayPerson) {
                                    setIsEditingStayPerson(true)
                                } else {
                                    await handleSaveAdminNotes()
                                    setIsEditingStayPerson(false)
                                }
                            }}
                            disabled={isSaving}
                            style={{
                                marginLeft: "auto",
                                border: "1px solid #000",
                                padding: "6px 12px",
                                fontSize: 14,
                                background: "white",
                                cursor: isSaving ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                opacity: isSaving ? 0.5 : 1,
                            }}
                        >
                            {isEditingStayPerson ? "완료" : "수정"}
                        </button>
                    )}
                </div>
                <div style={gridStyle}>
                    {renderRow("이름", editStayName, {
                        value: editStayName,
                        onChange: setEditStayName,
                        isEditing: isEditingStayPerson,
                    })}

                    {renderRow("생년월일", editStayBirthdate, {
                        value: editStayBirthdate,
                        onChange: setEditStayBirthdate,
                        isEditing: isEditingStayPerson,
                    })}

                    {renderRow("연락처", editStayContact, {
                        value: editStayContact,
                        onChange: setEditStayContact,
                        isEditing: isEditingStayPerson,
                    })}
                </div>
            </div>

            {/* 숙박 정보 */}
            <div style={sectionStyle}>
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>숙박 정보</div>
                    {mode === "admin" && (
                        <button
                            onClick={async () => {
                                if (!isEditingStayInfo) {
                                    setIsEditingStayInfo(true)
                                } else {
                                    await handleSaveAdminNotes()
                                    setIsEditingStayInfo(false)
                                }
                            }}
                            disabled={isSaving}
                            style={{
                                marginLeft: "auto",
                                border: "1px solid #000",
                                padding: "6px 12px",
                                fontSize: 14,
                                background: "white",
                                cursor: isSaving ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                opacity: isSaving ? 0.5 : 1,
                            }}
                        >
                            {isEditingStayInfo ? "완료" : "수정"}
                        </button>
                    )}
                </div>
                <div style={gridStyle}>
                    {renderRow("지점", data.stay_location)}
                    {renderRow(
                        "숙박 일자",
                        `${data.checkin_date || "-"} - ${data.checkout_date || "-"}`
                    )}
                    {renderRow(
                        "추가 서비스",
                        data.service_price?.services?.length
                            ? data.service_price.services
                                  .map(
                                      (s: any) =>
                                          `${s.type}${s.amount ? `: ${s.amount.toLocaleString()}원` : ""}`
                                  )
                                  .join(", ")
                            : "-"
                    )}
                    {renderRow(
                        "요청사항",
                        data.stay_details?.special_requests || "-"
                    )}
                    {renderRow(
                        "기념일",
                        data.stay_details?.anniversary
                            ? `${data.stay_details.anniversary.type || "-"} - ${
                                  data.stay_details.anniversary.name ||
                                  "(이름 없음)"
                              } - ${data.stay_details.anniversary.value || "(내용 없음)"}`
                            : "-"
                    )}
                    {renderRow(
                        "이용규칙",
                        data.stay_details?.terms_agreement?.facility_policy
                            ? "동의"
                            : "미동의"
                    )}
                    {renderRow(
                        "취소/환불 정책",
                        data.stay_details?.terms_agreement?.cancellation_policy
                            ? "동의"
                            : "미동의"
                    )}
                    {renderRow(
                        "개인정보 처리",
                        data.stay_details?.terms_agreement?.privacy_policy
                            ? "동의"
                            : "미동의"
                    )}
                    {renderRow(
                        "마케팅 수신 동의",
                        data.stay_details?.terms_agreement?.marketing_consent
                            ? "동의"
                            : "미동의"
                    )}

                    {/* 특이사항 */}
                    {mode === "admin" && (
                        // ✅ gridStyle3 내부지만, 두 열 전체를 span 해서 전체 폭을 사용
                        <div style={{ gridColumn: "1 / -1" }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "140px 1fr auto",
                                    alignItems: "start",
                                    columnGap: 24,
                                    rowGap: 12,
                                    fontSize: 14,
                                    color: "#374151",
                                    width: "100%", // 전체 폭
                                }}
                            >
                                <div style={labelStyle}>특이사항</div>

                                <div>
                                    <textarea
                                        disabled={!isEditingStayInfo}
                                        placeholder="특이사항 입력"
                                        value={adminNotes}
                                        onChange={(e) =>
                                            setAdminNotes(e.target.value)
                                        }
                                        style={{
                                            padding: "6px 10px",
                                            fontSize: 14,
                                            border: "1px solid #d1d5db",
                                            borderRadius: 6,
                                            width: 300,
                                            height: 80,
                                            resize: "vertical",
                                            backgroundColor: isEditingStayInfo
                                                ? "#fff"
                                                : "#f9fafb",
                                        }}
                                    />
                                    {saveMessage && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                fontSize: 13,
                                                color:
                                                    saveMessage.type === "ok"
                                                        ? "#059669"
                                                        : "#DC2626",
                                            }}
                                        >
                                            {saveMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 결제 정보 */}
            <div
                style={{
                    ...sectionStyle,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>결제 정보</div>
                </div>

                {/* 최초 금액 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        객실 요금
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14,
                                fontFamily: "Pretendard",
                                color: "#374151",
                            }}
                        >
                            {`${(
                                Number(data.initial_price || 0) -
                                (data.discounted_price?.primary_coupons?.reduce(
                                    (acc: number, c: any) =>
                                        acc + (c.amount || 0),
                                    0
                                ) || 0)
                            ).toLocaleString()}원`}
                        </div>
                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: 13,
                                lineHeight: "20px",
                            }}
                        >
                            기본요금{" "}
                            {Number(data.initial_price || 0).toLocaleString()}원
                        </div>
                        {data.discounted_price?.primary_coupons?.map(
                            (c: any, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        color: "#6b7280",
                                        fontSize: 13,
                                        lineHeight: "20px",
                                    }}
                                >
                                    {`${c.coupon_description} - ${Number(c.amount || 0).toLocaleString()}원`}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* 할인가 적용 금액 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        특별 할인
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14,
                                fontFamily: "Pretendard",
                                color: "#374151",
                            }}
                        >
                            {`-${(
                                data.discounted_price?.secondary_coupons?.reduce(
                                    (acc: number, c: any) =>
                                        acc + (c.amount || 0),
                                    0
                                ) || 0
                            ).toLocaleString()}원`}
                        </div>
                        {data.discounted_price?.secondary_coupons?.map(
                            (c: any, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        color: "#6b7280",
                                        fontSize: 13,
                                        lineHeight: "20px",
                                    }}
                                >
                                    {`${c.coupon_description} - ${Number(c.amount || 0).toLocaleString()}원`}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* 추가 서비스 금액 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        추가 서비스 이용료
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            color: "#374151",
                        }}
                    >
                        {`${Number(data.service_price?.amount || 0).toLocaleString()}원`}
                    </div>
                </div>

                {/* 최종 요금 합계 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        최종 요금 합계
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            color: "#374151",
                        }}
                    >
                        {`${Number(data.service_price?.amount + data.discounted_price?.amount || 0).toLocaleString()}원`}
                    </div>
                </div>

                {/* VAT */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        VAT 금액
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            color: "#374151",
                        }}
                    >
                        {`${Number(data.vat_price || 0).toLocaleString()}원`}
                    </div>
                </div>

                {/* 보증금 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        보증금 금액
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            color: "#374151",
                        }}
                    >
                        {`${Number(data.deposit_price || 0).toLocaleString()}원`}
                    </div>
                </div>

                {/* 최종 결제액 */}
                <div style={{ display: "flex", alignItems: "start", gap: 24 }}>
                    <div
                        style={{
                            width: 140,
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            fontWeight: 500,
                            color: "#6B7280",
                        }}
                    >
                        결제 금액
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            fontFamily: "Pretendard",
                            color: "#374151",
                        }}
                    >
                        {`${Number(data.final_price || 0).toLocaleString()}원`}
                    </div>
                </div>

                {mode === "admin" &&
                    data._payments?.[0]?.payment_info?.paymentKey && (
                        <div
                            style={{
                                marginTop: 24,
                                padding: 16,
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                background: "#f9fafb",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}
                            >
                                Toss 결제 원본 데이터
                            </div>

                            {tossError && (
                                <div
                                    style={{
                                        color: "#DC2626",
                                        marginBottom: 12,
                                        fontSize: 13,
                                    }}
                                >
                                    {tossError}
                                </div>
                            )}

                            <pre
                                style={{
                                    fontSize: 12,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    background: "#fff",
                                    padding: 12,
                                    borderRadius: 6,
                                    border: "1px solid #e5e7eb",
                                    maxHeight: 400,
                                    overflowY: "auto",
                                }}
                            >
                                {tossPaymentJSON
                                    ? JSON.stringify(tossPaymentJSON, null, 2)
                                    : "불러오는 중..."}
                            </pre>
                        </div>
                    )}
            </div>

            {/* 정산 정보 */}
            {data.reservation_status === "confirmed" &&
                (mode === "admin" || data._settlements?.[0]) && (
                    <div style={sectionStyle}>
                        <div style={titleWrapperStyle}>
                            <div style={titleStyle}>정산 정보</div>
                        </div>

                        {
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "start",
                                    margin: "12px 0 0 0",
                                    gap: 24,
                                }}
                            >
                                <div
                                    style={{
                                        width: 140,
                                        fontSize: 14,
                                        fontFamily: "Pretendard",
                                        fontWeight: 500,
                                        color: "#6B7280",
                                    }}
                                >
                                    보증금 금액
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontFamily: "Pretendard",
                                        color: "#374151",
                                    }}
                                >
                                    {`${Number(data.deposit_price || 0).toLocaleString()}원`}
                                </div>
                            </div>
                        }

                        {/* 정산 입력 영역: admin만 */}
                        {mode === "admin" && !data._settlements?.[0] ? (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "140px 1fr auto",
                                    alignItems: "start",
                                    columnGap: 24,
                                    rowGap: 12,
                                    fontSize: 14,
                                    color: "#374151",
                                }}
                            >
                                <div style={labelStyle}>숙박 간 사용 금액</div>
                                <div>
                                    <input
                                        type="number"
                                        placeholder="금액 입력"
                                        value={
                                            data._settlements?.[0]
                                                ?.settlement_type ===
                                            "additional_payment"
                                                ? (data._settlements[0]
                                                      ?.additional_price ??
                                                  inputAmount)
                                                : inputAmount
                                        }
                                        onChange={(e) =>
                                            setInputAmount(e.target.value)
                                        }
                                        style={{
                                            padding: "6px 10px",
                                            fontSize: 14,
                                            border: "1px solid #d1d5db",
                                            borderRadius: 6,
                                            width: 120,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <br />
                                    <textarea
                                        placeholder="내역 입력"
                                        value={
                                            data._settlements?.[0]
                                                ?.settlement_type ===
                                            "additional_payment"
                                                ? (data._settlements[0]
                                                      ?.settlement_breakdown ??
                                                  inputBreakdown)
                                                : inputBreakdown
                                        }
                                        onChange={(e) =>
                                            setInputBreakdown(e.target.value)
                                        }
                                        style={{
                                            padding: "6px 10px",
                                            fontSize: 14,
                                            border: "1px solid #d1d5db",
                                            borderRadius: 6,
                                            width: 300,
                                            height: 60,
                                        }}
                                    />
                                </div>
                                <div>
                                    <button
                                        onClick={handleFinalizeInput}
                                        style={{
                                            border: "1px solid #000",
                                            padding: "6px 12px",
                                            fontSize: 14,
                                            background: "white",
                                            cursor: "pointer",
                                        }}
                                    >
                                        입력 완료
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // 읽기 전용 영역
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "140px 1fr",
                                    rowGap: 12,
                                    columnGap: 24,
                                    fontSize: 14,
                                    color: "#374151",
                                    marginTop: 24,
                                    alignItems: "start",
                                }}
                            >
                                <div style={labelStyle}>숙박 간 사용 금액</div>
                                <div>
                                    <div>
                                        {data._settlements?.[0]
                                            ?.settlement_type ===
                                            "additional_payment" ||
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "deposit_refund"
                                            ? Number(
                                                  data._settlements[0]
                                                      ?.additional_price || 0
                                              ).toLocaleString() + "원"
                                            : Number(
                                                  inputAmount || 0
                                              ).toLocaleString() + "원"}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 4,
                                            color: "#6b7280",
                                        }}
                                    >
                                        {data._settlements?.[0]
                                            ?.settlement_type ===
                                            "additional_payment" ||
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "deposit_refund"
                                            ? data._settlements[0]
                                                  ?.settlement_breakdown || "-"
                                            : inputBreakdown || "-"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 정산 결과 영역 */}
                        {(data._settlements?.[0]?.settlement_type ===
                            "deposit_refund" ||
                            settlementDirection === "refund") && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "140px 1fr",
                                    rowGap: 12,
                                    columnGap: 24,
                                    fontSize: 14,
                                    color: "#374151",
                                    marginTop: 24,
                                    alignItems: "start",
                                }}
                            >
                                <div style={labelStyle}>최종 환불 금액</div>
                                <div>
                                    {Number(
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "deposit_refund"
                                            ? data._settlements[0]
                                                  ?.settlement_amount
                                            : (finalSettlementAmount ?? "-")
                                    )?.toLocaleString()}
                                    원
                                </div>
                            </div>
                        )}

                        {(data._settlements?.[0]?.settlement_type ===
                            "additional_payment" ||
                            settlementDirection === "payment") && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "140px 1fr",
                                    rowGap: 12,
                                    columnGap: 24,
                                    fontSize: 14,
                                    color: "#374151",
                                    marginTop: 24,
                                    alignItems: "start",
                                }}
                            >
                                <div style={labelStyle}>
                                    추가 결제 요청 금액
                                </div>
                                <div>
                                    {Number(
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "additional_payment"
                                            ? data._settlements[0]
                                                  ?.settlement_amount
                                            : (finalSettlementAmount ?? "-")
                                    )?.toLocaleString()}
                                    원
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {/* 환불 정보 */}
            {(mode === "admin" || data._refunds?.[0]) && (
                <div
                    style={{
                        ...sectionStyle,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <div style={titleWrapperStyle}>
                        <div style={titleStyle}>환불 정보</div>
                    </div>

                    {/* 원 결제액 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "start",
                            gap: 24,
                        }}
                    >
                        <div
                            style={{
                                width: 140,
                                fontSize: 14,
                                fontFamily: "Pretendard",
                                fontWeight: 500,
                                color: "#6B7280",
                            }}
                        >
                            원 결제액
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                fontFamily: "Pretendard",
                                color: "#374151",
                            }}
                        >
                            {`${Number(data.final_price || 0).toLocaleString()}원`}
                        </div>
                    </div>

                    {/* 환불 금액 + 설명 */}
                    {(() => {
                        const hasRefundData = data._refunds?.[0]?.refund_details
                        let diffDays = getDiffDaysKST(data.checkin_date)
                        let lodgingRefund = 0
                        let serviceRefund = 0
                        let depositRefund = 0
                        let totalRefund = 0
                        let lodgingRate = 0
                        let serviceRate = 0

                        if (hasRefundData) {
                            const details = data._refunds[0].refund_details
                            diffDays = details.days_before_checkin
                            lodgingRefund = details.discounted_w_vat
                            serviceRefund = details.service_w_vat
                            depositRefund = details.deposit
                            totalRefund = data._refunds[0].refund_price
                        } else {
                            const getLodgingRefundRate = () => {
                                if (diffDays >= 31) return 1.0
                                if (diffDays >= 15) return 0.8
                                if (diffDays >= 10) return 0.6
                                return 0.0
                            }
                            const getServiceRefundRate = () => {
                                if (diffDays >= 10) return 1.0
                                return 0.0
                            }

                            lodgingRate = getLodgingRefundRate()
                            serviceRate = getServiceRefundRate()

                            const lodgingBase =
                                (data.discounted_price?.amount || 0) * 1.1
                            lodgingRefund = lodgingBase * lodgingRate

                            const serviceBase =
                                (data.service_price?.amount || 0) * 1.1
                            serviceRefund = serviceBase * serviceRate

                            depositRefund = (data.deposit_price || 0) * 1.0
                            totalRefund =
                                lodgingRefund + serviceRefund + depositRefund
                        }

                        return (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "start",
                                    gap: 24,
                                }}
                            >
                                <div
                                    style={{
                                        width: 140,
                                        fontSize: 14,
                                        fontFamily: "Pretendard",
                                        fontWeight: 500,
                                        color: "#6B7280",
                                    }}
                                >
                                    환불 금액
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontFamily: "Pretendard",
                                            color: "#374151",
                                        }}
                                    >
                                        {`${Math.round(totalRefund).toLocaleString()}원`}
                                    </div>
                                    <div
                                        style={{
                                            color: "#6b7280",
                                            fontSize: 13,
                                            lineHeight: "20px",
                                        }}
                                    >
                                        체크인 {diffDays}일 전 (환불 기준)
                                    </div>
                                    <div
                                        style={{
                                            color: "#6b7280",
                                            fontSize: 13,
                                            lineHeight: "20px",
                                        }}
                                    >
                                        숙박요금 환불 금액 (
                                        {hasRefundData
                                            ? "-"
                                            : `${Math.round(lodgingRate * 100)}%`}
                                        ) -{" "}
                                        {Math.round(
                                            lodgingRefund
                                        ).toLocaleString()}
                                        원
                                    </div>
                                    <div
                                        style={{
                                            color: "#6b7280",
                                            fontSize: 13,
                                            lineHeight: "20px",
                                        }}
                                    >
                                        추가서비스요금 환불 금액 (
                                        {hasRefundData
                                            ? "-"
                                            : `${Math.round(serviceRate * 100)}%`}
                                        ) -{" "}
                                        {Math.round(
                                            serviceRefund
                                        ).toLocaleString()}
                                        원
                                    </div>
                                    <div
                                        style={{
                                            color: "#6b7280",
                                            fontSize: 13,
                                            lineHeight: "20px",
                                        }}
                                    >
                                        보증금 환불 금액 (100%) -{" "}
                                        {Math.round(
                                            depositRefund
                                        ).toLocaleString()}
                                        원
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* 결제 수단 + 환불 상태 */}
                    {data._refunds?.[0] &&
                        (() => {
                            const refundStatus = data._refunds[0]?.refund_status
                            const refundHistory =
                                data._refunds[0]?.refund_history?.find(
                                    (r) => r.status === refundStatus
                                )
                            const statusText =
                                refundStatus === "pending"
                                    ? "대기"
                                    : refundStatus === "processing"
                                      ? "처리 중"
                                      : refundStatus === "completed"
                                        ? "완료"
                                        : "-"
                            const timestamp = refundHistory?.timestamp

                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "start",
                                        gap: 24,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 140,
                                            fontSize: 14,
                                            fontFamily: "Pretendard",
                                            fontWeight: 500,
                                            color: "#6B7280",
                                        }}
                                    >
                                        결제 수단
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontFamily: "Pretendard",
                                            color: "#374151",
                                        }}
                                    >
                                        카드결제 환불 | {statusText}{" "}
                                        {timestamp
                                            ? new Date(
                                                  timestamp
                                              ).toLocaleString("ko-KR", {
                                                  hour12: false,
                                              })
                                            : ""}
                                    </div>
                                </div>
                            )
                        })()}
                </div>
            )}

            {/* 처리 이력 */}
            <div style={sectionStyle}>
                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>처리 이력</div>
                </div>
                <div style={gridStyle}>
                    {/* 항상 표시 */}
                    {renderRow(
                        "예약대기 시각",
                        formatDateTime(
                            data.reservation_history?.find(
                                (r: any) => r.status === "pending"
                            )?.timestamp
                        ) || "-"
                    )}
                    {renderRow(
                        "예약확정 시각",
                        formatDateTime(
                            data.reservation_history?.find(
                                (r: any) => r.status === "confirmed"
                            )?.timestamp
                        ) || "-"
                    )}
                    {renderRow(
                        "체크인 시각",
                        formatDateTime(
                            data.stay_history?.find(
                                (s: any) => s.status === "checked_in"
                            )?.timestamp
                        ) || "-"
                    )}
                    {renderRow(
                        "체크아웃 시각",
                        formatDateTime(
                            data.stay_history?.find(
                                (s: any) => s.status === "checked_out"
                            )?.timestamp
                        ) || "-"
                    )}

                    {/* 조건부 표시 */}
                    {data._cancellations?.[0]?.cancel_history?.some(
                        (h) => h.status === "pending"
                    ) &&
                        renderRow(
                            "취소대기 시각",
                            formatDateTime(
                                data._cancellations[0].cancel_history.find(
                                    (h) => h.status === "pending"
                                )?.timestamp
                            )
                        )}
                    {data._cancellations?.[0]?.cancel_history?.some(
                        (h) => h.status === "processing"
                    ) &&
                        renderRow(
                            "취소완료 시각",
                            formatDateTime(
                                data._cancellations[0].cancel_history.find(
                                    (h) => h.status === "completed"
                                )?.timestamp
                            )
                        )}
                    {data._settlements?.[0]?.settlement_history?.some(
                        (s: any) =>
                            s.status === "pending" &&
                            data._settlements?.[0]?.settlement_type ===
                                "deposit_refund"
                    ) &&
                        renderRow(
                            "보증금 환불 진행 시각",
                            formatDateTime(
                                data._settlements?.[0]?.settlement_history.find(
                                    (s: any) =>
                                        s.status === "pending" &&
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "deposit_refund"
                                )?.timestamp
                            )
                        )}
                    {data._settlements?.[0]?.settlement_history?.some(
                        (s: any) =>
                            s.status === "pending" &&
                            data._settlements?.[0]?.settlement_type ===
                                "additional_payment"
                    ) &&
                        renderRow(
                            "추가결제 요청 시각",
                            formatDateTime(
                                data._settlements?.[0]?.settlement_history.find(
                                    (s: any) =>
                                        s.status === "pending" &&
                                        data._settlements?.[0]
                                            ?.settlement_type ===
                                            "additional_payment"
                                )?.timestamp
                            )
                        )}
                    {renderRow(
                        "숙박완료 시각",
                        formatDateTime(
                            data._settlements?.[0]?.settlement_history?.find(
                                (s: any) => s.status === "completed"
                            )?.timestamp
                        ) || "-"
                    )}
                </div>
            </div>
        </div>
    )
}
