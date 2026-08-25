import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  Timestamp,
  FirestoreError,
} from "firebase/firestore";
import { db, auth, storage } from "./firebase";
import { InquiryRecord, Notice, MaterialItem, Course } from "../types";
import { ScheduleItem, PopupNoticeConfig } from "../components/NoticePopupModal";
import { PopularCourseAdminItem } from "../components/InquiryAdminModal";
import { COURSES_DATA } from "../data/coursesData";

// Error Logger Helper
function handleFirestoreError(error: unknown, actionName: string) {
  console.error(`Firestore Error [${actionName}]:`, error);
  const msg = error instanceof Error ? error.message : String(error);
  throw new Error(`[Firestore ${actionName}] ${msg}`);
}

// Helper to format timestamps to YYYY-MM-DD or ISO
export function formatFirestoreTimestamp(val: any): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) return val.toDate().toISOString().slice(0, 10);
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString().slice(0, 10);
  if (val.seconds) return new Date(val.seconds * 1000).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

// Helper to extract YYMM string from an ISO date string or Date
export function getYYMMKey(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${yy}${mm}`;
  }
  const yy = d.getFullYear().toString().slice(-2);
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${yy}${mm}`;
}

// Format receipt numbers as YYMM-N (e.g., 2608-1, 2608-2). Resets sequence when year or month changes.
export function formatReceiptNumber(
  idOrRecord: string | InquiryRecord,
  createdAt?: string,
  allRecords?: InquiryRecord[]
): string {
  if (!idOrRecord) {
    return `${getYYMMKey()}-1`;
  }

  let id = typeof idOrRecord === 'string' ? idOrRecord : idOrRecord.id;
  let receiptNum = typeof idOrRecord === 'object' ? idOrRecord.receiptNumber : undefined;
  let itemCreatedAt = typeof idOrRecord === 'object' ? idOrRecord.createdAt : createdAt;

  // If receiptNum or id is already formatted as YYMM-N (정상 발급) or
  // YYMM-Txxxxxx (채번 실패 시 임시번호) 형태라면 그대로 사용합니다.
  // 임시번호까지 이 정규식에 포함하지 않으면, 아래 재계산 로직이 임시번호를
  // 무시하고 다른 번호로 덮어써서 관리자 화면의 "임시번호" 표시가 무력화됩니다.
  if (receiptNum && /^\d{4}-(\d+|T\d+)$/.test(receiptNum)) {
    return receiptNum;
  }
  if (id && /^\d{4}-(\d+|T\d+)$/.test(id)) {
    return id;
  }

  const targetYYMM = getYYMMKey(itemCreatedAt);

  if (allRecords && allRecords.length > 0) {
    // Filter records belonging to the same YYMM month
    const sameMonthRecords = allRecords.filter((r) => getYYMMKey(r.createdAt) === targetYYMM);

    // Sort chronologically ascending (oldest first)
    sameMonthRecords.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      if (timeA !== timeB) return timeA - timeB;
      return (a.id || '').localeCompare(b.id || '');
    });

    const index = sameMonthRecords.findIndex((r) => r.id === id);
    if (index !== -1) {
      return `${targetYYMM}-${index + 1}`;
    }
  }

  return `${targetYYMM}-1`;
}

// =========================================================================
// 1. APPLICATIONS COLLECTION (`applications`)
// =========================================================================

/**
 * 접수번호(YYMM-N)를 원자적으로 발급합니다.
 *
 * 기존 방식은 applications 컬렉션 전체를 읽어(getDocs) 이번 달 건수를 세는
 * 방식이었는데, 일반 방문자는애초에 applications를 읽을 권한이 없어서(Firestore
 * 규칙상 read는 관리자 전용) 이 조회가 항상 실패하고 접수번호가 1로 고정되는
 * 문제가 있었습니다. 그 결과 동시에 신청한 여러 명이 똑같은 접수번호(예: 2608-1)
 * 를 받을 수 있었습니다.
 *
 * 이제는 별도의 counters/{YYMM} 문서를 Firestore 트랜잭션(runTransaction)으로
 * "이전 값 + 1"만큼만 원자적으로 증가시켜 채번합니다. 트랜잭션은 동시에 여러
 * 사용자가 접근해도 Firestore가 순서를 보장해 주므로 중복이 발생하지 않고,
 * counters 컬렉션은 개인정보를 담지 않으므로 공개 읽기/증가를 허용해도 안전합니다.
 */
async function getNextReceiptNumber(targetYYMM: string): Promise<string> {
  const counterRef = doc(db, "counters", targetYYMM);

  const nextSeq = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.exists() ? (counterSnap.data().count as number) || 0 : 0;
    const next = current + 1;
    if (counterSnap.exists()) {
      transaction.update(counterRef, { count: next });
    } else {
      transaction.set(counterRef, { count: next });
    }
    return next;
  });

  return `${targetYYMM}-${nextSeq}`;
}

