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
 *
 * Do NOT re-add data-mutation or full-data-read endpoints here without
 * adding real server-side authentication (e.g. verifying a Firebase ID
 * token with the Firebase Admin SDK) first.
 */
export function createExpressApp() {
  const app = express();

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

  // Dynamic sitemap: lists the homepage plus every individual notice,
  // program, and gallery post URL, read live from the public
  // `foundation/global` Firestore document (see firestore.rules — this
  // document is publicly readable by design). Replaces the old static
  // sitemap.xml, which only ever listed the homepage.
  app.get("/sitemap.xml", async (req, res) => {
    const SITE_ORIGIN = "https://nbnhappy.or.kr";
    const PROJECT_ID = "gen-lang-client-0288068906";
    const DATABASE_ID = "ai-studio-c345f36f-becb-4d51-8f4b-58287995f527";

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
    ];

    try {
      const fsUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/global`;
      const fsRes = await fetch(fsUrl);
      if (fsRes.ok) {
        const json: any = await fsRes.json();
        const fields = json.fields || {};

        const unwrap = (value: any): any => {
          if (value == null) return null;
          if ("stringValue" in value) return value.stringValue;
          if ("arrayValue" in value) return (value.arrayValue.values || []).map(unwrap);
          if ("mapValue" in value) {
            const out: Record<string, any> = {};
            const f = value.mapValue.fields || {};
            for (const k of Object.keys(f)) out[k] = unwrap(f[k]);
            return out;
          }
          return null;
        };

        const notices: any[] = fields.notices ? unwrap(fields.notices) : [];
        const programs: any[] = fields.programs ? unwrap(fields.programs) : [];
        const gallery: any[] = fields.gallery ? unwrap(fields.gallery) : [];

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
    } catch (e) {
      // Firestore unreachable — still return the static top-level pages above
      // rather than failing the whole sitemap.
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
      .join("\n")}\n</urlset>\n`;

    res.send(body);
  });

  return app;
}
