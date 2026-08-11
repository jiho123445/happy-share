/**
 * contact.js - 문의하기 폼 모듈
 * 
 * 목적: 방문자 문의사항 제출('contacts' 컬렉션) 및 관리자 문의 목록 조회/삭제
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
import { db } from "./firebaseInit.js";

const COLLECTION_NAME = "contacts";

/**
 * [방문자용] 문의사항 제출
 * @param {Object} contactData
 * @param {string} contactData.name - 작성자 성명
 * @param {string} contactData.email - 작성자 이메일
 * @param {string} contactData.phone - 작성자 연락처
 * @param {string} contactData.message - 문의 내용
 * @returns {Promise<Object>} 접수된 문의 내역 정보
 */
export async function submitContact({ name, email, phone, message }) {
  try {
    if (!name || !message) {
      throw new Error("성명과 문의내용은 필수 입력 항목입니다.");
    }

    const docData = {
      name: name.trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      message: message.trim(),
      status: "접수대기", // '접수대기', '답변완료', '확인'
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log("문의사항 접수 완료 Document ID:", docRef.id);

    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error("문의사항 제출 오류:", error);
    throw new Error("문의 접수 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * [관리자용] 문의 내역 목록 조회 (최신순)
 * @returns {Promise<Array<Object>>} 문의사항 목록 배열
 */
export async function getContactList() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const contacts = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      contacts.push({
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.date
      });
    });

    return contacts;
  } catch (error) {
    console.error("문의 내역 목록 조회 오류:", error);
    throw new Error("문의 내역을 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * [관리자용] 문의 내역 삭제
 * @param {string} contactId - 삭제할 문의 내역 문서 ID
 * @returns {Promise<void>}
 */
export async function deleteContact(contactId) {
  try {
    if (!contactId) {
      throw new Error("삭제할 문의 ID가 필요합니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, contactId);
    await deleteDoc(docRef);

    console.log(`문의 내역 삭제 완료 (ID: ${contactId})`);
  } catch (error) {
    console.error("문의 내역 삭제 오류:", error);
    throw new Error("문의 내역 삭제 중 오류가 발생했습니다: " + error.message);
  }
}
