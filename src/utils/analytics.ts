/**
 * ANALYTICS (2026-08 addition, revised 2026-08-24): Google Analytics 4
 * integration.
 *
 * Entirely optional and off by default — gated behind VITE_GA_MEASUREMENT_ID,
 * following the same pattern as VITE_ADMIN_UID/VITE_ADMIN_EMAIL elsewhere in
 * this project: if the env var isn't set at build time, every function here
 * is a silent no-op and nothing GA-related ever loads, so this is safe to
 * ship even before the measurement ID is configured in Vercel.
 *
 * REVISION NOTE: the original version of this file used
 * `send_page_view: false` on the initial config call, relying entirely on
 * a manually-fired page_view event from FoundationContext.tsx for every
 * navigation, including the very first page load. Verified against Google
 * Tag Assistant that the tag configured correctly but the debug session
 * showed zero page_view hits actually sent — a known-flaky pattern with
 * gtag.js in single-page apps (Google's own docs and multiple field
 * reports describe send_page_view:false interacting unreliably with
 * SPA frameworks). Switched to the standard, well-tested approach
 * instead: let gtag.js send its normal automatic page_view on the
 * initial config call (the most heavily-used, best-supported code path
 * in gtag.js), and only fire manual page_view events for subsequent
 * in-app navigation (tab changes) that wouldn't otherwise trigger a
 * pageview at all, since this is a client-side-routed SPA with no full
 * page reloads. See the isFirstPageView guard in trackPageView() below
 * and its caller in FoundationContext.tsx.
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
    // The initial page_view is sent automatically by this config call
    // (gtag.js's default, best-supported behavior). trackPageView() below
    // is only used for subsequent SPA tab changes, which otherwise
    // wouldn't be seen as separate pageviews at all.
    window.gtag('config', MEASUREMENT_ID);
  } catch (e) {
    console.warn('[analytics] Failed to initialize Google Analytics:', e);
  }
}

let isFirstPageView = true;

export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  // The very first call (initial page load) is already covered by the
  // automatic page_view sent from the 'config' command in initAnalytics()
  // above — sending a second one here would double-count that first
  // visit. Every call after that is a genuine in-app navigation with no
  // full page reload, so it needs its own manual page_view.
  if (isFirstPageView) {
    isFirstPageView = false;
    return;
  }
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