export async function submitApplicationToFirestore(data: {
  name: string;
  phone: string;
  courseInterest: string;
  preferredTime: string;
  hasNaeilCard: string;
  userCategory: string;
  message: string;
}): Promise<InquiryRecord> {
  const now = new Date();
  const targetYYMM = getYYMMKey(now);

  // 접수번호를 먼저 원자적으로 발급받습니다. (트랜잭션 실패 시 아래 catch에서
  // 타임스탬프 기반 임시 번호로 대체하되, 이 경우에도 실제 저장 성공 여부는
  // 별도로 정직하게 확인합니다 - 아래 참고)
  let receiptId: string;
  try {
    receiptId = await getNextReceiptNumber(targetYYMM);
  } catch (e) {
    console.warn("접수번호 채번 실패, 임시 번호로 대체:", e);
    receiptId = `${targetYYMM}-T${Date.now().toString().slice(-6)}`;
  }

  const colRef = collection(db, "applications");
  const docData = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    course: data.courseInterest || "상담 후 결정",
    courseInterest: data.courseInterest || "상담 후 결정",
    preferredTime: data.preferredTime || "상관없음",
    hasNaeilCard: data.hasNaeilCard || "유",
    userCategory: data.userCategory || "취업준비생",
    memo: data.message ? data.message.trim() : "",
    message: data.message ? data.message.trim() : "",
    status: "상담대기",
    adminNotes: "",
    receiptNumber: receiptId,
    createdAt: serverTimestamp(),
    createdAtIso: now.toISOString(),
  };

  // 실제 Firestore 저장이 완료될 때까지 정직하게 기다립니다.
  // (예전에는 600ms 인위적 타임아웃과 경쟁시켜, 느린 네트워크에서 실제로는
  //  저장에 성공했는데도 사용자에게는 "가짜 성공"을 보여주거나, 반대로 실패를
  //  성공처럼 보여주는 문제가 있었습니다. 지금은 addDoc이 끝날 때까지 기다렸다가
  //  성공하면 진짜 성공, 실패하면 진짜 실패로 안내합니다.)
  const docRef = await addDoc(colRef, docData);

  return {
    id: docRef.id,
    receiptNumber: receiptId,
    name: docData.name,
    phone: docData.phone,
    courseInterest: docData.courseInterest,
    preferredTime: docData.preferredTime as any,
    hasNaeilCard: docData.hasNaeilCard as any,
    userCategory: docData.userCategory as any,
    message: docData.message,
    createdAt: docData.createdAtIso,
    status: "상담대기",
    adminNotes: "",
  };
}

export function subscribeApplicationsFromFirestore(
  onUpdate: (records: InquiryRecord[]) => void
): () => void {
  const colRef = collection(db, "applications");
  const q = query(colRef, orderBy("createdAt", "desc"));

  const parseDoc = (d: any) => {
    const data = d.data();
    return {
      id: d.id,
      receiptNumber: data.receiptNumber || undefined,
      name: data.name || "",
      phone: data.phone || "",
      courseInterest: data.courseInterest || data.course || "상담 후 결정",
      preferredTime: data.preferredTime || "상관없음",
      hasNaeilCard: data.hasNaeilCard || "유",
      userCategory: data.userCategory || "취업준비생",
      message: data.message || data.memo || "",
      createdAt: data.createdAtIso || formatFirestoreTimestamp(data.createdAt),
      status: data.status || "상담대기",
      adminNotes: data.adminNotes || "",
    } as InquiryRecord;
  };

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map(parseDoc));
    },
    (error: FirestoreError) => {
      if (error.code === "failed-precondition") {
        // 정렬용 인덱스가 아직 빌드 중일 때만 무정렬로 재시도합니다.
        console.warn("접수내역 정렬 인덱스가 아직 준비되지 않아 무정렬로 재조회합니다:", error);
        onSnapshot(colRef, (snapshot) => {
          const records = snapshot.docs.map(parseDoc);
          records.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
          onUpdate(records);
        });
      } else {
        // 이 구독은 관리자 로그인 후에만 호출되도록 되어 있으므로, 여기서
        // permission-denied가 뜬다면 로그인 세션이 만료됐거나 admins 컬렉션에
        // 등록되지 않은 계정일 가능성이 큽니다. 재시도 대신 원인을 그대로 남깁니다.
        // (다만 onUpdate는 반드시 호출해서, 로딩 스피너가 영원히 멈추지 않는
        // 문제가 생기지 않도록 합니다.)
        console.error("접수내역 구독 실패 (관리자 인증/권한 확인 필요):", error);
        onUpdate([]);
      }
    }
  );
}

export async function updateApplicationStatusInFirestore(
  docId: string,
  status?: '상담대기' | '상담완료' | '등록완료' | '보류',
  adminNotes?: string
): Promise<void> {
  try {
    const docRef = doc(db, "applications", docId);
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (status) updatePayload.status = status;
    if (adminNotes !== undefined) {
      updatePayload.adminNotes = adminNotes;
      updatePayload.memo = adminNotes;
    }
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, "updateApplicationStatusInFirestore");
  }
}

export async function deleteApplicationFromFirestore(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "applications", docId));
  } catch (err) {
    handleFirestoreError(err, "deleteApplicationFromFirestore");
  }
}

export async function batchDeleteApplicationsFromFirestore(ids: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, "applications", id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, "batchDeleteApplicationsFromFirestore");
  }
}


// =========================================================================
// 2. SETTINGS / OPENING POPUP (`settings/opening_popup`)
// =========================================================================

export const DEFAULT_OPENING_POPUP: PopupNoticeConfig = {
  enabled: true,
  badgeText: "2026년 하반기 신규 개강 안내",
  title: "홍천 중앙정보처리학원 9~10월 수강생 모집",
  subtitle: "국비지원 최대 100% 지원 & 1:1 맞춤 실습 교육",
  content:
    "컴퓨터활용능력(1급/2급), 전산세무회계, 정보처리기능사/기사, GTQ/ITQ 자격증, 시니어 어르신 기초반 수강생을 모집합니다! 지금 신청하시고 국민내일배움카드 혜택을 받으세요.",
  dateText: "개강일: 2026년 9월 ~ 10월 수시 개강 (오전/오후/야간반 운영)",
  schedules: [
    { courseName: "컴퓨터활용능력 (1급 / 2급)", startDate: "9월 08일 개강", timeSlot: "오전 10:00 / 야간 19:00" },
    { courseName: "전산세무회계 (전산회계1급/세무2급)", startDate: "9월 15일 개강", timeSlot: "오후 14:00 / 야간 19:00" },
    { courseName: "시니어 어르신 왕초보 컴퓨터&스마트폰", startDate: "9월 10일 개강", timeSlot: "오후 13:30 ~ 15:00" },
    { courseName: "정보처리기능사 / GTQ 포토샵 자격증", startDate: "10월 01일 개강", timeSlot: "오후 15:30 / 야간 19:00" },
  ],
  actionText: "지금 온라인 수강신청하기",
  buttonLabel: "",
};

