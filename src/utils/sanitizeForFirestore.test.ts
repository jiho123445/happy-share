import { describe, it, expect } from 'vitest';
import { sanitizeForFirestore } from './sanitizeForFirestore';

describe('sanitizeForFirestore', () => {
  it('drops top-level undefined fields', () => {
    const input = { name: '홍길동', attachmentName: undefined, phone: '010-0000-0000' };
    expect(sanitizeForFirestore(input)).toEqual({ name: '홍길동', phone: '010-0000-0000' });
  });

  it('recursively drops undefined fields in nested objects', () => {
    const input = { a: 1, nested: { b: 2, c: undefined, deeper: { d: undefined, e: 3 } } };
    expect(sanitizeForFirestore(input)).toEqual({ a: 1, nested: { b: 2, deeper: { e: 3 } } });
  });

  it('drops undefined entries from arrays without leaving holes', () => {
    const input = [1, undefined, 2, undefined, 3];
    expect(sanitizeForFirestore(input)).toEqual([1, 2, 3]);
  });

  it('sanitizes objects nested inside arrays', () => {
    const input = [{ a: 1, b: undefined }, { a: undefined, b: 2 }];
    expect(sanitizeForFirestore(input)).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('preserves null, false, 0, and empty-string values (only undefined is dropped)', () => {
    const input = { a: null, b: false, c: 0, d: '' };
    expect(sanitizeForFirestore(input)).toEqual({ a: null, b: false, c: 0, d: '' });
  });

  it('leaves Date instances untouched instead of walking their internal fields', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const result = sanitizeForFirestore({ createdAt: date });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.getTime()).toBe(date.getTime());
  });

  it('returns primitives unchanged', () => {
    expect(sanitizeForFirestore('hello')).toBe('hello');
    expect(sanitizeForFirestore(42)).toBe(42);
    expect(sanitizeForFirestore(true)).toBe(true);
    expect(sanitizeForFirestore(null)).toBe(null);
  });
});
