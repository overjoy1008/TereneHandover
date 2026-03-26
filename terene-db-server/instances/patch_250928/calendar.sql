CREATE TABLE days_category (
    eng_name   VARCHAR(40) PRIMARY KEY,
    kor_name   VARCHAR(40) NOT NULL UNIQUE, 
    custom     BOOLEAN DEFAULT FALSE, 
    unmu_price NUMERIC(12) NOT NULL,
    bg_color   VARCHAR(9) NOT NULL
);

INSERT INTO days_category (eng_name, kor_name, custom, unmu_price, bg_color) VALUES
('Weekday',      '평일', FALSE, 1500000, '#FFFFFF00'),
('Weekend',      '주말', FALSE, 2100000, '#EFEFEF'),
('Peak-Weekday', '성수기 평일', FALSE, 2100000, '#EFECEA'),
('Peak-Weekend', '성수기 주말', FALSE, 2400000, '#DFDBD9'),
('Special-1',    '특별 연휴', TRUE,  2400000, '#E0CECE');



CREATE TABLE days_design (
    object VARCHAR(40) PRIMARY KEY,  -- normal_text, weekend_text, holiday_text, disabled_text
    color  VARCHAR(9) NOT NULL
);

INSERT INTO days_design (object, color) VALUES
('normal_text',   '#707070'),
('weekend_text',  '#DB4242'),
('holiday_text',  '#DB4242'),
('disabled_text', '#707070');



CREATE TABLE days_250928 (
    date_id VARCHAR(40) PRIMARY KEY,

    date VARCHAR(20) NOT NULL,
    location VARCHAR(200) NOT NULL,
    
    category VARCHAR(40) NOT NULL,
    
    is_holiday BOOLEAN NOT NULL,
    
    checkin JSONB,
    checkin_occupied BOOLEAN,
    checkin_allowed BOOLEAN,
    checkin_order_id VARCHAR(20),

    checkout JSONB,
    checkout_occupied BOOLEAN,
    checkout_allowed BOOLEAN,
    checkout_order_id VARCHAR(20)
);

-- TODO: python 코드 이용해서 자동 Migration하기!!
-- TODO: Migration 이후에 days 쓰는 framer 코드 전부 링크 v3로 변경하기!