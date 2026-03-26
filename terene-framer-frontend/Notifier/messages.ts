// messages.ts
export function createClientReservationMessage({
    name,
    firstDate,
    secondDate,
    adult,
    child,
    finalPrice,
}: {
    name: string
    firstDate: string
    secondDate: string
    adult: number
    child: number
    finalPrice: number
}) {
    return `[TERENE UNMU]
${name}님, 아래와 같이 예약 신청이 완료되었습니다.

예약정보
1. 이름 : ${name}
2. 지점 : TERENE UNMU
3. 숙박 일정 : ${firstDate}~${secondDate}
4. 숙박 인원 : 성인 ${adult}명, 아동/유아 ${child}명,
5. 결제 금액 : ${finalPrice.toLocaleString()}원

계좌번호 : 우리은행 1005-904-683385
예금주 : (주)바드건축사무소
예금기한 : 예약 신청 후 24시간 이내

예약 후 24시간 이내에 입금이 확인되지 않을 시, 예약은 자동 취소됩니다.
결제금액에 포함된 보증금은 추가 요금 청구가 없을 경우 체크아웃 당일 100% 환급됩니다.

입금 확인 후 확정 문자가 발송되며, 해당 문자를 받으신 시점부터 예약이 최종 확정됩니다.

예약 취소 및 환불 신청은 유선(02-6952-1548)을 통해서만 가능합니다 (오전 10시~오후 6시)
환불은 환불규정에 맞춰 처리되며 영업일 기준 2~3일 정도 소요될 수 있습니다.
감사합니다.`
}

export function createAdminReservationMessage({
    orderId,
    membershipNumber,
    name,
    firstDate,
    secondDate,
    adult,
    child,
    finalPrice,
}: {
    orderId: string
    membershipNumber: string | null
    name: string
    firstDate: string
    secondDate: string
    adult: number
    child: number
    finalPrice: number
}) {
    return `[TERENE UNMU]
${name}님의 예약 신청이 접수되었습니다.

예약정보
1. 예약번호 : ${orderId}
2. 회원번호 : ${membershipNumber || "비회원 예약"}
3. 이름 : ${name}
4. 지점 : TERENE UNMU
5. 숙박 일정 : ${firstDate}~${secondDate}
6. 숙박 인원 : 성인 ${adult}명, 아동/유아 ${child}명,
7. 결제 금액 : ${finalPrice.toLocaleString()}원

* 자세한 정보는 관리자 페이지( https://terene.kr/admin-table )에서 확인해주시기 바랍니다.`
}

