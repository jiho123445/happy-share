# 너브내행복나눔재단 SEO 최종 보완본

기존 화면/메뉴/Firebase/관리자 기능을 유지하고 검색 노출에 필요한 항목만 보완했습니다.

## 적용 내용
- 메인 title/description/keywords에 `홍천 봉사단체`, `홍천 봉사`, `홍천 봉사활동`, `홍천 나눔단체` 반영
- 주요 SPA 경로에 빌드 시 독립적인 `index.html` 생성
- 주요 경로별 title/description/canonical/hreflang/OG/Twitter 메타 생성
- 공지/사업/갤러리 상세 URL별 정적 SEO 페이지 생성
- 상세 페이지 JSON-LD 생성
- NGO + WebSite + WebPage/Article/ImageGallery 구조화 데이터 연결
- 빌드 시 Firestore 공개 콘텐츠를 반영한 정적 sitemap.xml 생성
- robots.txt에서 sitemap 명시
- Vercel의 sitemap -> /api 재작성 제거: 실제 생성된 정적 sitemap.xml을 직접 제공

## 유지한 영역
- Firebase Authentication / Firestore / Storage
- 관리자 UI 및 관리자 권한 로직
- 사진 업로드/삭제
- 공지/사업/갤러리 데이터 구조
- 기존 디자인과 메뉴 구조
- 기존 보안 헤더 및 CSP
