export interface NoticeAttachment {
  name: string;
  url?: string;
  size?: string;
  type?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: '공지사항' | '재단소식' | '사업소식' | '후원소식' | '모집공고' | '보도자료';
  date: string;
  views: number;
  content: string;
  isImportant?: boolean;
  author: string;
  attachmentName?: string;
  /** @deprecated Legacy single-attachment URL, kept in sync alongside
   * `attachments` for backward compatibility with older documents/readers.
   * New code should read/write `attachments` instead. */
  attachmentUrl?: string;
  attachments?: NoticeAttachment[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string; // e.g. '장학금 전달', '교육지원', '명절 나눔', '삼계탕 나눔', '생활용품 지원', '주거환경 개선', '복지시설 지원', '다문화가족 활동', '가족센터 활동', '지역사회 봉사'
  date: string;
  imageUrl: string; // 대표 사진 (커버 이미지) - 기존 단일 사진 데이터 100% 호환
  images?: string[]; // 항목 내 여러 장의 사진 목록 (다중 사진 지원)
  /** Firebase Storage path for primary file uploaded by the gallery manager. */
  storagePath?: string;
  /** Firebase Storage paths for all uploaded files in this gallery post. */
  storagePaths?: string[];
  description: string;
  location?: string;
  author?: string;
  isProtected?: boolean; // 관리자 공식 등록 보호 여부 (임의 변경 불가)
}

export interface TimelineItem {
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  category?: '출범' | '수상' | '사업확대' | '법인전환';
  imageUrl?: string;
  awardBadge?: string;
  /** Shows the "주요 도약 시점" badge in the timeline. Not currently set
   * on any entry in initialData.ts — set to true on specific entries to
   * use this. */
  isMilestone?: boolean;
}

export interface ProgramItem {
  id: string;
  code: string; // '01', '02', '03', '04', '05', '06'
  title: string;
  subtitle: string;
  summary: string;
  details: string[];
  iconName: string;
  targetAudience: string;
  impactMessage: string;
  badge?: string;
}

export interface AwardItem {
  year: string;
  title: string;
  issuer: string;
  description: string;
}

export interface DonationApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  donationType: '정기후원' | '일시후원' | '물품후원' | '봉사활동';
  targetCategory: string; // '장학·교육', '긴급지원', '주거환경', '다문화가족', '복지시설배분', '지역나눔'
  amountOrItem?: string;
  message?: string;
  privacyAgreed: boolean;
  createdAt: string;
  status: '접수완료' | '확인중' | '처리완료';
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: '대기중' | '답변완료';
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: '구독중' | '해지';
}

export interface DebugLog {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: string;
}

export interface PopupItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FoundationSettings {
  name: string;
  englishName: string;
  chairmanName: string;
  chairmanImageUrl?: string;
  heroImageUrl?: string;
  chairmanGreeting?: string;
  sloganMain: string;
  sloganSub: string;
  establishedYear: string;
  reorganizedYear: string;
  address: string;
  phone: string;
  fax: string;
  familyCenterPhone?: string;
  familyCenterFax?: string;
  email: string;
  operatingHours: string;
  bankAccounts: {
    bank: string;
    accountNumber: string;
    holder: string;
  }[];
  snsLinks: {
    naver?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  galleryCategories?: string[];
}

export type ActiveTab =
  | 'main'
  | 'about'
  | 'programs'
  | 'news'
  | 'gallery'
  | 'press'
  | 'donate'
  | 'family-center'
  | 'contact'
  | 'notice-detail'
  | 'gallery-detail'
  | 'program-detail'
  | 'family-center-detail';

export type AboutSubTab = 'greeting' | 'purpose' | 'history' | 'organization';

export interface PressCoverageItem {
  id: string;
  title: string;
  outlet: string; // 언론사명 (e.g. '강원일보', '신아일보')
  date: string; // YYYY-MM-DD
  summary: string;
  url: string; // 원문 기사 링크 (외부 사이트)
}

