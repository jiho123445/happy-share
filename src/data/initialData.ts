import { FoundationSettings, TimelineItem, ProgramItem, AwardItem, NoticeItem, GalleryItem, DonationApplication, PopupItem } from '../types';

export const INITIAL_GALLERY_CATEGORIES: string[] = [
  '장학금 전달',
  '교육지원',
  '명절 나눔',
  '삼계탕 나눔',
  '주거환경 개선',
  '복지시설 지원',
  '다문화지원'
];

export const INITIAL_SETTINGS: FoundationSettings = {
  adminPassword: '1026',
  name: '사단법인 너브내행복나눔재단',
  englishName: 'Nerve-Nae Happiness Sharing Foundation',
  chairmanName: '윤성일',
  chairmanImageUrl: '/uploads/chairman_profile.jpg',
  heroImageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
  chairmanGreeting: `안녕하십니까. 사단법인 너브내 행복나눔재단 이사장 윤성일입니다.

먼저 바쁘신 가운데 저희 재단 홈페이지를 찾아주신 후원자님, 자원봉사자님, 그리고 지역주민 여러분께 진심으로 감사의 인사를 드립니다.

'너브내'라는 이름은 넓고 깊게 흐르는 물줄기를 뜻하는 우리말입니다. 그 이름처럼 이웃을 향한 정과 사랑이 넓고 깊게 흘러, 우리 지역사회 곳곳에 따뜻하게 스며들기를 바라는 마음으로 너브내 행복나눔재단은 첫걸음을 내디뎠습니다.

오늘도 복지의 손길이 미처 닿지 못한 곳에서 외로움과 어려움을 겪고 계신 이웃들이 적지 않습니다. 저희 재단은 작은 나눔이 모여 커다란 희망의 물결을 이룬다는 믿음으로, 그러한 이웃들의 곁을 지키는 든든한 버팀목이 되고자 합니다.

저희 재단은 다음과 같은 마음으로 걸어가고 있습니다.

• 소외된 이웃과의 동행: 어르신, 다문화 가정, 취약계층 아동·청소년 등 복지 사각지대에 놓인 이웃들을 꾸준히 찾아 나서고, 실질적인 도움을 드리기 위해 노력하고 있습니다.
• 투명하고 성실한 법인 운영: 여러분께서 보내주신 따뜻한 정성이 가장 필요한 곳에 정직하게 전달될 수 있도록, 투명성과 공정성을 최우선 가치로 삼고 있습니다.
• 지역사회와 함께하는 나눔 문화 확산: 모두가 서로를 돌보고 온기를 나누는 행복한 공동체를 만드는 일에 앞장서고자 합니다.

혼자 가면 빠른 길이 될 수 있지만, 함께 가면 더 멀리, 그리고 더 따뜻하게 갈 수 있습니다. 여러분의 관심과 참여 하나하나가 우리 이웃들에게는 삶을 살아갈 큰 용기와 희망이 됩니다.

너브내 행복나눔재단이 지역사회의 빛과 소금이 되는 그 여정에 앞으로도 늘 함께해 주시기를 부탁드리며, 이 자리를 찾아주신 모든 분들의 가정에 건강과 행복이 가득하시기를 진심으로 기원합니다.

감사합니다.

사단법인 너브내 행복나눔재단 이사장 윤성일 올림`,
  sloganMain: '넓고 깊은 강물처럼, 홍천에 따뜻한 나눔이 흐릅니다.',
  sloganSub: '2009년부터 이어온 나눔, 이제 홍천군민 모두의 행복으로 이어갑니다.',
  establishedYear: '2009',
  reorganizedYear: '2024',
  address: '강원특별자치도 홍천군 홍천읍 송학로3길 26, 2층 (너브내행복나눔재단)',
  phone: '033-436-1925',
  fax: '033-436-1910',
  familyCenterPhone: '033-433-1925',
  familyCenterFax: '033-433-1910',
  email: 'hcdmh1026@naver.com',
  operatingHours: '월~금 09:00 - 18:00 (토, 일, 공휴일 휴무)',
  bankAccounts: [
    { bank: '농협', accountNumber: '351-1040-2310-53', holder: '(사)너브내행복나눔재단' },
    { bank: '신한은행', accountNumber: '100-026-882834', holder: '(사)너브내행복나눔재단' }
  ],
  snsLinks: {
    naver: 'https://blog.naver.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com'
  },
  galleryCategories: INITIAL_GALLERY_CATEGORIES
};

