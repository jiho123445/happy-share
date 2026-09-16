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

  it('leaves firebasestorage.googleapis.com URLs untouched (already uniquely versioned)', () => {
    const url =
      'https://firebasestorage.googleapis.com/v0/b/example.appspot.com/o/settings%2F123_abc_hero.jpg?alt=media&token=xyz';
    expect(formatImageUrl(url, 999)).toBe(url);
  });

  it('leaves *.firebasestorage.app URLs untouched (already uniquely versioned)', () => {
    const url =
      'https://firebasestorage.googleapis.com/v0/b/example.firebasestorage.app/o/activities%2F1_abc.jpg?alt=media&token=xyz';
    expect(formatImageUrl(url, 999)).toBe(url);
  });

  it('still cache-busts non-Firebase-Storage external URLs even without an explicit version', () => {
    const result = formatImageUrl('https://images.unsplash.com/photo-123?auto=format&w=800');
    expect(result).toMatch(/^https:\/\/images\.unsplash\.com\/photo-123\?auto=format&w=800&v=\d+$/);
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