export function subscribeOpeningPopupFromFirestore(
  onUpdate: (config: PopupNoticeConfig) => void
): () => void {
  const docRef = doc(db, "settings", "opening_popup");

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const config: PopupNoticeConfig = {
          enabled: typeof data.isVisible === "boolean" ? data.isVisible : data.enabled ?? true,
          badgeText: data.badgeText || DEFAULT_OPENING_POPUP.badgeText,
          title: data.title || DEFAULT_OPENING_POPUP.title,
          subtitle: data.subtitle || DEFAULT_OPENING_POPUP.subtitle,
          content: data.content || DEFAULT_OPENING_POPUP.content,
          dateText: data.scheduleSummary || data.dateText || DEFAULT_OPENING_POPUP.dateText,
          schedules: Array.isArray(data.schedules) ? data.schedules : DEFAULT_OPENING_POPUP.schedules,
          actionText: data.actionText || DEFAULT_OPENING_POPUP.actionText,
          buttonLabel: data.buttonLabel || "",
        };
        onUpdate(config);
      } else {
        // Doc doesn't exist yet, return default and initialize in Firestore
        onUpdate(DEFAULT_OPENING_POPUP);
        saveOpeningPopupToFirestore(DEFAULT_OPENING_POPUP).catch((e) =>
          console.warn("Auto-seeding opening_popup failed:", e)
        );
      }
    },
    (err) => {
      console.error("subscribeOpeningPopupFromFirestore error:", err);
      onUpdate(DEFAULT_OPENING_POPUP);
    }
  );
}

export async function saveOpeningPopupToFirestore(config: PopupNoticeConfig): Promise<void> {
  try {
    const docRef = doc(db, "settings", "opening_popup");
    const payload = {
      isVisible: Boolean(config.enabled),
      enabled: Boolean(config.enabled),
      badgeText: config.badgeText || "",
      title: config.title || "",
      subtitle: config.subtitle || "",
      content: config.content || "",
      scheduleSummary: config.dateText || "",
      dateText: config.dateText || "",
      schedules: Array.isArray(config.schedules) ? config.schedules : [],
      actionText: config.actionText || "지금 온라인 수강신청하기",
      buttonLabel: config.buttonLabel || "",
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, "saveOpeningPopupToFirestore");
  }
}


// =========================================================================
// 3. NOTICES COLLECTION (`notices`)
// =========================================================================

export const DEFAULT_NOTICES: Notice[] = [
  {
    id: "notice-default-1",
    title: "2026년도 국민내일배움카드 국비지원 과정 신규 수강생 모집 안내",
    date: "2026-08-01",
    category: "국비지원",
    content:
      "2026년 하반기 국민내일배움카드 국비지원 신규 과정을 개강합니다.\n- 대상: 구직자, 재직자, 졸업예정자, 영세자영업자\n- 개강 과정: 컴퓨터활용능력 2급/1급, 전산세무회계, 사무자동화(OA)\n- 혜택: 훈련비 최대 100% 지원 및 출석율에 따른 매월 훈련장려금 지급\n- 문의: 033-433-1926 ~ 7 (학원 방문 및 전화 상담 환영)",
    important: true,
  },
  {
    id: "notice-default-2",
    title: "제8회 대한상공회의소 컴활 / ITQ 국가기술자격시험 시험일정 및 원서접수",
    date: "2026-07-25",
    category: "시험일정",
    content:
      "대한상공회의소 및 한국생산성본부 주관 자격시험 일정 안내입니다.\n본 학원은 상시시험 지정 시험장 연습 장비와 동일한 사양의 PC로 교육을 진행하고 있습니다.\n원서 접수 대행 및 1:1 기출 체크를 지원해 드립니다.",
    important: true,
  },
  {
    id: "notice-default-3",
    title: "홍천 중앙정보처리학원 모바일 겸용 반응형 홈페이지 리뉴얼 오픈!",
    date: "2026-07-15",
    category: "학원소개",
    content:
      "스마트폰과 태블릿, PC 어디서나 편리하게 수강정보를 확인하고 간편하게 수강 문의를 신청할 수 있도록 홈페이지가 개편되었습니다.\n많은 이용 부탁드립니다.",
    important: false,
  },
];

export function subscribeNoticesFromFirestore(
  onUpdate: (notices: Notice[]) => void
): () => void {
  const colRef = collection(db, "notices");
  const q = query(colRef, orderBy("createdAt", "desc"));

  const parseSnapshot = (snapshot: any) => {
    if (snapshot.empty) {
      // 기본 공지사항 데이터가 비어 있을 때 자동으로 채워 넣습니다.
      // 다만 notices에 대한 쓰기 권한은 관리자에게만 있으므로, 로그인하지
      // 않은 일반 방문자는 시도해봐야 항상 거부됩니다. 불필요한 실패 요청을
      // 만들지 않도록, 현재 관리자로 로그인된 세션일 때만 시도합니다.
      if (auth.currentUser) {
        seedDefaultNotices().catch(console.error);
      }
      return DEFAULT_NOTICES;
    }
    return snapshot.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "",
        category: data.category || "공지",
        content: data.content || "",
        important: Boolean(data.important),
        date: data.date || formatFirestoreTimestamp(data.createdAt),
        attachedFiles: Array.isArray(data.attachedFiles) ? data.attachedFiles : [],
      } as Notice;
    });
  };

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(parseSnapshot(snapshot));
    },
    (err: FirestoreError) => {
      if (err.code === "failed-precondition") {
        // 인덱스가 아직 생성/빌드 중일 때만 정렬 없이 재시도합니다.
        console.warn("공지사항 정렬(orderBy) 인덱스가 아직 준비되지 않아 무정렬로 재조회합니다:", err);
        onSnapshot(colRef, (snapshot) => {
          onUpdate(parseSnapshot(snapshot));
        });
      } else {
        // 권한 오류(permission-denied) 등은 재시도해도 해결되지 않으므로,
        // 원인을 숨기지 않고 그대로 로그로 남깁니다.
        console.error("공지사항 구독 실패:", err);
      }
    }
  );
}