export const INITIAL_TIMELINE: TimelineItem[] = [
  {
    year: '2026',
    title: '지역 복지 인프라 강화 & 다문화가족 화합 복지',
    subtitle: '문화와 온기가 결합한 포용적 복지 모델 구축',
    description: '관내 장애인·노인·가족 복지시설 대상 맞춤형 배분사업 확충과 함께 홍천 다문화가족 한마음 축제 개최 및 소외계층 포용 복지를 추진합니다.',
    category: '사업확대'
  },
  {
    year: '2024',
    title: '「사단법인 너브내행복나눔재단」으로 확대 전환',
    subtitle: '홍천군 전체 복지 사각지대를 보듬는 민간 복지 플랫폼',
    description: '15년간 축적된 전문성과 후원 네트워크를 바탕으로 지원 대상을 홍천군민 전체의 소외계층으로 확대하고 복지시설 배분사업과 공모사업을 본격 추진합니다.',
    category: '법인전환'
  },
  {
    year: '2019',
    title: '강원도 선행도민대상 수상',
    subtitle: '도민 헌신 및 이웃사랑 실천',
    description: '10년 이상 변함없이 홍천 지역사회 소외 이웃과 취약계층을 위해 헌신한 이웃사랑 실천 공로로 강원도 선행도민대상을 수상했습니다.',
    category: '수상',
    awardBadge: '강원도 선행도민대상 (2019)'
  },
  {
    year: '2017',
    title: '여성가족부장관상 수상',
    subtitle: '다문화가족 지원 및 포용사회 조성',
    description: '다문화가족의 건강한 성장과 지역사회 융합, 여성 및 아동 복지 증진에 이바지한 공로로 여성가족부장관 표창을 받았습니다.',
    category: '수상',
    awardBadge: '여성가족부장관상 (2017)'
  },
  {
    year: '2016',
    title: '행정자치부장관상 수상',
    subtitle: '지역사회 봉사 및 나눔 공로 인정',
    description: '홍천군 다문화가정의 안정적 정착과 소외계층 대상 지속적인 민간 복지 지원활동의 성과를 인정받아 행정자치부장관 표창을 수상하였습니다.',
    category: '수상',
    awardBadge: '행정자치부장관상 (2016)'
  },
  {
    year: '2010~2015',
    title: '다문화가정 복지 지원망 대폭 확대',
    subtitle: '교육, 의료, 주거, 긴급생활 지원',
    description: '장학금 지원, 학원비 및 교재비 보조, 긴급 의료비 및 생활용품 지원, 보온 주거환경 개선사업을 본격화하며 홍천 관내 복지 사각지대 해소에 기여했습니다.',
    category: '사업확대'
  },
  {
    year: '2009',
    title: '(사)홍천다문화가정후원회 출범',
    subtitle: '민간 중심 나눔의 첫 걸음',
    description: '홍천지역 다문화가정과 이주민, 지역 취약계층의 안정적인 자립을 지원하기 위해 윤성일 회장을 중심으로 지역 자원봉사자와 후원인들이 뜻을 모아 출범했습니다.',
    category: '출범'
  }
];

export const INITIAL_AWARDS: AwardItem[] = [
  {
    year: '2016',
    title: '행정자치부장관상',
    issuer: '행정자치부',
    description: '지역사회 봉사 및 나눔문화 활성화 공로'
  },
  {
    year: '2017',
    title: '여성가족부장관상',
    issuer: '여성가족부',
    description: '다문화가족 자립 및 포용사회 조성 기여'
  },
  {
    year: '2019',
    title: '강원도 선행도민대상',
    issuer: '강원특별자치도',
    description: '지역 소외계층 지원 및 헌신적 봉사 실천'
  },
  {
    year: '2022',
    title: '강원 다문화가족 우수봉사단체 대상',
    issuer: '강원 다문화복지협의회',
    description: '다문화 아동·청소년 장학지원 및 봉사 공로'
  }
];

