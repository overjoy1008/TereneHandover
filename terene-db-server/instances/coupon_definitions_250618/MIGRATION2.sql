INSERT INTO coupon_definitions_250618 (
    coupon_definition_id, name, description,
    discount_type, discount_value, scope, counter, type,
    conditions_json, validity_type, validity_value, refillable, enabled
)
VALUES
('CD-250801-0001-TERENE09', '(주)효원홀딩스', 'TERENE 9 - 50% 할인',
 'percentage', 50, -1, 1, 'code',
 '[{"type": "date", "endDate": "2026-05-30", "startDate": "2025-06-01"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0002-FREE0001', '무료숙박권', '무료숙박권 - 이다교',
 'percentage', 100, -1, 1, 'code',
 '[{"type": "date", "endDate": "2025-07-13", "startDate": "2025-07-13"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0003-FREE00WD', '무료숙박권 - 영업용', '평일 1박 무료숙박권',
 'percentage', 100, 1, 1, 'code',
 '[{"type": "date", "endDate": "2025-09-30", "startDate": "2025-07-01"}, {"type": "seasonal", "allowedCategories": ["Weekday", "Peak-Weekday"]}, {"max": "1680000", "type": "applied_discount"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0004-RELAY110', '연박할인권 - 영업용', '프로모션 1박 연장 시 10% 추가할인권',
 'percentage', 10, 1, 1, 'code',
 '[{"type": "date", "endDate": "2025-09-30", "startDate": "2025-07-01"}, {"max": "172800", "type": "applied_discount"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0005-CODE0010', '일반 영업용 할인', 'PROMOTION CODE1',
 'percentage', 10, -1, 1, 'code',
 '[]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0006-CODE0030', '암원 영업용 30% 할인', 'PROMOTION CODE',
 'percentage', 30, -1, 1, 'code',
 '[]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0007-STAFF010', '임직원 가족 할인쿠폰 10%', '임직원 가족 할인 - 10%',
 'percentage', 10, -1, 1, 'code',
 '[{"type": "date", "endDate": "2025-08-23", "startDate": "2025-08-22"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0008-REBATE10', '재방문 할인쿠폰', '재방문 10% 할인쿠폰',
 'percentage', 10, -1, 1, 'code',
 '[{"type": "date", "endDate": "2025-12-31", "startDate": ""}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0009-MEMBER20', '회원권 영업용 코드 A', '회원권상담 1박 체험할인권 - 20%',
 'percentage', 20, 1, 1, 'code',
 '[{"type": "date", "endDate": "2025-08-31", "startDate": ""}, {"max": "384000", "type": "applied_discount"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0010-MEMBER30', '회원권 영업용 코드 B', 'PROMPOTION CODE1',
 'percentage', 30, -1, 1, 'code',
 '[]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0011-FREEYEAR', '회원권 무료숙박', 'TERENE - 1년 무료 숙박권',
 'percentage', 100, -1, 1, 'code',
 '[{"type": "date", "endDate": "2026-05-30", "startDate": "2025-06-01"}]',
 'year', '1', FALSE, TRUE),

('CD-250801-0012-VAADD30E', 'VAADD 임원 30% 할인', 'VAADD 임원 할인 30%',
 'percentage', 30, -1, 1, 'code',
 '[{"type": "date", "endDate": "2025-12-31", "startDate": "2025-05-23"}]',
 'permanent', NULL, FALSE, TRUE),

('CD-250801-0013-VAADD30S', 'VAADD 직원 30% 할인', 'VAADD 임직원 할인 30%',
 'percentage', 30, -1, 1, 'code',
 '[]',
 'permanent', NULL, FALSE, TRUE);
