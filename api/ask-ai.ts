import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAskAiRequest } from "./_shared/aiConsultant";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ reply: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp =
    (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const result = await handleAskAiRequest(req.body || {}, clientIp);
  res.status(result.status).json(result.body);
}
