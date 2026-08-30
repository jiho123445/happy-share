import express from "express";
import path from "path";
import fs from "fs";

/**
 * SECURITY NOTE (2026 audit):
 * This Express app previously exposed `/api/settings`, `/api/sync`,
 * `/api/gallery`, `/api/data`, and `/api/debug` endpoints with NO
 * authentication whatsoever. Anyone who knew (or guessed) the deployed
 * URL could read the entire site content — including donor names,
 * phone numbers, emails, and inquiry messages — or overwrite it, just by
 * sending a plain HTTP request. There was no login check of any kind on
 * the server side; the admin login in the React app only gated the UI,
 * not this API.
 *
 * All real data now lives exclusively in Cloud Firestore, which is
 * protected by firestore.rules (writes require the admin Firebase Auth
 * UID; donation/inquiry/subscriber records live in their own
 * collections that the public can only create into, never read).
 *
 * This file is kept only for:
 *  - `/api/health` — a harmless uptime check
 *  - `/uploads/:filename` and `/api/image/:filename` — read-only static
 *    file serving for legacy images that were uploaded before this fix
 *    (new uploads now go directly to Firebase Storage, which enforces
 *    isAdmin() on writes).
 *  - `/sitemap.xml` — dynamically lists individual notice/program/gallery
 *    URLs read live from Firestore.
 *  - `/notices/:id`, `/programs/:id`, `/gallery/:id` — bot-aware preview
 *    rendering (see below). Real visitors are transparently passed
 *    through to the normal SPA; only known link-preview/search bots get
 *    a small standalone HTML response with that item's title/description
 *    filled in.
 *
 * Do NOT re-add data-mutation or full-data-read endpoints here without
 * adding real server-side authentication (e.g. verifying a Firebase ID
 * token with the Firebase Admin SDK) first.
 */

const PROJECT_ID = "gen-lang-client-0288068906";
const DATABASE_ID = "ai-studio-c345f36f-becb-4d51-8f4b-58287995f527";

// Minimal unwrapper for Firestore REST API's typed value format
// (e.g. { stringValue: "..." }, { arrayValue: { values: [...] } }).
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

