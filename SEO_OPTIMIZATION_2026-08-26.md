# 너브내행복나눔재단 SEO 최적화 적용 내역

기존 홈페이지의 화면 구성, Firebase 구조, 관리자 기능, 데이터 구조를 변경하지 않고 검색엔진 최적화 요소만 보강했습니다.

## 적용 내용

1. 홈페이지 기본 SEO
- `<title>`을 `홍천 봉사단체 | 사단법인 너브내행복나눔재단`으로 개선
- 홍천 봉사·나눔·취약계층 지원을 포함한 메타 설명 강화
- 검색엔진 robots 지시 및 대형 이미지 미리보기 허용 설정
- canonical / hreflang(ko-KR) 설정
- Open Graph site_name / locale 보강

2. 구조화 데이터
- Schema.org `NGO` 조직 정보 추가
- `WebSite` 구조화 데이터 추가
- 홍천군 지역 서비스와 2009년 설립 정보를 구조화
- 홈페이지가 `홍천 봉사단체`라는 검색 의도와 연결되도록 자연스럽게 설명

3. SPA 페이지별 SEO
- 메뉴를 이동할 때 브라우저 제목과 description이 실제 페이지에 맞게 변경
- 재단소개 / 주요사업 / 공지사항 / 활동갤러리 / 보도자료 / 가족센터 / 후원 / 문의 페이지별 SEO 문구 적용
- 공지·사업·갤러리 상세 페이지는 선택된 콘텐츠 제목과 설명을 사용
- 각 경로에 맞는 canonical 및 WebPage/Article JSON-LD 동적 적용

4. 본문 검색 신호
- 기존 메인 H1의 의미는 유지하면서 `홍천의 나눔과 봉사`라는 핵심 표현을 자연스럽게 반영
- 기존 활동 이미지 ALT와 봉사 관련 본문은 그대로 유지

5. robots / sitemap
- Googlebot, Yeti(Naver), bingbot의 정상 크롤링 허용을 명시
- 기존 동적 sitemap.xml 유지
- sitemap에는 메인/주요 메뉴 및 Firestore에 등록된 공지·사업·갤러리 상세 URL이 포함됨

## 변경하지 않은 것

- 홈페이지의 화면 레이아웃과 메뉴 구조
- Firebase Authentication / Firestore / Storage
- 관리자 기능
- 사진 업로드·삭제 기능
- Vercel 배포 구조
- 기존 데이터 구조
- 기존 보안 규칙

## 확인 사항

현재 작업 환경에서는 원본 프로젝트의 모든 npm 의존성을 완전히 설치하지 못해 `npm run lint`와 `npm run build`의 최종 성공 여부까지 실행 검증하지 못했습니다. 따라서 배포 전 GitHub/Vercel 환경에서 기존 CI와 함께 빌드 검증을 권장합니다.

SEO는 적용 즉시 검색순위가 바뀌는 기능이 아닙니다. Google/Naver가 새 메타정보와 페이지를 다시 크롤링하고 색인한 뒤 반영됩니다.
