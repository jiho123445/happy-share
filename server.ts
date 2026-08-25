import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handleAskAiRequest } from "./api/_shared/aiConsultant";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", academy: "홍천 중앙정보처리학원" });
  });

  // 동적 sitemap (프로덕션에서는 Vercel이 api/sitemap.ts로 라우팅합니다.
  // 로컬 개발 중에도 동일하게 테스트할 수 있도록 여기서도 같은 핸들러를 씁니다.)
  app.get("/sitemap.xml", async (req, res) => {
    const { default: sitemapHandler } = await import("./api/sitemap");
    // @ts-ignore - Express Request/Response는 VercelRequest/VercelResponse와
    // 이 핸들러가 실제로 쓰는 메서드(status/setHeader/send) 형태가 호환됩니다.
    await sitemapHandler(req as any, res as any);
  });

  // AI Course Advice Endpoint using Gemini
  // (프로덕션/Vercel에서는 api/ask-ai.ts 서버리스 함수가 같은 로직을
  //  api/_shared/aiConsultant.ts에서 공유해서 사용합니다.)
  app.post("/api/ask-ai", async (req, res) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const clientIp =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const result = await handleAskAiRequest(req.body, clientIp);
    res.status(result.status).json(result.body);
  });

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hongcheon JAHRD Server running on http://localhost:${PORT}`);
  });
}

startServer();
