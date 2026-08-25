import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * POST /api/download-material
 * body: { materialId: string }
 * header: Authorization: Bearer <로그인 계정의 Firebase ID 토큰>
 *
 * ⚠️ 왜 이 API가 필요한가 (중요한 설계 변경 배경):
 * 이전 버전은 업로드 시점에 Firebase Storage의 getDownloadURL()로 만든
 * "다운로드 토큰이 포함된 URL"을 Firestore materials 문서에 그대로 저장해
 * 두고, 승인된 수강생이 그 문서를 읽을 수 있으면 그 URL을 그대로 다운로드에
 * 썼습니다.
 *
 * 문제는, 이런 토큰 포함 URL은 Firebase Storage 보안 규칙(storage.rules)을
 * 아예 거치지 않고 파일을 내려받을 수 있다는 점입니다(Firebase의 잘 알려진
 * 동작 방식입니다). 즉 그 URL 자체를 알고 있는 사람은, 승인 여부나 로그인
 * 여부와 무관하게 파일을 받을 수 있었습니다. 승인된 수강생이 실수로(또는
 * 의도적으로) 그 링크를 다른 사람에게 전달하면, 그 사람은 로그인조차
 * 필요 없이 파일에 접근할 수 있는 셈이었습니다.
 *
 * 이 API는 그 문제를 해결합니다: Firestore에는 이제 storagePath만 저장하고,
 * 실제 다운로드 링크는 "요청할 때마다" 이 서버가 (1) 로그인 여부, (2) 관리자
 * 또는 승인된 수강생 여부, (3) '학원서식'처럼 수강생에게 금지된 유형인지
 * 를 매번 다시 확인한 뒤, 5분 안에 만료되는 임시 링크를 새로 발급합니다.
 * 이렇게 하면 링크가 유출되더라도 금방 무효화되고,애초에 승인되지 않은
 * 사람은 링크 자체를 받을 수 없습니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const { materialId } = req.body || {};

  if (!idToken || typeof materialId !== "string" || !materialId) {
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
    return initializeApp({
      credential: cert(getServiceAccount()),
      storageBucket: "joongang-homepage.firebasestorage.app",
    });
  }

  let adminAuth;
  let adminDb;
  let bucket;
  try {
    const app = getAdminApp();
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    bucket = getStorage(app).bucket();
  } catch (configErr: any) {
    console.error("Firebase Admin SDK 초기화 실패:", configErr);
    res.status(500).json({ error: "SERVICE_ACCOUNT_NOT_CONFIGURED" });
    return;
  }

  try {
    // 1. 요청자 신원 확인
    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerUid = decoded.uid;

    // 2. 관리자 또는 승인된 수강생인지 확인
    const adminDoc = await adminDb.collection("admins").doc(callerUid).get();
    const isCallerAdmin = adminDoc.exists;

    let isApprovedStudent = false;
    if (!isCallerAdmin) {
      const studentDoc = await adminDb.collection("students").doc(callerUid).get();
      isApprovedStudent = studentDoc.exists && studentDoc.data()?.status === "승인됨";
    }

    if (!isCallerAdmin && !isApprovedStudent) {
      res.status(403).json({ error: "권한이 없습니다." });
      return;
    }

    // 3. 자료 정보 조회
    const materialDoc = await adminDb.collection("materials").doc(materialId).get();
    if (!materialDoc.exists) {
      res.status(404).json({ error: "자료를 찾을 수 없습니다." });
      return;
    }
    const material = materialDoc.data()!;

    // 4. 학생은 '예제서식'과 '채점프로그램'만 다운로드할 수 있습니다.
    // 기존 버전의 '예제 파일' 데이터는 하위 호환을 위해 허용합니다.
    const studentVisibleTypes = new Set(["예제서식", "채점프로그램", "예제 파일"]);
    if (!isCallerAdmin && !studentVisibleTypes.has(String(material.materialType || ""))) {
      res.status(403).json({ error: "권한이 없습니다." });
      return;
    }

    if (!material.storagePath) {
      res.status(500).json({ error: "파일 경로 정보가 없습니다." });
      return;
    }

    // 5. 5분간만 유효한 임시 다운로드 링크 발급
    const asciiFallbackName = String(material.fileName || "download").replace(/[^\x00-\x7F]/g, "_");
    const [url] = await bucket.file(material.storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 5 * 60 * 1000,
      responseDisposition: `attachment; filename="${asciiFallbackName}"; filename*=UTF-8''${encodeURIComponent(
        String(material.fileName || "download")
      )}`,
    });

    // 6. 다운로드 횟수 집계 (서버에서 처리하는 게 클라이언트 직접 증가보다 신뢰도 높음)
    try {
      await adminDb.collection("materials").doc(materialId).update({
        downloadCount: (material.downloadCount || 0) + 1,
      });
    } catch (countErr) {
      console.warn("다운로드 횟수 집계 실패(다운로드 자체는 계속 진행):", countErr);
    }

    res.status(200).json({ url, fileName: material.fileName });
  } catch (error: any) {
    console.error("자료 다운로드 링크 발급 실패:", error);
    res.status(401).json({ error: "인증 확인에 실패했습니다. 다시 로그인 후 시도해 주세요." });
  }
}
