import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isLikelyBot, checkRateLimit, HONEYPOT_FIELD_NAME } from './spamGuard';

describe('isLikelyBot', () => {
  it('flags a filled honeypot field as a bot, regardless of timing', () => {
    const mountedAt = Date.now() - 10_000; // well past the min fill time
    expect(isLikelyBot('http://spam.example', mountedAt)).toBe(true);
  });

  it('flags submissions faster than the minimum human fill time', () => {
    const mountedAt = Date.now(); // submitted "instantly"
    expect(isLikelyBot('', mountedAt)).toBe(true);
  });

  it('treats a whitespace-only honeypot value as empty, not as a bot signal', () => {
    // The implementation trims before comparing, so accidental whitespace
    // (e.g. from autofill) doesn't false-positive a real visitor.
    const mountedAt = Date.now() - 10_000;
    expect(isLikelyBot('   ', mountedAt)).toBe(false);
  });

  it('allows a normal human submission: empty honeypot + enough time elapsed', () => {
    const mountedAt = Date.now() - 5_000;
    expect(isLikelyBot('', mountedAt)).toBe(false);
  });

  it('exposes a stable honeypot field name for forms to bind to', () => {
    expect(HONEYPOT_FIELD_NAME).toBe('website_url');
  });
});

describe('checkRateLimit', () => {
  const KEY = 'test:rate-limit';

  beforeEach(() => {
    localStorage.clear();
  });

  it('allows submissions under the limit', () => {
    expect(checkRateLimit(KEY).allowed).toBe(true);
    expect(checkRateLimit(KEY).allowed).toBe(true);
    expect(checkRateLimit(KEY).allowed).toBe(true);
  });

  it('blocks the submission once the rolling-window cap is exceeded', () => {
    checkRateLimit(KEY);
    checkRateLimit(KEY);
    checkRateLimit(KEY);
    const fourth = checkRateLimit(KEY);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMinutes).toBeGreaterThanOrEqual(1);
  });

  it('does not count submissions outside the rolling window', () => {
    const now = Date.now();
    // Seed 3 timestamps just past the 10-minute window.
    localStorage.setItem(
      KEY,
      JSON.stringify([now - 11 * 60_000, now - 12 * 60_000, now - 15 * 60_000])
    );
    expect(checkRateLimit(KEY).allowed).toBe(true);
  });

  it('fails open (allows the submission) if localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled (private browsing)');
    });
    expect(checkRateLimit(KEY).allowed).toBe(true);
    spy.mockRestore();
  });
});
