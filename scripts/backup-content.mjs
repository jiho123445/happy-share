// AUTOMATED CONTENT BACKUP (2026-08 addition), run on a schedule by
// .github/workflows/backup.yml. Fetches every publicly-readable
// foundation/{docName} document (settings/programs/notices/press/gallery/
// popups — see firestore.rules, these are `allow read: if true`) via the
// Firestore REST API and writes a single dated JSON snapshot into
// backups/.
//
// Deliberately does NOT touch donations/inquiries/subscribers: those
// collections hold donor/inquirer personal data and are only readable by
// the authenticated admin (see firestore.rules), so an unattended,
// credential-less script like this one has no way to read them — and
// shouldn't. For a full backup including that data, use the "전체 데이터
// 백업 다운로드" button in the admin panel's 시스템 로그 > 백업 tab, which
// runs client-side with the admin's own Firebase Auth session and is a
// deliberate, admin-initiated action rather than an unattended job.
import fs from "fs";
import path from "path";

const PROJECT_ID = "gen-lang-client-0288068906";
const DATABASE_ID = "ai-studio-c345f36f-becb-4d51-8f4b-58287995f527";
const DOC_NAMES = ["settings", "programs", "notices", "press", "gallery", "popups"];
const BACKUPS_DIR = path.join(process.cwd(), "backups");

function unwrapFirestoreValue(value) {
  if (value == null) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(unwrapFirestoreValue);
  if ("mapValue" in value) {
    const out = {};
    const fields = value.mapValue.fields || {};
    for (const key of Object.keys(fields)) out[key] = unwrapFirestoreValue(fields[key]);
    return out;
  }
  return null;
}

async function fetchDoc(docName) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/${docName}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[backup-content] Could not fetch foundation/${docName}: HTTP ${res.status}`);
    return null;
  }
  const json = await res.json();
  const fields = json.fields || {};
  const out = {};
  for (const key of Object.keys(fields)) out[key] = unwrapFirestoreValue(fields[key]);
  return out;
}

async function main() {
  const snapshot = { exportedAt: new Date().toISOString(), kind: "public-content-only" };
  let anySucceeded = false;

  for (const docName of DOC_NAMES) {
    const data = await fetchDoc(docName);
    if (data) anySucceeded = true;
    snapshot[docName] = data;
  }

  if (!anySucceeded) {
    console.error("[backup-content] Every foundation/* fetch failed — not writing a backup file (would just be all-null).");
    process.exit(1);
  }

  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  const dateStr = new Date().toISOString().split("T")[0];
  const outPath = path.join(BACKUPS_DIR, `${dateStr}.json`);
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`[backup-content] Wrote ${outPath}`);
}

main().catch((e) => {
  console.error("[backup-content] Unexpected error:", e);
  process.exit(1);
});
