# terene-toss-server-api

Toss Payments 결제 확인을 위해 별도로 운영하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

- Framer만으로는 Toss Payments 결제 완료 이후의 서버 측 확인과 `confirm` 처리를 안정적으로 수행할 수 없으므로 이 디렉토리가 별도의 API 역할을 담당합니다.
- 해당 API는 Toss Payments API와 통신하여 결제가 정상적으로 승인되었는지 확인하며, 프론트엔드에서 직접 처리하기 어려운 결제 검증 단계를 서버에서 처리합니다.

## Environment (`.env`)

- `TOSS_SECRET_KEY`
  - 역할: Toss Payments 실결제(=라이브 결제)용 secret key입니다.
  - 형식: `live_gsk_`로 시작하는 문자열
  - Toss Payments 개발자 콘솔에서 live secret key를 발급받아 사용합니다.
- `TOSS_SECRET_TEST_KEY`
  - 역할: Toss Payments 테스트 결제용 secret key입니다.
  - 형식: `test_gsk_`로 시작하는 문자열
  - Toss Payments 개발자 콘솔에서 test secret key를 발급받아 사용합니다.

## Docker

- Build Command: `npm install`
- Start Command: `npm start`
- 기본 포트: `4000`

## Local Testing

```bash
docker build -t terene-toss-server-api .
docker run --rm -p 4000:4000 --env-file .env terene-toss-server-api
```

- 로컬에서 Docker로 테스트할 때는 `.env` 파일에 `TOSS_SECRET_KEY`, `TOSS_SECRET_TEST_KEY`를 넣어야 합니다.
- Render에서는 `PORT`가 자동으로 들어오지만, 로컬 Docker 테스트에서는 컨테이너 기본 포트를 `4000`으로 사용하면 됩니다.

## Directory Structure

```text
terene-toss-server-api/
├─ node_modules/
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ .dockerignore
├─ Dockerfile
├─ index.js
├─ package-lock.json
└─ package.json
```

## Directory / File Notes

- `index.js`
  - 이 디렉토리의 실제 실행 진입점입니다.
  - Express 서버를 띄우고, CORS와 JSON body 파싱을 설정합니다.
  - `.env`에서 `TOSS_SECRET_KEY`, `TOSS_SECRET_TEST_KEY`, `PORT`를 읽습니다.
  - `/confirm` POST 엔드포인트를 통해 Toss Payments 결제 확인 API를 호출합니다.
  - `paymentKey`가 테스트 결제인지 확인해서 live key 또는 test key를 구분해 사용합니다.
  - 최종적으로 Toss Payments의 confirm 결과를 그대로 받아 프론트엔드에 응답합니다.