async function seedDefaultNotices() {
  // addDoc 대신 고정된 문서 ID(setDoc + merge: false는 아니지만 존재 시 덮어쓰는
  // 방식이 아니라 "이미 있으면 실패"가 아닌 동일 결과를 내도록 결정적 ID를 사용)를
  // 사용해, 여러 방문자가 동시에 첫 방문해 시딩을 시도해도 중복 문서가 쌓이지
  // 않고 같은 문서로 수렴하도록 합니다.
  const colRef = collection(db, "notices");
  for (let i = 0; i < DEFAULT_NOTICES.length; i++) {
    const n = DEFAULT_NOTICES[i];
    const seedId = `seed-${i + 1}`;
    await setDoc(doc(colRef, seedId), {
      title: n.title,
      category: n.category,
      content: n.content,
      important: Boolean(n.important),
      date: n.date,
      attachedFiles: [],
      createdAt: serverTimestamp(),
    });
  }
}

export async function addNoticeToFirestore(data: {
  title: string;
  category: string;
  content: string;
  date?: string;
  important?: boolean;
  attachedFiles?: string[];
}): Promise<void> {
  try {
    const colRef = collection(db, "notices");
    await addDoc(colRef, {
      title: data.title.trim(),
      category: data.category || "공지",
      content: data.content.trim(),
      important: Boolean(data.important),
      date: data.date || new Date().toISOString().slice(0, 10),
      attachedFiles: data.attachedFiles || [],
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, "addNoticeToFirestore");
  }
}

export async function updateNoticeInFirestore(
  id: string,
  data: {
    title?: string;
    category?: string;
    content?: string;
    date?: string;
    important?: boolean;
    attachedFiles?: string[];
  }
): Promise<void> {
  try {
    const docRef = doc(db, "notices", id);
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.content !== undefined) updatePayload.content = data.content;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.important !== undefined) updatePayload.important = data.important;
    if (data.attachedFiles !== undefined) updatePayload.attachedFiles = data.attachedFiles;

    // updateDoc 대신 setDoc(merge:true) — 같은 이유로(문서가 아직
    // Firestore에 없을 수 있는 시딩 타이밍 이슈) courses와 동일하게 안전한
    // upsert 방식으로 통일합니다.
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, "updateNoticeInFirestore");
  }
}

export async function deleteNoticeFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "notices", id));
  } catch (err) {
    handleFirestoreError(err, "deleteNoticeFromFirestore");
  }
}


// =========================================================================
// 4. POPULAR COURSES COLLECTION (`popular_courses`)
// =========================================================================

export const DEFAULT_POPULAR_COURSES: PopularCourseAdminItem[] = [
  {
    id: "pop-default-1",
    badge: "모집중 · 국비지원",
    badgeColor: "blue",
    timeSlot: "09:30 - 12:30",
    startDate: "2026-09-01 개강",
    title: "컴퓨터활용능력 1급/2급 (실기)",
    description: "자부담금 0원~최대 100% 정부지원",
  },
  {
    id: "pop-default-2",
    badge: "모집중 · 인기",
    badgeColor: "emerald",
    timeSlot: "14:00 - 17:00",
    startDate: "2026-09-01 개강",
    title: "전산세무회계 & KcLep 실무",
    description: "회계원리부터 세무 신고 실무 원스톱",
  },
  {
    id: "pop-default-3",
    badge: "추천 · 오전반",
    badgeColor: "amber",
    timeSlot: "10:00 - 12:00",
    startDate: "수시 개강",
    title: "어르신 스마트폰 & 타자·컴퓨터 기초",
    description: "친절한 1:1 눈높이 특별지도",
  },
];

export function subscribePopularCoursesFromFirestore(
  onUpdate: (courses: PopularCourseAdminItem[]) => void
): () => void {
  const colRef = collection(db, "popular_courses");

  const parseDocs = (snapshot: any) => {
    if (snapshot.empty) {
      // notices와 동일한 이유로, 관리자 로그인 세션일 때만 시딩을 시도합니다.
      if (auth.currentUser) {
        seedDefaultPopularCourses().catch(console.error);
      }
      return DEFAULT_POPULAR_COURSES;
    }
    const items = snapshot.docs.map((d: any, idx: number) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.courseTitle || data.title || "",
        courseTitle: data.courseTitle || data.title || "",
        description: data.description || "",
        badge: data.tag || data.badge || "모집중",
        badgeColor: data.badgeColor || "blue",
        timeSlot: data.timeSlot || "시간 문의",
        startDate: data.startDate || "수시 개강",
        isPopular: typeof data.isPopular === "boolean" ? data.isPopular : true,
        order: typeof data.order === "number" ? data.order : idx,
      };
    });
    items.sort((a: any, b: any) => a.order - b.order);
    return items;
  };

  return onSnapshot(
    colRef,
    (snapshot) => {
      onUpdate(parseDocs(snapshot));
    },
    (err) => {
      console.error("subscribePopularCoursesFromFirestore error:", err);
      onUpdate(DEFAULT_POPULAR_COURSES);
    }
  );
}

