/**
 * adminAuth.ts - 관리자 인증 모듈
 *
 * 여기서 로그인이 성공해도 그것만으로 관리자 권한이 생기는 건 아닙니다.
 * 실제 데이터 접근 권한은 Firestore 보안규칙의 isAdmin() 함수가 최종
 * 판단하는데, 이 함수는 단순 로그인 여부가 아니라 Firestore의 `admins`
 * 컬렉션에 본인 UID로 된 문서가 실제로 존재하는지까지 확인합니다.
 * 즉 로그인은 여기(Firebase Authentication)에서, 권한 판단은 Firestore
 * 규칙(및 서버리스 함수의 Admin SDK 검증)에서 이뤄지는 구조입니다.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

export async function loginAdmin(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error?.code));
  }
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export function onAdminAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * 현재 로그인된 관리자 본인의 비밀번호를 변경합니다.
 * 보안을 위해 현재 비밀번호로 재인증(reauthenticate)한 뒤에만 변경을 허용합니다.
 * (다른 관리자의 비밀번호는 변경할 수 없고, 본인 것만 가능합니다.)
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.");
  }
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error?.code));
  }
}

export function getCurrentAdminEmail(): string | null {
  return auth.currentUser?.email ?? null;
}

function getAuthErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "올바르지 않은 이메일 형식입니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 일치하지 않습니다.";
    case "auth/too-many-requests":
      return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/requires-recent-login":
      return "보안을 위해 다시 로그인한 후 시도해 주세요.";
    default:
      return "요청을 처리하지 못했습니다. 입력 정보를 확인해 주세요.";
  }
}
