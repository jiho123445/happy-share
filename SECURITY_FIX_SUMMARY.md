# 보안 수정 내역 요약 (2026-08-20)

이 문서는 이번에 수정한 4가지 보안 문제와, **배포 전에 반드시 손으로 해줘야 하는 작업**을 정리한 것입니다.

## 1. 인증 없이 열려있던 백엔드 API 제거 (가장 심각했던 문제)

- `src/serverApp.ts`에서 `/api/settings`, `/api/sync`, `/api/gallery`, `/api/data`, `/api/debug`를 전부 삭제했습니다. 이전에는 로그인 여부와 무관하게 누구나 이 주소로 직접 요청을 보내 사이트 콘텐츠를 통째로 바꾸거나(후원자·문의자 개인정보 포함) 읽어갈 수 있었습니다.
- 이제 데이터는 오직 Firestore를 통해서만 읽고 쓰며, Firestore는 보안 규칙(`firestore.rules`)으로 보호됩니다.
- 이사장 사진 / 메인 배너 / 팝업 이미지 업로드는 인증 없는 `/api/upload` 대신, 갤러리/공지 첨부파일과 동일하게 **Firebase Storage**(관리자만 쓰기 가능)로 직접 업로드하도록 바꿨습니다 (`src/components/AdminModal.tsx`).
- `src/components/SyncDebugOverlay.tsx`의 "서버 진단" 버튼도 제거했습니다. (이 버튼이 호출하던 `/api/debug`가 서버 내부 파일 목록을 공개로 노출하고 있었습니다.)

## 2. 후원자·문의자·구독자 개인정보를 공개 문서에서 분리

- 이전에는 후원 신청/문의/뉴스레터 구독자(이름, 전화번호, 이메일, 메시지)가 전부 `foundation/global`이라는 **누구나 읽을 수 있는 문서** 안에 함께 저장되어 있었습니다.
- 이제 `donations`, `inquiries`, `subscribers`라는 별도의 Firestore 컬렉션으로 분리했습니다. 새 규칙(`firestore.rules`)은 **일반 방문자는 신청서 제출(create)만 가능**하고, **조회·수정·삭제는 관리자 로그인 후에만** 가능하도록 설정했습니다.
- `src/context/FoundationContext.tsx`, `src/components/DonateSection.tsx`, `src/components/LocationSection.tsx`, `src/components/NewsletterSection.tsx`가 이 구조에 맞게 수정되었습니다.

## 3. 팝업 편집 화면의 "가짜 로그인" 제거

- `src/components/PopupModal.tsx`에 있던, Firebase 로그인과 무관하게 비밀번호 문자열(`'1026'` 하드코딩 기본값)만 비교하던 로컬 인증 로직을 완전히 제거했습니다.
- 이제 팝업 편집도 다른 관리자 기능과 동일하게, 실제 Firebase Authentication 로그인(`AdminModal.tsx`) 여부만 확인합니다. 로그인 안 된 상태에서 팝업 수정 버튼을 누르면 정식 관리자 로그인 화면이 열립니다.

## 4. 코드 정리

- 어디서도 사용되지 않던 루트 레거시 파일 삭제: `auth.js`, `board.js`, `contact.js`, `donation.js`, `gallery.js`, 루트 `firebaseInit.js`
- `adminPassword` 필드를 타입(`src/types.ts`)과 초기 데이터(`src/data/initialData.ts`)에서 제거

## 5. (추가 수정) 팝업 이미지 업로드 방식 개선

- `src/components/PopupModal.tsx`의 팝업 대표 이미지 업로드가 base64 데이터 URL을 그대로 Firestore `foundation/global` 문서에 박아넣던 방식에서, 다른 이미지들과 동일하게 **압축 후 Firebase Storage(`settings/` 경로)에 업로드하고 짧은 다운로드 URL만 저장**하는 방식으로 바뀌었습니다.
- 이제 팝업 이미지를 여러 장/큰 사진으로 올려도 `foundation/global` 문서의 1MB 용량 제한에 걸려 사이트 전체 저장이 실패하는 문제가 생기지 않습니다.
- 업로드 중에는 버튼이 "업로드 중..."으로 바뀌고 비활성화됩니다.

---

## 6. (추가 개선) npm audit 취약점 점검

- 실제 소스코드에서 전혀 쓰이지 않던 `xlsx` 패키지(높음 심각도, SheetJS 프로토타입 오염/ReDoS, 수정본 없음)를 완전히 제거했습니다. 엑셀 내보내기는 전부 `exceljs`로 처리되고 있어 기능에는 영향 없습니다.
- 남은 `uuid` 취약점(보통 심각도)은 `exceljs`의 내부 의존성이며, 문제가 되는 함수(`v3()/v5()/v6()`에 직접 버퍼를 넘기는 경우)를 이 앱은 쓰지 않아 실질적 위험은 낮습니다. 수정하려면 `exceljs`를 구버전으로 낮춰야 해서(더 나쁜 트레이드오프) 지금은 보류 상태입니다. 나중에 `exceljs`가 새 버전을 내면 `npm audit`으로 다시 확인해 주세요.

## 7. (추가 개선) 공개 폼 스팸 방지

