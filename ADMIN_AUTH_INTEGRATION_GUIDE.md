# 관리자 인증 통합 수정본

## 이번 수정의 목적

기존 홈페이지에 공존하던 두 가지 관리자 인증 방식을 하나로 통합했습니다.

- 제거: 팝업에서 사용하는 기존 관리자 비밀번호 / 기본값 1026
- 제거: `sessionStorage`의 관리자 권한 플래그
- 유지: Firebase Authentication 이메일 + 비밀번호
- 관리자 권한 기준: `VITE_ADMIN_UID`와 Firebase Authentication의 현재 사용자 UID 일치 여부
- 유지: Firestore / Firebase Storage의 기존 데이터 구조와 사진 저장 기능

## 실제 운영 앱에서 수정된 핵심 파일

- `src/components/PopupModal.tsx`
- `src/components/AdminModal.tsx`
- `src/context/FoundationContext.tsx`
- `src/data/initialData.ts`
- `src/types.ts`
- `env.example`
- `ADMIN_SETUP_CHECKLIST.txt`

현재 앱의 실제 진입점은 `src/main.tsx`이며 `src/App.tsx`가 `src/components/PopupModal.tsx`와 `src/components/AdminModal.tsx`를 사용합니다.

## GitHub 업로드

1. 이 ZIP을 압축 해제합니다.
2. 압축을 푼 폴더 **안의 모든 파일과 폴더**를 기존 GitHub 저장소의 루트에 업로드합니다.
3. 폴더 구조를 반드시 유지합니다. 특히 아래 경로가 정확해야 합니다.

```text
src/
  App.tsx
  main.tsx
  components/
    PopupModal.tsx
    AdminModal.tsx
  context/
    FoundationContext.tsx
  data/
    initialData.ts
```

4. `main` 브랜치에 Commit 합니다.

## 배포 전에 확인할 환경변수

배포 환경에 다음 값을 설정하는 것을 권장합니다. 설정하지 않아도 현재 지정된 관리자 UID가 기본값으로 사용되지만, 향후 관리자 계정을 변경할 경우 환경변수를 사용하는 것이 좋습니다.

```text
VITE_ADMIN_EMAIL=관리자 Firebase 이메일
VITE_ADMIN_UID=Firebase Authentication에서 확인한 관리자 User UID
```

`VITE_ADMIN_UID`가 설정되면 그 값을 사용하고, 설정하지 않으면 현재 지정된 관리자 UID를 사용하도록 했습니다.

## 배포 후 반드시 확인할 테스트

### 1. 기존 비밀번호 테스트

팝업의 관리자 버튼을 눌렀을 때:

- `관리자 비밀번호 확인`
- `기본: 1026`

화면이 **나오면 안 됩니다.**

기존 `1026`을 입력해서 관리자 기능에 들어가는 것도 **실패해야 정상**입니다.

### 2. Firebase 관리자 로그인

팝업 → `관리자 로그인`

에서 Firebase Authentication 관리자 이메일/비밀번호로 로그인합니다.

로그인 성공 후:

- 팝업 수정
- 팝업 삭제
- 팝업 추가
- 전체 관리자 센터

가 같은 Firebase 관리자 인증으로 동작해야 합니다.

### 3. 사진 기능

기존에 정상 확인한 사진 저장 기능은 별도로 변경하지 않았습니다.

- 사진 업로드
- 사진 교체
- 사진 삭제
- Firebase Storage 저장
- Firestore 메타데이터 저장

을 기존처럼 테스트합니다.

## Firebase Rules

현재 프로젝트의 `firestore.rules`와 `storage.rules`에는 관리자 UID가 지정되어 있어야 합니다.

핵심 조건:

```text
request.auth != null
&& request.auth.uid == '관리자 UID'
```

즉, Firebase Authentication으로 로그인했더라도 지정된 관리자 UID가 아니면 쓰기가 거부됩니다.

## 주의

이 수정본은 관리자 인증 통합을 목적으로 한 것입니다. 기존 사진 저장 경로와 데이터 구조를 임의로 변경하지 않았습니다.

또한 이 작업 환경에서는 프로젝트 의존성 설치가 완료되지 않아 실제 Vite production build를 끝까지 실행해 검증하지 못했습니다. 따라서 배포 전에 GitHub/Vercel 또는 현재 사용 중인 배포 환경에서 자동 빌드 결과를 반드시 확인하십시오.
