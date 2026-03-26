CREATE TABLE customers_250618 (
    membership_number VARCHAR(10) PRIMARY KEY CHECK (
        membership_number ~ '^[UA]-\d{8}$'
    ),

    id VARCHAR(50),
    password VARCHAR(100) NOT NULL,

    name_kor VARCHAR(100),  -- 성명/상호 (한글)
    name_eng VARCHAR(100),  -- 성명/상호 (영문)

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
        membership_grade IN ('Non-Member', 'UNMU 6', 'UNMU 9', 'UNMU 12', 'UNMU 24', 'TERENE 6', 'TERENE 9', 'TERENE 12', 'TERENE 24', 'All-Free')
    ),

    phase VARCHAR(20) NOT NULL CHECK (
        phase IN ('Phase-1', 'Phase-2', 'Phase-3', 'Phase-4', 'Phase-5', 'Phase-6', 'Phase-7', 'Phase-8', 'Phase-n')
    ),

    signup_date VARCHAR,
    remarks TEXT[],
    blacklist BOOLEAN DEFAULT FALSE  -- 블랙리스트 여부

    nationality VARCHAR(20) NOT NULL DEFAULT 'domestic' CHECK (nationality IN ('domestic', 'foreign'));
);
