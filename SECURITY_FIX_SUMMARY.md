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

---

## ⚠️ 배포 전 반드시 해야 할 일 (자동으로 안 됨)

1. **Firebase 콘솔에서 규칙 재배포**
   - Firestore → 규칙 탭에 이 저장소의 `firestore.rules` 내용을 그대로 붙여넣고 게시(Publish)
   - Storage → 규칙 탭에 이 저장소의 `storage.rules` 내용을 그대로 붙여넣고 게시
2. **기존 `foundation/global` 문서 정리**
   - Firestore 콘솔에서 `foundation/global` 문서를 열어 `donations`, `inquiries`, `subscribers`, `adminPassword` 필드가 남아있다면 전부 삭제하세요. (코드는 더 이상 이 필드들을 쓰지 않지만, 기존에 저장된 값이 그대로 남아 있으면 여전히 공개 노출 상태입니다.)
   - 필요하다면 이 필드들의 기존 값을 참고해서 새 컬렉션(`donations`, `inquiries`, `subscribers`)에 관리자가 직접 옮겨 담아야 합니다. 자동 마이그레이션은 포함되어 있지 않습니다.
3. **재배포 후 확인**
   - 관리자 로그인 후 팝업 등록/수정, 후원신청/문의/뉴스레터 구독, 이사장 사진/배너 업로드가 정상 동작하는지 한 번씩 테스트해 주세요.

## 참고: 코드 검증 완료

- `npx tsc --noEmit` — 오류 없음
- `npm run build` — 정상 빌드 성공
