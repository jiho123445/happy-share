/**
 * gallery.js - 활동사진 관리 모듈
 * 
 * 목적: Cloud Storage 이미지 업로드 및 Firestore 'activities' 컬렉션의 사진 데이터 CRUD
 */

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { db, storage } from "../lib/firebase.ts";

const COLLECTION_NAME = "activities";

/**
 * 이미지 파일 업로드 + Firestore 'activities' 컬렉션에 정보 저장
 * @param {File} file - 업로드할 이미지 파일 객체
 * @param {string} title - 활동사진 제목
 * @param {string} [category="재단활동"] - 사진 카테고리 (예: '나눔행사', '가족센터', '봉사활동')
 * @returns {Promise<Object>} 생성된 문서 데이터 및 ID
 */
export async function uploadPhoto(file, title, category = "재단활동") {
  try {
    if (!file) {
      throw new Error("업로드할 이미지 파일을 선택해 주세요.");
    }

    // 1. Cloud Storage에 고유 파일 경로 생성 및 업로드
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const storagePath = `activities/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // 2. Firestore 'activities' 컬렉션에 문서 생성
    const docData = {
      title: title.trim(),
      category: category.trim(),
      imageUrl: imageUrl,
      storagePath: storagePath,
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log("활동사진 등록 성공, Document ID:", docRef.id);

    return { id: docRef.id, ...docData, imageUrl };
  } catch (error) {
    console.error("활동사진 업로드 오류:", error);
    throw new Error("활동사진 업로드 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * Firestore에서 활동사진 목록 조회 (최신순 정렬)
 * @returns {Promise<Array<Object>>} 활동사진 목록 배열
 */
export async function getPhotos() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const photos = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      photos.push({
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.date
      });
    });

    return photos;
  } catch (error) {
    console.error("활동사진 목록 조회 오류:", error);
    throw new Error("활동사진 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * Storage의 이미지 파일과 Firestore 문서를 동시에 삭제
 * @param {string} docId - 삭제할 Firestore 문서 ID
 * @param {string} storagePath - Storage 내 파일 저장 경로
 * @returns {Promise<void>}
 */
export async function deletePhoto(docId, storagePath) {
  try {
    if (!docId) {
      throw new Error("삭제할 문서 ID가 필요합니다.");
    }

    // 1. Storage의 이미지 파일 삭제 (storagePath가 존재하는 경우)
    if (storagePath) {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef).catch((err) => {
        console.warn("Storage 파일 삭제 경고 (이미 삭제되었거나 경로 없음):", err.message);
      });
    }

    // 2. Firestore 문서 삭제
    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);

    console.log(`활동사진 삭제 완료 (Doc ID: ${docId})`);
  } catch (error) {
    console.error("활동사진 삭제 오류:", error);
    throw new Error("활동사진 삭제 중 오류가 발생했습니다: " + error.message);
  }
}
