# terene-framer-frontend

Framer의 `Assets` 탭 아래 `Code` 섹션에서 사용하던 코드만 모아둔 디렉토리입니다. Framer는 디자이너 친화적인 서비스이지만, GitHub 연동, 외부 라이브러리 설치, DB 직접 연동 같은 일반적인 개발 기능은 지원하지 않습니다. 대신 `code override`와 `code component` 기능 및 `.tsx`, `.ts` 등의 파일 형식은 지원하므로, 이를 이용해 TERENE 사이트에 필요한 예약, 결제, 로그인, 회원, 관리자 페이지 관련 기능을 구현했습니다.

- 위젯, 버튼, 테이블, 입력 폼, 상태 표시 UI 등 실제 화면에서 필요한 대부분의 동작이 이 디렉토리 안의 코드로 구성됩니다.
- 외부 시스템 연동은 Framer 내부 기능으로 처리하는 것이 아니라 `fetch`를 통해 API 서버에 요청하는 방식으로 구성했습니다.
- 이를 통해 PostgreSQL, SOLAPI, Toss Payments 같은 외부 서비스와 연결되도록 만들었습니다.
- Framer에서는 React의 `useState` 대신 `useStore`를 중심으로 상태를 관리합니다.
- 로그인한 회원 정보, 성인/아동 인원 수, 멤버십 적용 상태, 쿠폰/마일리지 사용 상태, 예약 관련 선택값 등 주요 상태는 모두 `useStore`를 통해 유지됩니다.

## Directory Structure

```text
terene-framer-frontend/
├─ Auth/
├─ Calendar/
├─ Components/
├─ ContactForm/
├─ Legacy Before 250928/
├─ Notifier/
├─ Receipt/
├─ Store/
├─ Table/
├─ TossPayments/
└─ Utils/
```

## Historical / No Longer Used Code

- `Legacy Before 250928/`
  - 과거 버전 백업 코드가 들어 있는 디렉토리입니다.
- 파일명 끝이 `_1231`, `_0109`, `_0108`, `_1`, `_2` 등으로 끝나는 파일들
  - 날짜 또는 임시 분기 시점 기준으로 복사된 히스토리성 코드입니다.
  - 예:
  - `Calendar/CalendarContainer_1231.tsx`
  - `Calendar/DayComponent_0109.tsx`
  - `Receipt/PriceDisplay_1231.tsx`
  - `Table/Orders/OrdersTableLogic_1.tsx`
  - `Table/Orders/RefundPopup_1.tsx`
- 파일명에 `legacy`가 포함된 코드
  - 예: `TossPayments/CheckoutPage_legacy.tsx`
