CREATE TABLE coupon_definitions_250618 (
    coupon_definition_id VARCHAR(23) PRIMARY KEY,  -- 쿠폰 정의 ID (예시: CD-250527-1143-00000000)

    name VARCHAR(100) NOT NULL,  -- 쿠폰 명칭
    description VARCHAR(200) NOT NULL,  -- 사용자 표시 설명

    discount_type VARCHAR(20) NOT NULL CHECK (
        discount_type IN ('percentage', 'fixed')
    ),  -- 할인 방식

    discount_value NUMERIC NOT NULL,  -- 할인 수치 (예: 10%, 10000원)

    scope NUMERIC NOT NULL,  -- 쿠폰 적용 가능한 최대 일수 (1 = 1박만 적용, 2 = 2박까지 적용, -1 = 모든 숙박일에 적용)

    counter NUMERIC NOT NULL,  -- 쿠폰을 총 몇 번 사용 가능한지 (1 = 1회성, 2 = 2회성, ..., -1 = 무제한)

    type VARCHAR(20) DEFAULT 'global' CHECK (
        type IN ('global', 'membership', 'code')
    ),  -- 쿠폰 타입 (membership은 쿠폰 당 하루에만 적용 가능)

    conditions_json JSONB,  -- 쿠폰 조건
    -- 예시:
    -- [
    --   { "type": "seasonal", "allowedCategories": ["Weekend", "Peak-Weekend"] },
    --   { "type": "membership", "members": ["TERENE 6", "UNMU 6"] },
    --   { "type": "relay", "min": 2, "max": 2 }
    -- ]

    validity_type VARCHAR(10) NOT NULL CHECK (
        validity_type IN ('day', 'week', 'month', 'year', 'custom', 'permanent')
    ),  -- 유효기간 유형

    validity_value VARCHAR(20),  -- 유효기간 값 (예: '1', '7', '2025-08-31')

    refillable BOOLEAN NOT NULL DEFAULT FALSE,  -- 소멸 시 쿠폰 재발행할지 여부

    enabled BOOLEAN NOT NULL DEFAULT FALSE,  -- 쿠폰 사용 가능 여부

    exclusive BOOLEAN NOT NULL DEFAULT FALSE  -- 다른 쿠폰과 중복 사용 가능 여부
);