async function seedDefaultPopularCourses() {
  // 고정 문서 ID를 사용해 동시 시딩으로 인한 중복 생성을 방지합니다.
  const colRef = collection(db, "popular_courses");
  for (let idx = 0; idx < DEFAULT_POPULAR_COURSES.length; idx++) {
    const c = DEFAULT_POPULAR_COURSES[idx];
    const seedId = `seed-${idx + 1}`;
    await setDoc(doc(colRef, seedId), {
      courseTitle: c.title,
      title: c.title,
      description: c.description,
      tag: c.badge,
      badge: c.badge,
      badgeColor: c.badgeColor || "blue",
      timeSlot: c.timeSlot,
      startDate: c.startDate,
      isPopular: true,
      order: idx,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function addPopularCourseToFirestore(data: {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  timeSlot?: string;
  startDate?: string;
  isPopular?: boolean;
  order?: number;
}): Promise<void> {
  try {
    const colRef = collection(db, "popular_courses");
    await addDoc(colRef, {
      courseTitle: data.title.trim(),
      title: data.title.trim(),
      description: data.description ? data.description.trim() : "",
      tag: data.badge || "모집중",
      badge: data.badge || "모집중",
      badgeColor: data.badgeColor || "blue",
      timeSlot: data.timeSlot || "시간 문의",
      startDate: data.startDate || "수시 개강",
      isPopular: typeof data.isPopular === "boolean" ? data.isPopular : true,
      order: typeof data.order === "number" ? data.order : Date.now(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, "addPopularCourseToFirestore");
  }
}

export async function updatePopularCourseInFirestore(
  id: string,
  data: {
    title?: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    timeSlot?: string;
    startDate?: string;
    isPopular?: boolean;
    order?: number;
  }
): Promise<void> {
  try {
    const docRef = doc(db, "popular_courses", id);
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (data.title !== undefined) {
      updatePayload.courseTitle = data.title;
      updatePayload.title = data.title;
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.badge !== undefined) {
      updatePayload.tag = data.badge;
      updatePayload.badge = data.badge;
    }
    if (data.badgeColor !== undefined) updatePayload.badgeColor = data.badgeColor;
    if (data.timeSlot !== undefined) updatePayload.timeSlot = data.timeSlot;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate;
    if (data.isPopular !== undefined) updatePayload.isPopular = data.isPopular;
    if (data.order !== undefined) updatePayload.order = data.order;

    // 동일한 시딩 타이밍 이슈에 대비해 upsert 방식(setDoc+merge)으로 통일.
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, "updatePopularCourseInFirestore");
  }
}

export async function deletePopularCourseFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "popular_courses", id));
  } catch (err) {
    handleFirestoreError(err, "deletePopularCourseFromFirestore");
  }
}

// =========================================================================
// 5. 교육과정 컬렉션 (`courses`) - 교육과정 페이지(전체/카테고리별 강좌 카드) 관리
// =========================================================================

// coursesData.ts에 있던 하드코딩 8개 과정을 그대로 초기 시드 데이터로 사용합니다.
export const DEFAULT_COURSES: Course[] = COURSES_DATA;

export function subscribeCoursesFromFirestore(
  onUpdate: (courses: Course[]) => void
): () => void {
  const colRef = collection(db, "courses");

  const parseDocs = (snapshot: any) => {
    if (snapshot.empty) {
      // notices/popular_courses와 동일하게, 관리자 로그인 세션일 때만 초기 시딩을 시도합니다.
      // 주의: Firebase Auth는 페이지 로드 시 세션 복원이 비동기라서, 이 최초
      // onSnapshot 콜백이 실행되는 시점엔 실제로 로그인돼 있어도
      // auth.currentUser가 아직 null일 수 있습니다. 그래서 여기 조건만
      // 믿으면 시딩이 누락될 수 있어, ensureCoursesSeeded()를 관리자
      // 로그인 확인 시점(InquiryAdminModal)에서 별도로 한 번 더 확정적으로
      // 호출합니다 — 이게 실제 시딩을 보장하는 주 경로입니다.
      if (auth.currentUser) {
        seedDefaultCourses().catch(console.error);
      }
      return DEFAULT_COURSES;
    }
    const items = snapshot.docs.map((d: any, idx: number) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "",
        category: data.category || "자격증",
        summary: data.summary || "",
        description: data.description || "",
        target: data.target || "",
        duration: data.duration || "",
        schedule: data.schedule || "",
        nationalSupport: Boolean(data.nationalSupport),
        subsidyRate: data.subsidyRate || "",
        tuition: typeof data.tuition === "number" ? data.tuition : 0,
        selfPayEstimate: data.selfPayEstimate || "카드 유형별 상이",
        certificationTags: Array.isArray(data.certificationTags) ? data.certificationTags : [],
        curriculum: Array.isArray(data.curriculum) ? data.curriculum : [],
        featured: Boolean(data.featured),
        order: typeof data.order === "number" ? data.order : idx,
      } as Course & { order: number };
    });
    items.sort((a: any, b: any) => a.order - b.order);
    return items;
  };

  return onSnapshot(
    colRef,
    (snapshot) => {
      onUpdate(parseDocs(snapshot));
    },
    (err) => {
      console.error("subscribeCoursesFromFirestore error:", err);
      onUpdate(DEFAULT_COURSES);
    }
  );
}

async function seedDefaultCourses() {
  // 고정 문서 ID를 사용해 동시 시딩으로 인한 중복 생성을 방지합니다.
  const colRef = collection(db, "courses");
  for (let idx = 0; idx < DEFAULT_COURSES.length; idx++) {
    const c = DEFAULT_COURSES[idx];
    const seedId = `seed-${idx + 1}`;
    await setDoc(doc(colRef, seedId), {
      title: c.title,
      category: c.category,
      summary: c.summary,
      description: c.description,
      target: c.target,
      duration: c.duration,
      schedule: c.schedule,
      nationalSupport: c.nationalSupport,
      subsidyRate: c.subsidyRate,
      tuition: c.tuition,
      selfPayEstimate: c.selfPayEstimate,
      certificationTags: c.certificationTags,
      curriculum: c.curriculum,
      featured: Boolean(c.featured),
      order: idx,
      updatedAt: serverTimestamp(),
    });
  }
}

// 관리자 로그인이 "확실히" 확인된 시점(예: InquiryAdminModal의 관리자
// 인증 체크 완료 시점)에서 명시적으로 호출해 courses 컬렉션이 비어있으면
// 시드 데이터를 채워 넣습니다. subscribeCoursesFromFirestore 내부의
// auth.currentUser 체크는 타이밍에 따라 누락될 수 있어(위 주석 참고),
// 이 함수가 실제로 시딩을 보장하는 확정적인 경로입니다. 이미 문서가
// 있으면 아무 것도 하지 않습니다(setDoc은 같은 seedId로 여러 번
// 호출돼도 안전 — 덮어쓸 뿐 중복 생성되지 않습니다).
export async function ensureCoursesSeeded(): Promise<void> {
  try {
    const colRef = collection(db, "courses");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedDefaultCourses();
    }
  } catch (err) {
    console.error("ensureCoursesSeeded failed:", err);
  }
}

export type CourseInput = Omit<Course, "id">;

