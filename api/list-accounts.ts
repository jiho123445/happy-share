import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * POST /api/list-accounts
 * header: Authorization: Bearer <관리자 계정의 Firebase ID 토큰>
 *
 * Firebase Authentication에 등록된 모든 로그인 계정을 조회하고, 각 계정이
 * admins/students 컬렉션 중 어디에 속하는지(또는 어디에도 속하지 않는
 * "고아 계정"인지) 함께 반환합니다. 관리자 화면에서 "전체 계정 관리" 탭을
 * 통해 한눈에 정리할 수 있게 하기 위한 API입니다.
 *
 * ⚠️ delete-student.ts와 동일한 이유로, Admin SDK 초기화 로직을 이 파일
 * 안에 직접 포함했습니다(별도 공유 모듈로 분리 시 Vercel 배포 환경에서
 * 모듈을 찾지 못하는 문제가 있었습니다).
 */

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY 값이 올바른 JSON 형식이 아닙니다.");
  }
}

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({ credential: cert(getServiceAccount()) });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!idToken) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
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

    const callerAdminDoc = await adminDb.collection("admins").doc(callerUid).get();
    if (!callerAdminDoc.exists) {
      res.status(403).json({ error: "관리자 권한이 없습니다." });
      return;
    }

    // Firebase Authentication에 등록된 계정 전체 조회 (최대 1000개, 소규모
    // 학원 사이트 규모에서는 충분합니다. 더 많아지면 페이지네이션이 필요해요.)
    const listResult = await adminAuth.listUsers(1000);

    const [adminsSnap, studentsSnap] = await Promise.all([
      adminDb.collection("admins").get(),
      adminDb.collection("students").get(),
    ]);

    const adminUids = new Set(adminsSnap.docs.map((d) => d.id));
    const studentMap = new Map<string, FirebaseFirestore.DocumentData>(
      studentsSnap.docs.map((d) => [d.id, d.data()])
    );

    const accounts = listResult.users.map((u) => {
      const uid = u.uid;
      if (adminUids.has(uid)) {
        return {
          uid,
          email: u.email || "",
          createdAt: u.metadata.creationTime,
          role: "admin" as const,
        };
      }
      const studentData = studentMap.get(uid);
      if (studentData) {
        return {
          uid,
          email: u.email || "",
          createdAt: u.metadata.creationTime,
          role: "student" as const,
          name: studentData.name || "",
          phone: studentData.phone || "",
          status: studentData.status || "승인대기",
        };
      }
      return {
        uid,
        email: u.email || "",
        createdAt: u.metadata.creationTime,
        role: "unknown" as const,
      };
    });

    // 최근 가입순으로 정렬
    accounts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    res.status(200).json({ accounts });
  } catch (error: any) {
    console.error("계정 목록 조회 실패:", error);
    res.status(401).json({ error: "인증 확인에 실패했습니다. 다시 로그인 후 시도해 주세요." });
  }
}
