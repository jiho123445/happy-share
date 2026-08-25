import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * POST /api/set-student-approval
 * body: { uid: string, status: '승인됨' | '거절됨' | '승인대기' }
 * header: Authorization: Bearer <관리자 계정의 Firebase ID 토큰>
 *
 * 수강생의 Firestore 승인 상태를 바꾸는 동시에, Firebase Authentication의
 * Custom Claims에도 approved: true/false를 심어줍니다.
 *
 * ⚠️ 현재 이 Custom Claims는 어디에서도 실제로 읽지 않습니다(2026-08
 * 기준). Storage 접근 제어는 지금은 이메일 기반 관리자 확인 +
 * `api/download-material.ts`의 서버 측 Firestore 조회 방식으로 처리하고
 * 있어서, 이 클레임은 남겨진 이전 설계의 흔적입니다. 실제 승인 여부의
 * 기준(source of truth)은 어디까지나 Firestore의 `students.status`
 * 필드이며, 이 클레임 값이 실제 상태와 다르더라도 승인/차단 동작에는
 * 영향이 없습니다. 나중에 Storage 규칙에서 다시 활용할 계획이 없다면
 * 이 setCustomUserClaims 호출은 안전하게 제거해도 됩니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const { uid, status } = req.body || {};

  const validStatuses = ["승인됨", "거절됨", "승인대기"];
  if (!idToken || typeof uid !== "string" || !uid || !validStatuses.includes(status)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }

  function getServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.");
    return JSON.parse(raw);
  }

  function getAdminApp() {
    const existing = getApps();
    if (existing.length > 0) return existing[0];
    return initializeApp({ credential: cert(getServiceAccount()) });
  }

  let adminAuth;
  let adminDb;
  try {
    const app = getAdminApp();
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
  } catch (configErr: any) {
    console.error("Firebase Admin SDK 초기화 실패:", configErr);
    res.status(500).json({ error: "SERVICE_ACCOUNT_NOT_CONFIGURED" });
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerUid = decoded.uid;

    const adminDoc = await adminDb.collection("admins").doc(callerUid).get();
    if (!adminDoc.exists) {
      res.status(403).json({ error: "관리자 권한이 없습니다." });
      return;
    }

    // 1. Firestore 상태 변경
    await adminDb.collection("students").doc(uid).update({ status });

    // 2. Custom Claims 설정 (승인됨일 때만 approved: true, 그 외에는 false로
    //    명시적으로 지워서 예전 승인 상태가 토큰에 남아있지 않게 합니다.)
    await adminAuth.setCustomUserClaims(uid, { approved: status === "승인됨" });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("수강생 승인 처리 실패:", error);
    res.status(500).json({ error: "처리 중 오류가 발생했습니다." });
  }
}
