CREATE TABLE coupons (
    id VARCHAR(50) PRIMARY KEY,                        -- 쿠폰 ID (예: early_bird_20)
    priority NUMERIC NOT NULL UNIQUE,                  -- ✅ 우선순위, NOT NULL + 중복 불가
    name VARCHAR(100) NOT NULL,                        -- 쿠폰 명칭
    description VARCHAR(200) NOT NULL,                 -- ✅ 사용자에게 표시될 문구 (기존 display 필드)
    discount_type VARCHAR(20) NOT NULL CHECK (
        discount_type IN ('percentage', 'fixed')
    ),                                                 -- 할인 방식
    discount_value NUMERIC NOT NULL,                   -- 할인 수치
    scope VARCHAR(20) NOT NULL CHECK (
        scope IN ('per_stay', 'per_day')
    ),                                                 -- 할인 범위

    type VARCHAR(20) DEFAULT 'global' CHECK (
        type IN ('global', 'personal', 'code')
    ),                                                 -- 쿠폰 타입

    allowed_members TEXT[],                            -- 개인용 쿠폰 대상 멤버
    code VARCHAR(50),                                  -- 코드형 쿠폰일 경우 입력 코드

    conditions_json JSONB,                             -- 여러 조건을 배열로 저장
    enabled BOOLEAN NOT NULL DEFAULT FALSE             -- 쿠폰 활성 여부
);
