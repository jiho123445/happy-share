# 재단 홈페이지 자동 테스트 실행 안내

## 1. 최초 1회
```bash
npm ci
```

## 2. 전체 검증
```bash
npm run verify
```
순서: TypeScript → Vitest → 보안 감사 → Production build

## 3. 개별 검사
```bash
npm run lint
npm test
npm run test:security
npm run build
```

## 4. 배포 후 Smoke Test
```bash
SITE_URL=https://nbnhappy.or.kr npm run test:smoke
```
Windows PowerShell에서는:
```powershell
$env:SITE_URL='https://nbnhappy.or.kr'; npm run test:smoke
```

## 5. 관리자 인증
Vercel 환경변수에 `VITE_ADMIN_UID`를 반드시 설정합니다. 값이 없으면 관리자 UI는 의도적으로 잠깁니다(fail-closed). Firebase UID 자체는 비밀번호가 아닙니다.

## 6. GitHub Actions
`.github/workflows/ci.yml`이 포함되어 있어 main/master push 또는 PR 시 자동으로 lint, test, security audit, build, npm audit를 실행합니다.
