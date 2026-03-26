CREATE TABLE refund_policy (
    policy_id INT PRIMARY KEY,
    start_dday INT NOT NULL,
    end_dday INT NOT NULL,

    dvc_percent NUMERIC(5,2) NOT NULL, -- Discounted price with Vat, Customer
    svc_percent NUMERIC(5,2) NOT NULL, -- Service price with Vat, Customer
    dpc_percent NUMERIC(5,2) NOT NULL, -- Deposit with Vat, Customer
    x1c_percent NUMERIC(5,2), -- Extra category 1, Customer
    x2c_percent NUMERIC(5,2), -- Extra category 2, Customer
    x3c_percent NUMERIC(5,2), -- Extra category 3, Customer

    dva_percent NUMERIC(5,2) NOT NULL, -- Discounted price with Vat, Admin
    sva_percent NUMERIC(5,2) NOT NULL, -- Service price with Vat, Admin
    dpa_percent NUMERIC(5,2) NOT NULL, -- Deposit with Vat, Admin
    x1a_percent NUMERIC(5,2), -- Extra category 1, Admin
    x2a_percent NUMERIC(5,2), -- Extra category 2, Admin
    x3a_percent NUMERIC(5,2) -- Extra category 3, Admin
);

INSERT INTO refund_policy (policy_id, start_dday, end_dday, dvc_percent, svc_percent, dpc_percent, x1c_percent, x2c_percent, x3c_percent, dva_percent, sva_percent, dpa_percent, x1a_percent, x2a_percent, x3a_percent) VALUES
(1, 0, 1, 0, 0, 100, NULL, NULL, NULL, 100, 100, 100, NULL, NULL, NULL),
(2, 2, 9, 0, 100, 100, NULL, NULL, NULL, 100, 100, 100, NULL, NULL, NULL),
(3, 10, 14, 60, 100, 100, NULL, NULL, NULL, 100, 100, 100, NULL, NULL, NULL),
(4, 15, 30, 80, 100, 100, NULL, NULL, NULL, 100, 100, 100, NULL, NULL, NULL),
(5, 31, 9999, 100, 100, 100, NULL, NULL, NULL, 100, 100, 100, NULL, NULL, NULL);



