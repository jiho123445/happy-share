import { FoundationSettings, TimelineItem, ProgramItem, AwardItem, NoticeItem, GalleryItem } from '../types';

export const INITIAL_SETTINGS: FoundationSettings = {
  name: '사단법인 너브내행복나눔재단',
  englishName: 'Nerve-Nae Happiness Sharing Foundation',
  chairmanName: '윤성일',
  sloganMain: '넓고 깊은 강물처럼, 홍천에 따뜻한 나눔이 흐릅니다.',
  sloganSub: '2009년부터 이어온 나눔, 이제 홍천군민 모두의 행복으로 이어갑니다.',
  establishedYear: '2009',
  reorganizedYear: '2024',
  address: '강원특별자치도 홍천군 홍천읍 산림조합길 12 (너브내행복나눔재단 / 홍천군가족센터)',
  phone: '033-436-1926',
  fax: '033-436-1910',
  email: 'nerve_nae@naver.com',
  operatingHours: '월~금 09:00 - 18:00 (토, 일, 공휴일 휴무)',
  bankAccounts: [
    { bank: '농협은행', accountNumber: '351-0334-3619-11', holder: '(사)너브내행복나눔재단' },
    { bank: '신한은행', accountNumber: '100-033-436192', holder: '(사)너브내행복나눔재단' }
  ],
  snsLinks: {
    naver: 'https://blog.naver.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com'
  }
};