export async function addCourseToFirestore(data: CourseInput & { order?: number }): Promise<void> {
  try {
    const colRef = collection(db, "courses");
    await addDoc(colRef, {
      title: data.title.trim(),
      category: data.category,
      summary: data.summary ? data.summary.trim() : "",
      description: data.description ? data.description.trim() : "",
      target: data.target || "",
      duration: data.duration || "",
      schedule: data.schedule || "",
      nationalSupport: Boolean(data.nationalSupport),
      subsidyRate: data.subsidyRate || "",
      tuition: typeof data.tuition === "number" ? data.tuition : 0,
      selfPayEstimate: data.selfPayEstimate || "카드 유형별 상이",
      certificationTags: Array.isArray(data.certificationTags) ? data.certificationTags : [],
      curriculum: Array.isArray(data.curriculum) ? data.curriculum : [],
      featured: Boolean(data.featured),
      order: typeof data.order === "number" ? data.order : Date.now(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, "addCourseToFirestore");
  }
}

export async function updateCourseInFirestore(
  id: string,
  data: Partial<CourseInput> & { order?: number }
): Promise<void> {
  try {
    const docRef = doc(db, "courses", id);
    const updatePayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.summary !== undefined) updatePayload.summary = data.summary;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.target !== undefined) updatePayload.target = data.target;
    if (data.duration !== undefined) updatePayload.duration = data.duration;
    if (data.schedule !== undefined) updatePayload.schedule = data.schedule;
    if (data.nationalSupport !== undefined) updatePayload.nationalSupport = data.nationalSupport;
    if (data.subsidyRate !== undefined) updatePayload.subsidyRate = data.subsidyRate;
    if (data.tuition !== undefined) updatePayload.tuition = data.tuition;
    if (data.selfPayEstimate !== undefined) updatePayload.selfPayEstimate = data.selfPayEstimate;
    if (data.certificationTags !== undefined) updatePayload.certificationTags = data.certificationTags;
    if (data.curriculum !== undefined) updatePayload.curriculum = data.curriculum;
    if (data.featured !== undefined) updatePayload.featured = data.featured;
    if (data.order !== undefined) updatePayload.order = data.order;

    // updateDoc 대신 setDoc(merge:true)를 씁니다. updateDoc은 문서가 아직
    // 존재하지 않으면 "No document to update" 에러를 던지는데, 시딩
    // 타이밍이 어긋나 목록에 아직 Firestore에 실제로 없는 기본값(예:
    // course-1)이 표시된 상태에서 "수정"을 누르면 바로 이 에러가
    // 발생했습니다("저장 중 오류가 발생했습니다"). setDoc+merge는 문서가
    // 없으면 그 id로 새로 만들고, 있으면 병합 수정하므로 이 경우에도
    // 항상 저장이 성공합니다.
    await setDoc(docRef, updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, "updateCourseInFirestore");
  }
}

export async function deleteCourseFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "courses", id));
  } catch (err) {
    handleFirestoreError(err, "deleteCourseFromFirestore");
  }
}

// =========================================================================
// ERROR LOGS COLLECTION (`errorLogs`) - 방문자 브라우저 런타임 오류 자동 수집
// =========================================================================
// 재단 홈페이지(nbnhappy.or.kr)와 동일한 패턴입니다. 예전에는 방문자 화면에서
// 오류가 나도 console.error만 찍고 끝이라, 원장님은 실제로 어떤 문제가
// 발생했는지 전혀 알 방법이 없었습니다. 이제 ErrorBoundary와 전역
// window.onerror에서 잡힌 오류를 Firestore에 저장하고, 관리자 모드에서
// 확인할 수 있습니다.

export interface ErrorLogItem {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent?: string;
  context?: string;
  createdAt: string;
}

export async function reportClientError(data: {
  message: string;
  stack?: string;
  url: string;
  userAgent?: string;
  context?: string;
}): Promise<void> {
  try {
    const colRef = collection(db, "errorLogs");
    await addDoc(colRef, {
      message: (data.message || "알 수 없는 오류").slice(0, 2000),
      stack: data.stack ? data.stack.slice(0, 4000) : undefined,
      url: (data.url || "").slice(0, 500),
      userAgent: data.userAgent ? data.userAgent.slice(0, 500) : undefined,
      context: data.context ? data.context.slice(0, 200) : undefined,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    // 오류 리포팅 자체가 실패해도 방문자 화면에 영향을 주면 안 되므로,
    // 조용히 콘솔에만 남기고 절대 throw하지 않습니다.
    console.warn("reportClientError failed:", err);
  }
}

export function subscribeErrorLogsFromFirestore(
  onUpdate: (logs: ErrorLogItem[]) => void
): () => void {
  const colRef = collection(db, "errorLogs");
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          message: data.message || "",
          stack: data.stack || "",
          url: data.url || "",
          userAgent: data.userAgent || "",
          context: data.context || "",
          createdAt: data.createdAt || "",
        } as ErrorLogItem;
      });
      onUpdate(items);
    },
    (err) => {
      console.error("subscribeErrorLogsFromFirestore error:", err);
      onUpdate([]);
    }
  );
}

export async function deleteErrorLog(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "errorLogs", id));
  } catch (err) {
    handleFirestoreError(err, "deleteErrorLog");
  }
}

export async function clearAllErrorLogs(ids: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, "errorLogs", id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, "clearAllErrorLogs");
  }
}

// =========================================================================
// MATERIALS COLLECTION (`materials`) - 자료실 (서식/예제/프로그램 다운로드)
// =========================================================================

function parseMaterialSnapshot(snapshot: any): MaterialItem[] {
  return snapshot.docs.map((d: any) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      description: data.description || "",
      courseCategory: data.courseCategory || "공통",
      materialType: data.materialType || "학원서식",
      studentVisible: data.studentVisible !== false, // 예전 문서(필드 없음)는 기본 true로 취급
      fileName: data.fileName || "",
      storagePath: data.storagePath || "",
      fileSize: typeof data.fileSize === "number" ? data.fileSize : 0,
      createdAt: data.createdAtIso || formatFirestoreTimestamp(data.createdAt),
      uploadedBy: data.uploadedBy || "",
      downloadCount: typeof data.downloadCount === "number" ? data.downloadCount : 0,
    } as MaterialItem;
  });
}

/**
 * 관리자 전용 - 자료실 전체 목록을 제한 없이 구독합니다('학원서식' 포함).
 * Firestore 규칙의 isAdmin() 조건은 요청자 UID에 대해서만 결정되고 문서
 * 내용과 무관하므로, 관리자에게는 where 절 없이도 쿼리가 정상 허용됩니다.
 */
