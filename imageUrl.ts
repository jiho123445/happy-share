/**
 * Utility for formatting image URLs with robust cache-busting for mobile and desktop browsers.
 */
export function formatImageUrl(url?: string, version?: number | string): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url; // Inline data URL

  const cleanUrl = url.split('?')[0];
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

