/**
 * firebaseInit.js - 파이어베이스 초기화 모듈
 * 
 * 목적: Firebase App, Authentication, Firestore, Cloud Storage를 초기화하고
 * 프로젝트 전역에서 재사용할 수 있도록 서비스 객체들을 export합니다.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 환경변수 또는 파이어베이스 프로젝트 설정값
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyYOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-app-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// 앱 중복 초기화 방지
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 파이어베이스 핵심 서비스 객체 생성
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