- `src/utils/spamGuard.ts` 신규 생성
- 후원신청(`DonateSection.tsx`), 문의(`LocationSection.tsx`), 뉴스레터 구독(`NewsletterSection.tsx`) 3개 폼에 적용:
  - **허니팟 필드**: 사람 눈엔 안 보이지만 봇은 자동으로 채우는 숨김 입력창 — 채워져 있으면 조용히 무시(정상 제출된 것처럼 보이지만 실제로 저장 안 됨)
  - **최소 작성 시간**: 폼이 뜨고 2초 안에 제출되면 봇으로 간주
  - **클라이언트 측 횟수 제한**: 같은 브라우저에서 10분에 3번 초과 제출 차단
- 참고: 이건 reCAPTCHA/Firebase App Check 같은 정식 봇 차단 서비스가 아니라, 외부 계정/API 키 없이도 적용 가능한 실용적인 1차 방어선입니다. 우회가 아예 불가능하진 않지만 단순 자동화 스팸은 대부분 막습니다.

## 8. (추가 개선) JS 번들 크기 축소

- 로그인 상태 추적(Firebase Auth 리스너)을 `AdminModal.tsx`에서 `FoundationContext.tsx`로 이동 — 관리자 패널을 열지 않아도 로그인 상태가 항상 정확하게 유지되도록 구조 개선
- `App.tsx`에서 `AdminModal`을 `React.lazy()`로 지연 로딩 — **관리자가 실제로 패널을 열 때만** 코드가 다운로드됩니다
- `vite.config.ts`에 `manualChunks` 설정 추가 — firebase, exceljs, react 등을 별도 청크로 분리
- **결과**: 일반 방문자가 처음 페이지를 열 때 받는 용량이 약 621KB → **약 314KB(gzip 기준)로 절반 수준으로 감소**했습니다. 무거운 엑셀 내보내기 라이브러리(271KB)와 관리자 UI(22KB)는 이제 관리자가 로그인/패널을 열 때만 별도로 받습니다.

## 9. (추가 개선) `foundation/global` 문서를 6개로 분리

- 기존에는 설정·사업·공지·보도자료·갤러리·팝업이 전부 `foundation/global` 문서 하나에 들어있어, 이 중 하나만 커져도 전체(1MB 한도) 저장이 실패할 수 있었습니다.
- 이제 Firestore `foundation` 컬렉션 안에 문서 6개로 분리했습니다: `settings`, `programs`, `notices`, `press`, `gallery`, `popups`. 각 문서가 독립적으로 1MB 한도를 가집니다.
- **기존 `foundation/global` 문서는 그대로 두었고, 별도 마이그레이션 작업이 필요 없습니다.** 코드가 새 문서를 우선 읽되, 없으면 자동으로 기존 `global` 문서의 해당 필드를 대신 읽어오도록 되어 있습니다. 관리자가 특정 영역(예: 공지사항)을 수정/저장할 때마다 그 영역의 데이터가 자동으로 새 전용 문서로 옮겨가며, 시간이 지나면서 자연스럽게 전체가 분리된 구조로 전환됩니다.
- `firestore.rules`는 이미 `foundation/{docId}`라는 와일드카드 패턴이라 새 문서 이름들도 그대로 커버되어 별도 수정이 필요 없습니다 (기존에 게시하신 규칙 그대로 유효합니다).

---

## ⚠️ 배포 전 반드시 해야 할 일 (자동으로 안 됨)

1. **Firebase 콘솔에서 규칙 재배포**
   - Firestore → 규칙 탭에 이 저장소의 `firestore.rules` 내용을 그대로 붙여넣고 게시(Publish) — *이미 하셨다면 이번엔 내용이 그대로라 다시 안 하셔도 됩니다.*
   - Storage → 규칙 탭에 이 저장소의 `storage.rules` 내용을 그대로 붙여넣고 게시 — *이미 하셨다면 이번엔 내용이 그대로라 다시 안 하셔도 됩니다.*
2. **기존 `foundation/global` 문서 정리**
   - `donations`, `inquiries`, `subscribers`, `adminPassword` 필드는 지난번 안내대로 이미 지우셨다면 완료된 상태입니다.
   - `settings`, `programs`, `notices`, `pressItems`, `gallery`, `galleryCategories`, `popups` 필드는 **지금 당장 지우지 마세요.** 관리자가 각 영역을 한 번씩 편집/저장할 때까지는 이 필드들이 여전히 읽기 폴백(fallback)으로 쓰입니다. 각 영역을 한 번씩 저장해서 새 문서(`foundation/settings`, `foundation/programs` 등)가 만들어진 게 Firestore 콘솔에서 확인되면, 그때 `global` 문서의 해당 필드를 정리하셔도 됩니다.
3. **재배포 후 확인**
   - 관리자 로그인 후 사업/공지/보도자료/갤러리/팝업/설정을 각각 한 번씩 저장해보고 (1) 정상 저장되는지, (2) Firestore 콘솔에서 `foundation` 컬렉션에 `settings`, `programs`, `notices`, `press`, `gallery`, `popups` 문서가 새로 생기는지 확인해 주세요.
   - 후원신청/문의/뉴스레터 구독 폼을 로그아웃 상태에서 제출해보고 정상 접수되는지 확인해 주세요.
   - `npm install` 후 `npm run build`가 정상 동작하는지 한 번 로컬에서 확인해보시면 더 안전합니다 (package.json이 바뀌었습니다).

## 참고: 코드 검증 완료

- `npx tsc --noEmit` — 오류 없음
- `npm run build` — 정상 빌드 성공 (청크 분리 확인: index 132KB / firebase 178KB / AdminModal 22KB(지연 로딩) / exceljs 271KB(지연 로딩) — 전부 gzip 기준)
