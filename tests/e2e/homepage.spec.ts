import { test, expect } from '@playwright/test';
import { closeOpeningPopupIfVisible } from './helpers';

test.describe('홈페이지 기본 동작', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await closeOpeningPopupIfVisible(page);
  });

  test('홈페이지가 정상적으로 열리고 핵심 UI가 표시된다', async ({ page }) => {
    await expect(page).toHaveTitle(/중앙|학원|컴퓨터|정보처리/i);
    await expect(page.locator('#header-logo')).toBeVisible();
    await expect(page.locator('#nav-courses')).toBeVisible();
    await expect(page.locator('#nav-materials')).toBeVisible();
  });

  test('교육과정 페이지로 이동할 수 있다', async ({ page }) => {
    const courses = page.locator('#nav-courses');
    await expect(courses).toBeVisible();
    await courses.click();

    await expect(page).toHaveURL(/#courses$/);
    await expect(
      page.getByRole('heading', { name: '전체 교육과정', exact: true })
    ).toBeVisible();
  });

  test('자료실 접근 시 인증 관련 UI가 표시된다', async ({ page }) => {
    await page.locator('#nav-materials').click();
    await expect(page).toHaveURL(/#materials$/);
    await expect(
      page.getByRole('heading', { name: '자료실', exact: true })
    ).toBeVisible();

    await expect(
      page.getByText(/로그인|회원가입|인증|승인|수강생 전용 자료실/).first()
    ).toBeVisible();
  });
});
