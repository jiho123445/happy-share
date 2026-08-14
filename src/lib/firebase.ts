import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
// Cloud Storage: 이미지/첨부파일 원본은 여기에 저장하고, Firestore 문서에는
// 다운로드 URL(짧은 문자열)만 저장한다. (Firestore 문서 1개 최대 1MB 제한 때문에
// base64 이미지를 문서에 직접 넣으면 안 됨 — 반드시 이 규칙을 지킬 것)
export const storage = getStorage(app);
