/**
 * studentAuth.ts - 수강생(자료실 이용자) 인증 모듈
 *
 * 관리자와 동일한 Firebase Authentication을 공유하되, 계정이 관리자인지
 * 수강생인지는 Firestore의 별도 컬렉션(admins / students)으로 구분합니다.
 * 회원가입 직후에는 students/{uid} 문서가 status: '승인대기' 상태로 생성되고,
 * 원장님이 관리자 화면에서 승인해야 자료실 열람 권한(status: '승인됨')이 생깁니다.
 *
 * 추가 보호장치 2가지:
 * 1. 전화번호 중복 가입 방지 - phoneRegistry/{정규화된전화번호} 문서를 통해,
 *    같은 번호로 여러 이메일 계정을 만드는 것을 막습니다.
 * 2. 이메일은 Firebase Authentication이 형식을 검증합니다.
 *    가입 후 별도의 이메일 실소유 인증은 요구하지 않습니다.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile } from "../types";

/** 전화번호에서 숫자만 남깁니다 (phoneRegistry 문서 ID로 사용). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function signUpStudent(data: {
  name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<User> {
  const normalizedPhone = normalizePhone(data.phone);
  const phoneRef = doc(db, "phoneRegistry", normalizedPhone);

  // 1. 먼저 이 전화번호로 이미 가입된 계정이 있는지 확인합니다 (계정을
  //    만들기 전에 미리 걸러내서, 불필요한 Auth 계정 생성을 피합니다).
  try {
    const existingPhone = await getDoc(phoneRef);
    if (existingPhone.exists()) {
      throw new Error("이미 등록된 연락처입니다. 같은 번호로는 한 계정만 가입할 수 있어요.");
    }
  } catch (err: any) {
    if (err instanceof Error && err.message.startsWith("이미 등록된")) throw err;
    // 조회 자체가 실패한 경우(권한/네트워크)는 일단 진행하고, 아래 2단계의
    // Firestore 규칙이 최종적으로 중복을 막아줍니다.
    console.warn("전화번호 중복 확인 실패, 계속 진행합니다:", err);
  }

  let user: User;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    user = userCredential.user;
  } catch (error: any) {
    throw new Error(getStudentAuthErrorMessage(error?.code));
  }

  // 2. 전화번호를 "선점"합니다. 이미 다른 계정이 그 사이에 선점했다면
  //    (동시 가입 등 드문 경우), Firestore 규칙이 이 쓰기를 거부합니다 -
  //    문서가 이미 존재하면 본인이 아닌 쓰기는 update로 취급되어 차단됩니다.
  try {
    await setDoc(phoneRef, {
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("전화번호 등록 실패(중복 가능성) - 방금 만든 계정을 정리합니다:", err);
    try {
      await deleteUser(user);
    } catch (cleanupErr) {
      console.error("계정 정리 실패:", cleanupErr);
    }
    throw new Error("이미 등록된 연락처입니다. 같은 번호로는 한 계정만 가입할 수 있어요.");
  }

  // 3. 수강생 프로필 생성. 여기서 실패하면(네트워크 오류 등) 앞서 이미
  //    만들어진 Auth 계정과 phoneRegistry 선점 기록이 "고아 상태"로 남게
  //    되므로, 반드시 함께 롤백합니다.
  try {
    await setDoc(doc(db, "students", user.uid), {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      status: "승인대기",
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
  } catch (err) {
    console.error("수강생 프로필 생성 실패 - 계정과 전화번호 선점을 롤백합니다:", err);
    try {
      await deleteDoc(phoneRef);
    } catch (cleanupErr) {
      console.error("전화번호 선점 롤백 실패:", cleanupErr);
    }
    try {
      await deleteUser(user);
    } catch (cleanupErr) {
      console.error("계정 롤백 실패:", cleanupErr);
    }
    throw new Error("회원가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }

  // 4. 이메일 인증은 요구하지 않습니다. Firebase Authentication이
  //    회원가입 시 이메일 형식을 검증하며, 계정은 승인대기 상태로 생성됩니다.


  return user;
}

export async function loginStudent(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getStudentAuthErrorMessage(error?.code));
  }
}

/**
 * 비밀번호 재설정 메일을 보냅니다. (이 시스템은 별도 "아이디"가 없고
 * 이메일 자체가 로그인 아이디이므로, "아이디 찾기"는 필요 없고 비밀번호
 * 재설정만 제공합니다.)
 *
 * 보안을 위해 Firebase는 존재하지 않는 이메일에 대해서도 에러를 던지지
 * 않는 것이 기본 동작(계정 존재 여부를 외부에 노출하지 않기 위함)이라,
 * 이 함수도 항상 "메일을 보냈다"는 동일한 메시지를 보여주는 것을 권장합니다.
 */
export async function resetStudentPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    // auth/user-not-found는 계정 존재 여부를 알려주는 정보 노출이라, 다른
    // 오류(잘못된 이메일 형식 등)만 실제 에러로 보여주고 나머지는 조용히
    // 성공 처리합니다.
    if (error?.code === "auth/invalid-email") {
      throw new Error("올바르지 않은 이메일 형식입니다.");
    }
    if (error?.code === "auth/too-many-requests") {
      throw new Error("시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
    }
    // auth/user-not-found 등은 무시(성공한 것처럼 처리)합니다.
  }
}

export async function logoutStudent(): Promise<void> {
  await signOut(auth);
}

export function onStudentAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * 현재 로그인된 계정의 students/{uid} 문서를 실시간 구독합니다.
 * 문서가 없으면(예: 관리자 계정으로 로그인한 경우) null을 전달합니다.
 *
 * ⚠️ 문서가 "존재하지 않는 것"과 "권한 오류 등으로 읽기 자체가 실패한 것"은
 * 반드시 구분해야 합니다. 둘 다 null로 처리해버리면, Firestore 규칙이 아직
 * 배포되지 않았거나 네트워크 문제가 있을 때 수강생 계정이 "프로필 없음 =
 * 관리자 계정"으로 잘못 인식되어 승인 절차 없이 자료실을 통과해버리는
 * 심각한 문제가 생깁니다(실패 시 오히려 문이 열리는 구조는 위험합니다).
 * 그래서 읽기 실패 시에는 onError로 별도 통지하고, onUpdate(null)을
 * 호출하지 않습니다.
 */
export function subscribeStudentProfile(
  uid: string,
  onUpdate: (profile: StudentProfile | null) => void,
  onError?: (error: unknown) => void
): () => void {
  return onSnapshot(
    doc(db, "students", uid),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate({
        uid: snap.id,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        status: data.status || "승인대기",
        createdAt: data.createdAtIso || "",
      });
    },
    (err) => {
      console.error("수강생 프로필 구독 실패:", err);
      if (onError) {
        onError(err);
      }
    }
  );
}

function getStudentAuthErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다. 로그인해 주세요.";
    case "auth/invalid-email":
      return "올바르지 않은 이메일 형식입니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 일치하지 않습니다.";
    case "auth/too-many-requests":
      return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    default:
      return "요청을 처리하지 못했습니다. 입력 정보를 확인해 주세요.";
  }
}
