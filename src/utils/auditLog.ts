/**
 * AUDIT TRAIL (2026-08 addition): records what the admin did and when,
 * so — if there's ever more than one admin account, or just to answer
 * "did I actually save that?" later — there's a real history instead of
 * relying on memory. Only fires for successful writes (see call sites in
 * FoundationContext.tsx's postMutationToServer and the gallery-specific
 * setDoc calls), so this is a record of what changed, not of attempts.
 *
 * Like errorLogger.ts, this is deliberately best-effort: a logging
 * failure must never surface as if the actual save had failed.
 */
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export function writeAuditLog(action: string, summary: string): void {
  try {
    const payload: Record<string, unknown> = {
      action: action.slice(0, 100),
      summary: summary.slice(0, 500),
      createdAt: new Date().toISOString()
    };
    if (auth.currentUser?.email) {
      payload.adminEmail = auth.currentUser.email.slice(0, 200);
    }
    addDoc(collection(db, 'auditLogs'), payload).catch((e) => {
      console.warn('[auditLog] Could not write audit log entry:', e);
    });
  } catch (loggingError) {
    console.warn('[auditLog] Unexpected failure while writing audit log:', loggingError);
  }
}
