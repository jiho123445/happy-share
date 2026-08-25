import { test, expect } from '@playwright/test';
import { closeOpeningPopupIfVisible } from './helpers';

test.describe('수강문의 입력 검증', () => {
  test('필수 입력을 비운 상태에서는 문의 폼이 유효하지 않다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await closeOpeningPopupIfVisible(page);

    await page.locator('#nav-inquiry').click();
    await expect(page).toHaveURL(/#inquiry$/);

    const form = page.locator('#inquiry form').first();
    await expect(form).toBeVisible();

    const name = form.locator('input[required][type="text"]').first();
    const phone = form.locator('input[required][type="tel"]').first();

    await expect(name).toBeVisible();
    await expect(phone).toBeVisible();

    const validity = await form.evaluate((el) => {
      const f = el as HTMLFormElement;
      const required = Array.from(f.querySelectorAll('[required]'));
      return {
        checkValidity: f.checkValidity(),
        invalidRequiredCount: required.filter(
          (node) => !(node as HTMLInputElement).validity.valid
        ).length,
      };
    });

    expect(validity.checkValidity).toBe(false);
    expect(validity.invalidRequiredCount).toBeGreaterThanOrEqual(2);
  });
});
