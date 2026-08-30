// Generates a static HTML preview page for every notice/program/gallery
// item, run as part of `npm run build` (AFTER vite build, so dist/index.html
// already exists).
//
// WHY: KakaoTalk, Facebook, etc. link-preview bots and search crawlers read
// raw HTML without running JavaScript. This app is a client-rendered SPA,
// so every shared link previously showed the same generic foundation-wide
// title/description no matter which notice/program/gallery item was linked.
//
// HOW: For each item, this copies dist/index.html and swaps just the
// <head> meta tags (title/description/og:*/twitter:*) for that item's own
// title/summary/image, writing the result to e.g. dist/notices/{id}.html.
// The rest of the page — all the <script>/<link> tags — is untouched, so
// when a real visitor opens the link, the exact same React app boots and
// takes over immediately; they see no difference from today. Only the
// server-rendered <head>, which crawlers read before JS ever runs,
// changes.
//
// This intentionally does NOT touch any server/runtime code (no Express
// route, no Edge Middleware) — it only adds extra static files, so there
// is no new server-side code path that could crash in production. If this
// script fails or Firestore is unreachable at build time, it logs a
// warning and exits successfully without generating any preview
// pages — the build (and the rest of the site) is never blocked by this.

import fs from "fs";
import path from "path";

const PROJECT_ID = "gen-lang-client-0288068906";
const DATABASE_ID = "ai-studio-c345f36f-becb-4d51-8f4b-58287995f527";
const SITE_ORIGIN = "https://nbnhappy.or.kr";
const SITE_NAME = "사단법인 너브내행복나눔재단";
const DIST_DIR = path.join(process.cwd(), "dist");

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

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

