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


## Directory Structure

```text
terene-toss-server-api/
├─ node_modules/
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ index.js
├─ package-lock.json
└─ package.json
```
