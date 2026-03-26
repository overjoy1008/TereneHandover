CREATE TABLE order_cancellations_250618 (
    cancellation_id VARCHAR(20) PRIMARY KEY,  -- 취소 번호 (예시: C-250527-1143-000000)

    order_id VARCHAR(20) NOT NULL REFERENCES orders_250618(order_id),  -- 예약번호

    cancel_person VARCHAR(20) NOT NULL CHECK (
        cancel_person IN ('customer', 'admin')
    ),  -- 취소 구분

    cancel_type VARCHAR(30) NOT NULL,  -- 취소 유형 (예: unpaid_cancel, paid_cancel) (paid_cancel의 경우 order_refunds 생성 필수)

    cancel_status VARCHAR(20),  -- 취소 상태 (예: pending, processing, completed)

    cancel_history JSONB NOT NULL  -- 취소 이력
    -- [
    --   { "status": "pending", "timestamp": "2025-04-30T10:00:00Z" },
    --   { "status": "processing", "timestamp": "2025-04-30T10:30:00Z" },
    --   { "status": "completed", "timestamp": "2025-04-30T11:00:00Z" }
    -- ]
);
