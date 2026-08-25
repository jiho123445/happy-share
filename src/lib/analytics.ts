/**
 * analytics.ts - Google Analytics(GA4) SPA 페이지뷰 추적 헬퍼
 *
 * index.html에 로드된 gtag.js는 최초 페이지 로드시 1회만 자동으로
 * page_view 이벤트를 보냅니다. 이 사이트는 해시(#) 기반 SPA 라우팅을
 * 사용하므로, 섹션 이동 시마다 이 함수를 호출해 방문 통계가 실제
 * 화면 전환을 반영하도록 합니다.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(sectionId: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  try {
    window.gtag("event", "page_view", {
      page_title: `홍천 중앙정보처리학원 - ${sectionId}`,
      page_path: `/#${sectionId}`,
      page_location: window.location.href,
    });
  } catch (e) {
    console.warn("GA page_view tracking failed:", e);
  }
}