export const INITIAL_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-01',
    code: '01',
    title: '장학·교육지원',
    subtitle: '배움의 기회가 미래를 바꿉니다.',
    summary: '홍천 관내 다문화가정 자녀 및 취약계층 아동·청소년의 안정적인 학업 지원',
    details: [
      '다문화가정 및 저소득층 자녀 장학금 지급',
      '학원비 및 전문 방과후 교육비 맞춤 지원',
      '초·중·고 학용품, 도서 및 디지털 학습기기 제공',
      '청소년 진로탐색 및 자격증 취득 교육'
    ],
    iconName: 'GraduationCap',
    targetAudience: '홍천 관내 아동·청소년 및 이주민 자녀',
    impactMessage: '경제적 여건으로 꿈을 포기하지 않도록 든든한 디딤돌이 됩니다.',
    badge: '꿈과 희망'
  },
  {
    id: 'prog-02',
    code: '02',
    title: '취약계층 긴급지원',
    subtitle: '갑작스러운 위기에도 혼자가 되지 않도록.',
    summary: '질병, 사고, 실직 등으로 갑작스런 위기에 놓인 홍천 가정을 즉각 구호',
    details: [
      '긴급 의료비 및 수술비 지원',
      '생계위기 가구 생필품 및 위기 지원금 제공',
      '명절 선물세트 및 계절별 맞춤 구호물품 전달',
      '지역 긴급복지 연계 및 맞춤 상담 서비스'
    ],
    iconName: 'HeartHandshake',
    targetAudience: '홍천군 관내 긴급위기 가구 및 복지 사각지대',
    impactMessage: '가장 필요한 순간, 따뜻한 손길로 절망을 희망으로 바꿉니다.',
    badge: '긴급 구호'
  },
  {
    id: 'prog-03',
    code: '03',
    title: '주거환경 개선',
    subtitle: '더 안전하고 따뜻한 보금자리를 위해.',
    summary: '열악한 환경에 노출된 고령자, 장애인, 다문화가정의 보금자리 개보수',
    details: [
      '단열, 창호, 단열재 보강 및 단열 시공',
      '도배, 장판, 단열 폼보드 및 싱크대 교체',
      '여름철 선풍기·에어컨, 겨울철 난방유 및 연탄 지원',
      '안전손잡이 설치 및 주거위생 환경 소독'
    ],
    iconName: 'Home',
    targetAudience: '노후 주택 거주 취약계층 및 다문화가정',
    impactMessage: '안전하고 보송보송한 주거공간에서 건강한 삶이 시작됩니다.',
    badge: '보금자리'
  },
  {
    id: 'prog-04',
    code: '04',
    title: '다문화·가족지원',
    subtitle: '다름을 존중하고 함께 살아가는 홍천.',
    summary: '결혼이민자의 안정적 정착과 다문화가족의 지역사회 정주 여건 조성',
    details: [
      '한국어 문화 적응 및 다문화 이해 교실',
      '부모 교육, 가족 문화체험 및 캠프 운영',
      '이주여성 모국 방문 및 가족 소통 지원',
      '다문화 인식개선 캠페인 및 공동체 활동'
    ],
    iconName: 'Users',
    targetAudience: '결혼이민자, 이주민 및 다문화가족 전체',
    impactMessage: '서로의 문화를 이해하며 모두가 당당한 홍천 군민으로 어우러집니다.',
    badge: '가족 포용'
  },
  {
    id: 'prog-05',
    code: '05',
    title: '복지시설 배분사업',
    subtitle: '지역의 복지기관이 더 좋은 일을 할 수 있도록.',
    summary: '홍천 관내 사회복지기관 및 시설의 프로그램과 환경 개선비용을 직접 단체 지원',
    details: [
      '장애인복지관 문화예술·사물놀이 프로그램 지원',
      '노인복지관 식당 주방 시설 개보수 및 기능 보강',
      '지역아동센터 교육 기자재 및 난방비 지원',
      '관내 소규모 복지시설 맞춤형 공모 배분'
    ],
    iconName: 'Building2',
    targetAudience: '홍천 관내 사회복지시설 및 사회적 약자 이용기관',
    impactMessage: '지역 복지 인프라 전체의 역량을 높여 더 넓은 혜택을 제공합니다.',
    badge: '너브내 배분사업'
  },
  {
    id: 'prog-06',
    code: '06',
    title: '다문화가족 한마음 축제',
    subtitle: '다문화가족과 지역주민이 함께 어우러지는 화합과 나눔의 대축제.',
    summary: '세계 문화 체험, 체육대회, 장기자랑 및 모범가족 표창을 통한 홍천군민 소통과 화합의 장',
    details: [
      '세계 각국 전통 요리 및 다문화 전통의상 체험관 운영',
      '다문화가족과 지역 주민이 함께하는 명랑운동회 & 체육대회',
      '다문화가족 장기자랑, 세계 전통 무용 공연 및 축하 무대',
      '모범 다문화가족 표창, 다문화 장학금 전달 및 화합 네트워크 구축'
    ],
    iconName: 'PartyPopper',
    targetAudience: '홍천 관내 다문화가족, 이주민 및 홍천군민 전체',
    impactMessage: '다채로운 문화가 어우러져 편견을 허물고 온 군민이 하나 되는 포용 도시 홍천을 만들어 갑니다.',
    badge: '화합 축제사업'
  }
];

