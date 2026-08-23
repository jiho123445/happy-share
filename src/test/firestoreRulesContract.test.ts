import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * This project's public-facing forms (donation, inquiry, newsletter) write
 * directly to Firestore from the client. The only thing standing between a
 * malformed/malicious payload and the database is the field allowlist
 * (`hasOnly([...])`) inside firestore.rules — the client-side TypeScript
 * types in src/types.ts are NOT a security boundary by themselves.
 *
 * The team's own history (see project notes) shows this project has
 * repeatedly hit bugs from Firestore rules drifting out of sync with the
 * app's actual data shape, and from forgetting to publish an edited rules
 * file. This test doesn't catch the "forgot to publish" step (that can
 * only be caught by checking the live Firebase console), but it does catch
 * the more silent failure mode: someone adds/renames a field in
 * `src/types.ts` or in the submission code, but forgets to update
 * `firestore.rules` (or vice versa) — which would otherwise only surface
 * in production as "제출이 안 돼요" (submissions silently failing) once the
 * rules are deployed.
 */

const rulesPath = path.resolve(__dirname, '../../firestore.rules');
const rulesText = fs.readFileSync(rulesPath, 'utf-8');
const typesPath = path.resolve(__dirname, '../types.ts');
const typesText = fs.readFileSync(typesPath, 'utf-8');

/** Extracts the array of field names inside the first `hasOnly([...])` after `match /{collection}/{id} {`. */
function extractAllowedFields(collection: string): string[] {
  const matchBlockRe = new RegExp(`match /${collection}/\\{[^}]+\\}\\s*\\{([\\s\\S]*?)\\n    \\}`, 'm');
  const block = rulesText.match(matchBlockRe);
  expect(block, `could not find a match block for /${collection}/{id} in firestore.rules`).toBeTruthy();

  const hasOnlyRe = /hasOnly\(\[([^\]]+)\]\)/;
  const hasOnlyMatch = block![1].match(hasOnlyRe);
  expect(hasOnlyMatch, `could not find hasOnly([...]) inside the /${collection}/ rule`).toBeTruthy();

  return hasOnlyMatch![1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/** Extracts top-level field names from a `export interface Name { ... }` block in types.ts, excluding `id`. */
function extractTypeFields(interfaceName: string): string[] {
  const re = new RegExp(`interface ${interfaceName} \\{([\\s\\S]*?)\\n\\}`, 'm');
  const match = typesText.match(re);
  expect(match, `could not find interface ${interfaceName} in src/types.ts`).toBeTruthy();

  return match![1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .map((line) => line.split(':')[0].replace('?', '').trim())
    .filter((name) => name && name !== 'id');
}

describe('firestore.rules field allowlist matches src/types.ts', () => {
  it('donations: rules allowlist covers exactly the DonationApplication fields (minus id)', () => {
    const allowed = extractAllowedFields('donations').sort();
    const typeFields = extractTypeFields('DonationApplication').sort();
    expect(allowed).toEqual(typeFields);
  });

  it('inquiries: rules allowlist covers exactly the ContactInquiry fields (minus id)', () => {
    const allowed = extractAllowedFields('inquiries').sort();
    const typeFields = extractTypeFields('ContactInquiry').sort();
    expect(allowed).toEqual(typeFields);
  });

  it('subscribers: rules allowlist covers exactly the NewsletterSubscriber fields (minus id)', () => {
    const allowed = extractAllowedFields('subscribers').sort();
    const typeFields = extractTypeFields('NewsletterSubscriber').sort();
    expect(allowed).toEqual(typeFields);
  });

  it('the admin UID is a non-empty, plausible Firebase UID (not a placeholder)', () => {
    const uidMatch = rulesText.match(/request\.auth\.uid == '([^']+)'/);
    expect(uidMatch).toBeTruthy();
    const uid = uidMatch![1];
    expect(uid.length).toBeGreaterThanOrEqual(20);
    expect(uid).not.toMatch(/YOUR_|CHANGE_ME|TODO|xxxx/i);
  });

  it('there is a default-deny fallback rule so any unlisted path is closed by default', () => {
    expect(rulesText).toMatch(/match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
  });
});
