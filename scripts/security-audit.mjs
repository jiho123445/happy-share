import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const pass = (name) => checks.push({name, ok:true});
const fail = (name, detail='') => { checks.push({name, ok:false}); failures.push(`${name}${detail ? `: ${detail}` : ''}`); };

const rules = read('firestore.rules');
const storage = read('storage.rules');
const ctx = read('src/context/FoundationContext.tsx');
const vercel = JSON.parse(read('vercel.json'));
const pkg = JSON.parse(read('package.json'));

if (/ADMIN_UID\s*\|\|\s*['\"]a1MQ/.test(ctx) || /const\s+ADMIN_UID[^\n]*a1MQ/.test(ctx)) fail('No hard-coded admin UID fallback'); else pass('No hard-coded admin UID fallback');
if (/allow\s+read,\s*write:\s*if\s+true\s*;/.test(rules)) fail('Firestore wildcard/public write not allowed'); else pass('Firestore public write wildcard blocked');
if (/match\s+\/\{document=\*\*\}/.test(rules) && /allow\s+read,\s*write:\s*if\s+false/.test(rules)) pass('Firestore deny-by-default wildcard present'); else fail('Firestore deny-by-default wildcard missing');
if (/match\s+\/\{allPaths=\*\*\}/.test(storage) && /allow\s+read,\s*write:\s*if\s+false/.test(storage)) pass('Storage deny-by-default wildcard present'); else fail('Storage deny-by-default wildcard missing');
if (/donations|inquiries|subscribers/.test(rules) && /allow\s+read,\s*update,\s*delete:\s*if\s+isAdmin/.test(rules)) pass('Sensitive collections admin-only read/update/delete'); else fail('Sensitive collection rules incomplete');
if (/images\.unsplash\.com/.test(vercel.headers?.[0]?.headers?.find(x=>x.key==='Content-Security-Policy')?.value || '')) pass('CSP allows required Unsplash images'); else fail('CSP missing images.unsplash.com');
const csp=vercel.headers?.[0]?.headers?.find(x=>x.key==='Content-Security-Policy')?.value || '';
for (const token of ['https://securetoken.googleapis.com','https://identitytoolkit.googleapis.com','https://firebaseinstallations.googleapis.com']) csp.includes(token) ? pass(`CSP allows ${token}`) : fail(`CSP missing ${token}`);
if (csp.includes('frame-src')) pass('CSP frame-src explicitly configured'); else fail('CSP frame-src missing');
if (pkg.scripts?.['test:security']==='node scripts/security-audit.mjs') pass('Security test script registered'); else fail('Security test script not registered');
if (pkg.scripts?.verify) pass('Unified verify script registered'); else fail('Unified verify script missing');
if (exists('.github/workflows/ci.yml')) pass('GitHub Actions CI exists'); else fail('GitHub Actions CI missing');
if (!exists('.env') && exists('.gitignore') && read('.gitignore').includes('.env')) pass('Environment files excluded from Git'); else fail('Environment file exclusion missing');
if (!pkg.dependencies?.xlsx && !pkg.devDependencies?.xlsx) pass('Deprecated xlsx package not present'); else fail('xlsx package present');
if (/sessionStorage\.setItem\([^\n]*admin/i.test(ctx)) fail('Admin authorization not persisted in sessionStorage'); else pass('No sessionStorage admin authorization flag');

console.log(`SECURITY AUDIT: ${checks.filter(x=>x.ok).length}/${checks.length} passed`);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`);
if (failures.length) { console.error('\nFailures:\n' + failures.map(x=>`- ${x}`).join('\n')); process.exit(1); }
console.log('SECURITY AUDIT PASSED');