export const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-2026-01',
    title: '2026년 제3회 꿈나무 장학금 3,000만 원 전달식 개최 (보혜사 신도회 연계)',
    category: '재단소식',
    date: '2026-07-29',
    views: 485,
    isImportant: true,
    author: '재단 사업팀',
    content: `사단법인 너브내행복나눔재단은 보혜사 신도회와 함께 '2026 사랑 가득 장학금 전달식'을 개최하였습니다.

이번 장학금은 '제3회 꿈나무 장학금 지원사업'의 일환으로 보혜사 신도회의 따뜻한 후원과 재단 기금을 모아 총 3,000만 원의 기금을 조성하였습니다.

■ 지원 대상: 홍천군 관내 초등학생 50명
■ 지원 내용: 6개월간 매월 안정적인 장학금 지급

너브내행복나눔재단은 앞으로도 홍천의 꿈나무들이 경제적 여건에 상관없이 마음껏 꿈을 펼칠 수 있도록 든든한 버팀목이 되겠습니다.`
  },
  {
    id: 'not-2026-02',
    title: '2026년 호국보훈의 달 기념 국가유공자 및 취약계층 100가구 물품 나눔',
    category: '재단소식',
    date: '2026-06-17',
    views: 390,
    isImportant: false,
    author: '복지사업팀',
    content: `호국보훈의 달을 맞아 국가를 위해 헌신하신 국가유공자 어르신들과 복지 사각지대 취약계층 100가구에 여름철 선풍기 및 생필품 키트(가구당 10만 원 상당)를 선사했습니다.

재단 임직원과 봉사자들이 대상 가정을 직접 찾아뵙고 안부를 살피며 숭고한 헌신에 감사의 뜻을 전달하였습니다.`
  },
  {
    id: 'not-2026-03',
    title: '제17차 정기총회 개최 및 2026년 나눔복지 사업계획 보고',
    category: '재단소식',
    date: '2026-02-25',
    views: 310,
    isImportant: false,
    author: '재단 사무국',
    content: `사단법인 너브내행복나눔재단은 제17차 정기총회를 열어 2025년 사업 결산안을 승인하고 2026년 이웃사랑 나눔복지 사업계획을 의결하였습니다.

올해에는 취약계층 긴급구호, 장학사업 확대, 복지시설 배분사업과 함께 홍천 다문화가족 한마음 축제 개최 등 다각적인 포용복지를 실천할 예정입니다.`
  },
  {
    id: 'not-01',
    title: '2026년도 사단법인 너브내행복나눔재단 상반기 장학생 모집 안내',
    category: '모집공고',
    date: '2026-02-10',
    views: 342,
    isImportant: true,
    author: '재단 사무국',
    attachmentName: '2026_상반기_장학금신청서.hwp',
    attachments: [
      { name: '2026_상반기_장학생신청서_및_추천서.hwp', size: '142 KB', type: 'HWP' },
      { name: '2026_장학생_모집요강_및_제출서류안내.pdf', size: '320 KB', type: 'PDF' }
    ],
    content: `안녕하세요, 사단법인 너브내행복나눔재단 사무국입니다.

재단에서는 2026년도 상반기 홍천 관내 다문화가정 및 취약계층 자녀들의 학업 지속과 미래 성장을 돕기 위해 장학생을 다음과 같이 모집합니다.

■ 신청 대상
- 홍천군 관내 거주 초·중·고등학생 및 대학생 (다문화가정 및 저소득 취약계층)

■ 지원 내용
- 초등학생: 50만 원
- 중·고등학생: 100만 원
- 대학생: 200만 원

■ 접수 기간
- 2026년 3월 2일(월) ~ 3월 20일(금) 18:00까지

■ 제출 서류
- 장학생 추천 및 신청서 (첨부파일)
- 주민등록등본 및 가구 소득증빙 서류
- 재학증명서 및 성적증명서

자세한 사항은 재단 사무국(033-436-1925)으로 문의해 주시기 바랍니다.`
  },
  {
    id: 'not-02',
    title: '2025년도 너브내행복나눔 배분사업 최종 공모 결과 발표',
    category: '사업소식',
    date: '2025-12-15',
    views: 528,
    isImportant: false,
    author: '재단 사업팀',
    attachmentName: '2025_배분사업_선정기관_공문.pdf',
    attachments: [
      { name: '2025_너브내배분사업_최종선정기관_목록.pdf', size: '280 KB', type: 'PDF' }
    ],
    content: `홍천 관내 사회복지 시설과 기관을 대상으로 진행된 '2025년 너브내행복나눔 배분사업' 공모에 참여해주신 많은 기관에 깊은 감사를 드립니다.

심사위원회의 정밀한 심사를 거쳐 최종 선정된 8개 기관을 발표합니다.

■ 최종 선정 기관 (총 8개소)
1. 홍천군장애인복지관 (문화예술 사물놀이 프로그램 지원)
2. 홍천군노인복지관 (조리실 환경 개선 및 고령 어르신 식당 보강)
3. 홍천군가족센터 (다문화 아동 이중언어 교실 지원)
4. 홍천 지역아동센터 연합회 (학습 기자재 지원)
5. 기타 관내 사회복지 시설 4개소

선정된 기관에는 개별 안내 및 사업비 교부가 진행될 예정입니다.`
  },
  {
    id: 'not-03',
    title: '설 명절 맞아 홍천 관내 취약계층 300가구 생필품 나눔 전달식 개최',
    category: '재단소식',
    date: '2026-01-22',
    views: 410,
    isImportant: false,
    author: '재단 홍보팀',
    content: `너브내행복나눔재단은 민족 대명절 설을 맞아 홍천 관내 독거어르신, 다문화가정, 장애인 가구 등 300가구에 사랑의 떡국떡과 생필품 선물세트를 전달했습니다.

이번 나눔 행사에는 재단 이사진과 지역 자원봉사자들이 함께 참여하여 홍천읍 및 9개 면 지역 소외 이웃들의 가정을 직접 방문하여 전달하였습니다.`
  },
  {
    id: 'not-04',
    title: '제13회 홍천 다문화가족 한마음 축제 성황리 개최 안내',
    category: '재단소식',
    date: '2026-01-08',
    views: 385,
    isImportant: true,
    author: '다문화사업팀',
    content: `(사)너브내행복나눔재단과 홍천군가족센터가 공동 주최·주관한 '제13회 홍천 다문화가족 한마음 축제'가 600여 명의 다문화가족과 지역 군민들이 참여한 가운데 성황리에 개최되었습니다.

세계 전통요리 및 문화 체험관, 명랑운동회, 다문화가족 장기자랑 및 모범가족 표창 등 화합과 나눔의 풍성한 프로그램이 진행되었습니다.`
  },
  {
    id: 'not-05',
    title: '2025년도 후원금 집행 및 재정 투명성 기부금 영수증 안내',
    category: '후원소식',
    date: '2026-01-05',
    views: 620,
    isImportant: false,
    author: '재정관리팀',
    content: `소중한 마음을 모아주신 후원자 여러분께 감사드립니다.
2025년 한 해 동안 기부해 주신 기부금 영수증은 국세청 홈택스 연말정산 간소화 서비스를 통해 확인하실 수 있습니다.`
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    "title": "2026년 삼계탕 봉사",
    "category": "삼계탕 나눔",
    "imageUrl": "/uploads/gallery_gal-1786448517662.jpg",
    "description": "2026년 삼계탕 봉사",
    "location": "홍천군 관내",
    "id": "gal-1786448517662",
    "date": "2026-08-11",
    "author": "재단 관리자",
    "isProtected": true
  },
  {
    "id": "gal-03",
    "title": "여름철 보양 삼계탕 나눔 봉사활동",
    "category": "삼계탕 나눔",
    "date": "2025-07-15",
    "imageUrl": "/uploads/gallery_gal-03.jpg",
    "description": "무더위에 취약한 어르신들과 이웃들을 위해 자원봉사자들과 삼계탕 250인분을 정성껏 끓여 전달했습니다.",
    "location": "홍천군 종합복지관",
    "author": "재단 관리자",
    "isProtected": true
  },
  {
    "id": "gal-04",
    "title": "홍천군장애인복지관 사물놀이 문화교실 물품지원",
    "category": "복지시설 지원",
    "date": "2025-09-03",
    "imageUrl": "/uploads/gallery_gal-04.jpg",
    "description": "너브내행복나눔 배분사업을 통해 장애인복지관 사물놀이단에 악기 및 의상을 지원하였습니다.",
    "location": "홍천군장애인복지관",
    "author": "재단 관리자",
    "isProtected": true
  },
  {
    "id": "gal-05",
    "title": "독거어르신 노후주택 창호 및 도배 단열 시공",
    "category": "주거환경 개선",
    "date": "2025-10-12",
    "imageUrl": "/uploads/gallery_gal-05.jpg",
    "description": "겨울철 한파에 취약한 고령 어르신 가구의 창호 및 도배를 교체하여 warm-home을 선물했습니다.",
    "location": "홍천읍 신장대리",
    "author": "재단 관리자",
    "isProtected": true
  },
  {
    "id": "gal-06",
    "title": "제13회 홍천 다문화가족 한마음 축제 현장",
    "category": "다문화지원",
    "date": "2025-10-26",
    "imageUrl": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    "description": "다문화가족과 지역 주민들이 함께 세계 전통 요리를 맛보고 전통 의상을 체험하며 화합하는 한마음 축제 현장입니다.",
    "location": "홍천 도시산림공원 토리숲"
  }
];