export function createReservationMessage(
    type,
    row,
    daysBeforeCheckin = null,
    refundAmount = null,
    refundRateRoom = 0,
    refundRateAdd = 0,
    refundRateDeposit = 1
) {
    const name = row.reserver_name
    const membershipNumber = row.membership_number || "비회원 예약"
    const orderId = row.order_id
    const startDate = row.start_date
    const endDate = row.end_date
    const adult = row.adult
    const child = row.child
    const finalPrice = row.final_price
    const refundInfo = row.refund_info

    const formattedRefundAmount = refundAmount?.toLocaleString?.() || null

    if (type === "confirmed") {
        return {
            client_title: `[TERENE UNMU] ${name}님 예약 확정`,
            client_message: `[TERENE UNMU]
${name}님의 예약이 확정되었습니다.

예약정보
1. 이름 : ${name}
2. 지점 : TERENE UNMU
3. 숙박 일정 : ${startDate}~${endDate}
4. 숙박 인원 : 성인 ${adult}명, 아동/유아 ${child}명,

체크인 하루 전, 체크인 30분 전 안내 문자가 발송됩니다.
감사합니다`,
            admin_title: `[TERENE UNMU] ${membershipNumber} ${name}님 예약 확정`,
            admin_message: `[TERENE UNMU]
${name}님의 예약이 확정되었습니다.

예약정보
1. 예약번호 : ${orderId}
2. 회원번호 : ${membershipNumber}
3. 이름 : ${name}
4. 지점 : TERENE UNMU
5. 숙박 일정 : ${startDate}~${endDate}
6. 숙박 인원 : 성인 ${adult}명, 아동/유아 ${child}명,
7. 결제 금액 : ${Number(finalPrice).toLocaleString()}원

* 자세한 정보는 관리자 페이지( https://terene.kr/admin-table )에서 확인해주시기 바랍니다.`,
        }
    }

    if (type === "cancelled") {
        return {
            client_title: `[TERENE UNMU] ${name}님 예약 취소`,
            client_message: `[TERENE UNMU]
${name}님, 신청하신 예약이 입금이 확인되지 않아 자동 취소 처리되었습니다.

다음 기회에 꼭 뵐 수 있기를 바랍니다.
감사합니다.`,
            admin_title: `[TERENE UNMU] ${membershipNumber} ${name}님 예약 취소 및 환불 요청`,
            admin_message: `[TERENE UNMU]
${name}님의 예약이 취소 및 환불 요청되었습니다.

예약정보
1. 예약번호 : ${orderId}
2. 회원번호 : ${membershipNumber}
3. 이름 : ${name}
4. 환불 요청 시점 : 체크인 ${daysBeforeCheckin}일 전
 - 숙박요금(${(Number(row.receipt.discountedPrice) * 1.1).toLocaleString()}원, VAT 포함)의 ${Number(refundRateRoom) * 100}%
 - 추가서비스요금(${(Number(row.receipt.additionalPrice) * 1.1).toLocaleString()}원, VAT 포함)의 ${Number(refundRateAdd) * 100}%
 - 보증금(300,000원)의 ${Number(refundRateDeposit) * 100}%
5. 환불 금액 : ${formattedRefundAmount}원
6. 환불계좌 : ${refundInfo.refund_bank} ${refundInfo.refund_account}
7. 예금주 : ${refundInfo.refund_name}

* 자세한 정보는 관리자 페이지( https://terene.kr/admin-table )에서 확인해주시기 바랍니다.`,
        }
    }

    if (type === "refunded") {
        return {
            client_title: `[TERENE UNMU] ${name}님 예약 환불 완료`,
            client_message: `[TERENE UNMU]
예약취소 신청으로 아래와 같이 환불 처리되었습니다.

환불기준 : 체크인 ${daysBeforeCheckin}일 전
 - 숙박요금의 ${Number(refundRateRoom) * 100}%
 - 추가서비스요금의 ${Number(refundRateAdd) * 100}%
 - 보증금의 ${Number(refundRateDeposit) * 100}%

환불계좌 : ${refundInfo.refund_bank} ${refundInfo.refund_account}
예금주 : ${refundInfo.refund_name}
입금자 : (주)바드건축사사무소
환불 금액: ${formattedRefundAmount}원

다음 기회에 꼭 뵐 수 있기를 바랍니다.
감사합니다`,
            admin_title: `[TERENE UNMU] ${membershipNumber} ${name}님 예약 환불 완료`,
            admin_message: `[TERENE UNMU]
${name}님의 예약이 환불 처리되었습니다.

예약정보
1. 예약번호 : ${orderId}
2. 회원번호 : ${membershipNumber}
3. 이름 : ${name}
4. 환불 요청 시점 : 체크인 ${daysBeforeCheckin}일 전
 - 숙박요금(${(Number(row.receipt.discountedPrice) * 1.1).toLocaleString()}원, VAT 포함)의 ${Number(refundRateRoom) * 100}%
 - 추가서비스요금(${(Number(row.receipt.additionalPrice) * 1.1).toLocaleString()}원, VAT 포함)의 ${Number(refundRateAdd) * 100}%
 - 보증금(300,000원)의 ${Number(refundRateDeposit) * 100}%
5. 환불 금액 : ${formattedRefundAmount}원
6. 환불계좌 : ${refundInfo.refund_bank} ${refundInfo.refund_account}
7. 예금주 : ${refundInfo.refund_name}

* 자세한 정보는 관리자 페이지( https://terene.kr/admin-table )에서 확인해주시기 바랍니다.`,
        }
    }

    return null
}
