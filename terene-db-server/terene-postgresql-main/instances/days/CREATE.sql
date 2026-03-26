CREATE TABLE days (
    date VARCHAR(20) PRIMARY KEY,
    category VARCHAR(20) CHECK (
        category IN (
            'Weekday',
            'Weekend',
            'Peak-Weekday',
            'Peak-Weekend'
        )
    ),
    is_holiday BOOLEAN NOT NULL,

    -- 입실 정보
    checkin JSONB,
    -- 퇴실 정보
    checkout JSONB
);

