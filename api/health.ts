import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: "ok", academy: "홍천 중앙정보처리학원" });
}
