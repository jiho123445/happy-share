/**
 * donation.js - 후원 신청 및 관리 모듈
 * 
 * 목적: 사용자 후원 신청서 접수('donations' 컬렉션) 및 관리자의 후원 목록 조회/상태변경/삭제
 */

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebaseInit.js";

const COLLECTION_NAME = "donations";

/**
 * [사용자용] 후원 신청서 제출
 * @param {Object} donationData
 * @param {string} donationData.donorName - 후원자명 (또는 법인/단체명)
 * @param {string} donationData.phone - 연락처
 * @param {string} [donationData.email] - 이메일
 * @param {string} [donationData.type="정기후원"] - 후원 유형 ('정기후원' | '일시후원')
 * @param {number|string} donationData.amount - 후원 금액 (원)
 * @param {string} [donationData.paymentMethod="계좌이체"] - 납부 방식 ('자동이체', '계좌이체', '신용카드')
 * @param {string} [donationData.idNumber] - 주민번호 또는 사업자번호 (기부금영수증용, 선택)
 * @param {string} [donationData.message] - 응원 및 메시지 (선택)
 * @returns {Promise<Object>} 접수 완료된 후원 신청 정보
 */
export async function submitDonation({
  donorName,
  phone,
  email = "",
  type = "정기후원",
  amount,
  paymentMethod = "계좌이체",
  idNumber = "",
  message = ""
}) {
  try {
    if (!donorName || !phone || !amount) {
      throw new Error("후원자명, 연락처, 후원 금액은 필수 입력 항목입니다.");
    }

    const docData = {
      donorName: donorName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type: type,
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod,
      idNumber: idNumber.trim(), // 주민번호/사업자번호 (영수증 발급용)
      message: message.trim(),
      status: "접수", // 기본값: '접수' ('접수', '승인/완료', '취소', '보류')
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log("후원 신청서 접수 완료 Document ID:", docRef.id);

    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error("후원 신청서 제출 오류:", error);
    throw new Error("후원 신청 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * [관리자용] 전체 후원 신청 목록 조회 (최신순)
 * @returns {Promise<Array<Object>>} 후원 신청 내역 목록 배열
 */
export async function getDonationList() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      donations.push({
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.date
      });
    });

    return donations;
  } catch (error) {
    console.error("후원 신청 목록 조회 오류:", error);
    throw new Error("후원 신청 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * [관리자용] 후원 처리상태 업데이트
 * @param {string} donationId - 후원 신청 문서 ID
 * @param {string} newStatus - 변경할 상태 ('접수' -> '승인/완료', '취소', '보류')
 * @returns {Promise<void>}
 */
export async function updateDonationStatus(donationId, newStatus) {
  try {
    if (!donationId || !newStatus) {
      throw new Error("후원 ID와 변경할 상태 정보가 필요합니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, donationId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    console.log(`후원 처리상태 업데이트 완료 (ID: ${donationId}, Status: ${newStatus})`);
  } catch (error) {
    console.error("후원 상태 업데이트 오류:", error);
    throw new Error("후원 상태 업데이트 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * [관리자용] 후원 신청 내역 삭제
 * @param {string} donationId - 삭제할 후원 문서 ID
 * @returns {Promise<void>}
 */
export async function deleteDonation(donationId) {
  try {
    if (!donationId) {
      throw new Error("삭제할 후원 ID가 필요합니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, donationId);
    await deleteDoc(docRef);

    console.log(`후원 신청 내역 삭제 완료 (ID: ${donationId})`);
  } catch (error) {
    console.error("후원 내역 삭제 오류:", error);
    throw new Error("후원 신청 내역 삭제 중 오류가 발생했습니다: " + error.message);
  }
}
