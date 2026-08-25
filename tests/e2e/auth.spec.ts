import { test, expect } from '@playwright/test';
import { closeOpeningPopupIfVisible } from './helpers';

test.describe('관리자 인증 UI 스모크 테스트', () => {
  test('관리자 모드 진입 버튼이 표시된다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await closeOpeningPopupIfVisible(page);

    const adminButton = page.getByRole('button', { name: /관리자 모드/ }).first();
    await expect(adminButton).toBeVisible();
  });
});
