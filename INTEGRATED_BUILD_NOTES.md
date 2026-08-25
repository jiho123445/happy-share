# 중앙정보처리학원 통합 수정본

이 버전은 GitHub에서 내려받은 현재 `main` 소스를 기준으로 정리한 운영용 통합본입니다.

## 자료실 공개 정책
- 학원서식: 관리자만
- 예제서식: 관리자 + 승인된 학생
- 채점프로그램: 관리자 + 승인된 학생
- 기존 `예제 파일` 자료: 하위 호환을 위해 승인된 학생에게 계속 공개

학생의 자료 다운로드는 `/api/download-material`을 통해서만 허용하며, Storage의 `materials/` 직접 읽기는 관리자에게만 허용합니다.

## 정리한 불필요 파일
- `bun.lock` — npm/`package-lock.json`을 사용하므로 제거
- `metadata.json` — 실행 코드에서 사용하지 않아 제거
- `public/og-image.png` — 사용되지 않는 중복 OG 이미지 제거 (`og-image.jpg` 유지)
- `public/top_logo.png` — 소스에서 참조되지 않아 제거

Playwright workflow와 기존 테스트 파일은 삭제하지 않았습니다. 최근 정상화한 `npx playwright test` 실행 방식을 그대로 유지합니다.
