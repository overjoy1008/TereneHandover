CREATE TABLE order_refunds_250618 (
    refund_id VARCHAR(20) PRIMARY KEY,  -- 환불 번호 (예시: R-250527-1143-000000)

    order_id VARCHAR(20) NOT NULL REFERENCES orders_250618(order_id),  -- 예약번호
    payment_id VARCHAR(20) NOT NULL REFERENCES order_payments_250618(payment_id),  -- 최소 완료된 결제 내역 참조

    refund_price NUMERIC NOT NULL,  -- 환불 금액
    refund_details JSONB,  -- 환불 정책 상세
    -- {
    --   "days_before_checkin": 5,
    --   "discounted_w_vat": 5000,
    --   "service_w_vat": 2000,
    --   "deposit": 3000
    -- }

    refund_status VARCHAR(20),  -- 환불 상태

    refund_history JSONB NOT NULL  -- 환불 이력
    -- [
    --   { "status": "pending", "timestamp": "2025-05-01T12:00:00Z" },
    --   { "status": "processing", "timestamp": "2025-05-01T14:00:00Z" },
    --   { "status": "completed", "timestamp": "2025-05-03T11:00:00Z" }
    -- ]
);
