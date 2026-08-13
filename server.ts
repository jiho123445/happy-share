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
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Serve static uploaded images directly
  app.use("/uploads", express.static(UPLOADS_DIR));

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
      fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
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
        imageUrl: g.imageUrl ? saveBase64Image(g.imageUrl, `gallery_${g.id || "item"}`) : g.imageUrl
      }));
    }
    if (Array.isArray(payload.popups)) {
      payload.popups = payload.popups.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl ? saveBase64Image(p.imageUrl, `popup_${p.id || "item"}`) : p.imageUrl
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
    res.json({ status: "ok" });
  });

  app.post("/api/upload", (req, res) => {
    const { image, prefix } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    const url = saveBase64Image(image, prefix || "upload");
    res.json({ success: true, url });
  });

  app.get("/api/data", (req, res) => {
    const data = readStore();
    res.json({ success: true, data });
  });

  app.post("/api/settings", (req, res) => {
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
    res.json({ success: true, settings: updated.settings });
  });

  app.post("/api/sync", (req, res) => {
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
    res.json({ success: true, data: merged });
  });

  app.get("/api/gallery", (req, res) => {
    const data = readStore() || {};
    res.json({ success: true, gallery: data.gallery || [] });
  });

  app.post("/api/gallery", (req, res) => {
    const current = readStore() || {};
    let rawGallery = req.body?.gallery || req.body || [];
    if (!Array.isArray(rawGallery)) rawGallery = [];
    
    const processedGallery = rawGallery.map((g: any) => ({
      ...g,
      imageUrl: g.imageUrl ? saveBase64Image(g.imageUrl, `gallery_${g.id || "item"}`) : g.imageUrl
    }));

    const updated = {
      ...current,
      gallery: processedGallery
    };
    writeStore(updated);
    res.json({ success: true, gallery: updated.gallery });
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
