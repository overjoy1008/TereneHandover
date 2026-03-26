# TERENE Workspace Overview

이 워크스페이스는 TERENE 운영에 필요한 프론트엔드 코드와 3개의 API 서버를 함께 정리한 디렉토리입니다.
- 각 디렉토리에 대한 상세 설명은 디렉토리 내부의 README.md에 각각 담아두었습니다.
- 이 워크스페이스는 두개의 branch가 존재합니다:
  1. main:
    - 더이상 쓰이지 않는 코드가 삭제된 최적화 버전의 코드입니다.
  2. original:
    - terene-framer-frontend 코드는 Framer 사이트에서 2026/03/26 오후 4시 시점의 코드가 담겨있습니다.
    - terene-db-server, terene-notifier-server, terene-toss-server-api 코드는 2026/02/06에 `vaadd-architects` Github 계정으로 옮긴 시점을 기준으로 담겨있습니다.


## 1. `terene-framer-frontend`

Framer의 `Assets` 탭 아래 `Code` 섹션에서 사용하던 코드만 모아둔 디렉토리입니다. Framer는 디자이너 친화적인 서비스이지만, GitHub 연동, 외부 라이브러리 설치, DB 직접 연동 같은 일반적인 개발 기능은 지원하지 않습니다. 대신 `code override`와 `code component` 기능 및 `.tsx`, `.ts` 등의 파일 형식은 지원하므로, 이를 이용해 TERENE 사이트에 필요한 예약, 결제, 로그인, 회원, 관리자 페이지 관련 기능을 구현했습니다.

- 위젯, 버튼, 테이블, 입력 폼, 상태 표시 UI 등 실제 화면에서 필요한 대부분의 동작이 이 디렉토리 안의 코드로 구성됩니다.
- 외부 시스템 연동은 Framer 내부 기능으로 처리하는 것이 아니라 `fetch`를 통해 API 서버에 요청하는 방식으로 구성했습니다.
- 이를 통해 PostgreSQL, SOLAPI, Toss Payments 같은 외부 서비스와 연결되도록 만들었습니다.
- Framer에서는 React의 `useState` 대신 `useStore`를 중심으로 상태를 관리합니다.
- 로그인한 회원 정보, 성인/아동 인원 수, 멤버십 적용 상태, 쿠폰/마일리지 사용 상태, 예약 관련 선택값 등 주요 상태는 모두 `useStore`를 통해 유지됩니다.


## 2. `terene-db-server`

PostgreSQL 데이터베이스와 직접 통신하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

- 조회, 추가, 수정, 삭제 등 데이터 처리 기능을 담당합니다.
- 예약 정보, 회원 정보, 쿠폰, 마일리지, 관리자 설정, 일정 관련 데이터 등 서비스 운영에 필요한 주요 데이터를 다룹니다.
- Framer 프론트엔드는 데이터베이스에 직접 접근할 수 없기 때문에, 이 서버를 통해 필요한 정보를 읽고 저장합니다.

### Environment (`.env`)

- `DATABASE_URL`
  - 역할: PostgreSQL 연결 문자열입니다.
  - 형식: `postgresql://`로 시작하는 링크
  - Render에서 배포한 PostgreSQL(`TERENE`)의 `External Database URL`을 사용합니다.


## 3. `terene-notifier-server`

예약 후속 처리와 알림 발송 관련 작업을 담당하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

- `cron`을 통해 30분마다 DB를 점검합니다.
- 체크인/체크아웃 관련 상태를 확인하고 필요한 업데이트를 수행 후 알림톡 전송 등 후속 작업을 처리합니다.
- Framer에서 들어오는 예약 관련 요청을 미리 정의된 A/C/E/F/G 등 use case 단위로 처리합니다.
- 각 use case에 따라 캘린더, 회원, 쿠폰 등 관련 테이블 업데이트를 수행 후 SOLAPI를 이용해 알림톡을 발송합니다.
- Framer에서 use case에 맞는 요청이 들어오면 Queue에 넣고 순서대로 처리하는 구조를 사용합니다.

### Environment (`.env`)

- `SENDER_EMAIL_USER`
  - 역할: 이메일 발송에 사용할 발신자 이메일 주소입니다.
  - 형식: `name@example.com` 등 이메일 문자열
  - 어디서 가져오나:
  - 실제 발송에 사용할 Gmail 또는 메일 서비스 계정 주소를 사용합니다.
- `SENDER_EMAIL_PASS`
  - 역할: 위 이메일 계정으로 SMTP 발송할 때 사용하는 비밀번호 또는 앱 비밀번호입니다.
  - 형식: `xxxx xxxx xxxx xxxx` 등 소문자 16자리 문자열
  - Gmail을 쓴다면 일반 계정 비밀번호가 아니라 Google App Password를 사용합니다.
  - 사용 중인 메일 서비스가 다르면 해당 서비스의 SMTP 비밀번호 또는 앱 비밀번호를 사용합니다.
- `SENDER_PHONE`
  - 역할: SOLAPI 문자/알림톡 발신 번호입니다.
  - 형식: `02-XXXX-XXXX`
  - SOLAPI 콘솔에 등록 및 인증된 발신번호를 사용합니다.
- `SOLAPI_API_KEY`
  - 역할: SOLAPI API 호출용 키입니다.
  - 형식: 대문자 및 숫자로 이루어진 16자리 문자열
  - SOLAPI 콘솔의 API Key 관리 화면에서 발급받습니다.
- `SOLAPI_API_SECRET`
  - 역할: SOLAPI API 호출용 시크릿입니다.
  - 형식: 대문자 및 숫자로 이루어진 16자리 문자열
  - SOLAPI 콘솔의 API Key 관리 화면에서 발급받습니다.


## 4. `terene-toss-server-api`

Toss Payments 결제 확인을 위해 별도로 운영하는 API 서버이며, GitHub와 연동 및 Render에 배포되어 운영되고 있습니다.

 - Framer만으로는 Toss Payments 결제 완료 이후의 서버 측 확인과 `confirm` 처리를 안정적으로 수행할 수 없으므로 이 디렉토리가 별도의 API 역할을 담당합니다.
- 해당 API는 Toss Payments API와 통신하여 결제가 정상적으로 승인되었는지 확인하며, 프론트엔드에서 직접 처리하기 어려운 결제 검증 단계를 서버에서 처리합니다.

### Environment (`.env`)

- `TOSS_SECRET_KEY`
  - 역할: Toss Payments 실결제(=라이브 결제)용 secret key입니다.
  - 형식: `live_gsk_`로 시작하는 문자열
  - Toss Payments 개발자 콘솔에서 live secret key를 발급받아 사용합니다.
- `TOSS_SECRET_TEST_KEY`
  - 역할: Toss Payments 테스트 결제용 secret key입니다.
  - 형식: `test_gsk_`로 시작하는 문자열
  - Toss Payments 개발자 콘솔에서 test secret key를 발급받아 사용합니다.