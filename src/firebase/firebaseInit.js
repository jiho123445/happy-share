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
  apiKey: "AIzaSyAF0bm83erZuKrL3tAwsFef_wW2bIuy7GM",
  authDomain: "happy-share-288ad.firebaseapp.com",
  projectId: "happy-share-288ad",
  storageBucket: "happy-share-288ad.firebasestorage.app",
  messagingSenderId: "363148942733",
  appId: "1:363148942733:web:58b40dc86c41a1006871c4",
  measurementId: "G-ZL6TZGM8NB"
};

// 앱 중복 초기화 방지
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 파이어베이스 핵심 서비스 객체 생성
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
