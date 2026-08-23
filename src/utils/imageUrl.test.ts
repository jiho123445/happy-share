import { describe, it, expect } from 'vitest';
import { formatImageUrl, getImageApiFallbackUrl } from './imageUrl';

describe('formatImageUrl', () => {
  it('returns an empty string for missing or non-string input', () => {
    expect(formatImageUrl(undefined)).toBe('');
    // @ts-expect-error deliberately testing a bad-input guard
    expect(formatImageUrl(123)).toBe('');
  });

  it('passes data URLs through unchanged (no cache-busting needed)', () => {
    const dataUrl = 'data:image/png;base64,AAAA';
    expect(formatImageUrl(dataUrl)).toBe(dataUrl);
  });

  it('appends a provided version as a cache-busting query param', () => {
    expect(formatImageUrl('/uploads/photo.jpg', 42)).toBe('/uploads/photo.jpg?v=42');
  });

  it('strips an existing query string before adding the new version', () => {
    expect(formatImageUrl('/uploads/photo.jpg?v=1', 42)).toBe('/uploads/photo.jpg?v=42');
  });

  it('adds ?v= to any root-relative path, not just /uploads or /api/image', () => {
    expect(formatImageUrl('/static/logo.png', 7)).toBe('/static/logo.png?v=7');
  });

  it('appends with & when a full external URL already has query params', () => {
    expect(formatImageUrl('https://cdn.example.com/img.png?x=1', 7)).toBe(
      'https://cdn.example.com/img.png?x=1&v=7'
    );
  });
});

describe('getImageApiFallbackUrl', () => {
  it('returns an empty string for missing input', () => {
    expect(getImageApiFallbackUrl(undefined)).toBe('');
  });

  it('passes data URLs through unchanged', () => {
    const dataUrl = 'data:image/png;base64,AAAA';
    expect(getImageApiFallbackUrl(dataUrl)).toBe(dataUrl);
  });

  it('rewrites an /uploads/ path to the /api/image/ fallback route', () => {
    const result = getImageApiFallbackUrl('/uploads/photo.jpg?v=1');
    expect(result).toMatch(/^\/api\/image\/photo\.jpg\?v=\d+$/);
  });
});
