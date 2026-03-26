CREATE TABLE holidays (
    date VARCHAR(20) PRIMARY KEY,
    category VARCHAR(20) CHECK (
        category IN (
            'Weekday',
            'Weekend',
            'Peak-Weekday',
            'Peak-Weekend'
        )
    )
);
