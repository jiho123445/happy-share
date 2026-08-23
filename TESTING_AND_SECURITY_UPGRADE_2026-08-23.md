# 재단 홈페이지 (nbnhappy.or.kr) 보안·자동테스트 점검 및 보강 (2026-08-23)

학원 홈페이지(jahrd.co.kr)와 동일한 수준으로 맞추기 위해 진행한 점검 및 수정 내역입니다.

## 1. 먼저 확인한 것: 기존 코드는 이미 상당히 탄탄한 상태였습니다

`SECURITY_FIX_SUMMARY.md`, `SECURITY_PATCH_2026-08-20.md`에 기록된 지난 작업 덕분에, 아래 항목들은 이미 학원 사이트와 동등하거나 그 이상 수준이었습니다. 이번에 다시 깨뜨리지 않았는지 하나씩 재검증했습니다.

- **인증 없는 API 없음**: `/api/settings`, `/api/sync`, `/api/data` 등 예전에 있었던 무인증 엔드포인트는 이미 전부 제거되어 있고, 남은 것은 `/api/health`(단순 상태 체크), 정적 이미지 서빙, `/sitemap.xml`뿐입니다. 데이터 쓰기는 전부 Firestore 규칙으로만 통제됩니다.
- **Firestore 규칙**: `donations`, `inquiries`, `subscribers` 컬렉션이 익명 사용자는 `create`만, 조회/수정/삭제는 관리자(고정 UID) 로그인만 가능하도록 되어 있고, `hasOnly([...])` 필드 화이트리스트로 예상 밖의 필드가 끼어드는 것도 막고 있습니다. 이번에 이 화이트리스트가 `src/types.ts`의 실제 타입과 정확히 일치하는지도 자동 테스트로 새로 검증했습니다 (아래 3번 참고).
- **Storage 규칙**: 관리자만 업로드 가능, 파일 크기·MIME 타입·확장자 3중 제한.
- **가짜 로그인 제거**: 팝업 편집 등 모든 관리자 기능이 실제 Firebase Authentication 로그인만 확인합니다.
- **개인정보 분리**: 후원/문의/구독자 개인정보가 공개 문서와 분리되어 있습니다.
- **스팸 방지**: 허니팟 + 최소 작성시간 + 클라이언트 횟수 제한 3중 장치.
- **번들 최적화**: AdminModal/exceljs 지연 로딩, 코드 스플리팅 적용.
- **보안 헤더**: `X-Content-Type-Options`, `X-Frame-Options`, HSTS 등 이미 적용.

## 2. 이번에 새로 추가한 것

### ✅ 자동 테스트 (기존에는 전혀 없었음 — 가장 큰 차이점)

학원 사이트와 달리 이 저장소에는 테스트 프레임워크 자체가 설치되어 있지 않았습니다. **Vitest + Testing Library**를 새로 설치하고, 보안과 직결된 순수 함수들에 대해 **총 42개 테스트**를 작성해 전부 통과를 확인했습니다.

| 테스트 파일 | 검증 내용 |
|---|---|
| `src/utils/spamGuard.test.ts` | 허니팟 감지, 최소 작성시간, 요청 빈도 제한, localStorage 실패 시 안전하게 통과(fail-open) 등 |
| `src/utils/uploadValidation.test.ts` | 확장자 위조, MIME 타입 위조(예: `.jpg`로 이름 바꾼 실행파일) 차단, 파일 크기 제한, HWP/HWPX 예외 처리 |
| `src/utils/sanitizeForFirestore.test.ts` | `undefined` 필드가 재귀적으로 안전하게 제거되는지 (이전에 겪으셨던 "저장이 조용히 실패하는" 버그의 재발 방지) |
| `src/utils/imageUrl.test.ts` | 캐시버스팅 URL 생성, data URL 처리 |
| `src/test/firestoreRulesContract.test.ts` | **가장 실용적인 테스트**: `firestore.rules`의 필드 화이트리스트가 `src/types.ts`의 실제 타입과 정확히 일치하는지 자동 대조. 코드에서 필드를 추가/변경했는데 규칙 파일을 깜빡 안 고치거나(혹은 반대), 관리자 UID가 플레이스홀더로 남아있거나, 기본 거부(deny-by-default) 규칙이 사라지는 것을 CI에서 미리 잡아냅니다. |

실행 방법:
```bash
npm install       # vitest 등 새 devDependency 설치
npm run test          # 1회 실행
npm run test:watch    # 감시 모드
npm run test:coverage # 커버리지 리포트
```

### ✅ GitHub Actions CI (`​.github/workflows/ci.yml`)

지금까지는 Vercel이 그냥 빌드해서 배포하는 구조라, 타입 오류나 테스트 실패가 있어도 배포를 막는 장치가 없었습니다. 이제 `main` 브랜치로 푸시하거나 PR을 올릴 때마다 자동으로:
1. `npm run lint` (`tsc --noEmit` 타입 체크)
2. `npm run test` (위 42개 테스트)
3. `npm run build`
4. `npm audit` (정보 제공용, 실패해도 CI는 안 멈춤)

이 GitHub 저장소로 푸시하셔야 실제로 동작합니다 (Actions 탭에서 확인 가능).

### ✅ Content-Security-Policy 헤더 추가 (`vercel.json`)

기존에 없던 CSP를 추가해, 만약 어딘가에 XSS 취약점이 생기더라도 외부 스크립트 삽입/실행을 브라우저 차원에서 차단하도록 했습니다. Pretendard 폰트(jsdelivr), Firebase(Firestore/Storage/Auth) 도메인은 허용 목록에 포함했습니다.

**⚠️ 배포 후 반드시 확인해주세요**: CSP는 실제 배포 환경에서 테스트해봐야 안전합니다. 배포 후 관리자 로그인, 이미지 업로드, 갤러리/공지 조회를 한 번씩 해보시고, 브라우저 개발자도구 Console에 CSP 관련 빨간 오류가 뜨는지 확인해주세요. 문제가 있으면 바로 알려주시면 헤더를 조정해드리겠습니다.

### ✅ 사용하지 않는 의존성 제거 (`@google/genai`)

코드 어디서도 실제로 호출되지 않는 `@google/genai` 패키지가 `package.json`에 남아있었습니다 (지난번 `xlsx` 제거와 같은 맥락). 공급망 공격 표면을 줄이기 위해 제거했습니다. `npm run lint`, `npm run build` 모두 정상 통과 확인했습니다.

## 3. 남아있는 참고 사항 (조치 불필요, 참고용)

- `npm audit`상 `uuid` moderate 취약점 1건은 기존 `SECURITY_FIX_SUMMARY.md`에 이미 기록된 것과 동일합니다 (`exceljs`의 내부 의존성, 이 앱은 취약한 함수를 쓰지 않음). 그대로 두어도 무방합니다.
- Firestore/Storage 규칙 파일 자체는 이번에 수정하지 않았습니다 — 이미 배포하신 내용 그대로 유효합니다.

## 4. 요약: 학원 사이트 대비 격차 해소

| 항목 | 이전 | 이후 |
|---|---|---|
| 자동 테스트 | 없음 | Vitest 42개 테스트 |
| CI (푸시/PR마다 자동 검증) | 없음 | GitHub Actions (타입체크+테스트+빌드) |
| CSP 헤더 | 없음 | 추가 (배포 후 확인 필요) |
| 불필요한 의존성 | `@google/genai` 미사용 잔존 | 제거 |
| 나머지 보안 항목 (규칙, 인증, 개인정보 분리, 스팸방지 등) | 이미 우수 | 변경 없음, 재검증만 수행 |