export function subscribeMaterialsFromFirestore(
  onUpdate: (materials: MaterialItem[]) => void,
  onError?: (error: FirestoreError) => void
): () => void {
  // 관리자 목록은 orderBy를 사용하지 않습니다.
  // 기존 자료 중 createdAt 필드가 없거나 형식이 다른 문서가 있어도
  // 관리자 목록 전체가 비어 보이지 않도록 원본 컬렉션을 그대로 읽은 뒤
  // 브라우저에서 날짜순으로 정렬합니다.
  const colRef = collection(db, "materials");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = parseMaterialSnapshot(snapshot);
      items.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
      onUpdate(items);
    },
    (err: FirestoreError) => {
      console.error("관리자 자료실 구독 실패:", err);
      onUpdate([]);
      onError?.(err);
    }
  );
}

/**
 * 승인된 수강생(및 자료실 공개 페이지를 함께 보는 관리자)용 - '학원서식'을
 * 제외한 자료만 구독합니다.
 *
 * ⚠️ 왜 별도 함수로 분리했는가: Firestore 보안 규칙은 "필터"가 아니라
 * "전부 허용 또는 전부 거부"로 동작합니다(공식 문서 표현). 즉 쿼리 결과가
 * 될 수 있는 문서 중 단 하나라도 규칙을 통과하지 못하면, 그 문서만 빠지는
 * 게 아니라 쿼리 전체가 permission-denied로 실패합니다.
 *
 * 예전에는 where 절 없이 materials 전체를 조회하면서, 규칙에서만
 * `resource.data.materialType != '학원서식'` 조건으로 걸러내려고 했는데,
 * 이 조건은 문서마다 값이 다른(resource.data 의존) 조건이라 쿼리 자체와
 * 일치하지 않아, 컬렉션에 학원서식이 하나라도 있으면 승인된 수강생의
 * 조회가 전부 거부되는 문제가 있었습니다(빈 화면으로 보일 수 있음).
 *
 * 지금은 업로드 시 저장해둔 `studentVisible` 필드를 쿼리의 where 절에
 * 명시적으로 포함시켜서, "이 쿼리가 반환할 수 있는 모든 문서는
 * studentVisible == true"라는 걸 Firestore가 정적으로 보장할 수 있게
 * 했습니다. 규칙의 조건과 쿼리의 조건이 일치해야 통과된다는 Firestore의
 * 요구사항을 충족시키는 방식입니다.
 *
 * ⚠️ orderBy를 쓰지 않는 이유: `where(studentVisible == true)` +
 * `orderBy(createdAt desc)`를 함께 쓰면 Firestore 콘솔에서 별도로
 * 만들어줘야 하는 복합 색인(composite index)이 필요합니다. 이 색인이
 * 아직 없거나 생성이 안 돼 있으면 쿼리 자체가 실패해서, 정작 조건을
 * 만족하는 승인된 수강생에게도 자료가 하나도 안 보이는 문제가 있었습니다.
 * 관리자용 함수(subscribeMaterialsFromFirestore)와 마찬가지로 정렬은
 * 클라이언트에서 처리해, Firebase 콘솔에서 색인을 만들거나 색인 생성이
 * 끝나길 기다릴 필요 자체를 없앴습니다.
 */
export function subscribeVisibleMaterialsFromFirestore(
  onUpdate: (materials: MaterialItem[]) => void
): () => void {
  const colRef = collection(db, "materials");
  const q = query(colRef, where("studentVisible", "==", true));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = parseMaterialSnapshot(snapshot);
      items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      onUpdate(items);
    },
    (err: FirestoreError) => {
      console.error("자료실(수강생용) 구독 실패:", err);
      onUpdate([]);
    }
  );
}

/**
 * 예전(자료실 공개 필터 기능이 생기기 전)에 등록된 자료 문서에는
 * `studentVisible` 필드 자체가 없습니다. 화면(parseMaterialSnapshot)에서는
 * "필드 없으면 공개로 취급"하도록 기본값을 넣어주지만, 이는 클라이언트에
 * 데이터가 도착한 *이후*에 적용되는 로직일 뿐입니다.
 *
 * 정작 홈페이지 자료실이 사용하는 subscribeVisibleMaterialsFromFirestore는
 * `where("studentVisible", "==", true)` 쿼리를 쓰는데, Firestore는 해당
 * 필드가 아예 없는 문서는 이 조건과 일치하지 않는 것으로 보고 서버 단에서
 * 걸러냅니다. 그 결과 예전 자료들은 관리자 패널(필터 없는 쿼리)에는
 * 보이지만, 정작 홈페이지 자료실에는 처음부터 내려오지 않는 문제가
 * 있었습니다.
 *
 * 이 함수는 `studentVisible` 필드가 없는 기존 문서를 찾아, 자료 유형
 * (materialType)에 맞는 값으로 한 번만 채워 넣는 관리자 전용 마이그레이션
 * 입니다. 실행 후에는 예전 자료도 정상적으로 홈페이지 자료실 쿼리에
 * 포함됩니다.
 */
export async function backfillLegacyMaterialsVisibility(): Promise<{
  updatedCount: number;
  totalCount: number;
}> {
  const snapshot = await getDocs(collection(db, "materials"));
  const legacyDocs = snapshot.docs.filter((d) => d.data().studentVisible === undefined);

  if (legacyDocs.length === 0) {
    return { updatedCount: 0, totalCount: snapshot.size };
  }

  // Firestore 배치 쓰기는 최대 500개 제한이 있어 500개씩 나눠 처리합니다.
  const CHUNK_SIZE = 450;
  for (let i = 0; i < legacyDocs.length; i += CHUNK_SIZE) {
    const chunk = legacyDocs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((docSnap) => {
      const materialType = docSnap.data().materialType || "학원서식";
      batch.update(docSnap.ref, { studentVisible: isStudentVisibleMaterialType(materialType) });
    });
    await batch.commit();
  }

  return { updatedCount: legacyDocs.length, totalCount: snapshot.size };
}

