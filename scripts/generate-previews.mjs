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

  // BUG FIX (2026-08-23): creating dist/notices/, dist/programs/, and
  // dist/gallery/ as directories further down — even when empty — shadows
  // the SPA catch-all rewrite in vercel.json for the *bare* routes
  // /notices, /programs, and /gallery (no id). Vercel's static file
  // server checks the deployed filesystem before falling back to
  // vercel.json rewrites; finding a directory with no index.html at that
  // exact path, it returns its own 404 instead of ever reaching the
  // "/(.*)" -> "/index.html" rewrite that would normally boot the React
  // app. Every real visitor to https://<domain>/gallery (the site's own
  // nav links, per src/serverApp.ts's sitemap.xml) hit that 404.
  //
  // Fix: always write a plain copy of the untouched app shell as
  // index.html inside each of these three directories. This happens
  // BEFORE the Firestore fetch below (and unconditionally, regardless of
  // whether that fetch succeeds) precisely because it must never be
  // skipped — unlike the per-item preview pages, which are a nice-to-have
  // for link previews, this is what keeps the site's own top-level routes
  // from 404ing.
  const noticesDir = path.join(DIST_DIR, "notices");
  const programsDir = path.join(DIST_DIR, "programs");
  const galleryDir = path.join(DIST_DIR, "gallery");
  for (const dir of [noticesDir, programsDir, galleryDir]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), shellHtml, "utf-8");
  }

  let data;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/global`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore fetch failed: ${res.status}`);
    const json = await res.json();
    const fields = json.fields || {};
    data = {};
    for (const key of Object.keys(fields)) data[key] = unwrapFirestoreValue(fields[key]);
  } catch (e) {
    console.warn("[generate-previews] Could not fetch Firestore data at build time, skipping per-item preview generation:", e.message);
    return;
  }

  let count = 0;

  const notices = data.notices || [];
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

  const programs = data.programs || [];
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

  const gallery = data.gallery || [];
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

  console.log(`[generate-previews] Generated ${count} static preview pages.`);
}

main().catch((e) => {
  // Never fail the build because of this script.
  console.warn("[generate-previews] Unexpected error, skipping preview generation:", e);
});
