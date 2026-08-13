/**
 * Utility for formatting image URLs with robust cache-busting for mobile and desktop browsers.
 */
export function formatImageUrl(url?: string, version?: number | string): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url; // Inline data URL

  const cleanUrl = url.split('?')[0];
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('/')) {
    const v = version || Date.now();
    return `${cleanUrl}?v=${v}`;
  }
  return url;
}
