import type { VercelRequest, VercelResponse } from "@vercel/node";

// 재단 홈페이지(nbnhappy.or.kr)와 동일한 방식의 동적 sitemap입니다.
// 예전에는 public/sitemap.xml이 고정된 정적 파일이라 새 공지사항이
// 올라와도 sitemap에는 반영되지 않았습니다. 이제는 매 요청마다
// Firestore에서 실시간으로 공지사항 목록을 읽어와 개별 URL
// (/notices/:id)까지 전부 sitemap에 포함시킵니다 — 개별 공지가 검색
// 결과에 노출되려면 사이트맵에 그 URL이 실제로 등록돼 있어야 합니다.

const SITE_ORIGIN = "https://www.jahrd.co.kr";
const PROJECT_ID = "joongang-homepage";

// Firestore REST API의 typed value 포맷을 평범한 JS 값으로 풀어주는 최소
// 구현체입니다(재단 사이트 src/serverApp.ts의 동일 함수와 같은 방식).
function unwrapFirestoreValue(value: any): any {
  if (value == null) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(unwrapFirestoreValue);
  }
  if ("mapValue" in value) {
    const out: Record<string, any> = {};
    const fields = value.mapValue.fields || {};
    for (const key of Object.keys(fields)) {
      out[key] = unwrapFirestoreValue(fields[key]);
    }
    return out;
  }
  return null;
}

async function fetchNoticeIds(): Promise<string[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notices?pageSize=300`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json: any = await res.json();
    const docs: any[] = json.documents || [];
    return docs
      .map((d) => String(d.name || "").split("/").pop())
      .filter((id): id is string => Boolean(id));
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  const urls: { loc: string; changefreq: string; priority: string }[] = [
    { loc: `${SITE_ORIGIN}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_ORIGIN}/courses`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_ORIGIN}/national-support`, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_ORIGIN}/intro`, changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE_ORIGIN}/notices`, changefreq: "daily", priority: "0.8" },
    { loc: `${SITE_ORIGIN}/inquiry`, changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE_ORIGIN}/location`, changefreq: "monthly", priority: "0.6" },
  ];

  const noticeIds = await fetchNoticeIds();
  for (const id of noticeIds) {
    urls.push({
      loc: `${SITE_ORIGIN}/notices/${encodeURIComponent(id)}`,
      changefreq: "monthly",
      priority: "0.5",
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;

  res.status(200).send(body);
}