/**
 * 파일을 Firebase Storage에 업로드하고, 완료되면 Firestore에 메타데이터
 * 문서를 생성합니다. onProgress로 0~100 사이의 업로드 진행률을 전달받을 수
 * 있습니다. (관리자 전용 - Storage/Firestore 규칙상 로그인 없이는 실패합니다.)
 *
 * ⚠️ 업로드 시점에 getDownloadURL()로 영구 다운로드 링크를 만들어 저장하지
 * 않습니다. Firebase Storage의 다운로드 토큰 URL은 보안 규칙(storage.rules)
 * 자체를 우회하는 특성이 있어서, 그 URL을 아는 사람은 승인 여부·로그인
 * 여부와 무관하게 파일을 받을 수 있는 문제가 있었습니다. 이제는 storagePath
 * (실제 다운로드 링크가 아닌 내부 경로)만 저장해두고, 실제 다운로드는
 * api/download-material.ts가 요청마다 권한을 재확인한 뒤 5분짜리 임시
 * 링크를 새로 발급하는 방식으로 처리합니다 (getMaterialDownloadUrl 참고).
 */
// 학생 자료실에 공개할 자료 유형은 명시적으로 두 종류만 허용합니다.
// 기존 데이터의 '예제 파일'은 이전 버전의 명칭이므로 호환성을 위해 계속 공개합니다.
const STUDENT_VISIBLE_MATERIAL_TYPES = new Set([
  "예제서식",
  "채점프로그램",
  "예제 파일",
]);

function isStudentVisibleMaterialType(materialType: string): boolean {
  return STUDENT_VISIBLE_MATERIAL_TYPES.has(materialType);
}

export async function uploadMaterialToFirestore(
  file: File,
  meta: {
    title: string;
    description?: string;
    courseCategory: string;
    materialType: MaterialItem["materialType"];
  },
  onProgress?: (percent: number) => void
): Promise<MaterialItem> {
  const { ref, uploadBytesResumable } = await import("firebase/storage");

  const safeFileName = file.name.replace(/[^\w.\-가-힣 ]/g, "_");
  const storagePath = `materials/${meta.courseCategory}/${Date.now()}_${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(percent);
        }
      },
      (error) => reject(error),
      () => resolve()
    );
  });

  const now = new Date();

  const docData = {
    title: meta.title.trim(),
    description: meta.description ? meta.description.trim() : "",
    courseCategory: meta.courseCategory,
    materialType: meta.materialType,
    // 수강생용 쿼리의 where 절과 짝을 이루는 필드입니다. Firestore 보안
    // 규칙은 문서별로 값이 달라지는 조건(resource.data...)을 검증하려면
    // 쿼리 자체에도 동일한 where 조건이 있어야 하므로, 이 필드 없이는
    // '학원서식 제외' 조건을 규칙만으로 안전하게 걸 수 없습니다.
    studentVisible: isStudentVisibleMaterialType(meta.materialType),
    fileName: file.name,
    storagePath,
    fileSize: file.size,
    createdAt: serverTimestamp(),
    createdAtIso: now.toISOString(),
    uploadedBy: auth.currentUser?.email || "관리자",
    downloadCount: 0,
  };

  const docRef = await addDoc(collection(db, "materials"), docData);

  return {
    id: docRef.id,
    title: docData.title,
    description: docData.description,
    courseCategory: docData.courseCategory,
    materialType: docData.materialType,
    studentVisible: docData.studentVisible,
    fileName: docData.fileName,
    storagePath: docData.storagePath,
    fileSize: docData.fileSize,
    createdAt: docData.createdAtIso,
    uploadedBy: docData.uploadedBy,
    downloadCount: docData.downloadCount,
  };
}

/**
 * 자료 다운로드를 위한 임시(5분) 서명 URL을 서버(api/download-material)에
 * 요청합니다. 요청할 때마다 서버가 로그인/승인 여부를 다시 확인하므로,
 * 승인되지 않은 계정은 애초에 링크 자체를 받을 수 없습니다. 다운로드
 * 횟수 집계도 이 안에서 서버가 함께 처리합니다.
 */
export async function getMaterialDownloadUrl(materialId: string): Promise<{ url: string; fileName: string }> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch("/api/download-material", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ materialId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "다운로드 링크 발급에 실패했습니다.");
  }

  return response.json();
}

/**
 * 자료 다운로드 클릭 시 다운로드 횟수를 1 증가시킵니다. 승인된 수강생도
 * 호출할 수 있어야 하므로, Firestore 규칙에서 이 필드만 +1 증가시키는
 * 업데이트는 예외적으로 허용해뒀습니다 (다른 필드는 수정 불가).
 * 실패해도 사용자 경험에 지장이 없도록 오류는 조용히 무시합니다(다운로드
 * 자체는 이미 진행 중이므로 카운트 실패로 막을 필요는 없습니다).
 */
export async function deleteMaterialFromFirestore(id: string, storagePath: string): Promise<void> {
  try {
    const { ref, deleteObject } = await import("firebase/storage");
    try {
      await deleteObject(ref(storage, storagePath));
    } catch (storageErr: any) {
      // 파일이 이미 삭제되어 존재하지 않는 경우만 무시하고 계속 진행합니다.
      // 그 외의 오류(권한 문제, 네트워크 오류 등)는 Storage 파일이 실제로는
      // 그대로 남아있는 상태이므로, 여기서 무시하고 넘어가면 "목록에서는
      // 사라졌는데 실제 파일은 Storage에 그대로 남는" 고아 파일 문제가
      // 생깁니다. 그래서 이 경우엔 Firestore 기록도 지우지 않고 오류를
      // 그대로 던져서, 관리자 화면에 실패로 표시되고 다시 시도할 수 있게 합니다.
      if (storageErr?.code !== "storage/object-not-found") {
        console.error("Storage 파일 삭제 실패 (Firestore 기록은 보존됨):", storageErr);
        throw storageErr;
      }
      console.warn("Storage 파일이 이미 존재하지 않아 건너뜁니다:", storagePath);
    }
    await deleteDoc(doc(db, "materials", id));
  } catch (err) {
    handleFirestoreError(err, "deleteMaterialFromFirestore");
  }
}

