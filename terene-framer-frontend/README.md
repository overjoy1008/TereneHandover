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

## Directory / File Notes

- `Auth/`
  - 로그인 및 유지(CheckAuth), 비회원 조회(Nonmember), 비밀번호 재설정(Password) 등 인증 관련 코드가 들어 있습니다.
  - 특히 CheckAuth.tsx에는 Framer 사이트가 로그인 상태를 유지하고 예약자/쿠폰/가격 정보 등 저장값(store)을 다음 페이지로 전달하기 위한 코드들이 모여있습니다.
- `Calendar/`
  - reservation-2에서 캘린더 UI를 담당하며, 예약 가능 날짜 표시와 체크인/체크아웃 날짜 선택 기능 관련 코드가 들어 있습니다.
- `Components/`
  - 여러 화면에서 공통으로 사용하는 UI 컴포넌트 모음입니다. 서버 연동 기능 / 추가 고급 기능들을 포함하기 위해 Framer 컴포넌트를 모방한 코드 컴포넌트들도 존재합니다.
- `ContactForm/`
  - 문의 및 상담 신청 폼 관련 코드가 들어 있습니다.
- `Legacy Before 250928/`
  - 이전 버전 백업 코드가 들어 있는 디렉토리입니다. 전부 삭제해도 무방합니다.
- `Notifier/`
  - 초기에 Notifier 서버의 역할을 했던 프론트 코드입니다. 관리자 연락처, 메시지 문구 등 프론트엔드에서 참조하는 알림톡 관련 코드가 들어 있습니다.
  - 삭제 예정이던 코드이나, 아직 이 코드를 참고하는 다른 코드가 있을 수 있어서 보류 상태에 있었습니다. 만약 전체 주석처리를 해서도 알림톡(A~L까지)이 여전히 아무 문제 작동한다면 이 부분은 전체 삭제가 가능한 코드입니다.
- `Receipt/`
  - reservation-3에서 등장하는 예약 폼, 영수증 가격 계산, 예약자/숙박자/멤버쉽/쿠폰/추가서비스 등 다양한 정보를 받아 백엔드로 보내는 로직이 들어 있습니다.
- `Store/`
  - Framer의 `useStore` 기반 상태 관리 코드가 들어 있습니다. 모든 페이지에서 기억하고 있어야 하는 클라이언트의 로그인 정보, 체크인/아웃 날짜, 가격 등 다양한 변수가 존재하며, DB에서 불러온 클라이언트의 회원 정보를 기억하는 cache와 같은 역할을 수행하기도 합니다.
- `Table/`
  - 관리자, 회원, 주문, 정산 등에 쓰이는 테이블형 UI 코드가 들어 있습니다.
  - Table/ 안에 있는 컴포넌트들은 초기 테이블들입니다(그 중 유일하게 쿠폰 목록 테이블만이 계속 사용되고 있습니다.)
  - Table/Orders/는 예약 내역 조회 테이블입니다. Admin 기준으로 모든 정보를 가져온 뒤 회원/비회원에 따라 필터링하는 방식입니다.
  - Table/MemberPage/는 회원 페이지의 테이블들입니다(회원 정보, 연도별 회원권, 쿠폰 및 마일리지 등).
  - Table/Members/는 관리자 페이지의 회원 조회 테이블입니다.
  - Table/AdminPage/는 관리자 페이지의 나머지 테이블입니다(캘린더 관리, 환불 규정, 추가 서비스 관리, 관리자 설정 등).
  - Table/Managements/는 관리자 페이지의 지점 운영 관리 테이블이며, DB에서 fetch해오는 기능 및 UI는 구현 완료되었으나, 출근 직원 입력 및 체크 기능 제작 직전에 중단되었습니다.
- `TossPayments/`
  - Toss Payments 결제 위젯 프론트엔드 코드 및 그 이후의 로직(결제 로딩/실패/성공)이 들어 있습니다.
- `Utils/`
  - 날짜(특히 형식 변환 혹은 한국 시간으로 변경 등), fetch, 예약 규칙 등 여러 곳에서 공통으로 쓰는 유틸 함수가 들어 있습니다.

## Historical / No Longer Used Code

- Legacy Before 250928/ 전체 디렉토리
- Calendar/CalendarContainer_1231.tsx
- Calendar/CalendarSelector_1231.tsx
- Calendar/DayComponent_0109.tsx
- Calendar/DayComponent_1231.tsx
- Calendar/UnmuMembership_1231.tsx
- Calendar/VacationDisplay_1231.tsx
- Calendar/WeekComponent_1231.tsx
- Calendar/WeekSelector_1231.tsx
- Components/LoadingOverlay.tsx의 윗부분 주석
- Receipt/AdditionalService_1231.tsx
- Receipt/CheckAuth.tsx
- Receipt/EvaluateCoupons_1231.ts
- Receipt/PriceDisplay_1231.ts
- Receipt/ReceiptLabelComponent_1231.ts
- Receipt/SubmitTossReservation.ts
- Table/AdminPage/AdminSettings_1231.tsx
- Table/AdminPage/DaysCateogry_1231.tsx
- Table/AdminPage/LateDateStatus_1231.tsx
- Table/AdminPage/RefundPolicies_1231.tsx
- Table/AdminPage/SpecificDateRow_1231.tsx
- Table/AdminPage/SpecificDateSettings_1231.tsx
- Table/MemberPage/MembershipTableDetail_0108.tsx
- Table/Orders/MemberOrdersTableElement_1.tsx
- Table/Orders/NonmemberOrdersTableElement_1.tsx
- Table/Orders/OrdersTableDetailList_1.tsx
- Table/Orders/OrdersTableLogic_1.tsx
- Table/Orders/RefundPopup_1.tsx
- TossPayments/CheckoutPage_legacy.tsx
- TossPayments/CheckoutPageIntegrated.tsx
- TossPayments/CheckoutPageUSDtsx
- TossPayments/CheckoutSwitchToForeignButton.tsx
- TossPayments/FailPage.tsx의 윗부분 주석
- TossPayments/LoadingPage_1231.tsx
