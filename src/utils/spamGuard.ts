/**
 * Lightweight, dependency-free spam mitigation for the public-facing
 * forms (donation application, contact inquiry, newsletter signup).
 *
 * This is NOT a replacement for a real bot-detection service like
 * Google reCAPTCHA or Firebase App Check — those require registering
 * for an external site key, which hasn't been set up for this project.
 * What's here is a pragmatic first layer that blocks the overwhelming
 * majority of naive/automated spam bots without needing any external
 * account or API key, using three well-established techniques together:
 *
 * 1. Honeypot field — an input that's invisible to real visitors (via
 *    CSS, not `display:none`/`type=hidden`, since some bots skip those)
 *    but that simple bots fill in anyway because they blindly fill every
 *    field they find. If it has a value, the submission is silently
 *    dropped (no data written, but the visitor still sees a normal
 *    "success" message so we don't tip off the bot to adapt).
 * 2. Minimum fill time — a bot that submits within ~2 seconds of the
 *    page loading almost certainly didn't read and fill the form like a
 *    human would.
 * 3. Client-side rate limiting — caps how many submissions a single
 *    browser can send per form within a rolling time window. This is
 *    trivially bypassable by clearing localStorage or using a different
 *    browser, so it's a courtesy limit against accidental double-clicks
 *    and very unsophisticated repeat-spam, not a hard security boundary.
 *    (The real hard boundary is the Firestore `create` rule validation
 *    in firestore.rules, which every submission still has to pass
 *    regardless of what happens here.)
 */

import type { CSSProperties } from 'react';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const MIN_HUMAN_FILL_TIME_MS = 2000; // 2 seconds

/** Form field name for the honeypot input. Real users never see or fill this. */
export const HONEYPOT_FIELD_NAME = 'website_url';

/**
 * Returns true if this submission looks automated and should be
 * silently dropped rather than saved.
 */
export function isLikelyBot(honeypotValue: string, formMountedAt: number): boolean {
  if (honeypotValue.trim() !== '') return true;
  if (Date.now() - formMountedAt < MIN_HUMAN_FILL_TIME_MS) return true;
  return false;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMinutes?: number;
}

/**
 * Checks and records a submission against a rolling-window rate limit
 * stored in localStorage. Fails OPEN (allows the submission) if
 * localStorage is unavailable, so a privacy-mode browser or storage
 * quota issue never blocks a legitimate visitor from submitting.
 */
export function checkRateLimit(storageKey: string): RateLimitResult {
  try {
    const raw = localStorage.getItem(storageKey);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
      const oldest = Math.min(...recent);
      const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
      return { allowed: false, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60000)) };
    }

    recent.push(now);
    localStorage.setItem(storageKey, JSON.stringify(recent));
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

/**
 * Inline style for the honeypot input. Uses absolute positioning off
 * ­screen rather than `display:none` or `type="hidden"`, since some bots
 * are smart enough to skip those specifically.
 */
export const honeypotStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};
