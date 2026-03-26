CREATE TABLE coupon_instances_250618 (
    coupon_instance_id VARCHAR(23) PRIMARY KEY,  -- 쿠폰 인스턴스 ID (예시: CI-250527-1143-00000000)

    coupon_definition_id VARCHAR(23) NOT NULL REFERENCES coupon_definitions_250618(coupon_definition_id),  -- 쿠폰 정의 참조 (code형만 발행 가능해야 함)

    coupon_code VARCHAR(50),  -- 쿠폰 코드

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('available', 'used', 'expired', 'disabled')
    ),  -- 쿠폰 상태 (정의 단계에서 비활성시 disabled로 전환)

    membership_number VARCHAR(10) REFERENCES customers_250618(membership_number),  -- 쿠폰 소유자

    issued_at TIMESTAMP NOT NULL,  -- 쿠폰 발행 시각

    coupon_due TIMESTAMP,  -- 쿠폰 유효 기한

    sender_info JSONB,  -- 보낸 사람 정보
    -- {
    --   "is_vaadd": false,
    --   "membership_number": "123456",
    --   "name": "홍길동",
    --   "birthdate": "19900101",
    --   "contact": "010-1234-5678"
    -- }

    receiver_info JSONB,  -- 받는 사람 정보
    -- {
    --   "membership_number": "789012",
    --   "name": "김철수",
    --   "birthdate": "19900303",
    --   "contact": "010-9876-5432"
    -- }

    order_id VARCHAR(20) REFERENCES orders_250618(order_id),  -- 사용된 예약 번호 (있다면)
    used_location VARCHAR(200),  -- 사용된 지점명
    used_timestamp TIMESTAMP,  -- 사용 시각
    used_amount NUMERIC  -- 사용 금액
);
