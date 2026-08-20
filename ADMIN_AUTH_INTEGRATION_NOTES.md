# 관리자 인증 통합 수정본

## 이번 수정의 핵심

기존 사이트에는 관리자 인증이 두 가지 존재했습니다.

1. `PopupModal.tsx`의 기존 관리자 비밀번호 인증 (하드코딩된 기본 비밀번호)
2. `AdminModal.tsx`의 Firebase Authentication 이메일/비밀번호 인증

이번 수정본은 **Firebase Authentication만 관리자 인증의 기준으로 사용**하도록 통합했습니다.

### 변경 사항

- 팝업 관리 화면의 기존 비밀번호 인증 제거
- 팝업 관리 버튼도 Firebase 관리자 로그인 화면을 사용
- `sessionStorage`의 `nerve_nae_admin_auth` 값을 관리자 권한의 근거로 사용하지 않도록 변경
- 관리자 권한은 Firebase Authentication의 지정 UID로 판단
- Firebase 로그인 성공 후 지정 관리자 UID가 아니면 즉시 로그아웃
- `initialData.ts`의 기본 관리자 비밀번호 제거
- `data/foundation_store.json`의 legacy `adminPassword` 제거
- Firebase Storage/Firestore의 보조 Rules 파일도 지정 관리자 UID 방식으로 정리

## 관리자 UID

현재 프로젝트에서 사용하도록 설정된 관리자 UID:

`a1MQmdMGkgdorEl6V3FAptCAYo52`

클라이언트와 Firebase Rules 모두 관리자 UID를 정확히 일치시켜 확인합니다. 관리자 UID가 없으면 관리자 권한을 부여하지 않습니다.

> UID는 비밀키가 아닙니다. 실제 보안은 Firebase Authentication과 Firestore/Storage Rules가 담당합니다.

## 중요한 배포 순서

1. 이 수정본을 GitHub에 업로드
2. 현재 홈페이지가 Firebase Authentication 이메일/비밀번호로 관리자 로그인되는지 확인
3. 관리자 계정 UID가 위 UID와 같은지 확인
4. 그 다음 Firestore Rules와 Storage Rules를 Firebase에 게시
5. 관리자 사진 등록/수정/삭제 테스트
6. 일반 방문자에서 쓰기 권한이 거부되는지 테스트

**Rules를 먼저 게시하지 마십시오.**

## 주의

현재 프로젝트에는 과거 작업에서 만들어진 중복/legacy 파일들이 일부 남아 있습니다. 현재 실제 Vite 진입점은 `index.html -> /src/main.tsx`이므로 이번 인증 통합의 핵심 변경은 `src/` 아래 실제 사용 파일에 적용했습니다. 중복 legacy 파일의 일괄 삭제는 운영 안정성을 확인한 후 별도 작업으로 진행하는 것을 권장합니다.
