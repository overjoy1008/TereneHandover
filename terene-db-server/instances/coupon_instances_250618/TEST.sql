DELETE FROM coupon_instances_250618;

INSERT INTO coupon_instances_250618 (
    coupon_instance_id, coupon_definition_id, coupon_code, status,
    membership_number, issued_at, coupon_due, sender_info, receiver_info
)
VALUES
-- 평일 쿠폰 13개
('CI-250717-0300-24wd0001', 'CD-250717-0300-24wd0000', NULL, 'available',
 'A-00000002', '2025-05-01 00:00:00+09', '2026-04-30 23:59:00+09',
 '{"is_vaadd": true, "membership_number": null, "name": null, "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}'),
('CI-250717-0300-24wd0002', 'CD-250717-0300-24wd0000', NULL, 'available',
 'A-00000002', '2025-05-01 00:00:00+09', '2026-04-30 23:59:00+09',
 '{"is_vaadd": true, "membership_number": null, "name": null, "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}'),
('CI-250717-0300-24wd0003', 'CD-250717-0300-24wd0000', NULL, 'available',
 'A-00000002', '2025-05-01 00:00:00+09', '2026-04-30 23:59:00+09',
 '{"is_vaadd": true, "membership_number": null, "name": null, "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}'),

-- 주말 쿠폰 6개
('CI-250717-0300-24we0001', 'CD-250717-0300-24we0000', NULL, 'available',
 'A-00000002', '2025-05-01 00:00:00+09', '2026-04-30 23:59:00+09',
 '{"is_vaadd": true, "membership_number": null, "name": null, "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}');






INSERT INTO coupon_instances_250618 (
    coupon_instance_id, coupon_definition_id, coupon_code, status,
    membership_number, issued_at, coupon_due, sender_info, receiver_info
)
VALUES
-- 재방문 할인쿠폰 인스턴스
('CI-250801-0300-REBATE01', 'CD-250730-0700-REBATE10', 'REVISIT10CODE001', 'available',
 'A-00000002', '2025-08-01 03:00:00+09', '2025-12-31 23:59:59+09',
 '{"is_vaadd": true, "membership_number": "A-00000001", "name": "관리자", "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}'),

-- 평일 1박 무료숙박권 인스턴스
('CI-250801-0300-FREEWD01', 'CD-250730-0700-FREEWD01', 'WEEKDAYFREE001', 'available',
 'A-00000002', '2025-08-01 03:00:00+09', '2025-09-30 23:59:59+09',
 '{"is_vaadd": true, "membership_number": "A-00000001", "name": "관리자", "birthdate": null, "contact": null}',
 '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}');







INSERT INTO coupon_definitions_250618 (
    coupon_definition_id, name, description,
    discount_type, discount_value, scope, counter, type,
    conditions_json, validity_type, validity_value, refillable, enabled
)
VALUES (
    'CD-250731-0700-FIX100K', '10만원 할인쿠폰', '단일 사용 10만원 할인 쿠폰',
    'fixed', 100000, -1, 1, 'code',
    null, 'month', '3', TRUE, TRUE
);
INSERT INTO coupon_instances_250618 (
    coupon_instance_id, coupon_definition_id, coupon_code, status,
    membership_number, issued_at, coupon_due, sender_info, receiver_info
)
VALUES (
    'CI-250731-0700-FIX00001', 'CD-250731-0700-FIX100K', 'FIX100KCODE001', 'available',
    'A-00000002', '2025-07-31 07:00:00+09', '2025-10-31 23:59:59+09',
    '{"is_vaadd": true, "membership_number": "A-00000001", "name": "관리자"}',
    '{"membership_number": "A-00000002", "name": "박경빈", "birthdate": "20011008", "contact": "010-2370-5710"}'
);
