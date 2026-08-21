import { PressCoverageItem } from '../types';

/**
 * 사단법인 너브내행복나눔재단(및 위탁 운영 중인 홍천군가족센터) 관련
 * 실제 언론 보도 목록입니다. 2024~2026년 사이 웹 검색을 통해 확인한
 * 기사만 선별했으며, 각 항목의 링크는 해당 언론사 원문 기사로 연결됩니다.
 *
 * 새로운 보도가 나오면 이 배열에 항목을 추가해주세요. (관리자 화면에서
 * 직접 추가할 수 있는 기능이 필요하면 말씀해주세요 — 공지사항처럼
 * Firestore 기반 CRUD로 확장할 수 있습니다.)
 */
export const INITIAL_PRESS_COVERAGE: PressCoverageItem[] = [
  {
    id: 'press-2026-04-01',
    title: '[포토뉴스] 너브내행복나눔재단 홍천교육청에 장학금 전달',
    outlet: '강원일보',
    date: '2026-04-09',
    summary: '재단이 홍천교육지원청을 방문해 초등학생 대상 제3회 꿈나무 장학금 3,000만원을 전달한 소식을 사진과 함께 전했습니다.',
    url: 'https://www.kwnews.co.kr/page/view/2026040815203813560'
  },
  {
    id: 'press-2026-02-27',
    title: '너브내행복나눔재단, 제17차 정기총회 개최',
    outlet: '신아일보',
    date: '2026-02-27',
    summary: '재단이 2026년 제17차 정기총회를 열어 2025년도 사업실적과 결산을 승인하고, 지역 복지 유공자에게 감사패와 표창을 전달한 소식을 다뤘습니다.',
    url: 'https://www.shinailbo.co.kr/news/articleView.html?idxno=2196797'
  },
  {
    id: 'press-2026-02-26',
    title: '너브내행복나눔재단, 2026년 정기총회 열어 2025년 결산 승인',
    outlet: '한국다문화인터넷신문',
    date: '2026-02-26',
    summary: '2026년 제17차 정기총회 소식을 다루며, 재단이 취약계층 지원과 지역 복지 네트워크 강화를 중심으로 2026년 사업계획을 보고했다고 전했습니다.',
    url: 'https://www.xn--3e0bx5e0sbx9qba378ifzhyiursi7oc.com/bbs/board.php?bo_table=news&wr_id=4921'
  },
  {
    id: 'press-2026-02-20',
    title: '홍천군가족센터 맞벌이자녀돌봄교실, 홍천소방서 연계 소방안전교육 실시',
    outlet: '신아일보',
    date: '2026-02-20',
    summary: '재단이 위탁 운영하는 홍천군가족센터 돌봄교실이 홍천소방서와 연계해 화재 대처요령, 소화기 사용법, 심폐소생술 등 아동 안전교육을 진행한 소식입니다.',
    url: 'http://www.shinailbo.co.kr/news/articleView.html?idxno=2193741'
  },
  {
    id: 'press-2025-12-16',
    title: '대명소노그룹, 홍천 취약계층 청소년 지원 1000만원 전달',
    outlet: '이투데이',
    date: '2025-12-16',
    summary: '대명소노그룹이 홍천군 다문화·조손·한부모 가정 학생들의 교육 기회 지원을 위해 재단에 후원금 1,000만원을 전달한 소식을 다뤘습니다.',
    url: 'https://www.etoday.co.kr/news/view/2536422'
  },
  {
    id: 'press-2025-12-16-b',
    title: '대명소노그룹, 홍천 취약계층 학생에 1천만원 후원···15년째 나눔',
    outlet: '스마트에프엔',
    date: '2025-12-16',
    summary: '대명소노그룹이 2011년부터 이어온 홍천군 취약계층 학생 후원이 15년째를 맞았다며, 이번 후원금 1,000만원 전달식 소식을 전했습니다.',
    url: 'https://www.smartfn.co.kr/news/articleView.html?idxno=129608'
  },
  {
    id: 'press-2025-12-04',
    title: '2025년 홍천군가족센터 사업보고회 \'미리 크리스마스\'',
    outlet: '내외일보',
    date: '2025-12-04',
    summary: '재단과 홍천군가족센터가 함께한 2025년 사업보고회에서 취약가족 지원, 다문화 특화사업 등 한 해 활동 성과를 공유한 자리를 소개했습니다.',
    url: 'https://www.naewoeilbo.com/news/articleView.html?idxno=2258921'
  },
  {
    id: 'press-2025-10-20',
    title: '홍천군가족센터, 돌봄품앗이 하반기 대상교육 및 전체모임 진행',
    outlet: '신아일보',
    date: '2025-10-20',
    summary: '재단이 위탁 운영하는 홍천군가족센터가 돌봄품앗이 참여 활동가와 부모를 대상으로 소통 교육과 전체모임을 진행한 소식을 담았습니다.',
    url: 'https://www.shinailbo.co.kr/news/articleView.html?idxno=2132432'
  },
  {
    id: 'press-2025-09-27',
    title: '홍천도시산림공원 토리숲 \'2025년 제4회 세계문화축제\'',
    outlet: '로컬세계',
    date: '2025-09-27',
    summary: '재단 윤성일 이사장이 참석한 가운데 열린 제4회 세계문화축제에서 드론축구대회와 다문화 화합 프로그램이 진행된 현장을 소개했습니다.',
    url: 'https://localsegye.co.kr/news/view/1065605576380983'
  },
  {
    id: 'press-2025-08-21',
    title: '홍천군, 다문화 사회 의식 고취하는 제6회 다문화인식개선 콘테스트 시상식 개최',
    outlet: '내외일보',
    date: '2025-08-21',
    summary: '재단 윤성일 이사장이 참석한 제6회 다문화인식개선 그림 공모전 시상식에서 어린이·청소년 150명이 수상한 소식을 전했습니다.',
    url: 'https://www.naewoeilbo.com/news/articleView.html?idxno=2164766'
  },
  {
    id: 'press-2025-08-14',
    title: '[강원도 양성평등기금 지원사업] 홍천군, 다양한 사업 추진 통해 여성 역량 강화 및 사회 참여 도모',
    outlet: '여성신문',
    date: '2025-08-14',
    summary: '강원도 양성평등기금 지원사업의 일환으로 재단이 지역 여성을 대상으로 운영 중인 K-POP 댄스교실 \'댄스 ON\' 등 여성 역량 강화 프로그램을 소개했습니다.',
    url: 'https://www.womennews.co.kr/news/articleView.html?idxno=266085'
  },
  {
    id: 'press-2025-03-14',
    title: '너브내행복나눔재단, 홍천교육지원청에 장학금 전달',
    outlet: '강원도민일보',
    date: '2025-03-14',
    summary: '재단과 홍천군가족센터가 공동으로 지역 초등학생 50명을 선발해 1인당 60만원씩 \'꿈나무 장학금\'을 지원한 소식을 다뤘습니다.',
    url: 'https://www.kado.net/news/articleView.html?idxno=1298821'
  },
  {
    id: 'press-2025-03-13',
    title: '[포토뉴스] 홍천 너브내행복나눔재단 꿈나무 장학금 전달',
    outlet: '강원일보',
    date: '2025-03-14',
    summary: '학업 의지가 강하거나 예체능 분야에 재능이 있는 초등학생 50명에게 장학증서를 전달한 꿈나무 장학금 사업 현장을 사진으로 전했습니다.',
    url: 'https://www.kwnews.co.kr/page/view/2025031311442762611'
  },
  {
    id: 'press-2024-12-16',
    title: '대명소노그룹, 홍천군 취약계층 학생 위한 후원금 1천만원 전달',
    outlet: '청년일보',
    date: '2024-12-16',
    summary: '대명소노그룹이 홍천군 취약계층 학생 지원을 위해 재단에 후원금 1,000만원을 전달한 전달식 소식을 보도했습니다.',
    url: 'https://www.youthdaily.co.kr/news/article.html?no=206330'
  },
  {
    id: 'press-2024-10-25',
    title: '강원 홍천 토리숲에서 26일 세계문화축제…핼러윈 행사 등 다채',
    outlet: '뉴시스',
    date: '2024-10-25',
    summary: '재단 주관으로 홍천 거주 다양한 가정 500여 명이 참가한 세계문화축제 개최 소식을 전하며, 세계문화 체험과 핼러윈 행사, 한마음체육대회 등을 소개했습니다.',
    url: 'https://www.newsis.com/view/NISX20241025_0002934171'
  },
  {
    id: 'press-2024-06-28',
    title: '홍천군가족센터, 제5회 다문화인식개선 콘테스트 그림공모전 시상식 \'성료\'',
    outlet: '한국다문화인터넷신문',
    date: '2024-06-28',
    summary: '재단이 위탁 운영하는 홍천군가족센터가 다문화 인식개선을 주제로 매년 개최하는 그림 공모전 시상식에서 15명의 학생이 수상한 소식을 다뤘습니다.',
    url: 'https://www.xn--3e0bx5e0sbx9qba378ifzhyiursi7oc.com/795'
  }
];
