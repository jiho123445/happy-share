/**
 * MONITORING (2026-08 addition): before this, the only way anyone found
 * out a real visitor had hit an error (the /gallery 404s, the CSP-blocked
 * photo upload, etc.) was the admin personally reproducing the problem or
 * a visitor describing/screenshotting it. This writes a small record of
 * client-side errors to Firestore's `errorLogs` collection (see
 * firestore.rules — anyone can create one, only the admin can read them),
 * so the admin panel can show what's actually gone wrong in the field
 * without needing a screenshot first.
 *
 * This is intentionally best-effort and silent: logging an error must
 * never itself throw, get stuck retrying, or otherwise become a second
 * problem on top of the first one.
 */
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MAX_MESSAGE_LEN = 2000;
const MAX_STACK_LEN = 4000;
const MAX_CONTEXT_LEN = 200;

// Basic client-side throttle so a single broken component that errors on
// every render (or every animation frame) can't flood Firestore with
// thousands of writes in a few seconds. Not a substitute for the size/shape
// checks in firestore.rules, just a good neighbor.
let recentCount = 0;
let windowStart = Date.now();
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 60_000;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) : str;
}

export function logClientError(error: unknown, context?: string): void {
  try {
    const now = Date.now();
    if (now - windowStart > WINDOW_MS) {
      windowStart = now;
      recentCount = 0;
    }
    if (recentCount >= MAX_PER_WINDOW) return;
    recentCount++;

    const message = truncate(
      error instanceof Error ? error.message : String(error),
      MAX_MESSAGE_LEN
    ) || '(빈 오류 메시지)';
    const stack = error instanceof Error && error.stack ? truncate(error.stack, MAX_STACK_LEN) : undefined;

    const payload: Record<string, unknown> = {
      message,
      url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : undefined,
      createdAt: new Date().toISOString()
    };
    if (stack) payload.stack = stack;
    if (context) payload.context = truncate(context, MAX_CONTEXT_LEN);

    // Fire and forget. If this fails (offline visitor, Firestore hiccup,
    // ad blocker, etc.) there is nothing useful to do about it — falling
    // back to console keeps it visible locally without surfacing a second
    // error to the visitor.
    addDoc(collection(db, 'errorLogs'), payload).catch((e) => {
      console.warn('[errorLogger] Could not report error to Firestore:', e);
    });
  } catch (loggingError) {
    console.warn('[errorLogger] Unexpected failure while logging an error:', loggingError);
  }
}
