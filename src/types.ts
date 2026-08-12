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
  attachments?: NoticeAttachment[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string; // e.g. '장학금 전달', '교육지원', '명절 나눔', '삼계탕 나눔', '생활용품 지원', '주거환경 개선', '복지시설 지원', '다문화가족 활동', '가족센터 활동', '지역사회 봉사'
  date: string;
  imageUrl: string;
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

export interface FoundationSettings {
  adminPassword?: string;
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
}

export type ActiveTab =
  | 'main'
  | 'about'
  | 'programs'
  | 'news'
  | 'gallery'
  | 'donate'
  | 'family-center'
  | 'contact'
  | 'notice-detail'
  | 'gallery-detail'
  | 'program-detail'
  | 'family-center-detail';

export type AboutSubTab = 'greeting' | 'purpose' | 'history' | 'organization';
