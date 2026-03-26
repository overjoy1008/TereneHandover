CREATE TABLE customers (
    membership_number VARCHAR(10) PRIMARY KEY CHECK (
        membership_number ~ '^[UA]-\d{8}$'
    ),

    id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,

    name_kor VARCHAR(100),  -- 성명/상호 (한글)
    name_eng VARCHAR(100) NOT NULL,  -- 성명/상호 (영문)

    is_personal BOOLEAN NOT NULL,  -- true = 개인, false = 법인

    -- 개인일 경우에만 사용
    birthdate VARCHAR(8),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),

    -- 법인일 경우에만 사용
    business_registration_number VARCHAR(20),

    -- 계약 담당자 통합 정보
    contact_person_name VARCHAR(100),
    contact_person_phone VARCHAR(30),

    address VARCHAR(200) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,

    membership_grade VARCHAR(30) NOT NULL CHECK (
        membership_grade IN ('Non-Member', 'UNMU 6', 'UNMU 9', 'UNMU 12', 'UNMU 24', 'All-Free')
    ),

    -- 추가된 컬럼들
    owned_mileage NUMERIC NOT NULL DEFAULT 0,
    signup_date VARCHAR,
    used_coupons TEXT[] NOT NULL,
    remarks TEXT[]
);
