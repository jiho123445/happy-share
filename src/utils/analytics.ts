/**
 * ANALYTICS (2026-08 addition): Google Analytics 4 integration.
 *
 * Entirely optional and off by default — gated behind VITE_GA_MEASUREMENT_ID,
 * following the same pattern as VITE_ADMIN_UID/VITE_ADMIN_EMAIL elsewhere in
 * this project: if the env var isn't set at build time, every function here
 * is a silent no-op and nothing GA-related ever loads, so this is safe to
 * ship even before the measurement ID is configured in Vercel.
 *
 * This is a single-page app: tab changes (news/gallery/about/etc.) do NOT
 * trigger a full page reload, so gtag.js's automatic page_view tracking
 * (which fires once, on initial script load) would only ever see the very
 * first tab a visitor lands on. trackPageView() is called manually from
 * FoundationContext.tsx whenever `activeTab` changes, so every section a
 * visitor navigates to — including back/forward browser navigation — is
 * recorded as its own page_view, the way it would be on a traditional
 * multi-page site.
 */

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

let initialized = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initAnalytics(): void {
  if (!MEASUREMENT_ID || initialized || typeof document === 'undefined') return;
  initialized = true;

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    // send_page_view: false — this SPA sends its own page_view events via
    // trackPageView() on every tab change instead of relying on gtag.js's
    // one-time automatic pageview, which would otherwise only ever see
    // whichever tab the visitor first landed on.
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  } catch (e) {
    console.warn('[analytics] Failed to initialize Google Analytics:', e);
  }
}

export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: title
    });
  } catch (e) {
    console.warn('[analytics] Failed to send page_view:', e);
  }
}
