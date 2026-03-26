# terene-notifier-server

예약 후속 처리와 알림 발송 관련 작업을 담당하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

- `cron`을 통해 30분마다 DB를 점검합니다.
- 체크인/체크아웃 관련 상태를 확인하고 필요한 업데이트를 수행 후 알림톡 전송 등 후속 작업을 처리합니다.
- Framer에서 들어오는 예약 관련 요청을 미리 정의된 A/C/E/F/G 등 use case 단위로 처리합니다.
- 각 use case에 따라 캘린더, 회원, 쿠폰 등 관련 테이블 업데이트를 수행 후 SOLAPI를 이용해 알림톡을 발송합니다.
- Framer에서 use case에 맞는 요청이 들어오면 Queue에 넣고 순서대로 처리하는 구조를 사용합니다.

## Environment (`.env`)

- `SENDER_EMAIL_USER`
  - 역할: 이메일 발송에 사용할 발신자 이메일 주소입니다.
  - 형식: `name@example.com` 등 이메일 문자열
  - 실제 발송에 사용할 Gmail 또는 메일 서비스 계정 주소를 사용합니다.
- `SENDER_EMAIL_PASS`
  - 역할: 위 이메일 계정으로 SMTP 발송할 때 사용하는 비밀번호 또는 앱 비밀번호입니다.
  - 형식: `xxxx xxxx xxxx xxxx` 등 소문자 16자리 문자열
  - Gmail을 쓴다면 일반 계정 비밀번호가 아니라 Google App Password를 사용합니다.
- `SENDER_PHONE`
  - 역할: SOLAPI 문자/알림톡 발신 번호입니다.
  - 형식: `02-XXXX-XXXX`
  - SOLAPI 콘솔에 등록 및 인증된 발신번호를 사용합니다.
- `SOLAPI_API_KEY`
  - 역할: SOLAPI API 호출용 키입니다.
  - 형식: 대문자 및 숫자로 이루어진 문자열
  - SOLAPI 콘솔의 API Key 관리 화면에서 발급받습니다.
- `SOLAPI_API_SECRET`
  - 역할: SOLAPI API 호출용 시크릿입니다.
  - 형식: 대문자 및 숫자로 이루어진 문자열
  - SOLAPI 콘솔의 API Key 관리 화면에서 발급받습니다.

## Directory Structure

```text
terene-notifier-server/
├─ cron/
├─ queue/
├─ routes/
├─ templates/
├─ utils/
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ index.js
├─ package-lock.json
└─ package.json
```

## Historical / No Longer Used Code

- `cron/scheduler.duplicate.js`
  - 파일명 기준으로 중복/백업 성격의 파일입니다.
- `routes/*.v2.js`
  - 버전 분리 과정에서 남아 있는 이행용 코드일 가능성이 있는 파일들입니다.
  - 예:
  - `routes/email.v2.js`
  - `routes/kakao.v2.js`
  - `routes/sms.v2.js`
