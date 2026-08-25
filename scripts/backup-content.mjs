// AUTOMATED CONTENT BACKUP (2026-08 추가), .github/workflows/backup.yml이
// 매일 정해진 시간에 실행합니다. 공개적으로 읽을 수 있는(firestore.rules상
// `allow read: if true`) 컬렉션 — notices, courses, popular_courses,
// settings/opening_popup — 을 Firestore REST API로 읽어와 backups/ 폴더에
// 날짜별 JSON 스냅샷 하나를 저장합니다.
//
// 재단 홈페이지(nbnhappy.or.kr)의 scripts/backup-content.mjs와 같은
// 목적·같은 구조입니다. 다만 재단 사이트는 콘텐츠가 foundation/global
// 문서 하나에 다 들어있는 반면, 이 학원 사이트는 컬렉션별로 나뉘어
// 있어서(notices, courses, popular_courses는 컬렉션, settings는 문서)
// 컬렉션 목록 조회(list documents)와 단일 문서 조회(get document) 두
// 방식을 각각 사용합니다.
//
// 의도적으로 다루지 않는 것: applications(수강신청), students(수강생 계정),
// phoneRegistry — 전부 개인정보를 담고 있고 firestore.rules상 관리자만
// 읽을 수 있는 컬렉션이라, 자격증명 없는 무인 스크립트가 애초에 읽을 수
// 없고 읽어서도 안 됩니다. 이런 개인정보까지 포함한 전체 백업이 필요하면
// 관리자 모드에 로그인한 상태에서 직접 내보내기(엑셀 다운로드 등)를
// 이용해야 합니다.
import fs from "fs";
import path from "path";

const PROJECT_ID = "joongang-homepage";
const PUBLIC_COLLECTIONS = ["notices", "courses", "popular_courses"];
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

function unwrapDoc(doc) {
  const fields = doc.fields || {};
  const out = { id: String(doc.name || "").split("/").pop() };
  for (const key of Object.keys(fields)) out[key] = unwrapFirestoreValue(fields[key]);
  return out;
}

async function fetchCollection(collectionName) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=300`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[backup-content] Could not fetch ${collectionName}: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    const docs = json.documents || [];
    return docs.map(unwrapDoc);
  } catch (e) {
    console.warn(`[backup-content] Error fetching ${collectionName}:`, e.message || e);
    return null;
  }
}

async function fetchDoc(docPath) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[backup-content] Could not fetch ${docPath}: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    const fields = json.fields || {};
    const out = {};
    for (const key of Object.keys(fields)) out[key] = unwrapFirestoreValue(fields[key]);
    return out;
  } catch (e) {
    console.warn(`[backup-content] Error fetching ${docPath}:`, e.message || e);
    return null;
  }
}

async function main() {
  const snapshot = { exportedAt: new Date().toISOString(), kind: "public-content-only" };
  let anySucceeded = false;

  for (const collectionName of PUBLIC_COLLECTIONS) {
    const data = await fetchCollection(collectionName);
    if (data) anySucceeded = true;
    snapshot[collectionName] = data;
  }

  const openingPopup = await fetchDoc("settings/opening_popup");
  if (openingPopup) anySucceeded = true;
  snapshot.opening_popup = openingPopup;

  if (!anySucceeded) {
    console.error("[backup-content] Every fetch failed — not writing a backup file (would just be all-null).");
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
