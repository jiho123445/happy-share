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
    const updated = {
      ...current,
      settings: {
        ...(current.settings || {}),
        ...req.body,
      },
    };
    writeStore(updated);
    res.json({ success: true, settings: updated.settings });
  });

  app.post("/api/sync", (req, res) => {
    const payload = req.body || {};
    const current = readStore() || {};
    const merged = {
      ...current,
      ...payload,
      settings: payload.settings ? { ...(current.settings || {}), ...payload.settings } : current.settings,
    };
    writeStore(merged);
    res.json({ success: true, data: merged });
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
