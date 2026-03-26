INSERT INTO mileages_250618 (
    mileage_id,
    membership_number,
    issued_at,
    mileage_amount,
    mileage_type,
    description,
    mileage_due,
    order_id
) VALUES (
    'MI-250618-0001-00000001',
    'U-98765432',
    '2025-07-15 14:32:00',
    1000,
    'accumulate',
    '숙박 적립',
    '2026-07-15 23:59:59',
    NULL
);

INSERT INTO mileages_250618 (
    mileage_id,
    membership_number,
    issued_at,
    mileage_amount,
    mileage_type,
    description,
    mileage_due,
    order_id
) VALUES (
    'MI-250618-0002-00000002',
    'U-98765432',
    '2025-07-16 09:10:00',
    -200,
    'use',
    '예약 사용',
    NULL,
    NULL
);

--------------------------

INSERT INTO mileages_250618 (
    mileage_id,
    membership_number,
    issued_at,
    mileage_amount,
    mileage_type,
    description,
    mileage_due,
    order_id
) VALUES (
    'MI-250618-0003-00000003',
    'A-00000002',
    '2025-07-16 10:00:00',
    -800,
    'expire',
    '유효기간 만료',
    NULL,
    NULL
);
