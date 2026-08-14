import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_FILE = path.join(DATA_DIR, "foundation_store.json");
  const IMAGE_STORE_FILE = path.join(DATA_DIR, "image_store.json");
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  const DIST_UPLOADS_DIR = path.join(process.cwd(), "dist", "uploads");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Persistent In-Memory / File-based Image Store to survive serverless/container resets
  const readImageStore = (): Record<string, { mime: string; base64: string; size?: number; updatedAt?: number }> => {
    try {
      if (fs.existsSync(IMAGE_STORE_FILE)) {
        return JSON.parse(fs.readFileSync(IMAGE_STORE_FILE, "utf-8"));
      }
    } catch (e) {
      console.warn("Failed to read IMAGE_STORE_FILE", e);
    }
    return {};
  };

  const writeImageStore = (store: Record<string, any>) => {
    try {
      fs.writeFileSync(IMAGE_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write IMAGE_STORE_FILE", e);
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
    const distPath = path.join(DIST_UPLOADS_DIR, filename);

    // 1. Check if primary file exists on disk
    if (fs.existsSync(primaryPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
      res.setHeader("Content-Type", mime);
      return res.sendFile(primaryPath);
    }

    // 2. Check if dist file exists on disk
    if (fs.existsSync(distPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
      res.setHeader("Content-Type", mime);
      return res.sendFile(distPath);
    }

    // 3. Fallback: Reconstitute from persistent Image Store JSON
    const imgStore = readImageStore();
    if (imgStore[filename] && imgStore[filename].base64) {
      try {
        const item = imgStore[filename];
        const buffer = Buffer.from(item.base64, "base64");
        // Re-write to disk so future requests are fast
        try {
          fs.writeFileSync(primaryPath, buffer);
        } catch (we) {
          // ignore write error in read-only environment
        }
        res.setHeader("Content-Type", item.mime || "image/jpeg");
        res.setHeader("Content-Length", buffer.length);
        return res.send(buffer);
      } catch (e) {
        console.error("Error reconstituting image from store", e);
      }
    }

    // 4. If image is not found, fallback to 404 or pass
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

      // 1. Save to public/uploads
      fs.writeFileSync(filePath, buffer);

      // 2. Also sync to dist/uploads if dist directory exists
      try {
        if (fs.existsSync(path.join(process.cwd(), "dist"))) {
          if (!fs.existsSync(DIST_UPLOADS_DIR)) {
            fs.mkdirSync(DIST_UPLOADS_DIR, { recursive: true });
          }
          fs.writeFileSync(path.join(DIST_UPLOADS_DIR, filename), buffer);
        }
      } catch (e) {
        console.warn("Could not copy to dist/uploads", e);
      }

      // 3. Save to persistent image_store.json
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
    } catch (e) {
      console.warn("Failed to read DB_FILE", e);
    }
    return null;
  };

  const writeStore = (data: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write DB_FILE", e);
    }
  };

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({ status: "ok", timestamp: Date.now() });
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
    let bodySettings = req.body || {};

    // Preserve custom chairman image if incoming image is the old unsplash stock image
    if (
      bodySettings.chairmanImageUrl &&
      bodySettings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a") &&
      current.settings?.chairmanImageUrl &&
      !current.settings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a")
    ) {
      bodySettings.chairmanImageUrl = current.settings.chairmanImageUrl;
    }

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

    if (
      payloadSettings.chairmanImageUrl &&
      payloadSettings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a") &&
      current.settings?.chairmanImageUrl &&
      !current.settings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a")
    ) {
      payloadSettings.chairmanImageUrl = current.settings.chairmanImageUrl;
    }

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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