export const INITIAL_TIMELINE: TimelineItem[] = [
  {
    year: '2009',
    title: '(사)홍천다문화가정후원회 출범',
    subtitle: '민간 중심 나눔의 첫 걸음',
    description: '홍천지역 다문화가정과 이주민, 지역 취약계층의 안정적인 자립을 지원하기 위해 윤성일 회장을 중심으로 지역 자원봉사자와 후원인들이 뜻을 모아 출범했습니다.',
    category: '출범',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'
  },
  {
    year: '2010~2015',
    title: '다문화가정 복지 지원망 대폭 확대',
    subtitle: '교육, 의료, 주거, 긴급생활 지원',
    description: '장학금 지원, 학원비 및 교재비 보조, 긴급 의료비 및 생활용품 지원, 보온 주거환경 개선사업을 본격화하며 홍천 관내 복지 사각지대 해소에 기여했습니다.',
    category: '사업확대',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
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
    year: '2017',
    title: '여성가족부장관상 수상',
    subtitle: '다문화가족 지원 및 포용사회 조성',
    description: '다문화가족의 건강한 성장과 지역사회 융합, 여성 및 아동 복지 증진에 이바지한 공로로 여성가족부장관 표창을 받았습니다.',
    category: '수상',
    awardBadge: '여성가족부장관상 (2017)'
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
    year: '2024',
    title: '「사단법인 너브내행복나눔재단」으로 확대 전환',
    subtitle: '홍천군 전체 복지 사각지대를 보듬는 민간 복지 플랫폼',
    description: '15년간 축적된 전문성과 후원 네트워크를 바탕으로 지원 대상을 홍천군민 전체의 소외계층으로 확대하고 복지시설 배분사업과 공모사업을 본격 추진합니다.',
    category: '법인전환',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  },
  {
    year: '2025~2026',
    title: '지역 복지 인프라 강화 & AI 디지털 포용 복지',
    subtitle: '기술과 온기가 결합한 미래형 복지 모델 구축',
    description: '관내 장애인·노인·가족 복지시설 대상 맞춤형 배분사업 확충과 함께 이주민 AI 한국어 발음교정 및 취약계층 디지털 포용 교육을 운영합니다.',
    category: '사업확대',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
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
    title: 'AI·디지털 복지',
    subtitle: '기술을 넘어 사람을 위한 미래형 복지.',
    summary: 'AI 음성인식과 생성형 디지털 기술을 접목한 다문화·고령층 맞춤 학습',
    details: [
      'AI 기반 한국어 발음 교정 및 정밀 실시간 음성 피드백 (Master K / Talkpal 연계)',
      '어르신 및 이주민 대상 스마트폰 생활 AI 활용 교육',
      '생성형 AI를 활용한 디지털 문해 및 정보격차 해소',
      '디지털 복지 기기 지원 및 비대면 안부 확인 시스템'
    ],
    iconName: 'Cpu',
    targetAudience: '결혼이민자, 다문화 자녀, 정보 소외 어르신',
    impactMessage: '누구나 기술의 혜택에서 소외되지 않는 미래형 복지 홍천을 선도합니다.',
    badge: '특화 혁신사업'
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

올해에는 취약계층 긴급구호, 장학사업 확대, 복지시설 배분사업과 함께 AI 디지털 포용 교육 등 다각적인 포용복지를 실천할 예정입니다.`
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

자세한 사항은 재단 사무국([관리자 입력 필요 - 전화번호])으로 문의해 주시기 바랍니다.`
  },
  {
    id: 'not-02',
    title: '2025년도 너브내행복나눔 배분사업 최종 공모 결과 발표',
    category: '사업소식',
    date: '2025-12-15',
    views: 528,
    isImportant: false,
    author: '재단 사업팀',
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
    title: '결혼이민자 대상 AI 기반 한국어 발음교정 특화 프로그램 수강생 모집',
    category: '모집공고',
    date: '2026-01-08',
    views: 295,
    isImportant: true,
    author: '디지털복지팀',
    content: `너브내행복나눔재단과 홍천군가족센터가 공동 주관하는 'AI 한국어 발음 교정 및 정착 지원 사업' 수강생을 모집합니다.

스마트폰 AI 음성인식 기술을 활용해 언제 어디서나 정확한 한국어 발음과 어휘를 연습할 수 있는 무료 학습 기회를 제공합니다.`
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
    id: 'gal-2026-01',
    title: '2026년 제3회 꿈나무 장학금 전달식 (보혜사 신도회 후원)',
    category: '장학금 전달',
    date: '2026-07-29',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: '보혜사 신도회 후원 및 재단 기금 총 3,000만 원으로 홍천 관내 초등학생 50명에게 6개월간 지원될 사랑 가득 장학금을 전달했습니다.',
    location: '너브내행복나눔재단 대강당'
  },
  {
    id: 'gal-2026-02',
    title: '2026년 호국보훈의 달 기념 헌신을 기억하는 나눔 행사',
    category: '명절 나눔',
    date: '2026-06-17',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=800&q=80',
    description: '국가유공자 및 복지 사각지대 취약계층 100가구에 여름 선풍기와 생필품 키트(가구당 10만 원 상당)를 전달하며 감사의 마음을 표했습니다.',
    location: '홍천군 관내 취약계층 가구'
  },
  {
    id: 'gal-2026-03',
    title: '제17차 정기총회 및 2026년 이웃사랑 나눔복지 사업계획 보고',
    category: '복지시설 지원',
    date: '2026-02-25',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: '2025년 결산 승인 및 2026년 지역사회 복지 사각지대 발굴과 연대 강화를 위한 사업계획을 확정하였습니다.',
    location: '너브내행복나눔재단 회의실'
  },
  {
    id: 'gal-01',
    title: '2026년 설맞이 홍천 사랑의 떡국떡 & 생필품 나눔',
    category: '명절 나눔',
    date: '2026-01-22',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    description: '홍천 관내 독거어르신과 다문화가정 300가구에 사랑의 설 명절 선물세트를 전달했습니다.',
    location: '홍천군 재단 정문 및 관내 9개 면'
  },
  {
    id: 'gal-2025-01',
    title: '홍천군가족센터 2025년 사업보고회 및 성과공유회',
    category: '교육지원',
    date: '2025-12-02',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    description: '재단 위탁운영 기관인 홍천군가족센터의 한 해 동안의 다문화 및 이주민 맞춤 가족복지 성과를 지역 주민들과 공유하였습니다.',
    location: '홍천군가족센터 강당'
  },
  {
    id: 'gal-2025-02',
    title: '지역사회 복지 향상을 위한 유관기관 업무협약(MOU) 체결',
    category: '복지시설 지원',
    date: '2025-09-17',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    description: '홍천군사회복지협의회 및 종합사회복지관과 연대하여 복지 사각지대 긴급 구호 및 공동 대응 협조 체계를 구축하였습니다.',
    location: '홍천군 종합사회복지관'
  },
  {
    id: 'gal-2025-03',
    title: '제2회 너브내행복나눔재단 배분사업 전달식',
    category: '복지시설 지원',
    date: '2025-06-26',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: '홍천 관내 8개 주요 복지시설에 공모 배분 사업비를 전달하고 장애인·노인 문화 프로그램을 적극 지원했습니다.',
    location: '너브내행복나눔재단 대강당'
  },
  {
    id: 'gal-02',
    title: '다문화 아동·청소년 희망 장학금 전달식',
    category: '장학금 전달',
    date: '2025-11-18',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: '홍천 관내 우수 학업 아동 및 다문화 가정 자녀 45명에게 희망 장학금을 전달했습니다.',
    location: '재단 대강당'
  },
  {
    id: 'gal-03',
    title: '여름철 보양 삼계탕 나눔 봉사활동',
    category: '삼계탕 나눔',
    date: '2025-07-15',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: '무더위에 취약한 어르신들과 이웃들을 위해 자원봉사자들과 삼계탕 250인분을 정성껏 끓여 전달했습니다.',
    location: '홍천군 종합복지관'
  },
  {
    id: 'gal-04',
    title: '홍천군장애인복지관 사물놀이 문화교실 물품지원',
    category: '복지시설 지원',
    date: '2025-09-03',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: '너브내행복나눔 배분사업을 통해 장애인복지관 사물놀이단에 악기 및 의상을 지원하였습니다.',
    location: '홍천군장애인복지관'
  },
  {
    id: 'gal-05',
    title: '독거어르신 노후주택 창호 및 도배 단열 시공',
    category: '주거환경 개선',
    date: '2025-10-12',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    description: '겨울철 한파에 취약한 고령 어르신 가구의 창호 및 도배를 교체하여 warm-home을 선물했습니다.',
    location: '홍천읍 신장대리'
  },
  {
    id: 'gal-06',
    title: 'AI 기반 한국어 발음분석 실습 교실 현장',
    category: '교육지원',
    date: '2025-12-01',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: '결혼이민자들이 스마트폰 AI 발음분석 앱을 활용해 한국어 음성을 익히는 특화 수업 현장입니다.',
    location: '홍천군가족센터 강의실'
  }
];
