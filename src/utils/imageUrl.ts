/**
 * Utility for formatting image URLs with robust cache-busting for mobile and desktop browsers.
 */
export function formatImageUrl(url?: string, version?: number | string): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url; // Inline data URL

  const cleanUrl = url.split('?')[0];

  // PERFORMANCE FIX (2026-09-16): Firebase Storage download URLs are
  // already uniquely versioned — every upload gets its own storage path
  // (a timestamp + UUID, see processImageFile in AdminModal.tsx) and a
  // fresh `token` query param, so a replaced photo is always a brand
  // new URL on its own. Appending our own `?v=` cache-buster on top of
  // an already-unique URL did nothing useful — it just made every real
  // photo on the site look "brand new" to the browser on every render,
  // forcing a full re-download from Firebase Storage every time *any*
  // unrelated part of the site's data changed elsewhere (confirmed
  // 2026-09-16: every real photo on the homepage was being re-fetched
  // 2-3 times within seconds of loading, purely because of this).
  // Firebase Storage uploads already set a long-lived immutable
  // Cache-Control header, so leaving these URLs untouched lets the
  // browser's normal HTTP cache actually do its job.
  const isFirebaseStorageUrl =
    /^https:\/\/firebasestorage\.googleapis\.com\//.test(cleanUrl) ||
    /\.firebasestorage\.app\//.test(cleanUrl);
  if (isFirebaseStorageUrl) {
    return url;
  }

  const v = version || Date.now();
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('/api/image/')) {
    return `${cleanUrl}?v=${v}`;
  }
  if (cleanUrl.startsWith('/')) {
    return `${cleanUrl}?v=${v}`;
  }
  return `${url}${url.includes('?') ? '&' : '?'}v=${v}`;
}

export function getImageApiFallbackUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url;
  const filename = url.split('?')[0].replace(/^\/uploads\//, '');
  return `/api/image/${filename}?v=${Date.now()}`;
}

