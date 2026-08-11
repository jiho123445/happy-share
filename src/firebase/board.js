/**
 * board.js - 공지사항 게시판 모듈
 * 
 * 목적: Firestore 'notices' 컬렉션의 공지사항 글 작성, 목록 조회, 수정, 삭제(CRUD) 제공
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebaseInit.js";

const COLLECTION_NAME = "notices";

/**
 * 공지사항 신규 작성 (관리자용)
 * @param {Object} noticeData 
 * @param {string} noticeData.title - 공지 제목
 * @param {string} noticeData.content - 공지 내용
 * @param {string} [noticeData.category="공지사항"] - 공지 카테고리 ('공지사항', '보도자료', '사업공고')
 * @param {boolean} [noticeData.isPinned=false] - 상단 고정 여부
 * @returns {Promise<Object>} 생성된 공지사항 데이터
 */
export async function createNotice({ title, content, category = "공지사항", isPinned = false }) {
  try {
    if (!title || !content) {
      throw new Error("제목과 내용은 필수 입력 사항입니다.");
    }

    const docData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      isPinned: Boolean(isPinned),
      views: 0,
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log("공지사항 작성 완료 Document ID:", docRef.id);

    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error("공지사항 작성 오류:", error);
    throw new Error("공지사항 등록 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * 공지사항 목록 조회 (최신순 및 상단 고정순 정렬)
 * @returns {Promise<Array<Object>>} 공지사항 목록 배열
 */
export async function getNotices() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const notices = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      notices.push({
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.date
      });
    });

    // 상단 고정글 우선 정렬
    notices.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return notices;
  } catch (error) {
    console.error("공지사항 목록 조회 오류:", error);
    throw new Error("공지사항 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * 특정 공지사항 상세 및 조회수 1 증가
 * @param {string} noticeId - 공지사항 문서 ID
 * @returns {Promise<Object>} 공지사항 상세 정보
 */
export async function getNoticeDetail(noticeId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, noticeId);
    
    // 조회수 1 증가
    await updateDoc(docRef, { views: increment(1) }).catch(() => {});

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("존재하지 않는 공지사항입니다.");
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("공지사항 상세 조회 오류:", error);
    throw new Error("공지사항 정보를 가져오는 중 오류가 발생했습니다.");
  }
}

/**
 * 공지사항 수정 (관리자용)
 * @param {string} noticeId - 공지사항 문서 ID
 * @param {Object} updateData - 수정할 공지 데이터 (title, content, category, isPinned 등)
 * @returns {Promise<void>}
 */
export async function updateNotice(noticeId, updateData) {
  try {
    if (!noticeId) {
      throw new Error("수정할 공지사항 ID가 필요합니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, noticeId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    console.log(`공지사항 수정 완료 (ID: ${noticeId})`);
  } catch (error) {
    console.error("공지사항 수정 오류:", error);
    throw new Error("공지사항 수정 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * 공지사항 삭제 (관리자용)
 * @param {string} noticeId - 삭제할 공지사항 문서 ID
 * @returns {Promise<void>}
 */
export async function deleteNotice(noticeId) {
  try {
    if (!noticeId) {
      throw new Error("삭제할 공지사항 ID가 필요합니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, noticeId);
    await deleteDoc(docRef);

    console.log(`공지사항 삭제 완료 (ID: ${noticeId})`);
  } catch (error) {
    console.error("공지사항 삭제 오류:", error);
    throw new Error("공지사항 삭제 중 오류가 발생했습니다: " + error.message);
  }
}
