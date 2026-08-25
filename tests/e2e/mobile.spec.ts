import { test, expect } from '@playwright/test';
import { closeOpeningPopupIfVisible } from './helpers';

test.describe('모바일 기본 동작', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await closeOpeningPopupIfVisible(page);
  });

  test('모바일 메뉴를 열고 교육과정 메뉴를 사용할 수 있다', async ({ page }) => {
    const toggle = page.locator('#mobile-menu-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const courseButton = page
      .locator('header button:visible')
      .filter({ hasText: /^교육과정$/ })
      .last();

    await expect(courseButton).toBeVisible();
    await courseButton.click();

    await expect(page).toHaveURL(/#courses$/);
    await expect(
      page.getByRole('heading', { name: '전체 교육과정', exact: true })
    ).toBeVisible();
  });

  test('모바일 화면에 가로 스크롤이 생기지 않는다', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