async function fetchFoundationGlobal(): Promise<Record<string, any> | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/global`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: any = await res.json();
    const fields = json.fields || {};
    const out: Record<string, any> = {};
    for (const key of Object.keys(fields)) {
      out[key] = unwrapFirestoreValue(fields[key]);
    }
    return out;
  } catch {
    return null;
  }
}

// Known link-preview / search bot user-agent substrings (lowercase).
const BOT_UA_PATTERNS = [
  "kakaotalk",
  "facebookexternalhit",
  "twitterbot",
  "slackbot",
  "telegrambot",
  "whatsapp",
  "discordbot",
  "linkedinbot",
  "googlebot",
  "yeti", // Naver's crawler
  "bingbot",
  "daumoa", // Daum's crawler
];

function isBotRequest(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text: string, max: number): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

function renderPreviewHtml(opts: {
  siteOrigin: string;
  title: string;
  description: string;
  image?: string;
  canonicalPath: string;
}): string {
  const SITE_NAME = "사단법인 너브내행복나눔재단";
  const { siteOrigin, title, description, image, canonicalPath } = opts;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${siteOrigin}${canonicalPath}`;
  const ogImage = image || `${siteOrigin}/og-image.jpg`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(ogImage)}" />
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(SITE_NAME)}에서 전체 내용 보기</a></p>
</body>
</html>`;
}

export function createExpressApp() {
  const app = express();
  // Vercel terminates TLS at the edge and forwards to this function over
  // plain HTTP, setting X-Forwarded-Proto: https. Trust that header so
  // req.protocol correctly reports "https" in production (and stays
  // "http" for local dev), which the preview/passthrough route below
  // relies on to build a working self-referential URL.
  app.set("trust proxy", true);

  // In Vercel serverless environment, use /tmp for persistent writes
  const isVercel = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const BASE_DIR = isVercel ? "/tmp" : process.cwd();
  const UPLOADS_DIR = path.join(BASE_DIR, "public", "uploads");

  // Anti-cache headers for API/upload routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
    }
    next();
  });

  // Read-only: serve legacy images that were uploaded to local disk before
  // this fix. Does not accept uploads and does not expose any site data.
  const serveImageHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const filename = path.basename(req.params.filename || req.path.replace(/^\/(uploads|api\/image)\//, ""));
    if (!filename) return next();

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const primaryPath = path.join(UPLOADS_DIR, filename);
    try {
      if (fs.existsSync(primaryPath)) {
        const ext = path.extname(filename).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
        res.setHeader("Content-Type", mime);
        return res.sendFile(primaryPath);
      }
    } catch (e) {}

    return res.status(404).json({ error: "Image not found", filename });
  };

  app.get("/uploads/:filename", serveImageHandler);
  app.get("/api/image/:filename", serveImageHandler);

  app.get("/api/health", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({ status: "ok", timestamp: Date.now(), isVercel });
  });

  // NOTE: A bot-aware preview route for /notices/:id, /programs/:id, and
  // /gallery/:id (giving KakaoTalk/search-engine link previews their own
  // title/description per article) was attempted here and rolled back —
  // it caused 500 errors in production that weren't reproducible in local
  // testing. The helper functions above (fetchFoundationGlobal,
  // renderPreviewHtml, isBotRequest, truncate, escapeHtml) are left in
  // place since they're harmless when unused and can be wired back up
  // later with more careful staging/testing. For now these paths are
  // served the same way as every other route: the static SPA shell via
  // vercel.json's catch-all rewrite, which is proven to work reliably.

  // ⚠️ (2026-08 확인) 이 라우트는 실제로는 절대 호출되지 않는 죽은 코드입니다.
  // vercel.json에는 이 경로에 대한 rewrite가 없고, dist/sitemap.xml이라는
  // 실제 정적 파일이 빌드 시점에 이미 만들어져 있어서, Vercel은 이 Express
  // 라우트에 요청이 도달하기도 전에 그 정적 파일을 먼저 서빙합니다(로컬
  // `npm run dev`에서도 이 서버 대신 vite 미들웨어가 요청을 처리합니다).
  // sitemap.xml을 실제로 갱신하려면 여기가 아니라 scripts/generate-previews.mjs
  // 를 고쳐야 합니다(2026-08부터 그 스크립트가 개별 공지/사업/갤러리까지
  // 포함한 sitemap.xml을 빌드 시점에 만듭니다). 이 라우트도 `foundation/global`
  // 문서 하나만 읽어 이미 오래된 로직이라, 지우기보다는 그대로 남겨 최소한
  // 잘못된 정보를 주지 않도록 이 설명만 정정해둡니다.
  //
  // (아래는 원래 주석) Dynamic sitemap: lists the homepage plus every individual notice,
  // program, and gallery post URL, read live from the public
  // `foundation/global` Firestore document (see firestore.rules — this
  // document is publicly readable by design). Replaces the old static
  // sitemap.xml, which only ever listed the homepage.
  app.get("/sitemap.xml", async (req, res) => {
    const SITE_ORIGIN = "https://nbnhappy.or.kr";

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

    const urls: { loc: string; changefreq: string; priority: string }[] = [
      { loc: `${SITE_ORIGIN}/`, changefreq: "weekly", priority: "1.0" },
      { loc: `${SITE_ORIGIN}/about`, changefreq: "monthly", priority: "0.6" },
      { loc: `${SITE_ORIGIN}/programs`, changefreq: "monthly", priority: "0.6" },
      { loc: `${SITE_ORIGIN}/news`, changefreq: "daily", priority: "0.8" },
      { loc: `${SITE_ORIGIN}/gallery`, changefreq: "weekly", priority: "0.6" },
      { loc: `${SITE_ORIGIN}/press`, changefreq: "weekly", priority: "0.5" },
      { loc: `${SITE_ORIGIN}/family-center`, changefreq: "monthly", priority: "0.5" },
      { loc: `${SITE_ORIGIN}/donate`, changefreq: "monthly", priority: "0.7" },
      { loc: `${SITE_ORIGIN}/privacy`, changefreq: "yearly", priority: "0.3" },
      { loc: `${SITE_ORIGIN}/terms`, changefreq: "yearly", priority: "0.3" },
    ];

    const data = await fetchFoundationGlobal();
    if (data) {
      const notices: any[] = data.notices || [];
      const programs: any[] = data.programs || [];
      const gallery: any[] = data.gallery || [];

      for (const n of notices) {
        if (n?.id) urls.push({ loc: `${SITE_ORIGIN}/notices/${encodeURIComponent(n.id)}`, changefreq: "monthly", priority: "0.5" });
      }
      for (const p of programs) {
        if (p?.id) urls.push({ loc: `${SITE_ORIGIN}/programs/${encodeURIComponent(p.id)}`, changefreq: "monthly", priority: "0.5" });
      }
      for (const g of gallery) {
        if (g?.id) urls.push({ loc: `${SITE_ORIGIN}/gallery/${encodeURIComponent(g.id)}`, changefreq: "monthly", priority: "0.4" });
      }
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
      .join("\n")}\n</urlset>\n`;

    res.send(body);
  });

  return app;
}
