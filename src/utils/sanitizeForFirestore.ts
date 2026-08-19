/**
 * Firestore's setDoc()/updateDoc() throw SYNCHRONOUSLY (not a rejected
 * Promise) the moment they encounter a field whose value is `undefined`
 * anywhere in the document — e.g. `{ attachmentName: undefined }`.
 *
 * Because that throw happens before setDoc() even returns a promise, code
 * like `setDoc(ref, data).then(...).catch(...)` never gets a chance to
 * attach its `.catch()`, so the failure is completely silent: no error
 * banner, no console-visible rejection handled by our own code — the write
 * just never happens. Locally the UI already looks updated (optimistic
 * state), so the bug only becomes visible after a refresh re-syncs from
 * Firestore's untouched old data and the change appears to "disappear".
 *
 * Rather than hunting down every call site that might accidentally set a
 * field to `undefined` (e.g. `attachmentName: hasFile ? file.name : undefined`),
 * every payload going to Firestore is passed through this sanitizer first,
 * which recursively drops `undefined` values (arrays/objects are walked;
 * `undefined` array entries are also dropped so indices don't shift in a
 * surprising way for consumers that just care about content, not position).
 */
export function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      result[key] = sanitizeForFirestore(val);
    }
    return result as T;
  }

  return value;
}
