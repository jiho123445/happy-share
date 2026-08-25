import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Course } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HomeHub } from './components/HomeHub';
import { PageHeader } from './components/PageHeader';
import { CourseExplorer } from './components/CourseExplorer';
import { CourseDetailModal } from './components/CourseDetailModal';
import { NationalSupportGuide } from './components/NationalSupportGuide';
import { AcademyIntro } from './components/AcademyIntro';
import { NoticeBoard } from './components/NoticeBoard';
import { FaqSection } from './components/FaqSection';
import { InquirySection } from './components/InquirySection';
import { NoticePopupModal, PopupNoticeConfig } from './components/NoticePopupModal';
import { LocationSection } from './components/LocationSection';
import { MaterialsSection } from './components/MaterialsSection';
import { StudentAuthGate } from './components/StudentAuthGate';
import { Footer } from './components/Footer';
import { AiConsultantModal } from './components/AiConsultantModal';
import { MobileQuickBar } from './components/MobileQuickBar';
import { ChevronRight, CreditCard, FileText, MapPin, Award, Megaphone } from 'lucide-react';
import {
  subscribeApplicationsFromFirestore,
  subscribeOpeningPopupFromFirestore,
  DEFAULT_OPENING_POPUP,
} from './lib/firestoreService';
import { onAdminAuthStateChanged } from './lib/adminAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { trackPageView } from './lib/analytics';

