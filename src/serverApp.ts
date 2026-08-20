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

  return app;
}
