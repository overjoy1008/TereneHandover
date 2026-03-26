-- 1. 회원 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES (
    'member_discount_50', 1, 'UNMU 회원 50% 할인', '회원가 50% off',
    'percentage', 50, 'per_stay',
    'global', NULL, NULL,
    '[
        { "type": "membership", "members": ["UNMU 6", "UNMU 9", "UNMU 12", "UNMU 24"] }
    ]',
    TRUE
);

-- 2. Early Bird 20%
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES (
    'early_bird_20', 2, '가오픈 기념 20% 할인', '가오픈 기념 20% off (25년 8월 31일까지)',
    'percentage', 20, 'per_stay',
    'global', NULL, NULL,
    '[
        { "type": "date", "endDate": "2025-08-31" }
    ]',
    TRUE
);

-- 3. 연박 2박 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES (
    'relay_discount_2days', 3, '연박 할인', '2박 예약 시 10% off',
    'percentage', 10, 'per_stay',
    'global', NULL, NULL,
    '[
        { "type": "relay", "min": 2, "max": 2 }
    ]',
    TRUE
);

-- 4. 연박 3박 이상 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES (
    'relay_discount_3days', 4, '연박 할인', '3박 이상 예약 시 10% off',
    'percentage', 10, 'per_stay',
    'global', NULL, NULL,
    '[
        { "type": "relay", "min": 3 }
    ]',
    TRUE
);

-- 5. 코드 쿠폰: SUMMER25
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES (
    'code_summer25', 5, 'Summer Code 25%', '코드 할인 (SUMMER25)',
    'percentage', 25, 'per_stay',
    'code', NULL, 'SUMMER25',
    '[
        { "type": "date", "startDate": "2025-07-01", "endDate": "2025-09-01" },
        { "type": "seasonal", "allowedCategories": ["Weekend", "Peak-Weekend"] }
    ]',
    TRUE
);

-- 6. 임직원용 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES 
('a_user_coupon_1', 6, 'A-임직원용 할인 1', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'EXECUTIVE30OFFA001', '[]', TRUE),
('a_user_coupon_2', 7, 'A-임직원용 할인 2', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'EXECUTIVE30OFFA002', '[]', TRUE),
('a_user_coupon_3', 8, 'A-임직원용 할인 3', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'EXECUTIVE30OFFA003', '[]', TRUE),
('a_user_coupon_4', 9, 'A-임직원용 할인 4', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'EXECUTIVE30OFFA004', '[]', TRUE),
('a_user_coupon_5', 10, 'A-임직원용 할인 5', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'EXECUTIVE30OFFA005', '[]', TRUE);

-- 7. 회원용 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES 
('u_user_coupon_1', 11, 'U-회원용 할인 1', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'USER30OFFUBASIC01', '[]', TRUE),
('u_user_coupon_2', 12, 'U-회원용 할인 2', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'USER30OFFUBASIC02', '[]', TRUE),
('u_user_coupon_3', 13, 'U-회원용 할인 3', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'USER30OFFUBASIC03', '[]', TRUE),
('u_user_coupon_4', 14, 'U-회원용 할인 4', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'USER30OFFUBASIC04', '[]', TRUE),
('u_user_coupon_5', 15, 'U-회원용 할인 5', '영수증에 보일 문구', 'percentage', 30, 'per_stay', 'personal', NULL, 'USER30OFFUBASIC05', '[]', TRUE);

-- 8. 영업용 할인
INSERT INTO coupons (
    id, priority, name, description,
    discount_type, discount_value, scope,
    type, allowed_members, code,
    conditions_json, enabled
) VALUES 
('u_market_coupon_1', 16, '일반 영업용 할인 1', '영수증에 보일 문구', 'percentage', 10, 'per_stay', 'personal', NULL, 'MARKET10SALED001', '[]', TRUE),
('u_market_coupon_2', 17, '일반 영업용 할인 2', '영수증에 보일 문구', 'percentage', 10, 'per_stay', 'personal', NULL, 'MARKET10SALED002', '[]', TRUE),
('u_market_coupon_3', 18, '일반 영업용 할인 3', '영수증에 보일 문구', 'percentage', 10, 'per_stay', 'personal', NULL, 'MARKET10SALED003', '[]', TRUE),
('u_market_coupon_4', 19, '일반 영업용 할인 4', '영수증에 보일 문구', 'percentage', 10, 'per_stay', 'personal', NULL, 'MARKET10SALED004', '[]', TRUE),
('u_market_coupon_5', 20, '일반 영업용 할인 5', '영수증에 보일 문구', 'percentage', 10, 'per_stay', 'personal', NULL, 'MARKET10SALED005', '[]', TRUE);