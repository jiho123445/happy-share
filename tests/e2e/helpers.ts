import { Page } from '@playwright/test';

/**
 * Firebase/Firestore에서 공지 팝업 설정이 비동기로 도착할 수 있으므로
 * 페이지 진입 직후뿐 아니라 잠시 기다린 뒤 팝업이 나타나면 닫는다.
 * 홈페이지 소스는 수정하지 않고 테스트에서만 처리한다.
 */
export async function closeOpeningPopupIfVisible(page: Page) {
  const card = page.locator('#notice-popup-card');

  // 팝업이 비동기로 렌더링될 수 있으므로 최대 5초간 나타나는지 확인한다.
  try {
    await card.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return;
  }

  const closeButton = page.locator('#notice-popup-close-x, #notice-popup-close-btn').first();
  try {
    if (await closeButton.isVisible({ timeout: 1000 })) {
      await closeButton.click();
    } else {
      await card.click({ position: { x: 5, y: 5 } });
    }
  } catch {
    // 이미 닫혔거나 DOM에서 제거된 경우 무시
  }

  // 실제 클릭을 방해하는 오버레이가 사라졌는지 확인한다.
  await card.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}
