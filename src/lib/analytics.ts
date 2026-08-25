/**
 * analytics.ts - Google Analytics(GA4) SPA 페이지뷰 추적 헬퍼
 *
 * index.html에 로드된 gtag.js는 최초 페이지 로드시 1회만 자동으로
 * page_view 이벤트를 보냅니다. 이 사이트는 경로 기반(path-based, # 없는)
 * SPA 라우팅을 사용하므로, 화면 전환 시마다 이 함수를 호출해 방문 통계가
 * 실제 URL 전환을 반영하도록 합니다.
 *
 * (2026-08 수정) 라우팅을 #해시 방식에서 경로(path) 방식으로 바꾸면서
 * 실제 주소는 /notices처럼 바뀌었는데, 이 파일은 그대로 남아있어서
 * page_path에 여전히 "/#notices" 형태로 기록되고 있었습니다. 실제 방문
 * 주소와 애널리틱스 기록이 어긋나는 문제라, 실제 경로(path)를 그대로
 * 받아 전송하도록 바꿨습니다. 호출하는 쪽(App.tsx)에서 실제 pathname을
 * 넘겨줍니다.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(path: string, label?: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  try {
    window.gtag("event", "page_view", {
      page_title: `홍천 중앙정보처리학원${label ? ` - ${label}` : ""}`,
      page_path: path,
      page_location: window.location.href,
    });
  } catch (e) {
    console.warn("GA page_view tracking failed:", e);
  }
}

