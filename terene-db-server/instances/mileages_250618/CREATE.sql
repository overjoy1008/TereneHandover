CREATE TABLE mileages_250618 (
    mileage_id VARCHAR(23) PRIMARY KEY,  -- 마일리지 변동 ID (예시: MI-250527-1143-00000000)
    
    membership_number VARCHAR(10) NOT NULL REFERENCES customers_250618(membership_number),  -- 소유하는 회원 번호

    issued_at TIMESTAMP NOT NULL,  -- 마일리지 변동 일시

    mileage_amount NUMERIC NOT NULL,  -- 변동된 마일리지 (+/- 가능)

    mileage_type VARCHAR(20) NOT NULL CHECK (
        mileage_type IN ('accumulate', 'use', 'expire')
    ),  -- 마일리지 사용 타입 (적립, 사용, 소멸)

    description VARCHAR(200),  -- 설명 (예: "숙박 적립", "예약 사용", "유효기간 만료")

    mileage_due TIMESTAMP,  -- 유효 기한 (예: 적립 마일리지의 만료일)

    order_id VARCHAR(20) REFERENCES orders_250618(order_id)  -- 사용된 예약 번호 (있다면)
);