CREATE TABLE additional_services (
    id VARCHAR(40) PRIMARY KEY,
    manual_order NUMERIC,
    
    title VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(1000) NOT NULL,
    price_description VARCHAR(1000),

    image_url VARCHAR(1000),
    image_file_id VARCHAR(200),

    category VARCHAR(20), -- CHECK (category IN ('package', 'additional')) = 패키지 / 추가 서비스
    paid BOOLEAN NOT NULL, -- 유료 / 무료
    type VARCHAR(20) NOT NULL, -- CHECK (type IN ('fixed', 'proportional') = 고정 / 비례
    price NUMERIC(12) NOT NULL, -- 원화 가격 (비례 type인 경우 단위 가격)
    
    displayed_price_kor VARCHAR(100), -- 고객에게 표시되는 가격 (예: '+100,000원' '+0원/회당, +30,000원/인원 당')
    displayed_price_eng VARCHAR(100),

    show_dropdown BOOLEAN NOT NULL DEFAULT FALSE, -- show_dropdown이 true인 경우, 사용자가 수량을 직접 선택 가능
    unit VARCHAR(20), -- '인' / '회'
    max_unit NUMERIC(2) DEFAULT 8, -- 최대 선택 가능 수량
    default_text VARCHAR(100), -- 최초 선택지 = '횟수' / '인원수'
    default_allowed BOOLEAN DEFAULT FALSE, -- default_allowed가 false인 경우 최초 선택지를 선택 불가능

    available BOOLEAN NOT NULL DEFAULT FALSE, -- 활성화 / 비활성화
    hidden BOOLEAN NOT NULL DEFAULT FALSE, -- hidden이 true인 경우, 관리자 화면에서만 보임
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO additional_services (id, manual_order, title, description, price_description, image_url, image_file_id, category, paid, type, price, displayed_price_kor, displayed_price_eng, show_dropdown, unit, max_unit, default_text, default_allowed, available, created_at, updated_at) VALUES
('room_only', 1, 'ROOM ONLY', '웰컴 샴페인(클라우디베이 펠로루스)', NULL, NULL, NULL, 'package', FALSE, 'fixed', 0, '+0원', 'KRW +0', FALSE, NULL, NULL, NULL, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE memberships (
    name VARCHAR(40) PRIMARY KEY,

    yearly_weekday INT NOT NULL,
    yearly_weekend INT NOT NULL,
    yearly_peak INT NOT NULL,
    
    month_limit INT NOT NULL
);

INSERT INTO memberships (name, yearly_weekday, yearly_weekend, yearly_peak, month_limit) VALUES
('Non-Member', 0, 0, 0, 2),
('TERENE 6', 4, 1, 1, 3),
('TERENE 9', 5, 2, 2, 6),
('TERENE 12', 7, 3, 2, 8),
('TERENE 24', 13, 6, 5, 12),
('All-Free', 9999, 9999, 9999, 9999);



CREATE TABLE settings (
    id VARCHAR(40) PRIMARY KEY,
    rule VARCHAR(200) NOT NULL,
    description VARCHAR(1000),

    type VARCHAR(20) NOT NULL DEFAULT 'boolean', -- CHECK (type IN ('boolean', 'numeric', 'text', 'selection')),
    
    boolean_setting BOOLEAN,
    
    numeric_setting NUMERIC(20),
    numeric_min NUMERIC(20),
    numeric_max NUMERIC(20),
    numberic_step NUMERIC(20),

    text_setting VARCHAR(200),

    selection_setting TEXT[],
    selection_default VARCHAR(200)
);

INSERT INTO settings (id, rule, description, type, boolean_setting, numeric_setting, numeric_min, numeric_max, numberic_step, text_setting, selection_setting, selection_default) VALUES
('DeadlineTime', '오늘 N시 전까지', NULL, 'text', NULL, NULL, NULL, NULL, NULL, '15:00', NULL, NULL),
('DeadlineDday', 'D+N일 예약 가능', NULL, 'numeric', NULL, 2, 1, 10, 1, NULL, NULL, NULL),
('OpenDate', '예약 가능일', NULL, 'text', NULL, NULL, NULL, NULL, NULL, '2025-07-08', NULL, NULL),
('CheckinTime', '입실 시간', NULL, 'text', NULL, NULL, NULL, NULL, NULL, '15:00', NULL, NULL),
('CheckoutTime', '퇴실 시간', NULL, 'text', NULL, NULL, NULL, NULL, NULL, '10:30', NULL, NULL),
('MaxStayDays', '최대 숙박 일수', NULL, 'numeric', NULL, 3, 1, 10, 1, NULL, NULL, NULL),
('ShowManagementContact', '지점 운영 연락처 표시', NULL, 'boolean', FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ShowManagementSefiPrice', '지점 운영 정산 가격 표시', NULL, 'boolean', FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ServerMaintenance', '서버 점검', '개발된 내용을 안전하게 적용하기 위해, 개발자와 관리자를 제외한 계정은 예약이 제한됩니다.', 'boolean', FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('DeveloperID', '개발자 계정', '서버 점검 시에도 예약이 가능한 개발자 계정입니다. 여러 개의 아이디를 콤마(,)로 구분하여 입력할 수 있습니다.', 'selection', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['U-98765432'], 'U-98765432'),
('AdminBypassCode', '관리자 예약 우회 코드', '요청사항에 해당 코드가 포함되면 결제 완료 고객으로 간주하고 토스 결제 없이 예약을 확정합니다. 대소문자 및 문자열 정확히 일치해야 합니다.', 'text', NULL, NULL, NULL, NULL, NULL, 'TERENE::ADMIN_CONFIRM_9F3K7QX2@UNMU', NULL, NULL),
('ExcessDiscountRate', '초과할인률(%)', '회원이 멤버쉽 쿠폰을 소진했을 때 적용되는 기본 할인률, 퍼센트(%) 단위로 입력합니다.', 'numeric', NULL, 25, 0, 100, 1, NULL, NULL, NULL);