function buildPreviewHtml(shellHtml, opts) {
  const { title, description, image, canonicalPath } = opts;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const ogImage = image || `${SITE_ORIGIN}/og-image.png`;

  let html = shellHtml;

  // Replace the <title>...</title> tag.
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);

  // Replace each of these meta tags' content attribute if present.
  const metaReplacements = [
    [/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${escapeHtml(description)}$2`],
    [/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${escapeHtml(title)}$2`],
    [/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${escapeHtml(description)}$2`],
    [/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${escapeHtml(ogImage)}$2`],
    [/(<meta\s+property="og:image:secure_url"\s+content=")[^"]*(")/, `$1${escapeHtml(ogImage)}$2`],
    [/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${escapeHtml(canonicalUrl)}$2`],
    [/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${escapeHtml(title)}$2`],
    [/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${escapeHtml(description)}$2`],
    [/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${escapeHtml(ogImage)}$2`],
  ];
  for (const [pattern, replacement] of metaReplacements) {
    html = html.replace(pattern, replacement);
  }

  // Add a canonical link right before </head> if not already present.
  if (!html.includes('rel="canonical"')) {
    html = html.replace("</head>", `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n  </head>`);
  }

  return html;
}

async function main() {
  let shellHtml;
  try {
    shellHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
  } catch (e) {
    console.warn("[generate-previews] dist/index.html not found, skipping preview generation.");
    return;
  }

  // BUG FIX (2026-08-23, updated after /news also 404'd): every top-level
  // route this SPA recognizes (see the `validTabs` list in
  // src/context/FoundationContext.tsx's parsePath()) needs a real static
  // index.html at its own path. Originally only notices/programs/gallery
  // got this treatment, on the assumption that vercel.json's catch-all
  // rewrite ("/(.*)" -> "/index.html") would handle every other path. It
  // turned out that catch-all rewrite isn't actually being applied on
  // this deployment for *any* bare route with no matching file — /news
  // 404'd exactly like /gallery originally did, and /about, /press,
  // /family-center, /donate, /contact were almost certainly broken the
  // same way, just not yet noticed. Rather than keep discovering these
  // one broken link at a time, every route the app itself can navigate to
  // now gets a real file, which always takes priority over routing
  // config and works regardless of whatever is preventing the rewrite
  // from firing. This happens BEFORE the Firestore fetch below (and
  // unconditionally, regardless of whether that fetch succeeds) precisely
  // because it must never be skipped.
  const TOP_LEVEL_ROUTES = [
    "notices",
    "programs",
    "gallery",
    "about",
    "news",
    "press",
    "family-center",
    "donate",
    "contact",
    "privacy",
    "terms"
  ];
  for (const route of TOP_LEVEL_ROUTES) {
    const dir = path.join(DIST_DIR, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), shellHtml, "utf-8");
  }
  // Re-usable directory paths for the per-item preview files written below.
  const noticesDir = path.join(DIST_DIR, "notices");
  const programsDir = path.join(DIST_DIR, "programs");
  const galleryDir = path.join(DIST_DIR, "gallery");

  // (2026-08 버그 수정) 이 스크립트는 원래 `foundation/global` 문서 하나만
  // 읽었는데, 앱은 그 사이 콘텐츠를 `foundation/notices`, `/programs`,
  // `/gallery` 등 영역별 개별 문서로 나눠 저장하는 방식으로 바뀌었고(위
  // FoundationContext.tsx의 실시간 리스너와 동일한 마이그레이션 방식),
  // 관리자가 그 이후 새로 쓰거나 수정한 공지/사업/갤러리 항목은
  // `foundation/global`에는 반영되지 않습니다. 즉 이 스크립트가 만드는
  // 카카오톡/문자 링크 미리보기와 sitemap이 마이그레이션 이후 추가·수정된
  // 항목을 계속 놓치고 있었습니다. FoundationContext.tsx와 완전히 동일한
  // 규칙(영역별 새 문서를 우선하고, 그 문서가 아직 없으면 예전 global
  // 문서의 해당 필드로 대체)으로 고칩니다.
  async function fetchFoundationDoc(docId) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/${docId}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Firestore fetch failed for foundation/${docId}: ${res.status}`);
      const json = await res.json();
      const fields = json.fields || {};
      const out = {};
      for (const key of Object.keys(fields)) out[key] = unwrapFirestoreValue(fields[key]);
      return out;
    } catch (e) {
      console.warn(`[generate-previews] Could not fetch foundation/${docId}:`, e.message);
      return null;
    }
  }

  let notices = [];
  let programs = [];
  let gallery = [];
  try {
    const [legacyDoc, noticesDoc, programsDoc, galleryDoc] = await Promise.all([
      fetchFoundationDoc("global"),
      fetchFoundationDoc("notices"),
      fetchFoundationDoc("programs"),
      fetchFoundationDoc("gallery"),
    ]);
    if (!legacyDoc && !noticesDoc && !programsDoc && !galleryDoc) {
      throw new Error("모든 foundation/* 문서를 가져오지 못했습니다 (네트워크 차단 또는 빌드 환경 문제일 수 있음)");
    }
    const legacy = legacyDoc || {};
    notices = noticesDoc?.items ?? legacy.notices ?? [];
    programs = programsDoc?.items ?? legacy.programs ?? [];
    gallery = galleryDoc?.items ?? legacy.gallery ?? [];
  } catch (e) {
    console.warn("[generate-previews] Could not fetch Firestore data at build time, skipping per-item preview generation:", e.message);
    return;
  }

  let count = 0;

  for (const notice of notices) {
    if (!notice?.id) continue;
    const imageAttachment = (notice.attachments || []).find(
      (a) => /^(jpe?g|png|webp|gif)$/i.test(a.type || "") || /\.(jpe?g|png|webp|gif)$/i.test(a.url || "")
    );
    const html = buildPreviewHtml(shellHtml, {
      title: notice.title || "공지사항",
      description: truncate(notice.content || "", 120),
      image: imageAttachment?.url,
      canonicalPath: `/notices/${encodeURIComponent(notice.id)}`,
    });
    fs.writeFileSync(path.join(noticesDir, `${notice.id}.html`), html, "utf-8");
    count++;
  }

  for (const program of programs) {
    if (!program?.id) continue;
    const html = buildPreviewHtml(shellHtml, {
      title: program.title || "주요사업",
      description: truncate(program.summary || "", 120),
      canonicalPath: `/programs/${encodeURIComponent(program.id)}`,
    });
    fs.writeFileSync(path.join(programsDir, `${program.id}.html`), html, "utf-8");
    count++;
  }

  for (const item of gallery) {
    if (!item?.id) continue;
    const html = buildPreviewHtml(shellHtml, {
      title: item.title || "갤러리",
      description: truncate(item.description || "", 120),
      image: item.imageUrl,
      canonicalPath: `/gallery/${encodeURIComponent(item.id)}`,
    });
    fs.writeFileSync(path.join(galleryDir, `${item.id}.html`), html, "utf-8");
    count++;
  }

  // (2026-08 추가) public/sitemap.xml은 지금까지 상위 9개 경로만 수기로
  // 적어둔 정적 파일이라, 개별 공지/사업/갤러리 상세 페이지와 privacy/terms
  // 페이지는 검색엔진이 sitemap만으로는 찾을 수 없었습니다. 위에서 이미
  // 만든 미리보기 페이지들과 동일한 데이터로 sitemap.xml을 빌드 시점에
  // 다시 만들어 dist/sitemap.xml로 내보냅니다(vite build가 만든
  // dist/sitemap.xml — public/의 정적 사본을 복사한 것 — 을 덮어씁니다).
  const todayIso = new Date().toISOString().slice(0, 10);
  const sitemapUrls = [
    { loc: `${SITE_ORIGIN}/`, changefreq: "weekly", priority: "1.0" },
    ...TOP_LEVEL_ROUTES.map((route) => ({
      loc: `${SITE_ORIGIN}/${route}`,
      changefreq: route === "notices" ? "daily" : "monthly",
      priority: route === "notices" || route === "programs" ? "0.8" : "0.6",
    })),
    ...notices.filter((n) => n?.id).map((n) => ({
      loc: `${SITE_ORIGIN}/notices/${encodeURIComponent(n.id)}`,
      changefreq: "monthly",
      priority: "0.6",
    })),
    ...programs.filter((p) => p?.id).map((p) => ({
      loc: `${SITE_ORIGIN}/programs/${encodeURIComponent(p.id)}`,
      changefreq: "monthly",
      priority: "0.6",
    })),
    ...gallery.filter((g) => g?.id).map((g) => ({
      loc: `${SITE_ORIGIN}/gallery/${encodeURIComponent(g.id)}`,
      changefreq: "monthly",
      priority: "0.5",
    })),
  ];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf-8");

  console.log(`[generate-previews] Generated ${count} static preview pages, sitemap.xml with ${sitemapUrls.length} URLs.`);
}

main().catch((e) => {
  // Never fail the build because of this script.
  console.warn("[generate-previews] Unexpected error, skipping preview generation:", e);
});
