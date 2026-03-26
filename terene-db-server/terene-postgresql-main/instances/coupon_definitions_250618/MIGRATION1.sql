INSERT INTO coupon_definitions_250618 (
    coupon_definition_id, name, description,
    discount_type, discount_value, scope, counter, type,
    conditions_json, validity_type, validity_value, refillable, enabled
)
VALUES 
(
    'CD-250730-0700-early020', '오픈 기념 20% 할인', '오픈 기념 20% off 기간연장 (25년 8월 31일까지)',
    'percentage', 20, -1, -1, 'global',
    '[{"type": "date", "endDate": "2025-08-31"}]', 'custom', '2025-08-31', TRUE, TRUE
),
(
    'CD-250730-0700-relay002', '연박 할인', '연박할인(2박) - 1박 당 10% off',
    'percentage', 10, -1, -1, 'global',
    '[{"type": "relay", "min": 2, "max": 2}]', 'permanent', NULL, TRUE, TRUE
),
(
    'CD-250730-0700-relay003', '연박 할인', '연박할인(3박) - 1박 당 10% off',
    'percentage', 10, -1, -1, 'global',
    '[{"type": "relay", "min": 3, "max": 3}]', 'permanent', NULL, TRUE, TRUE
),
(
    'CD-250730-0700-relay00n', '연박 할인', '연박할인(n박) - 1박 당 10% off',
    'percentage', 10, -1, -1, 'global',
    '[{"type": "relay", "min": 4}]', 'permanent', NULL, TRUE, TRUE
);

-- INSERT INTO coupon_definitions_250618 (
--     coupon_definition_id, name, description,
--     discount_type, discount_value, scope, counter, type,
--     conditions_json, validity_type, validity_value, refillable, enabled
-- )
-- VALUES
-- (
--     'CD-250730-0700-REBATE10', '재방문 할인쿠폰', '재방문 10% 할인쿠폰',
--     'percentage', 10, -1, 1, 'code',
--     null, 'year', '1', TRUE, TRUE
-- ),
-- (
--     'CD-250730-0700-FREEWD01', '평일 1박 무료숙박권', '평일 1박 무료숙박권',
--     'percentage', 100, 1, 1, 'code',
--     '[{"type": "seasonal", "allowedCategories": ["Weekday", "Peak-Weekday"]}, {"type": "applied_discount", "max": "1680000"}]', 
--     'month', '3', TRUE, TRUE
-- );
