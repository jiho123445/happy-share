import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * POST /api/delete-student
 * body: { uid: string }
 * header: Authorization: Bearer <관리자 계정의 Firebase ID 토큰>
 *
 * 요청자가 실제로 admins 컬렉션에 등록된 관리자인지 서버에서 직접 검증한 뒤,
 * 대상 계정의 Firebase Authentication 로그인 정보와 Firestore students 문서를
 * 모두 삭제합니다. 클라이언트 SDK만으로는 다른 사람의 Auth 계정을 지울 수
 * 없어서, 이 서버리스 함수가 필요합니다.
 *
 * ⚠️ Firebase Admin SDK 초기화 로직을 별도 공유 파일(_shared/*)로 분리하지
 * 않고 이 파일 안에 직접 포함했습니다. 별도 파일로 분리했을 때 Vercel 배포
 * 환경에서 "Cannot find module .../_shared/firebaseAdmin" 오류로 함수 자체가
 * 실행되지 못하는 문제가 있었기 때문입니다(로컬 빌드/타입체크는 정상이었지만
 * 실제 배포에서만 발생). 이 API 라우트 하나에서만 쓰는 로직이라 굳이 공유
 * 모듈로 뺄 필요가 없어서, 독립 파일 구조로 되돌렸습니다.
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
  const { uid } = req.body || {};

  if (!idToken || typeof uid !== "string" || !uid) {
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
    // 1. 요청자 신원 확인 (ID 토큰 검증)
    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerUid = decoded.uid;

    // 2. 요청자가 실제 관리자인지 확인 (admins 컬렉션, 규칙 우회 가능한 Admin SDK 사용)
    const adminDoc = await adminDb.collection("admins").doc(callerUid).get();
    if (!adminDoc.exists) {
      res.status(403).json({ error: "관리자 권한이 없습니다." });
      return;
    }

    // 2-1. 삭제 대상이 관리자 계정이면 거부합니다. 지금 화면(UI)에는 관리자
    // 삭제 버튼 자체가 없지만, 권한 검사는 화면이 아니라 요청을 실제로
    // 처리하는 서버에서 매번 강제해야 합니다. 이 검사가 없으면, 관리자
    // 계정이 탈취되거나 API가 직접 호출될 경우 다른 관리자(또는 자기 자신)
    // 계정을 삭제해버릴 수 있습니다.
    const targetAdminDoc = await adminDb.collection("admins").doc(uid).get();
    if (targetAdminDoc.exists) {
      res.status(403).json({ error: "관리자 계정은 이 기능으로 삭제할 수 없습니다." });
      return;
    }

    // 3. 대상 계정의 phoneRegistry 잠금도 함께 해제합니다. (그렇지 않으면
    //    계정은 삭제됐는데 전화번호 중복 방지 기록만 남아서, 같은 번호로
    //    재가입이 계속 막히는 문제가 생깁니다.)
    const studentDoc = await adminDb.collection("students").doc(uid).get();
    const phoneToRelease: string | null = studentDoc.exists
      ? String(studentDoc.data()?.phone || "").replace(/\D/g, "") || null
      : null;

    // 4. 대상 계정의 Authentication 로그인 정보, Firestore 프로필,
    //    전화번호 잠금을 모두 삭제합니다.
    const deletionTasks: { label: string; promise: Promise<unknown> }[] = [
      { label: "auth", promise: adminAuth.deleteUser(uid) },
      { label: "students", promise: adminDb.collection("students").doc(uid).delete() },
    ];
    if (phoneToRelease) {
      deletionTasks.push({
        label: "phoneRegistry",
        promise: adminDb.collection("phoneRegistry").doc(phoneToRelease).delete(),
      });
    }

    const results = await Promise.allSettled(deletionTasks.map((t) => t.promise));

    // ⚠️ 이전에는 Auth 삭제 결과만 확인하고 나머지(students, phoneRegistry)
    // 실패는 조용히 무시한 채 무조건 성공으로 응답했습니다. 그러면 예를 들어
    // "Auth는 지워졌는데 phoneRegistry만 실패로 남는" 부분 실패 상황을
    // 관리자가 알 방법이 없었습니다. 이제는 각 작업을 개별적으로 확인하고,
    // 실패한 항목이 있으면(이미 삭제된 상태를 뜻하는 auth/user-not-found는
    // 제외) 어떤 항목이 실패했는지 그대로 알려줍니다.
    const failed: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const code = (result.reason as any)?.code;
        if (deletionTasks[i].label === "auth" && code === "auth/user-not-found") {
          return; // 이미 삭제된 계정은 실패로 취급하지 않음
        }
        console.error(`${deletionTasks[i].label} 삭제 실패:`, result.reason);
        failed.push(deletionTasks[i].label);
      }
    });

    if (failed.length > 0) {
      res.status(500).json({
        error: `일부 항목 삭제에 실패했습니다: ${failed.join(", ")}. 다시 시도해 주세요.`,
        failedItems: failed,
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("수강생 계정 삭제 처리 실패:", error);
    res.status(401).json({ error: "인증 확인에 실패했습니다. 다시 로그인 후 시도해 주세요." });
  }
}
