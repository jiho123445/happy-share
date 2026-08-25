export interface Course {
  id: string;
  title: string;
  category: '국비지원' | '자격증' | '실무·기초' | '코딩·AI' | '학생·특강';
  summary: string;
  description: string;
  target: string; // 대상 (예: 취업준비생, 재직자, 시니어, 학생)
  duration: string; // 기간 (예: 2개월, 40시간)
  schedule: string; // 시간대 (예: 월~금 10:00 - 12:00 / 야간반 19:00 - 21:00)
  nationalSupport: boolean; // 국비지원 가능 여부
  subsidyRate: string; // 지원율 (예: 최대 100% 지원)
  tuition: number; // 일반 수강료 (원)
  selfPayEstimate: string; // 예상 자부담금 (예: 0원 ~ 50,000원)
  certificationTags: string[]; // 관련 자격증
  curriculum: string[]; // 주차별/단계별 교육내용
  featured?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  category: '모집안내' | '시험일정' | '학원소개' | '국비지원';
  content: string;
  important?: boolean;
}

export interface ConsultationForm {
  name: string;
  phone: string;
  courseInterest: string;
  preferredTime: '상관없음' | '오전반' | '오후반' | '야간반' | '주말반';
  hasNaeilCard: '유' | '무' | '발급예정/잘모름';
  userCategory: '취업준비생' | '재직자' | '대학생/학생' | '주부/시니어' | '기타';
  message: string;
}

export interface InquiryRecord extends ConsultationForm {
  id: string;
  receiptNumber?: string;
  createdAt: string; // ISO date string
  status: '상담대기' | '상담완료' | '등록완료' | '보류';
  adminNotes?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// 자료실 - 서식/예제/프로그램 등 다운로드 자료
export type MaterialType = '학원서식' | '예제서식' | '채점프로그램';

export interface MaterialItem {
  id: string;
  title: string;
  description?: string;
  courseCategory: string; // 과정명 (예: '컴퓨터활용능력 2급/1급 취득반') 또는 '공통'
  materialType: MaterialType;
  studentVisible: boolean; // '예제서식'과 '채점프로그램'만 true (Firestore 쿼리 where 절에 사용)
  fileName: string;
  storagePath: string; // Storage 경로 (다운로드는 매번 api/download-material에서 임시 링크 발급)
  fileSize: number; // bytes
  createdAt: string; // ISO date string
  uploadedBy: string; // 업로드한 관리자 이메일
  downloadCount: number; // 다운로드 클릭 횟수
}

// 자료실 - 수강생 회원가입/승인 관련
export type StudentStatus = '승인대기' | '승인됨' | '거절됨';

export interface StudentProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  status: StudentStatus;
  createdAt: string; // ISO date string
}
