# 너브내행복나눔재단 Firebase Storage 전환 수정버전

## 목적
기존 홈페이지의 갤러리 사진 업로드가 `/api/upload` → 서버 로컬 파일시스템(`/tmp` 가능)으로 저장되는 문제를
최소 변경으로 우회하고, 신규/수정 갤러리 사진을 Firebase Cloud Storage에 직접 저장하도록 변경한 1차 안전 전환 버전입니다.

## 이번 버전에서 바뀐 파일

1. `src/lib/firebase.ts`
   - 실제 `firebase-applet-config.json`을 사용하는 단일 Firebase 초기화에 Storage 추가.

2. `src/firebase/firebaseInit.js`
   - 기존 placeholder Firebase 설정 제거.
   - 기존 import 호환을 위해 `src/lib/firebase.ts`를 재-export.

3. `src/components/AdminModal.tsx`
   - 갤러리 파일 선택/드래그 업로드는 서버 `/api/upload`를 사용하지 않음.
   - 브라우저에서 1200px / JPEG 0.85로 압축.
   - Firebase Storage `activities/`에 직접 업로드.
   - Firestore에 저장할 `imageUrl`과 `storagePath`를 생성.
   - 갤러리 수정 시 새로 선택한 사진도 Firebase Storage에 저장.
   - 공지사항/팝업 등 다른 이미지 업로드 로직은 이번 단계에서 기존 동작을 유지.

4. `src/context/FoundationContext.tsx`
   - 갤러리 추가/수정/삭제는 `/api/gallery`를 거치지 않고 `foundation/global.gallery`를 직접 Firestore에 저장.
   - Firestore의 gallery 배열이 비어 있어도 정상적인 값으로 간주하여 stale localStorage 데이터를 지움.
   - 신규 Firebase Storage 사진 삭제 시 `storagePath`가 있으면 Storage 파일도 삭제.
   - LocalStorage는 캐시 역할만 유지.

5. `src/types.ts`
   - `GalleryItem.storagePath?: string` 추가.

6. `src/firebase/gallery.js`
   - 기존 Firebase Storage/Firestore 모듈의 Firebase 초기화를 단일 설정으로 통일.

## 아직 하지 않은 것
- 기존 `/api/upload`, `/api/gallery`, `foundation_store.json`, `image_store.json` 제거
- 기존 `/uploads/*` 사진의 Firebase Storage 마이그레이션
- `foundation/global.gallery`를 별도 `activities` 컬렉션으로 분리
- 공지사항/팝업 이미지의 Firebase Storage 전환

이것들은 1차 테스트가 성공한 뒤 별도 단계에서 진행해야 합니다.

## 반드시 테스트할 순서
1. 원본 프로젝트 백업.
2. Firebase Console에서 Storage가 활성화되어 있는지 확인.
3. 관리자 로그인.
4. 갤러리에서 새 사진 1장 업로드.
5. Firebase Console > Storage > `activities/`에 파일 생성 확인.
6. Firestore > `foundation/global` > `gallery`의 새 항목에서 `imageUrl`이 Firebase Storage URL인지 확인.
7. 홈페이지 새로고침.
8. 브라우저 종료 후 재접속.
9. 다른 PC/스마트폰에서 확인.
10. 이 모든 테스트가 통과한 뒤에만 서버 로컬 이미지 저장 코드를 제거.

## 빌드 확인
이 수정본을 만든 환경에는 의존성 설치가 완료되지 않아 여기서 전체 `npm run lint`/`npm run build`의 성공을 보장할 수 없습니다.
프로젝트 폴더에서:

    npm install
    npm run lint
    npm run build

순서로 확인하십시오.

빌드 오류가 나오면 오류 메시지 전체를 그대로 보내면 됩니다.
