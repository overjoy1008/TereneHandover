CREATE TABLE order_settlements_250618 (
    settlement_id VARCHAR(20) PRIMARY KEY,  -- 정산 번호 (예시: S-250527-1143-000000)
    settlement_type VARCHAR(20) NOT NULL CHECK (
        settlement_type IN ('deposit_refund', 'additional_payment', 'others')
    ),  -- 정산 유형

    order_id VARCHAR(20) NOT NULL REFERENCES orders_250618(order_id),  -- 예약번호

    additional_price NUMERIC NOT NULL,  -- 추가 결제 금액 (0 이상)

    settlement_amount NUMERIC NOT NULL,  -- 총 정산 금액

    settlement_breakdown VARCHAR(1000),  -- 정산 내역

    settlement_status VARCHAR(20) NOT NULL CHECK (
        settlement_status IN ('pending', 'processing', 'completed')
    ),  -- 정산 상태

    settlement_url VARCHAR(200),  -- 추가 결제 URL

    settlement_history JSONB NOT NULL  -- 정산 이력
    -- [
    --   { "status": "pending", "timestamp": "2025-05-03T12:00:00Z" },
    --   { "status": "processing", "timestamp": "2025-05-04T08:00:00Z" },
    --   { "status": "completed", "timestamp": "2025-05-04T09:00:00Z" }
    -- ]
);
