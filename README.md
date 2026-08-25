<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ca4abb49-e194-408b-a23c-336854a466c9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment architecture (Vercel)

이 프로젝트는 두 가지 서버 실행 방식이 공존합니다. 혼동하지 않도록 정리합니다.

- **`server.ts`** — 로컬 개발 전용 Express 서버(`npm run dev`)입니다. Vite 미들웨어와
  함께 실행되며, `/api/health`, `/api/ask-ai` 같은 라우트를 직접 정의합니다.
  **Vercel에 배포될 때는 이 파일이 실행되지 않습니다** — Vercel은 정적 프론트엔드
  (Vite 빌드 결과물)만 호스팅하고, `server.ts`는 사용하지 않습니다.
- **`api/*.ts`** — Vercel 서버리스 함수입니다. 실제 운영(`www.jahrd.co.kr`)에서
  `/api/...`로 오는 모든 요청은 이 폴더의 파일들이 처리합니다. 새 API가
  필요하면 이 폴더에 파일을 추가해야 실제 배포 환경에서 작동합니다.

즉 로컬에서 테스트할 땐 `server.ts`가, 실제 배포 환경에서는 `api/*.ts`가
같은 역할(AI 상담, 자료 다운로드, 관리자 계정 관리 등)을 나눠서 담당하는
구조입니다. 두 곳의 로직이 서로 다르게 바뀌지 않도록 주의가 필요합니다.


## 자동 E2E 테스트 (Playwright)

기존 애플리케이션 코드는 변경하지 않고 `tests/e2e/`에 별도의 브라우저 자동 테스트를 추가했습니다.

### 로컬에서 1회 설치

```bash
npm install
npx playwright install chromium
```

### 테스트 실행

```bash
npm run test:e2e
```

UI 모드:

```bash
npm run test:e2e:ui
```

HTML 보고서:

```bash
npm run test:e2e:report
```

### 중요한 운영 원칙

- 기본 E2E 테스트는 로컬 개발 서버(`npm run dev`)를 대상으로 합니다.
- 실제 운영 Firebase 데이터에 학생 생성/삭제를 수행하는 테스트는 기본 실행하지 않습니다.
- 관리자 로그인 테스트는 `TEST_ADMIN_EMAIL`과 `TEST_ADMIN_PASSWORD`가 설정된 경우에만 실행됩니다.
- 운영 계정 비밀번호, Firebase 서비스 계정 키, Gemini API 키를 저장소에 넣지 마세요.
- 실제 회원가입/승인/삭제를 자동화하려면 별도의 Firebase 테스트 프로젝트를 만들고 그 프로젝트만 사용해야 합니다.
- CI에서는 `TEST_BASE_URL`을 스테이징 환경으로 지정해 운영 데이터와 분리하는 것을 권장합니다.
