/**
 * auth.js - 관리자 인증 모듈
 * 
 * 목적: 관리자 이메일/비밀번호 로그인, 로그아웃, 현재 로그인 상태 감지 리스너 제공
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebaseInit.js";

/**
 * 관리자 이메일/비밀번호 로그인
 * @param {string} email - 관리자 이메일 주소
 * @param {string} password - 관리자 비밀번호
 * @returns {Promise<import("firebase/auth").UserCredential>} 로그인된 사용자 객체
 */
export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("관리자 로그인 성공:", userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error("관리자 로그인 오류:", error.code, error.message);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * 관리자 로그아웃
 * @returns {Promise<void>}
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
    console.log("관리자 로그아웃 완료");
  } catch (error) {
    console.error("관리자 로그아웃 오류:", error);
    throw new Error("로그아웃 처리 중 오류가 발생했습니다.");
  }
}

/**
 * 현재 로그인한 관리자 상태 변경 감지 리스너
 * @param {function(import("firebase/auth").User|null): void} callback - 상태 변경 시 실행할 콜백 함수
 * @returns {import("firebase/auth").Unsubscribe} 리스너 해제 함수
 */
export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * 인증 오류 코드 한글 메시지 변환
 * @param {string} errorCode 
 * @returns {string}
 */
function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "올바르지 않은 이메일 형식입니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 일치하지 않습니다.";
    case "auth/too-many-requests":
      return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    default:
      return "로그인에 실패했습니다. 입력 정보를 확인해 주세요.";
  }
}
