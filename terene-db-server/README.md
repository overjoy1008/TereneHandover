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

## Historical / No Longer Used Code

- `instances/` 아래의 날짜형 디렉토리들은 마이그레이션 기록 또는 시점별 SQL 스냅샷 성격의 파일입니다.
- 예:
  - `instances/customers_250618/`
  - `instances/coupon_instances_250618/`
  - `instances/order_settlements_250618/`
  - `instances/patch_250928/`
- `src/routes/test.routes.js`, `src/controllers/test.controller.js`, `src/services/test.service.js`
  - 이름 기준으로 테스트/검증 목적 파일로 보이며, 운영 핵심 경로와는 구분해서 보는 편이 좋습니다.
