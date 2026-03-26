CREATE TABLE orders_250618 (
    order_id VARCHAR(20) PRIMARY KEY,  -- 예약번호 (예시: O-250527-000000)
    old_order_id VARCHAR(25),  -- 이전 예약번호

    membership_number VARCHAR(10),  -- 회원 번호 (NULL이면 비회원)
    reserver_name VARCHAR(100),  -- 비회원 예약자 이름
    reserver_birthdate VARCHAR(8),  -- 비회원 예약자 생년월일 (예: '19900101')
    reserver_contact VARCHAR(30),  -- 비회원 예약자 연락처
    reserver_email VARCHAR(100),  -- 비회원 예약자 이메일 주소

    stay_info JSONB NOT NULL,  -- 숙박자 정보
    -- {
    --   "same_as_reserver": true,
    --   "name": "홍길동",
    --   "birthdate": "1990 0101",
    --   "contact": "010-1234-5678"
    -- }

    stay_people JSONB NOT NULL,  -- 숙박 인원 정보
    -- {
    --   "adult": 2,
    --   "teenager": 1,
    --   "child": 1
    -- }

    stay_location VARCHAR(200) NOT NULL,  -- 숙박 지점명
    checkin_date VARCHAR(10) NOT NULL,  -- 체크인 (예: '2025-05-01')
    checkout_date VARCHAR(10) NOT NULL,  -- 체크아웃 (예: '2025-05-03')

    stay_details JSONB NOT NULL,  -- 요청사항, 기념일, 약관 동의 등
    -- {
    --   "special_requests": "조용한 방 요청",
    --   "anniversary": {},
    --   "terms_agreement": {},
    --   "admin_notes": {}
    -- }

    initial_price NUMERIC NOT NULL,  -- 최초 금액

    discounted_price JSONB NOT NULL,  -- 할인 적용 금액
    -- {
    --   "amount": 10000,
    --   "primary_coupons": [
    --     {
    --       "coupon_id": "member_discount_50",
    --       "coupon_name": "UNMU 회원 50% 할인",
    --       "coupon_description": "회원가 50% off",
    --       "amount": 750000
    --     }
    --   ],
    --   "secondary_coupons": [
    --     {
    --       "coupon_id": "member_discount_50",
    --       "coupon_name": "UNMU 회원 50% 할인",
    --       "coupon_description": "회원가 50% off",
    --       "amount": 750000
    --     }
    --   ]
    -- }

    service_price JSONB NOT NULL,  -- 추가 서비스 금액
    -- {
    --   "amount": 20000,
    --   "services": [
    --     { "type": "조식 추가", "amount": 10000 },
    --     { "type": "와인 서비스", "amount": 10000 }
    --   ]
    -- }

    exchange_margin_price NUMERIC DEFAULT 0,  -- 해외 결제 수수료
    vat_price NUMERIC NOT NULL,  -- VAT 포함 금액
    deposit_price NUMERIC NOT NULL,  -- 보증금 금액
    final_price NUMERIC NOT NULL,  -- 최종 결제 금액

    stay_status VARCHAR(20) NOT NULL CHECK (
        stay_status IN ('before_checkin', 'checked_in', 'checked_out')
    ),  -- 숙박 상태
    stay_history JSONB NOT NULL,  -- 입실/퇴실 이력
    -- [
    --   { "status": "checked_in", "timestamp": "2025-05-01T15:00:00Z" },
    --   { "status": "checked_out", "timestamp": "2025-05-03T11:00:00Z" }
    -- ]

    reservation_status VARCHAR(20) NOT NULL CHECK (
        reservation_status IN ('pending', 'confirmed')
    ),  -- 예약 표시 상태
    reservation_history JSONB NOT NULL,  -- 예약 상태 변경 이력
    -- [
    --   { "status": "pending", "timestamp": "2025-04-30T09:00:00Z" },
    --   { "status": "confirmed", "timestamp": "2025-04-30T10:00:00Z" }
    -- ]

    reserved_by_vaadd BOOLEAN DEFAULT FALSE -- true면 관리자 예약
    hidden BOOLEAN DEFAULT FALSE  -- true면 예약 숨김

    payment VARCHAR(20) DEFAULT 'toss';  -- 결제 수단 (국내: toss, 페이팔: paypal, 해외카드: foreignCard)

    nationality VARCHAR(20) NOT NULL DEFAULT 'domestic' CHECK (nationality IN ('domestic', 'foreign'));
);
