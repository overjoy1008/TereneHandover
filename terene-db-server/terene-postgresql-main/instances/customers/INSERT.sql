-- 1
SELECT 
  'A-00000001' AS membership_number,
  'vaadd' AS id,
  'vaadd' AS password,
  '바드건축사사무소' AS name_kor,
  'VAADD architects' AS name_eng,
  FALSE AS is_personal,
  NULL AS birthdate,
  NULL AS gender,
  '463-88-02624' AS business_registration_number,
  '오기원 / 대표' AS contact_person_name,
  '010-2889-1548' AS contact_person_phone,
  '서울특별시 마포구 독막로15길 3-13, 5층' AS address,
  '02-6952-1548' AS phone,
  'vaadd@vaadd.kr' AS email,
  'All-Free' AS membership_grade,
  '100000' AS owned_mileage,
  NULL AS signup_date,
  '[]' AS used_coupons,
  '[]' AS remarks
FROM DUAL;

-- 2
SELECT 
  'A-00000002', 'developer', 'password11', '박경빈', 'Kyoungbin Park', TRUE,
  '20011008', 'Male', NULL, NULL, NULL,
  '경기도 성남시 중원구 도촌남로 69, 404동 1202호', '010-2370-5710', 'overjoy1008@gmail.com',
  'UNMU 24', '0', '2025-05-01', '["expired","SUMMER25"]', '["phase-2"]'
FROM DUAL;

-- 3
SELECT 
  'U-00000001', 'geewon_oh', 'password111', '오기원', 'GEEWON OH', TRUE,
  '19870212', 'Male', NULL, '오기원 / 대표', '010-2889-1548',
  '서울특별시 마포구 독막로15길 3-13, 5층', '010-2889-1548', 'ogw@vaadd.kr',
  'Non-Member', '5000', '2025-05-08', '[]', '[]'
FROM DUAL;

-- 4
SELECT 
  'U-00000003', 'dagyo_lee', 'password222', '이다교', 'DAGYO LEE', TRUE,
  '20001206', 'Female', NULL, '이다교 ', '010-2449-7802',
  '서울특별시 마포구 ', '010-2449-7802', 'ldg@vaadd.kr',
  'Non-Member', '0', '2025-05-23', '[]', '[]'
FROM DUAL;

-- 5
SELECT 
  'U-00000007', 'dagyo', 'password333', '다교', 'dagyo', TRUE,
  '20001206', 'Female', NULL, '다교', '010-2449-78002',
  ' 서울특별시 마포구', ' 010-2449-7802', 'ldg@vaadd.kr',
  'UNMU 6', '0', NULL, '[]', '[]'
FROM DUAL;

-- 6
SELECT 
  'U-99999999', 'tosspayments', 'testaccount0601', '토스페이먼츠', 'Toss Payments', TRUE,
  NULL, NULL, NULL, NULL, NULL,
  'OO시 OO구 OOOO', '010-0000-0000', 'tosspayments@xxx.xxx',
  'UNMU 6', '10000', '2025-06-01', '[]', '[]'
FROM DUAL;