// InquiryAdminModal은 엑셀 내보내기 라이브러리(exceljs)를 포함해 코드량이 커서
// (수강생 등 일반 방문자는 절대 열지 않는 화면인데도) 즉시 로드하면 모든 방문자가
// 이 무거운 코드를 다운로드하게 됩니다. React.lazy로 분리해, 원장님이 실제로
// "관리자 모드" 버튼을 눌렀을 때만 해당 코드가 내려받아지도록 했습니다.
const InquiryAdminModal = lazy(() =>
  import('./components/InquiryAdminModal').then((mod) => ({ default: mod.InquiryAdminModal }))
);

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [preselectedCourseForInquiry, setPreselectedCourseForInquiry] = useState<string>('');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  // 관리자 모달을 한 번이라도 열었는지 - lazy 컴포넌트를 처음 열 때만 마운트하고
  // 이후로는 계속 마운트된 상태로 두어(isOpen=false로 숨기기만) 다시 열 때
  // 매번 다시 로드/리렌더링되지 않게 합니다.
  const [hasOpenedAdminModal, setHasOpenedAdminModal] = useState<boolean>(false);

  // Opening Notice Popup State
  const [noticeConfig, setNoticeConfig] = useState<PopupNoticeConfig | null>(DEFAULT_OPENING_POPUP);
  const [isNoticePopupOpen, setIsNoticePopupOpen] = useState<boolean>(false);

  // Pending Inquiries Count State for Admin Red Indicator
  const [pendingInquiryCount, setPendingInquiryCount] = useState<number>(0);

  // 관리자 로그인 여부 추적 (Firebase Auth 세션이 남아있으면 새로고침해도 유지됨)
  // 수강생도 같은 Firebase Auth를 공유하므로, 단순 로그인 여부가 아니라
  // admins 컬렉션에 실제로 등록된 계정인지까지 확인합니다.
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubAuth = onAdminAuthStateChanged(async (user) => {
      if (!user) {
        setIsAdminAuthenticated(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdminAuthenticated(adminDoc.exists());
      } catch {
        setIsAdminAuthenticated(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore Subscription for Applications Pending Count
  // applications 컬렉션은 Firestore 규칙상 관리자만 읽을 수 있으므로,
  // 일반 방문자에게는 이 구독을 아예 시도하지 않습니다. (예전에는 모든 방문자가
  // 접근할 때마다 조회를 시도해 매번 권한 오류가 발생했었습니다.)
  useEffect(() => {
    if (!isAdminAuthenticated) {
      setPendingInquiryCount(0);
      return;
    }
    const unsubscribe = subscribeApplicationsFromFirestore((records) => {
      const pending = records.filter((r) => r.status === '상담대기' || !r.status).length;
      setPendingInquiryCount(pending);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated]);

  // Real-time Firestore Subscription for Opening Popup (`settings/opening_popup`)
  useEffect(() => {
    const unsubscribe = subscribeOpeningPopupFromFirestore((cfg) => {
      setNoticeConfig(cfg);

      let hiddenDate = null;
      try {
        hiddenDate = localStorage.getItem('hide_notice_popup_until');
      } catch (e) {
        console.warn('localStorage not accessible:', e);
      }

      const todayStr = new Date().toISOString().slice(0, 10);

      // "오늘 하루 동안 보지 않기"를 누른 경우, 카카오톡/외부 유입 등
      // 어떤 경로로 들어와도 오늘 하루는 절대 다시 뜨지 않아야 합니다.
      // (예전에는 카카오톡 인앱 브라우저나 '#notices' 공지 페이지로 들어오면
      // hiddenDate와 무관하게 무조건 다시 열려서, 하루 안 보기를 눌러도
      // 팝업이 계속 다시 떴습니다.)
      const hiddenToday = hiddenDate === todayStr;
      if (cfg.enabled && !hiddenToday) {
        setIsNoticePopupOpen(true);
      }
    });

    const handleNoticeUpdated = () => {
      try {
        localStorage.removeItem('hide_notice_popup_until');
      } catch (e) {
        console.warn('localStorage clear failed:', e);
      }
      setIsNoticePopupOpen(true);
    };

    window.addEventListener('notice_popup_updated', handleNoticeUpdated);
    return () => {
      unsubscribe();
      window.removeEventListener('notice_popup_updated', handleNoticeUpdated);
    };
  }, []);

  const handleHideToday = () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem('hide_notice_popup_until', todayStr);
    } catch (e) {
      console.warn('localStorage setItem failed:', e);
    }
    setIsNoticePopupOpen(false);
  };

  // Sync state with URL path for true multi-page navigation experience (해시 없는 실제 경로)
  // 예전에는 window.location.hash를 썼는데, 구글/네이버 검색 노출과 SEO에는
  // #이 붙지 않는 경로 기반 URL(/courses, /notices 등)이 훨씬 유리합니다.
  // 재단 홈페이지(nbnhappy.or.kr)와 동일한 방식: 게시물 하나하나(/notices/:id)까지
  // 실제 URL을 갖도록 확장하고, 예전 #해시 링크도 자동으로 새 경로로 옮겨줍니다.
  const VALID_SECTIONS = ['courses', 'national-support', 'intro', 'notices', 'inquiry', 'location', 'materials', 'home'];

  const buildPath = (section: string, noticeId?: string | null): string => {
    const normalized = section === 'hero' ? 'home' : section;
    if (normalized === 'notices' && noticeId) {
      return `/notices/${encodeURIComponent(noticeId)}`;
    }
    return normalized === 'home' ? '/' : `/${normalized}`;
  };

  const parsePathToState = (pathname: string): { section: string; noticeId: string | null } => {
    const raw = pathname.replace(/^\/+/, '').replace(/\/+$/, '').trim();
    if (!raw) return { section: 'home', noticeId: null };

    const noticeMatch = raw.match(/^notices\/([^/]+)$/);
    if (noticeMatch) {
      return { section: 'notices', noticeId: decodeURIComponent(noticeMatch[1]) };
    }

    return { section: VALID_SECTIONS.includes(raw) ? raw : 'home', noticeId: null };
  };

  // 예전에 카카오톡/문자/검색엔진에 이미 공유·색인된 #courses, #notices 같은
  // 구식 해시 링크가 있으면, 페이지가 처음 열릴 때 자동으로 새 경로(/courses,
  // /notices)로 바꿔줍니다(replaceState라 뒤로가기 히스토리를 늘리지 않음).
  // 이렇게 하지 않으면 예전 링크를 통해 들어온 방문자는 전부 그냥 홈으로
  // 떨어지게 됩니다. 마운트 시 한 번만 실행됩니다.
  const legacyHashMigratedRef = React.useRef(false);
  if (!legacyHashMigratedRef.current && typeof window !== 'undefined' && window.location.hash) {
    legacyHashMigratedRef.current = true;
    const legacyRaw = window.location.hash.replace(/^#/, '').trim();
    const legacySection = legacyRaw === 'hero' ? 'home' : legacyRaw;
    const migratedPath = VALID_SECTIONS.includes(legacySection) ? buildPath(legacySection) : null;
    if (migratedPath) {
      window.history.replaceState(null, '', migratedPath);
    } else {
      // 알 수 없는 해시는 그냥 지워서 주소창에 남지 않게 합니다.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  useEffect(() => {
    const parsePath = () => {
      const { section, noticeId } = parsePathToState(window.location.pathname);
      setActiveSection(section);
      setSelectedNoticeId(noticeId);
    };

    parsePath();
    // 뒤로가기/앞으로가기(브라우저 히스토리 이동) 시에도 동일하게 반영
    window.addEventListener('popstate', parsePath);
    return () => window.removeEventListener('popstate', parsePath);
  }, []);

  const handleNavigate = (pageId: string) => {
    const targetPage = pageId === 'hero' ? 'home' : pageId;
    setActiveSection(targetPage);
    setSelectedNoticeId(null);
    const targetPath = buildPath(targetPage);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(targetPage);

    // Open opening notice popup modal when Home button/logo is clicked
    if (pageId === 'home' || pageId === 'hero') {
      setIsNoticePopupOpen(true);
    }
  };

  // 공지사항 하나를 열람할 때 실제 URL(/notices/:id)을 부여합니다.
  // 이렇게 해야 카카오톡/문자로 공유하거나 구글·네이버 검색 결과에
  // 개별 공지가 노출될 수 있습니다(예전에는 팝업일 뿐 URL이 안 바뀌어서
  // 항상 /notices 목록 주소만 공유/색인됐습니다).
  const handleViewNotice = (noticeId: string) => {
    setActiveSection('notices');
    setSelectedNoticeId(noticeId);
    const targetPath = buildPath('notices', noticeId);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleCloseNoticeDetail = () => {
    setSelectedNoticeId(null);
    const targetPath = buildPath('notices');
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleSelectCourseForInquiry = (courseTitle: string) => {
    setPreselectedCourseForInquiry(courseTitle);
    handleNavigate('inquiry');
  };

  const handleOpenAdminModal = () => {
    setHasOpenedAdminModal(true);
    setIsAdminModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-16 lg:pb-0">
      
      {/* Top Header Navigation */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAdminModal={handleOpenAdminModal}
        pendingInquiryCount={pendingInquiryCount}
      />

      {/* Main Multi-Page Content Router */}
      <main className="min-h-[70vh]">
        
        {/* 1. HOME PAGE */}
        {(activeSection === 'home' || activeSection === 'hero') && (
          <div className="animate-fadeIn">
            <HeroSection
              onNavigate={handleNavigate}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
            <HomeHub
              onNavigate={handleNavigate}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onSelectCourseForInquiry={handleSelectCourseForInquiry}
            />
          </div>
        )}

        {/* 2. COURSES PAGE */}
        {activeSection === 'courses' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="전체 교육과정"
              subtitle="컴퓨터활용능력, 전산세무회계, 시니어/어르신 기초, 파이썬&AI 등 1:1 맞춤형 실습"
              categoryName="교육과정"
              onNavigateHome={() => handleNavigate('home')}
            />
            <CourseExplorer
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenDetailModal={(course) => setSelectedCourseForModal(course)}
              onSelectCourseForInquiry={handleSelectCourseForInquiry}
            />
            {/* Page Bottom Navigation Shortcut */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">국민내일배움카드 국비지원 혜택이 궁금하신가요?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">지원 대상, 신청 자격 및 최대 100% 수강료 지원 절차를 확인해 보세요.</p>
                </div>
                <button
                  onClick={() => handleNavigate('national-support')}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>국비지원 혜택 안내 바로가기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. NATIONAL SUPPORT PAGE */}
        {activeSection === 'national-support' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="국민내일배움카드 국비지원 안내"
              subtitle="고용노동부 지원 혜택, 신청 자격 요건, 발급 절차 및 HRD-Net 가이드"
              categoryName="국비지원"
              onNavigateHome={() => handleNavigate('home')}
            />
            <NationalSupportGuide
              onNavigateToInquiry={() => handleNavigate('inquiry')}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">국비 지원 개설 과목 목록 보기</h4>
                  <p className="text-xs text-slate-600 mt-0.5">국민내일배움카드로 수강 가능한 전체 강좌 및 시간표를 확인하세요.</p>
                </div>
                <button
                  onClick={() => handleNavigate('courses')}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>국비지원 교육과정 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. INTRO PAGE */}
        {activeSection === 'intro' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="학원 소개 & 원장 인사말"
              subtitle="1999년 설립 이래 홍천 지역 사회와 함께해온 IT·컴퓨터 전문 교육기관"
              categoryName="학원소개"
              onNavigateHome={() => handleNavigate('home')}
            />
            <AcademyIntro />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">직접 방문하시거나 전화 문의를 환영합니다</h4>
                  <p className="text-xs text-slate-600 mt-0.5">홍천여자고등학교 인근 중앙약국 맞은편, 터미널 도보 5분 거리에 위치하고 있습니다.</p>
                </div>
                <button
                  onClick={() => handleNavigate('location')}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4" />
                  <span>오시는 길 약도 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. NOTICES & FAQ PAGE */}
        {activeSection === 'notices' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="공지사항 & 자격증 시험일정"
              subtitle="2026년 모집 일정, 검정 시험 일정 안내 및 자주 묻는 질문(FAQ)"
              categoryName="공지 및 FAQ"
              onNavigateHome={() => handleNavigate('home')}
            />
            <NoticeBoard
              selectedNoticeId={selectedNoticeId}
              onOpenNotice={handleViewNotice}
              onCloseDetail={handleCloseNoticeDetail}
            />
            <div className="pt-8">
              <FaqSection />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">궁금한 점이 해결되지 않으셨나요?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">전화 또는 온라인 상담을 통해 1:1로 빠르게 궁금증을 풀어드립니다.</p>
                </div>
                <button
                  onClick={() => handleNavigate('inquiry')}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>1:1 수강 상담 문의하기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. INQUIRY PAGE */}
        {activeSection === 'inquiry' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="온라인 수강 문의"
              subtitle="1분 간편 문의 작성 또는 전화 상담 신청을 받아보세요"
              categoryName="상담신청"
              onNavigateHome={() => handleNavigate('home')}
            />
            <InquirySection
              preselectedCourse={preselectedCourseForInquiry}
              onOpenAdminModal={handleOpenAdminModal}
              pendingInquiryCount={pendingInquiryCount}
            />
          </div>
        )}

        {/* 8. LOCATION PAGE */}
        {activeSection === 'location' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="오시는 길 & 위치 안내"
              subtitle="강원도 홍천군 홍천읍 신장대로 48, 2층 (홍천여고 인근 중앙약국 맞은편)"
              categoryName="위치안내"
              onNavigateHome={() => handleNavigate('home')}
            />
            <LocationSection />
          </div>
        )}

        {/* 9. MATERIALS (자료실) PAGE */}
        {activeSection === 'materials' && (
          <div className="animate-fadeIn">
            <PageHeader
              title="자료실"
              subtitle="서식, 과정별 예제 파일, 채점프로그램을 다운로드하실 수 있습니다"
              categoryName="자료실"
              onNavigateHome={() => handleNavigate('home')}
            />
            <StudentAuthGate>
              <MaterialsSection />
            </StudentAuthGate>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        onApply={(courseTitle) => {
          handleSelectCourseForInquiry(courseTitle);
          setSelectedCourseForModal(null);
        }}
      />

      {/* AI Consultant Modal */}
      <AiConsultantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onNavigateToInquiry={() => handleNavigate('inquiry')}
      />

      {/* Opening Notice Popup Modal */}
      <NoticePopupModal
        noticeConfig={noticeConfig}
        isOpen={isNoticePopupOpen}
        onClose={() => setIsNoticePopupOpen(false)}
        onActionClick={() => {
          setIsNoticePopupOpen(false);
          handleNavigate('inquiry');
        }}
        onHideToday={handleHideToday}
      />

      {/* Admin Inquiry Data Management & Notice Modal */}
      {/* hasOpenedAdminModal이 true가 되기 전까지는 이 코드 자체를 마운트하지 않아
          lazy chunk를 내려받지 않습니다. 한 번 열린 뒤에는 계속 마운트해 두고
          isOpen prop으로만 표시/숨김을 제어합니다(재오픈 시 재로딩 방지). */}
      {hasOpenedAdminModal && (
        <Suspense fallback={null}>
          <InquiryAdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onNoticeUpdated={() => {
              setIsNoticePopupOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Floating Notice Popup Button */}
      {!isNoticePopupOpen && noticeConfig && noticeConfig.enabled && (
        <button
          type="button"
          onClick={() => setIsNoticePopupOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 z-40 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-full shadow-2xl border-2 border-white flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          title="개강 공지 팝업 다시보기"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
          </span>
          <Megaphone className="w-4 h-4 text-slate-950 fill-slate-950" />
          <span>{noticeConfig.buttonLabel || noticeConfig.badgeText}</span>
        </button>
      )}

      {/* Mobile Fixed Quick Action Bar */}
      <MobileQuickBar
        onNavigate={handleNavigate}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

    </div>
  );
}
