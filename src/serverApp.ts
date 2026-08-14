import express from "express";
import path from "path";
import fs from "fs";

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // In Vercel serverless environment, use /tmp for persistent writes
  const isVercel = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const BASE_DIR = isVercel ? "/tmp" : process.cwd();
  const DATA_DIR = path.join(BASE_DIR, "data");
  const DB_FILE = path.join(DATA_DIR, "foundation_store.json");
  const IMAGE_STORE_FILE = path.join(DATA_DIR, "image_store.json");
  const UPLOADS_DIR = path.join(BASE_DIR, "public", "uploads");

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Directory creation skipped or read-only:", e);
  }

  // In-memory fallback stores in case file write is restricted
  let memoryStore: any = null;
  let memoryImageStore: Record<string, { mime: string; base64: string; size?: number; updatedAt?: number }> = {};

  const readImageStore = (): Record<string, { mime: string; base64: string; size?: number; updatedAt?: number }> => {
    try {
      if (fs.existsSync(IMAGE_STORE_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(IMAGE_STORE_FILE, "utf-8"));
        return { ...memoryImageStore, ...parsed };
      }
    } catch (e) {
      // fallback to memory
    }
    return memoryImageStore;
  };

  const writeImageStore = (store: Record<string, any>) => {
    memoryImageStore = { ...memoryImageStore, ...store };
    try {
      fs.writeFileSync(IMAGE_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
    } catch (e) {
      // ignore
    }
  };

  // Enforce requested Anti-Cache Headers on all API and Upload requests
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
    }
    next();
  });

  // Handler for serving images from disk OR reconstituting from persistent Image Store
  const serveImageHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const filename = path.basename(req.params.filename || req.path.replace(/^\/(uploads|api\/image)\//, ""));
    if (!filename) return next();

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const primaryPath = path.join(UPLOADS_DIR, filename);

    // 1. Check if primary file exists on disk
    try {
      if (fs.existsSync(primaryPath)) {
        const ext = path.extname(filename).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
        res.setHeader("Content-Type", mime);
        return res.sendFile(primaryPath);
      }
    } catch (e) {}

    // 2. Fallback: Reconstitute from persistent Image Store JSON or Memory
    const imgStore = readImageStore();
    if (imgStore[filename] && imgStore[filename].base64) {
      try {
        const item = imgStore[filename];
        const buffer = Buffer.from(item.base64, "base64");
        try {
          fs.writeFileSync(primaryPath, buffer);
        } catch (we) {}
        res.setHeader("Content-Type", item.mime || "image/jpeg");
        res.setHeader("Content-Length", buffer.length);
        return res.send(buffer);
      } catch (e) {
        console.error("Error reconstituting image from store", e);
      }
    }

    return res.status(404).json({ error: "Image not found", filename });
  };

  app.get("/uploads/:filename", serveImageHandler);
  app.get("/api/image/:filename", serveImageHandler);

  function saveBase64Image(dataUrl: string, prefix = "img"): string {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return dataUrl;
    }
    try {
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) return dataUrl;
      let ext = match[1].toLowerCase();
      if (ext === "jpeg") ext = "jpg";
      if (ext === "svg+xml") ext = "svg";
      const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);
      const buffer = Buffer.from(match[2], "base64");
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";

      try {
        fs.writeFileSync(filePath, buffer);
      } catch (e) {}

      try {
        const store = readImageStore();
        store[filename] = {
          mime,
          base64: match[2],
          size: buffer.length,
          updatedAt: Date.now(),
        };
        writeImageStore(store);
      } catch (storeErr) {
        console.warn("Failed to persist to image_store.json", storeErr);
      }

      return `/uploads/${filename}`;
    } catch (e) {
      console.warn("Failed to save base64 image", e);
      return dataUrl;
    }
  }

  function sanitizePayload(payload: any) {
    if (!payload || typeof payload !== "object") return payload;
    if (payload.settings) {
      if (payload.settings.chairmanImageUrl) {
        payload.settings.chairmanImageUrl = saveBase64Image(payload.settings.chairmanImageUrl, "chairman");
      }
      if (payload.settings.heroImageUrl) {
        payload.settings.heroImageUrl = saveBase64Image(payload.settings.heroImageUrl, "hero");
      }
    }
    if (Array.isArray(payload.gallery)) {
      payload.gallery = payload.gallery.map((g: any) => ({
        ...g,
        imageUrl: g.imageUrl ? saveBase64Image(g.imageUrl, `gallery_${g.id || "item"}`) : g.imageUrl,
      }));
    }
    if (Array.isArray(payload.popups)) {
      payload.popups = payload.popups.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl ? saveBase64Image(p.imageUrl, `popup_${p.id || "item"}`) : p.imageUrl,
      }));
    }
    return payload;
  }

  const readStore = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {}
    return memoryStore;
  };

  const writeStore = (data: any) => {
    memoryStore = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {}
  };

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({ status: "ok", timestamp: Date.now(), isVercel });
  });

  app.get("/api/debug", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const data = readStore() || {};
    const imgStore = readImageStore();
    res.json({
      serverTime: new Date().toISOString(),
      timestamp: Date.now(),
      isVercel,
      galleryCount: data.gallery?.length || 0,
      noticesCount: data.notices?.length || 0,
      programsCount: data.programs?.length || 0,
      popupsCount: data.popups?.length || 0,
      imageStoreKeys: Object.keys(imgStore),
      diskFiles: fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [],
    });
  });

  app.post("/api/upload", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const { image, prefix } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    const url = saveBase64Image(image, prefix || "upload");
    res.json({ success: true, url, timestamp: Date.now() });
  });

  app.get("/api/data", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const data = readStore();
    res.json({ success: true, data, timestamp: Date.now() });
  });

  app.post("/api/settings", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const current = readStore() || {};
    let bodySettings = req.body?.settings || req.body || {};

    if (bodySettings.chairmanImageUrl) {
      bodySettings.chairmanImageUrl = saveBase64Image(bodySettings.chairmanImageUrl, "chairman");
    }
    if (bodySettings.heroImageUrl) {
      bodySettings.heroImageUrl = saveBase64Image(bodySettings.heroImageUrl, "hero");
    }

    const updated = {
      ...current,
      settings: {
        ...(current.settings || {}),
        ...bodySettings,
      },
    };
    writeStore(updated);
    res.json({ success: true, settings: updated.settings, timestamp: Date.now() });
  });

  app.post("/api/sync", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const rawPayload = req.body || {};
    const payload = sanitizePayload(rawPayload);
    const current = readStore() || {};
    const payloadSettings = payload.settings || {};

    const merged = {
      ...current,
      ...payload,
      settings: payload.settings ? { ...(current.settings || {}), ...payloadSettings } : current.settings,
    };
    writeStore(merged);
    res.json({ success: true, data: merged, timestamp: Date.now() });
  });

  app.get("/api/gallery", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const data = readStore() || {};
    res.json({ success: true, gallery: data.gallery || [], timestamp: Date.now() });
  });

  app.post("/api/gallery", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const current = readStore() || {};
    let rawGallery = req.body?.gallery || req.body || [];
    if (!Array.isArray(rawGallery)) rawGallery = [];

    const processedGallery = rawGallery.map((g: any) => ({
      ...g,
      imageUrl: g.imageUrl ? saveBase64Image(g.imageUrl, `gallery_${g.id || "item"}`) : g.imageUrl,
    }));

    const updated = {
      ...current,
      gallery: processedGallery,
    };
    writeStore(updated);
    res.json({ success: true, gallery: updated.gallery, timestamp: Date.now() });
  });

  return app;
}
