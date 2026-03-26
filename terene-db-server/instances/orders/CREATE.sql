CREATE TABLE orders (
    order_id VARCHAR(20) PRIMARY KEY,  -- 주문 ID
    membership_number VARCHAR(10),  -- NULL이면 비회원 주문
    order_product VARCHAR(200) NOT NULL,  -- 주문 상품
    start_date VARCHAR(10) NOT NULL,  -- 출발일 (예: '2025-05-01')
    end_date VARCHAR(10) NOT NULL,  -- 도착일 (예: '2025-05-03')

    reserver_name VARCHAR(100) NOT NULL,
    reserver_birthdate VARCHAR(8) NOT NULL,
    reserver_contact VARCHAR(30) NOT NULL,
    reserver_email VARCHAR(100) NOT NULL,

    payment_status VARCHAR(20) NOT NULL CHECK (
        payment_status IN ('pending', 'accepted', 'cancelled', 'refunded')
    ),  -- 결제 상태
    payment_timeline JSONB NOT NULL,  -- 주문/승인/취소/환불 날짜/시간

    stay_status VARCHAR(20) NOT NULL CHECK (
        stay_status IN ('before_checkin', 'checked_in', 'checked_out')
    ),  -- 입실 상태
    stay_timeline JSONB NOT NULL,  -- 입실/퇴실 시간 정보    

    adult NUMERIC NOT NULL,  -- 성인 인원
    child NUMERIC NOT NULL,  -- 아동 인원
    order_details JSONB NOT NULL,  -- 요청사항, 기념일, 약관 동의, 추가 서비스 등

    final_price NUMERIC NOT NULL,  -- 최종 결제 금액
    receipt JSONB NOT NULL,  -- 가격 리스트 (기존 price → receipt로 변경)
    coupons JSONB,  -- 쿠폰 리스트

    refund_info JSONB, -- 환불 정보

    FOREIGN KEY (membership_number) REFERENCES customers (membership_number)
);
