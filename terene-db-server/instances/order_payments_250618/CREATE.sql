CREATE TABLE order_payments_250618 (
    payment_id VARCHAR(20) PRIMARY KEY,  -- 결제 번호 (예시: P-250527-1143-000000)
    payment_type VARCHAR(30),  -- 결제 유형 (예: order, settlement, refund, others)

    order_id VARCHAR(20) NOT NULL REFERENCES orders_250618(order_id),  -- 예약번호

    payment_info JSONB NOT NULL,  -- 결제자 정보
    -- {
    --   "same_as_reserver": true,
    --   "name": "홍길동",
    --   "birthdate": "19900101",
    --   "contact": "010-1234-5678"
    -- }

    payment_method VARCHAR(50) NOT NULL,  -- 결제 수단
    -- 'bank_transfer' / 'Free' / 'Toss Payments' / 'Toss Payments Refund' / 'Foreign Card' / 'Foregin Card Refund' / 'Admin Bypass'

    payment_account JSONB,  -- 결제 계좌 정보
    -- {
    --   "is_vaadd": false,
    --   "account_holder": "홍길동",
    --   "bank_name": "KB국민은행",
    --   "account_number": "12345678901234"
    -- }
    receiver_account JSONB,  -- 받는 사람 정보
    -- {
    --   "is_vaadd": false,
    --   "account_holder": "홍길동",
    --   "bank_name": "KB국민은행",
    --   "account_number": "12345678901234"
    -- }

    payment_due TIMESTAMP,  -- 결제 유효 기한

    price_paid NUMERIC NOT NULL,  -- 실 결제 금액

    payment_status VARCHAR(20) NOT NULL CHECK (
        payment_status IN ('pending', 'processing', 'completed', 'error')
    ),  -- 결제 상태 (결제 도중 취소 혹은 존재하지 않은 결제로 판단 시 error 처리)
    payment_history JSONB NOT NULL  -- 결제 상태 변경 이력
    -- [
    --   { "status": "pending", "timestamp": "2025-04-30T09:00:00Z" },
    --   { "status": "processing", "timestamp": "2025-04-30T09:10:00Z" },
    --   { "status": "completed", "timestamp": "2025-04-30T09:12:00Z" }
    -- ]
);
