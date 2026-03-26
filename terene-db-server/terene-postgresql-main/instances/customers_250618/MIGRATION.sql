INSERT INTO customers_250618 (
    membership_number, id, password,
    name_kor, name_eng, is_personal,
    birthdate, gender, business_registration_number,
    contact_person_name, contact_person_phone,
    address, phone, email,
    membership_grade, phase,
    signup_date, remarks, blacklist
) VALUES
('A-00000001', 'vaadd', 'vaadd',
 '바드건축사사무소', 'VAADD architects', FALSE,
 NULL, NULL, '463-88-02624',
 '오기원 / 대표', '010-2889-1548',
 '서울특별시 마포구 독막로15길 3-13, 5층', '02-6952-1548', 'vaadd@vaadd.kr',
 'All-Free', 'Phase-1',
 NULL, ARRAY[]::TEXT[], FALSE),

('A-00000002', 'A-00000002', 'password11',
 '박경빈', 'Kyoungbin Park', TRUE,
 '20011008', 'Male', NULL,
 NULL, NULL,
 '경기도 성남시 중원구 도촌남로 69, 404동 1202호', '010-2370-5710', 'overjoy1008@gmail.com',
 'TERENE 9', 'Phase-2',
 '2025-06-01', ARRAY['phase-2'], FALSE),

('U-00000001', 'geewon_oh', 'password111',
 '오기원', 'GEEWON OH', TRUE,
 '19870212', 'Male', NULL,
 '오기원 / 대표', '010-2889-1548',
 '서울특별시 마포구 독막로15길 3-13, 5층', '010-2889-1548', 'ogw@vaadd.kr',
 'Non-Member', 'Phase-1',
 '2025-05-08', ARRAY[]::TEXT[], FALSE),

('U-00000003', 'dagyo_lee', 'password222',
 '이다교', 'DAGYO LEE', TRUE,
 '20001206', 'Female', NULL,
 '이다교 ', '010-2449-7802',
 '서울특별시 마포구 ', '010-2449-7802', 'ldg@vaadd.kr',
 'Non-Member', 'Phase-1',
 '2025-05-23', ARRAY[]::TEXT[], FALSE),

('U-00000007', 'dagyo', 'password333',
 '다교', 'dagyo', TRUE,
 '20001206', 'Female', NULL,
 '다교', '010-2449-78002',
 ' 서울특별시 마포구', ' 010-2449-7802', 'ldg@vaadd.kr',
 'TERENE 6', 'Phase-1',
 NULL, ARRAY[]::TEXT[], FALSE),

('U-99999999', 'tosspayments', 'testaccount0601',
 '토스페이먼츠', 'Toss Payments', TRUE,
 NULL, NULL, NULL,
 NULL, NULL,
 'OO시 OO구 OOOO', '010-0000-0000', 'tosspayments@xxx.xxx',
 'TERENE 6', 'Phase-1',
 '2025-06-01', ARRAY[]::TEXT[], FALSE);





INSERT INTO customers_250618 (
    membership_number, id, password,
    name_kor, name_eng, is_personal,
    birthdate, gender, business_registration_number,
    contact_person_name, contact_person_phone,
    address, phone, email,
    membership_grade, phase,
    signup_date, remarks, blacklist
) VALUES
('U-00010001', 'U-00010001', 'password11',
 '이다교', 'Dagyo Lee', TRUE,
 '19900101', 'Male', NULL,
 NULL, NULL,
 '서울특별시 강남구 테스트로 6', '010-2449-7802', 'ldg@vaadd.kr',
 'TERENE 6', 'Phase-1',
 '2025-08-01', ARRAY[]::TEXT[], FALSE),

('U-00010002', 'U-00010002', 'password22',
 '테스트유저2', 'Dagyo Lee', TRUE,
 '19920202', 'Female', NULL,
 NULL, NULL,
 '서울특별시 강남구 테스트로 9', '010-2449-7802', 'ldg@vaadd.kr',
 'TERENE 9', 'Phase-1',
 '2025-08-01', ARRAY[]::TEXT[], FALSE),

('U-00010003', 'U-00010003', 'password33',
 '테스트유저3', 'Dagyo Lee', TRUE,
 '19930303', 'Male', NULL,
 NULL, NULL,
 '서울특별시 강남구 테스트로 12', '010-2449-7802', 'ldg@vaadd.kr',
 'TERENE 12', 'Phase-1',
 '2025-08-01', ARRAY[]::TEXT[], FALSE),

('U-00010004', 'U-00010004', 'password44',
 '테스트유저4', 'Dagyo Lee', TRUE,
 '19940404', 'Female', NULL,
 NULL, NULL,
 '서울특별시 강남구 테스트로 24', '010-2449-7802', 'ldg@vaadd.kr',
 'TERENE 24', 'Phase-1',
 '2025-08-01', ARRAY[]::TEXT[], FALSE);