export const INITIAL_DONATIONS: DonationApplication[] = [
  {
    id: 'don-01',
    name: '희정',
    phone: '010-3849-1925',
    email: 'heejung@naver.com',
    donationType: '정기후원',
    targetCategory: '아동·청소년 장학금 지원',
    amountOrItem: '30,000원 / 월',
    message: '수고하세요!',
    privacyAgreed: true,
    createdAt: '2026-08-03 21:57',
    status: '접수완료'
  },
  {
    id: 'don-02',
    name: '황경하',
    phone: '010-5219-4820',
    email: 'hwang@daum.net',
    donationType: '일시후원',
    targetCategory: '취약계층 난방비 지원',
    amountOrItem: '100,000원',
    message: '따뜻한 겨울 보내시길 바랍니다.',
    privacyAgreed: true,
    createdAt: '2026-08-03 16:23',
    status: '확인중'
  },
  {
    id: 'don-03',
    name: '이상훈',
    phone: '010-8294-1029',
    email: 'shlee@gmail.com',
    donationType: '정기후원',
    targetCategory: '다문화가정 정착 지원',
    amountOrItem: '50,000원 / 월',
    message: '재단의 귀한 사역을 응원합니다.',
    privacyAgreed: true,
    createdAt: '2026-08-03 12:16',
    status: '접수완료'
  },
  {
    id: 'don-04',
    name: '김지호',
    phone: '010-9102-3921',
    email: 'jiho@naver.com',
    donationType: '물품후원',
    targetCategory: '복지시설 배분사업',
    amountOrItem: '백미(쌀) 20kg 5포',
    message: '필요한 가구에 잘 전달 부탁드립니다.',
    privacyAgreed: true,
    createdAt: '2026-08-03 12:07',
    status: '접수완료'
  }
];

export const INITIAL_POPUPS: PopupItem[] = [
  {
    id: 'popup-01',
    title: '2026년 너브내 행복나눔 정기 후원자 모집 안내',
    content: '안녕하십니까, 사단법인 너브내행복나눔재단입니다.\n\n2026년을 맞아 홍천 지역 소외계층 어르신 및 다문화 가정 아동을 위한 정기 후원자를 모집하고 있습니다.\n\n후원자님의 작은 나눔이 복지 사각지대 이웃들에게 커다란 희망의 불씨가 됩니다. 많은 관심과 따뜻한 나눔 참여를 부탁드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'news',
    isActive: true,
    createdAt: '2026-08-01'
  }
];

