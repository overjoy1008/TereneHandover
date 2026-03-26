
import React from "react"

type TermsAgreementContentProps = {
    id: string
    isMobile?: boolean
}

export default function TermsAgreementContent({
    id,
    isMobile = false,
}: TermsAgreementContentProps) {
    const fontSize = isMobile ? 9 : 13

    const baseStyle: React.CSSProperties = {
        fontFamily: "Pretendard Light, sans-serif",
        fontSize,
        color: "#000000",
        letterSpacing: "0.3px",
        lineHeight: "20px",
    }

    const ulStyle: React.CSSProperties = {
        paddingLeft: "6px",
        margin: "12px 0",
    }

    // flex용 li 스타일
    const liStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "flex-start",
        gap: "4px",
        marginBottom: "4px",
    }

    // 방점 전용
    const bulletStyle: React.CSSProperties = {
        lineHeight: "20px",
        // 필요하면 고정 너비 지정
        minWidth: "8px",
    }

    // 내용 전용
    const contentStyle: React.CSSProperties = {
        ...baseStyle,
        margin: 0,
    }

    const renderCancelTable = () => {
        // 공통 스타일
        const thStyle = {
            border: "1px solid #ddd",
            padding: "4px",
            fontWeight: "normal",
        }
        const tdStyle = {
            padding: "2px",
            borderTop: isMobile ? "1px solid #ddd" : "none",
            borderBottom: isMobile ? "1px solid #ddd" : "none",
            borderLeft: "1px solid #ddd",
            borderRight: "1px solid #ddd",
            fontSize,
        }
        // 마지막 행 전용 스타일
        const lastRowStyle = {
            ...tdStyle,
            borderBottom: "1px solid #ddd",
            paddingBottom: isMobile ? "2px" : "16px",
        }

        return (
            <div style={{ margin: "12px 0 24px 0" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "center",
                    }}
                >
                    <thead>
                        <tr>
                            <th rowSpan={2} style={thStyle}>
                                기준일
                            </th>
                            <th colSpan={3} style={thStyle}>
                                환불 금액
                            </th>
                        </tr>
                        <tr>
                            <th style={thStyle}>숙박요금</th>
                            <th style={thStyle}>추가 서비스 이용료</th>
                            <th style={thStyle}>보증금</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 31일 전 */}
                        <tr>
                            <td
                                style={{
                                    ...tdStyle,
                                    paddingTop: isMobile ? "2px" : "16px",
                                }}
                            >
                                체크인 31일 전까지
                            </td>
                            <td
                                style={{
                                    ...tdStyle,
                                    paddingTop: isMobile ? "2px" : "16px",
                                }}
                            >
                                총 결제금액의 100%
                            </td>
                            <td
                                style={{
                                    ...tdStyle,
                                    borderBottom: "1px solid #ddd",
                                    paddingTop: "4px",
                                }}
                                rowSpan={5}
                            >
                                총 결제금액의 100%
                            </td>
                            <td
                                style={{
                                    ...tdStyle,
                                    borderBottom: "1px solid #ddd",
                                    paddingTop: "4px",
                                }}
                                rowSpan={5}
                            >
                                총 결제금액의 100%
                            </td>
                        </tr>

                        {/* 15~30일 전 */}
                        <tr>
                            <td style={tdStyle}>체크인 15~30일 전까지</td>
                            <td style={tdStyle}>총 결제금액의 80%</td>
                        </tr>

                        {/* 10~14일 전 */}
                        <tr>
                            <td style={tdStyle}>체크인 10~14일 전까지</td>
                            <td style={tdStyle}>총 결제금액의 60%</td>
                        </tr>

                        {/* 1~9일 전 */}
                        <tr>
                            <td style={tdStyle}>체크인 1~9일 전까지</td>
                            <td style={tdStyle}>환불 불가</td>
                        </tr>

                        {/* 마지막 행: padding-bottom 4px 적용 */}
                        <tr>
                            <td style={lastRowStyle}>체크인 0~1일 전까지</td>
                            <td style={lastRowStyle}>환불 불가</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    const renderPoolTemperatureTable = () => {
        const thStyle = {
            border: "1px solid #ddd",
            padding: "4px",
            fontWeight: "normal",
            fontSize,
        }

        const tdStyle = {
            border: "1px solid #ddd",
            padding: "4px",
            fontSize,
        }

        return (
            <div style={{ margin: "8px 0 16px 16px" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "center",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>계절</th>
                            <th style={thStyle}>월</th>
                            <th style={thStyle}>설정온도</th>
                            <th style={thStyle}>온수공급 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tdStyle}>봄</td>
                            <td style={tdStyle}>3~5월</td>
                            <td style={tdStyle}>30~32도</td>
                            <td style={tdStyle}>오전 6시~오후 8시</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>여름</td>
                            <td style={tdStyle}>6~8월</td>
                            <td style={tdStyle}>26~28도</td>
                            <td style={tdStyle}>24시간</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>가을</td>
                            <td style={tdStyle}>9~11월</td>
                            <td style={tdStyle}>30~32도</td>
                            <td style={tdStyle}>오전 6시~오후 8시</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>겨울</td>
                            <td style={tdStyle}>12~2월</td>
                            <td style={tdStyle}>27~30도</td>
                            <td style={tdStyle}>24시간</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    const renderParagraph = (text: string) => (
        <p style={{ ...baseStyle, margin: "0" }}>{text}</p>
    )

    const renderList = (items: string[]) => (
        <ul style={ulStyle}>
            {items.map((text, i) => (
                <li key={i} style={liStyle}>
                    <div style={bulletStyle}>•</div>
                    <div style={contentStyle}>
                        {text.split("\n").map((line, idx, arr) => (
                            <React.Fragment key={idx}>
                                {line}
                                {idx < arr.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                </li>
            ))}
        </ul>
    )

    switch (id) {
        case "rules":
            return (
                <div style={baseStyle}>
                    {renderParagraph("사용인원 기준")}
                    {renderList([
                        "최대 인원은 8명입니다 (침실 3개에 침대 4개 비치)",
                        "미성년자의 예약은 불가하며, 숙박 시 보호자의 동행이 필요합니다 (숙박동의서 불가) ",
                        "유아(5세 미만)은 인원 수에 되지 않으며, 별도의 유아용 제품 및 침구류 등은 제공이 불가합니다",
                        "반려동물 동반 투숙은 불가합니다. 동반 투숙 시 청소비용(알러지 청소, 카펫 및 침구류 세탁비용, 매트리스 청소 등) 및 영업손실금이 청구됩니다",
                    ])}

                    {renderParagraph("이용 규칙 안내")}
                    {renderList([
                        "최대 3박까지 예약이 가능하며 연박 시 침구 교체 및 중간 청소 서비스는 제공되지 않습니다",
                        "입실시간 안내 : 체크인, 체크아웃 시간을 꼭 지켜주세요 ",
                        "비대면 숙소의 특성 상 체크인 이후 일들에 대하여 대응이 불가하여 자체적으로 대처해야 합니다. 이로 인한 불편을 이유로 환불을 요구할 수 없습니다 : 고객의 사유가 아닌 시설 문제로 인하여 숙박 자체가 불가할 경우에는 일부 또는 전체 환불이 가능합니다",
                        "독채형리조트의 특성 상 늦은 퇴실은 절대 불가합니다. 다음 고객을 위해 필요한 준비시간이므로 협조와 배려 부탁드립니다",
                        "체크아웃 시간 이후에 유선연락이 되지 않는 경우 담당 매니저가 임의로 실내 출입하여 상황을 확인할 수 있습니다",
                        "체크아웃 시간 이후에는 담당 매니저와 청소직원이 출입하여 청소를 시작할 수 있습니다",
                        "체크아웃 시간 30분 이상 넘겨서 퇴실하는 경우 50만원의 추가요금이 부과됩니다 (퇴실 시 현장결제)",
                    ])}

                    {renderParagraph("시설이용관련")}
                    {renderList([
                        "외출 및 체크아웃 시에는 화재 등의 위험이 있는 장비 또는 제품의 전원은 모두 끄고 보안을 위해 출입문, 외부로 통하는 창문을 모두 닫습니다 (시설 이용 간 고객 부주의에 의한 도난사고에 대한 책임은 고객에게 있습니다)",
                        "주방 청소 : 사용하신 식기류는 식기세척기를 이용하여 정리하고, 일반/플라스틱/병/음식물쓰레기는 꼭 분리수거 부탁드립니다 ",
                        "실내 취사가 가능하나 냄새가 심한 고기, 생선, 튀김 등의 조리는 불가합니다. 체크아웃 후 냄새가 심한 경우 추가 요금이 청구될 수 있습니다(야외 BBQ시설을 이용해 주세요)",
                        "BBQ시설 이용 시 장비는 정해진 장소에서만 사용하고, 사용 후 그릴 및 야외테이블 음식물과 쓰레기, 식기류는 깨끗히 정리 부탁드립니다",
                        "야외수영장의 수온은 정해진 내규에 따라 운영합니다. 개인에 따라 체감온도는 상이할 수 있으며 개별적인 온도조절은 불가합니다.",
                    ])}
                    {renderPoolTemperatureTable()}
                    {renderList([
                        "야외수영장, BBQ시설은 날씨(기온, 강풍, 강수 등)에 따라 사용이 어려울 수도 있으며, 이를 이유로 숙박요금의 환불을 요구할 수 없습니다 ",
                        "야외수영장 특성 상 체크인 전 청소와 소독을 꼼꼼히 진행하지만 벌레, 잔디, 나뭇잎, 꽃가루 등 이물질이 수시로 유입될 수 있습니다. 이용 전 비치된 뜰채를 직접 사용하여 제거할 수 있으며, 이에 대한 불편을 이유로 숙박요금의 환불을 요구할 수 없습니다 ",
                        "야외수영장 이용 시 수영복을 꼭 착용해주세요 (영유아는 수영장 이용 시 반드시 물놀이용 기저귀를 착용해주세요)",
                        "야외수영장, 노천탕 내 식음료 반입 및 취식, 장비에 고장을 유발할 수 있는 소형 장난감(물풍선 등) 및 입욕제 사용, 다이빙 등 위험행위는 금지합니다",
                        "야외수영장 내에서 물풍선, 유아용 소형 장난감 등의 사용은 금지합니다. (배수구로 들어가 장비의 고장을 유발할 수 있고, 손해배상이 청구될 수 있습니다)",
                        "일몰 이후에는 창문을 모두 닫아 벌레가 실내로 유입되지 않도록 하여야 합니다",
                        "사용 간 발생한 시설에 훼손, 파손, 고장, 분실, 오염 등에 대한 책임은 이용객에게 있으며 이에 대한 청소, 보수, 다음 고객의 이용 피해 등에 대하여 추가 비용(손해배상)이 청구될 수 있습니다",
                    ])}

                    {renderParagraph("주의 및 금지사항")}
                    {renderList([
                        "시설 이용 시 발생하는 고객 부주의에 의한 사고, 분실물 등에 대하여 책임지지 않습니다",
                        "모든 불법적인 행위는 금지되며, 이에 대한 책임은 전부 고객에게 있습니다 ",
                        "실내외 모든 공간은 금연공간입니다. 흡연으로 인한 시설물의 악취, 훼손, 오염 발생 시 청소비용이 추가 청구됩니다 ",
                        "본 시설은 투명한 유리, 목재, 대리석 등이 많이 사용되어, 시설물 이용 시 안전에 대한 주의가 필요합니다 ",
                        "특히, 거동이 불편하신 노약자와 영유아는 이용 시 각별히 보살펴주세요",
                        "전문적인 방역과 관리를 진행하고 있습니다만 주변에 강, 산, 천으로 둘러쌓여 있어 벌레에 유입을 100% 방지하기가 어렵습니다",
                        "벌레가 유입될 시 비치된 약품, 장비를 활용해 직접 처리해야되며, 이에 대한 별도 조치나 환불은 불가함을 양해 부탁드립니다",
                        "유리난간에는 절대 기대지 마시고 수영장, 노천탕, 욕실, 계단 등은 바닥이 미끄러우니 절대 뛰지마세요",
                        "보안 및 안전을 위해 외부(수영장, BBQ장 포함)와 일부 실내공간(직원전용 관리실, 회원전용창고)에는 24시간 CCTV가 실시간 녹화되고 있습니다",
                        "사전에 협의되지 않은 상업적 사진 또는 영상을 촬영하는 행위를 금지합니다",
                        "출입이 금지되어 있는 공간(관리실, 기계실 등)을 무단으로 들어가는 행위를 금지합니다",
                        "숙박권을 재판매하거나 양도, 양수, 교환하는 행위를 금지합니다",
                    ])}
                </div>
            )

        case "cancel":
            return (
                <div style={baseStyle}>
                    {renderParagraph("숙박요금 안내")}
                    {renderList([
                        "요금은 평일/주말/성수기에 따라 세분화되며 정확한 객실 요금은 일정 선택을 통해 확인할 수 있습니다",
                        "연박 할인 : 연박 시 추가 1박 당 10% 할인 적용됩니다. 최대 3박까지 예약이 가능하며 중간 청소는 제공되지 않습니다",
                        "장기숙박(4박 이상), 대관, 행사 등은 이메일을 통해 문의 부탁 드립니다 (contact@terene.kr)",
                        "프로모션 또는 쿠폰 할인 : 프로모션 할인은 자동 적용되며, 쿠폰 할인은 직접 입력하여 적용합니다",
                        "수영장, 노천탕(온수 포함)의 추가 요금은 없으며 악천우 또는 시설 고장 등 발생 시 사용이 어려울 수도 있습니다. 이를 이유로 숙박요금의 환불은 불가합니다",
                        "예약가능 날짜 및 상세한 숙박요금은 공식 홈페이지를 통해서 실시간 확인 가능합니다.",
                        "보증금은 결제하신 수단으로 체크아웃 기준 3~5영업일 이내 정산 및 환불 처리 됩니다",
                        "예약 이후에도 추가서비스 신청은 체크인 9일전까지 가능하며 카카오톡채널(ID: terene_official)로 신청 부탁 드립니다",
                    ])}

                    {renderParagraph("예약 취소 시 환불에 대한 규정")}
                    {renderCancelTable()}
                    {renderList([
                        "1일 1팀만이 사용가능한 독채형숙소의 특성 상 예약 당일 취소하는 경우에도 위와 동일한 기준이 적용되니 신중히 진행하시길 바랍니다",
                        "예약내역 확인 및 취소는 홈페이지에서 예약조회 후 가능합니다",
                        "환불 처리는 카드결제 취소 시 영업일 기준 3~5일정도 소요될 수 있습니다",
                        "기존 예약 건에 대해 일정 변경은 불가합니다. 일정 변경을 원할 시 기존 예약 취소 후 재예약을 부탁 드립니다",
                    ])}
                </div>
            )

        case "personal":
            return (
                <div style={baseStyle}>
                    <p>
                        (주)바드건축사사무소는 숙박 예약에 필요한 최소한의
                        개인정보를 수집하고 있으며 동의받은 목적 외 용도로
                        사용하지 않습니다.
                    </p>
                    {renderList([
                        "수집하는 개인정보 항목 : 성명, 생년월일, 연락처(전화번호, 이메일), 예약 내용, 결제정보",
                        "수집 및 이용 목적 : 서비스 제공 및 계약 이행, 이용자 본인 확인, 부정 이용 방지, 민원처리 등 소비자 분쟁 해결",
                        "개인정보 보유 및 이영 시간 : 구매 후 5년간 보관",
                    ])}
                    <p>
                        * 동의를 거부할 수 있으나 거부 시 숙박 예약이
                        불가합니다.
                    </p>
                </div>
            )

        case "marketing":
            return (
                <div style={baseStyle}>
                    <p>
                        (주)바드건축사사무소는 SMS, 이메일 등 전자적 전송 매체를
                        통하여 다양한 서비스(경품 등 제공, 이벤트 및 프로모션
                        관련 정보 안내, 신규
                        <br />
                        서비스 출시 정보 및 회원 특화 정보 제공 등) 제공을
                        위하여, 마케팅 및 홍보 목적 달성 시(또는 수신 동의 철회
                        및 탈퇴 시)까지 고객의
                        <br />
                        개인정보를 마케팅 및 광고에 활용하고자 합니다.
                    </p>
                    <br />
                    <p>
                        * 동의를 거부할 수 있으며, 동의를 거부하는 경우 각종
                        소식 및 이벤트 내용과 관련된 정보를 제공받으실 수
                        없습니다.
                    </p>
                </div>
            )

        default:
            return <p style={baseStyle}>약관 내용을 불러올 수 없습니다.</p>
    }
}
