# terene-db-server

PostgreSQL 데이터베이스와 직접 통신하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

- 조회, 추가, 수정, 삭제 등 데이터 처리 기능을 담당합니다.
- 예약 정보, 회원 정보, 쿠폰, 마일리지, 관리자 설정, 일정 관련 데이터 등 서비스 운영에 필요한 주요 데이터를 다룹니다.
- Framer 프론트엔드는 데이터베이스에 직접 접근할 수 없기 때문에, 이 서버를 통해 필요한 정보를 읽고 저장합니다.

## Environment (`.env`)

- `DATABASE_URL`
  - 역할: PostgreSQL 연결 문자열입니다.
  - 형식: `postgresql://`로 시작하는 링크
  - Render에서 배포한 PostgreSQL(`TERENE`)의 `External Database URL`을 사용합니다.

## Docker

- Build Command: `npm install`
- Start Command: `npm run start`
- 기본 포트: `3001`

## Local Testing

```bash
docker build -t terene-db-server .
docker run --rm -p 3001:3001 --env-file .env terene-db-server
```

- 로컬에서 Docker로 테스트할 때는 `.env` 파일에 `DATABASE_URL`을 넣어야 합니다.
- Render에서는 `PORT`가 자동으로 들어오지만, 로컬 Docker 테스트에서는 컨테이너 기본 포트를 `3001`로 사용하면 됩니다.

## Read-only Checks

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/v2/customers
curl http://localhost:3001/api/v3/settings
```

- `/api/health`
  - 가장 안전한 헬스체크용 엔드포인트입니다.
- `/api/v2/customers`
  - 회원 데이터를 읽기 전용으로 확인할 수 있습니다.
- `/api/v3/settings`
  - 관리자 설정 데이터를 읽기 전용으로 확인할 수 있습니다.
- 환경에 따라 실제 데이터가 비어 있거나, DB 연결이 되지 않으면 오류가 날 수 있습니다.

## Directory Structure

```text
terene-db-server/
├─ instances/
├─ src/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  └─ services/
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ .dockerignore
├─ Dockerfile
├─ package-lock.json
├─ package.json
└─ server.js
```

## Directory / File Notes

- `server.js`
  - 서버 실행 진입점입니다.
  - Express 앱을 띄우고 `PORT` 또는 기본 포트 `3001`로 서버를 실행합니다.
- `instances/`
  - DB에 존재하는 테이블의 스키마와 예시 인스턴스를 포함합니다.
  - v2에 추가된 테이블은 전부 *_250618/에, v3에서 추가된 테이블은 전부 patch_250928/에 있습니다.
- `src/app.js`
  - 공통 Express 설정과 라우터 연결을 담당합니다.
- `src/models/db.js`
  - PostgreSQL 연결 설정을 담당합니다.
  - `.env`의 `DATABASE_URL`을 읽어 DB connection pool을 생성합니다.
- `src/controllers/`
  - 각 API 요청/응답 처리 계층입니다. entities(v2)와 v3가 존재합니다.
- `src/services/`
  - 실제 SQL 실행과 비즈니스 로직을 담당하는 계층입니다. entities(v2)와 v3가 존재합니다.
- `src/routes/`
  - 각 엔드포인트 경로를 정의하는 라우터 계층입니다. entities(v2)와 v3가 존재합니다.

## Reservation Domain (v2)

- 예약
  - 테이블/스키마 기준: `instances/orders_250618/`
  - API 기준: `/api/v2/orders`
- 예약 결제
  - 테이블/스키마 기준: `instances/order_payments_250618/`
  - API 기준: `/api/v2/payments`
- 예약 취소
  - 테이블/스키마 기준: `instances/order_cancellations_250618/`
  - API 기준: `/api/v2/cancellations`
- 예약 환불
  - 테이블/스키마 기준: `instances/order_refunds_250618/`
  - API 기준: `/api/v2/refunds`
- 예약 정산
  - 테이블/스키마 기준: `instances/order_settlements_250618/`
  - API 기준: `/api/v2/settlements`
- 쿠폰 유형 정의
  - 테이블/스키마 기준: `instances/coupon_definitions_250618/`
  - API 기준: `/api/v2/coupon-definitions`
- 쿠폰 인스턴스
  - 테이블/스키마 기준: `instances/coupon_instances_250618/`
  - API 기준: `/api/v2/coupon-instances`
- 마일리지
  - 테이블/스키마 기준: `instances/mileages_250618/`
  - API 기준: `/api/v2/mileages`
- 회원
  - 테이블/스키마 기준: `instances/customers_250618/`
  - API 기준: `/api/v2/customers`

## Admin Settings Domain (v3)

- 관리자 설정 관련 스키마는 주로 `instances/patch_250928/` 기준으로 정리되어 있습니다.
- 캘린더
  - 테이블/스키마 기준: `days_250928`
  - API 기준: `/api/v3/days`
- 날짜 분류 카테고리
  - 테이블/스키마 기준: `days_category`
  - API 기준: `/api/v3/days-category`
- 장소 정보
  - 테이블/스키마 기준: `locations`
  - API 기준: `/api/v3/locations`
- N일 전까지 환불 금액 규칙
  - 테이블/스키마 기준: `refund_policy`
  - API 기준: `/api/v3/refund-policy`
- 패키지 및 추가서비스
  - 테이블/스키마 기준: `additional_services`
  - API 기준: `/api/v3/additional-services`
- 멤버쉽 별(TERENE 6/9/12/24) 예약 규정
  - 테이블/스키마 기준: `memberships`
  - API 기준: `/api/v3/memberships`
- 그외 관리자용 설정들
  - 테이블/스키마 기준: `settings`
  - API 기준: `/api/v3/settings`

## Historical / No Longer Used Code

- instances/coupons/
- instances/customers/
- instances/days/
- instances/holidays/
- instances/orders/
- src/routes/coupon.routes.js, src/controllers/coupon.controller.js, src/services/coupon.service.js
- src/routes/customer.routes.js, src/controllers/customer.controller.js, src/services/customer.service.js
- src/routes/day.routes.js, src/controllers/day.controller.js, src/services/day.service.js
- src/routes/holiday.routes.js, src/controllers/holiday.controller.js, src/services/holiday.service.js
- src/routes/order.routes.js, src/controllers/order.controller.js, src/services/order.service.js
- src/routes/test.routes.js, src/controllers/test.controller.js, src/services/test.service.js