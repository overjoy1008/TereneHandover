CREATE TABLE locations (
    location_id VARCHAR(200) PRIMARY KEY, -- 영문 대문자 명칭
    name_eng VARCHAR(200), -- 영문 대소문자 명칭
    name_kor VARCHAR(200), -- 한글 명칭
    name_var VARCHAR(200), -- 별도 표기 명칭
    
    tag VARCHAR(100), -- 장소 태그 (위치 정보 등)
    description VARCHAR(1000), -- 장소에 대한 설명

    address_kor VARCHAR(200),
    address_eng VARCHAR(200),

    spec_info_kor VARCHAR(1000), -- 오시는 길 안내 및 유의사항 (한글)
    spec_info_eng VARCHAR(1000), -- 오시는 길 안내 및 유의사항 (영문)

    phone VARCHAR(30),
    email VARCHAR(100),

    deposit NUMERIC,  -- 장소 고유 보증금
    checkin_time VARCHAR(20),
    checkout_time VARCHAR(20),
    
    base_occupancy INT, -- 기준 인원
    max_occupancy INT -- 최대 인원
);

INSERT INTO locations (
  location_id, name_eng, name_kor, name_var, tag,
  description, address_kor, address_eng, spec_info_kor, spec_info_eng,
  phone, email, deposit, checkin_time, checkout_time, base_occupancy, max_occupancy
) VALUES (
  'UNMU', 'Unmu', '운무', NULL, 'HWACHEON, GANGWON',
  E'북한강과 용화산의 압도적인 경관을 즐길 수 있는 독채형 리조트 ‘테레네 운무’를 소개합니다\n400평 대지, 130평 건축공간을 온전히 1일 1팀만을 위해 제공하며 야외수영장과 노천탕&사우나, 라운지를 갖추고 있습니다\n나만의 최고급 별장에 온 느낌을 주는 시설과 어메니티, 온전한 휴가를 선물할 독채형리조트입니다',
  E'강원도 화천군 하남면 호수길 206-31 (원천리 136-40)',
  E'206-31 Hosu-gil, Hanam-myeon, Hwacheon-gun, Gangwon-do\n(136-40 Woncheon-ri)',
  E'네비게이션에 ‘테레네 운무’ 또는 ‘TERENE UNMU’ 검색하셔서 오시면 됩니다.\n\n최근 주변 도로 공사가 많으니 안전 운전하시고,\n‘지촌삼거리’에서는 ‘화천’ 방향(파란색 유도선)으로, 도착 3분 전 갈림길에서는 ‘호수길’ 방향으로 오시면 헤매지 않고 도착하실 수 있습니다.',
  E'You can simply search “테레네 운무” or “TERENE UNMU” on your navigation system.\n\nPlease note that there is ongoing road construction in the surrounding area—drive safely.\nAt Jichon Samgeori (Jichon Intersection), follow the direction toward Hwacheon (blue guide line), and about 3 minutes before arrival, take the road toward Hosu-gil to reach us without confusion.',
  NULL, NULL, 300000, '15:00', '10:30', 8, 10
);


CREATE TABLE admin_contacts (
    admin_id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100),

    reservation_alert BOOLEAN NOT NULL DEFAULT TRUE,
    checkinout_alert BOOLEAN NOT NULL DEFAULT TRUE,

    quiet_mode BOOLEAN DEFAULT FALSE,
     -- quiet_mode가 true인 경우, 해당 관리자는 알림을 받지 않음

    manual_order NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_contacts (admin_id, name, phone, email, reservation_alert, checkinout_alert, quiet_mode, manual_order, created_at, updated_at) VALUES
('A1548', 'Admin 1', '010-2889-1548', NULL, TRUE, TRUE, FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A4590', 'Admin 2', '010-7499-4590', NULL, FALSE, TRUE, FALSE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ARESV', 'Admin 3', NULL, 'reserve@terene.kr', TRUE, FALSE, FALSE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A1048', 'Admin 4', '010-2899-1048', NULL, FALSE, TRUE, FALSE, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A7802', '이다교', '010-2449-7802', NULL, FALSE, FALSE, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A4565', 'Admin 5', '010-3917-4565', NULL, FALSE, TRUE, FALSE, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


CREATE TABLE employees (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    phone VARCHAR(30),
    email VARCHAR(100),

    location VARCHAR(200), -- REFERENCES locations(name),

    headquaters BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE attendance (
    date VARCHAR(20) NOT NULL,
    location VARCHAR(200) NOT NULL, -- REFERENCES locations(name),
    employee_id VARCHAR(40) NOT NULL, -- REFERENCES employees(id),

    attend BOOLEAN NOT NULL DEFAULT FALSE,
    time_interval VARCHAR(40),

    PRIMARY KEY (date, location, employee_id)
);

CREATE TABLE managements (
    date VARCHAR(20) NOT NULL,
    location VARCHAR(200) NOT NULL, -- REFERENCES locations(name),
    sefi_price NUMERIC, -- Settlement Final Price

    attendace_remarks TEXT[],

    PRIMARY KEY (date, location)
);
