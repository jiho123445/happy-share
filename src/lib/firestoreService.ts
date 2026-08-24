// firestoreService.ts intentionally has no Firestore SDK imports of its
// own now — handleFirestoreError() below is pure logging, and
// GLOBAL_FOUNDATION_DOC is just a path constant.

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export const GLOBAL_FOUNDATION_DOC = 'foundation/global';

// BUG FIX (2026-08-24): removed testFirestoreConnection(), which used to
// run on every page load and read `test/connection` — a path
// firestore.rules explicitly denies to everyone (`allow read, write: if
// false;`), on purpose. That made it a guaranteed-to-fail request on
// every single visit: no functional impact (the failure was silently
// swallowed), but a wasted round-trip and a steady stream of
// permission-denied entries in Firebase's usage logs. The onSnapshot
// listener in FoundationContext.tsx already reports connectivity for
// real; this separate probe added nothing.
