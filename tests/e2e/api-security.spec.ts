import { test, expect } from '@playwright/test';

test.describe('API 기본 보안', () => {
  test('health endpoint가 정상 응답한다', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.academy).toContain('중앙정보처리학원');
  });

  test('자료 다운로드 API는 인증 정보 없이 요청하면 거부한다', async ({ request }) => {
    // 실제 애플리케이션에 존재하는 POST /api/download-material을 대상으로 한다.
    // 인증 토큰 없이 요청하면 서버가 400으로 거부해야 한다.
    const response = await request.post('/api/download-material', {
      data: { materialId: 'e2e-unauthenticated-check' },
    });

    expect(response.status()).toBe(400);
  });

  test('자료 다운로드 API는 GET 방식으로 요청하면 허용하지 않는다', async ({ request }) => {
    const response = await request.get('/api/download-material');
    expect(response.status()).toBe(405);
  });
});
