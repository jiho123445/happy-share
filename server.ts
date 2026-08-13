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

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
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

  app.get("/api/data", (req, res) => {
    const data = readStore();
    res.json({ success: true, data });
  });

  app.post("/api/settings", (req, res) => {
    const current = readStore() || {};
    const bodySettings = req.body || {};
    
    // Preserve custom chairman image if incoming image is the old unsplash stock image
    if (
      bodySettings.chairmanImageUrl &&
      bodySettings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a") &&
      current.settings?.chairmanImageUrl &&
      !current.settings.chairmanImageUrl.includes("photo-1560250097-0b93528c311a")
    ) {
      bodySettings.chairmanImageUrl = current.settings.chairmanImageUrl;
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
    const payload = req.body || {};
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
    const gallery = req.body?.gallery || req.body || [];
    const updated = {
      ...current,
      gallery: Array.isArray(gallery) ? gallery : current.gallery || []
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
