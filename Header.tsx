import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { ActiveTab } from '../types';
import { Logo } from './Logo';
import {
  Heart,
  Phone,
  MapPin,
  Menu,
  X,
  Settings,
  ChevronDown,
  Waves,
  Calendar,
  Award,
  Users,
  BookOpen,
  Building2,
  Sparkles,
  Newspaper,
  Image as ImageIcon,
  ExternalLink,
  PartyPopper
} from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, activeTab, setActiveTab, setAboutSubTab, setAdminOpen, hasNewDonation, pendingDonationsCount } = useFoundation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleNavClick = (tab: ActiveTab, elementId?: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (elementId) {
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutSubTabClick = (subTab: 'greeting' | 'purpose' | 'history' | 'organization') => {
    setAboutSubTab(subTab);
    setActiveTab('about');
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100/60">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>강원특별자치도 홍천군</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>문의: {settings.phone}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 font-medium text-slate-400">
              <span>FAX: {settings.fax}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] bg-slate-800 text-orange-300 px-2 py-0.5 rounded font-medium">
              2009년부터 시작된 홍천의 나눔
            </span>
            <button
              onClick={() => setAdminOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-slate-800 relative"
              title="관리자 화면 열기"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">관리자</span>
              {hasNewDonation && (
                <span className="relative flex h-2 w-2 ml-0.5 shrink-0" title={`신규 후원신청 ${pendingDonationsCount}건`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Navigation Bar (Single Row as in image_3) */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3 lg:gap-6">
          {/* Foundation Text Logo */}
          <button
            onClick={() => handleNavClick('main')}
            className="flex items-center shrink-0 max-w-[70%] sm:max-w-none group text-left transition-transform hover:scale-[1.01]"
            title="사단법인 너브내행복나눔재단 메인으로 이동"
          >
            <Logo variant="dark" />
          </button>

          {/* Desktop Navigation Links (In the same row as logo) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-base xl:text-lg font-extrabold text-slate-800 shrink-0">
            {/* 재단소개 */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('about')} onMouseLeave={() => setActiveDropdown(null)}>
              <button
                onClick={() => handleNavClick('about')}
                className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'about' ? 'text-orange-700 bg-orange-100/90 font-black' : 'hover:text-orange-700 hover:bg-amber-100/60'
                }`}
              >
                <span>재단소개</span>
                <ChevronDown className="w-4 xl:w-5 h-4 xl:h-5 text-slate-500 group-hover:rotate-180 transition-transform" />
              </button>
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button onClick={() => handleAboutSubTabClick('greeting')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <Users className="w-5 h-5 text-orange-500 shrink-0" /> 이사장 인사말
                  </button>
                  <button onClick={() => handleAboutSubTabClick('purpose')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <BookOpen className="w-5 h-5 text-orange-500 shrink-0" /> 설립목적 및 정체성
                  </button>
                  <button onClick={() => handleAboutSubTabClick('history')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <Calendar className="w-5 h-5 text-orange-500 shrink-0" /> 재단 연혁 (2026~2009)
                  </button>
                  <button onClick={() => handleAboutSubTabClick('organization')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <Building2 className="w-5 h-5 text-orange-500 shrink-0" /> 조직도 및 위탁기관
                  </button>
                  <button onClick={() => handleNavClick('contact')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 border-t border-slate-100 mt-1 pt-3 transition-colors">
                    <MapPin className="w-5 h-5 text-orange-500 shrink-0" /> 오시는 길 (지도)
                  </button>
                </div>
              )}
            </div>

            {/* 주요사업 */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('programs')} onMouseLeave={() => setActiveDropdown(null)}>
              <button
                onClick={() => handleNavClick('programs')}
                className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'programs' ? 'text-orange-700 bg-orange-100/90 font-black' : 'hover:text-orange-700 hover:bg-amber-100/60'
                }`}
              >
                <span>주요사업</span>
                <ChevronDown className="w-4 xl:w-5 h-4 xl:h-5 text-slate-500 group-hover:rotate-180 transition-transform" />
              </button>
              {activeDropdown === 'programs' && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button onClick={() => handleNavClick('programs', 'prog-01')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    01. 장학·교육지원
                  </button>
                  <button onClick={() => handleNavClick('programs', 'prog-02')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    02. 취약계층 긴급지원
                  </button>
                  <button onClick={() => handleNavClick('programs', 'prog-03')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    03. 주거환경 개선
                  </button>
                  <button onClick={() => handleNavClick('programs', 'prog-04')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    04. 다문화·가족지원
                  </button>
                  <button onClick={() => handleNavClick('programs', 'prog-05')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition-colors">
                    <span>05. 복지시설 배분사업</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">너브내배분</span>
                  </button>
                  <button onClick={() => handleNavClick('programs', 'prog-06')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition-colors">
                    <span>06. 다문화가족 한마음 축제</span>
                    <PartyPopper className="w-4 h-4 text-pink-500" />
                  </button>
                </div>
              )}
            </div>

            {/* 활동소식 */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('news')} onMouseLeave={() => setActiveDropdown(null)}>
              <button
                onClick={() => handleNavClick('news')}
                className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'news' || activeTab === 'gallery' || activeTab === 'press' ? 'text-orange-700 bg-orange-100/90 font-black' : 'hover:text-orange-700 hover:bg-amber-100/60'
                }`}
              >
                <span>활동소식</span>
                <ChevronDown className="w-4 xl:w-5 h-4 xl:h-5 text-slate-500 group-hover:rotate-180 transition-transform" />
              </button>
              {activeDropdown === 'news' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button onClick={() => handleNavClick('news')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <Newspaper className="w-5 h-5 text-orange-500 shrink-0" /> 공지사항 & 뉴스
                  </button>
                  <button onClick={() => handleNavClick('gallery')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" /> 활동 갤러리
                  </button>
                  <button onClick={() => handleNavClick('press')} className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors">
                    <ExternalLink className="w-5 h-5 text-sky-500 shrink-0" /> 보도자료
                  </button>
                </div>
              )}
            </div>

            {/* 후원·참여 */}
            <button
              onClick={() => handleNavClick('donate')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 ${
                activeTab === 'donate' ? 'text-orange-700 bg-orange-100/90 font-black' : 'hover:text-orange-700 hover:bg-amber-100/60'
              }`}
            >
              <span>후원·참여</span>
              {hasNewDonation && (
                <span className="relative flex h-2.5 w-2.5 shrink-0" title={`신규 후원신청 ${pendingDonationsCount}건`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
              )}
            </button>

            {/* 홍천군가족센터 */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('family')} onMouseLeave={() => setActiveDropdown(null)}>
              <button
                onClick={() => handleNavClick('family-center')}
                className={`px-3 xl:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 xl:gap-2 shadow-2xs ${
                  activeTab === 'family-center'
                    ? 'text-emerald-900 bg-emerald-200/90 font-black border border-emerald-400'
                    : 'text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 border border-emerald-300/80'
                }`}
              >
                <Building2 className="w-4 xl:w-5 h-4 xl:h-5 text-emerald-700" />
                <span>홍천군가족센터</span>
                <ChevronDown className="w-3.5 xl:w-4 h-3.5 xl:h-4 text-emerald-700 group-hover:rotate-180 transition-transform" />
              </button>

              {activeDropdown === 'family' && (
                <div className="absolute top-full right-0 w-72 bg-white rounded-2xl shadow-2xl border border-emerald-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleNavClick('family-center')}
                    className="w-full text-left px-5 py-3 text-base sm:text-lg font-extrabold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Building2 className="w-5 h-5 text-emerald-600 shrink-0" /> 홍천군가족센터 안내
                  </button>
                  <a
                    href="https://hongcheon.familynet.or.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-5 py-3 text-base sm:text-lg font-black text-emerald-700 hover:bg-emerald-100/80 flex items-center justify-between border-t border-slate-100 mt-1 pt-3 transition-colors"
                  >
                    <span>공식 홈페이지 바로가기</span>
                    <ExternalLink className="w-5 h-5 text-emerald-600 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Quick Donate CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleNavClick('donate', 'donate-form')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
            >
              <Heart className="w-4.5 h-4.5 fill-white animate-pulse" />
              <span>후원하기</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-6 py-4 shadow-xl space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('main')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'main' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>메인 홈</span>
              <Waves className="w-5 h-5 text-orange-400" />
            </button>

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                  activeTab === 'about' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>재단소개</span>
                <Users className="w-5 h-5 text-orange-400" />
              </button>

              <div className="pl-4 border-l-2 border-orange-200 space-y-1.5 my-1.5">
                <button
                  onClick={() => handleAboutSubTabClick('greeting')}
                  className="w-full text-left py-2 px-2.5 rounded text-base font-bold text-slate-800 hover:text-orange-600"
                >
                  • 이사장 인사말
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('purpose')}
                  className="w-full text-left py-2 px-2.5 rounded text-base font-bold text-slate-800 hover:text-orange-600"
                >
                  • 설립목적 및 정체성
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('history')}
                  className="w-full text-left py-2 px-2.5 rounded text-base font-bold text-slate-800 hover:text-orange-600"
                >
                  • 재단 연혁 (2026~2009)
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('organization')}
                  className="w-full text-left py-2 px-2.5 rounded text-base font-bold text-slate-800 hover:text-orange-600"
                >
                  • 조직도 및 위탁기관
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('programs')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'programs' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>주요사업</span>
              <BookOpen className="w-5 h-5 text-orange-400" />
            </button>

            <button
              onClick={() => handleNavClick('news')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'news' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>활동소식 (공지&뉴스)</span>
              <Newspaper className="w-5 h-5 text-orange-400" />
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'gallery' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>활동 갤러리</span>
              <ImageIcon className="w-5 h-5 text-emerald-500" />
            </button>

            <button
              onClick={() => handleNavClick('press')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'press' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>보도자료</span>
              <ExternalLink className="w-5 h-5 text-sky-500" />
            </button>

            <button
              onClick={() => handleNavClick('donate')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'donate' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>후원·참여</span>
                {hasNewDonation && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0" title={`신규 후원신청 ${pendingDonationsCount}건`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                  </span>
                )}
              </span>
              <Heart className="w-5 h-5 text-orange-500" />
            </button>

            <button
              onClick={() => handleNavClick('family-center')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-lg font-extrabold flex items-center justify-between ${
                activeTab === 'family-center' ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-900 bg-emerald-50/50'
              }`}
            >
              <span>홍천군가족센터 (위탁)</span>
              <Building2 className="w-5 h-5 text-emerald-600" />
            </button>

            <a
              href="https://hongcheon.familynet.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left py-2.5 px-3 rounded-lg text-base font-extrabold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-100 flex items-center justify-between ml-2"
            >
              <span>└ 가족센터 공식 홈페이지 ↗</span>
              <ExternalLink className="w-4 h-4 text-emerald-700" />
            </a>

            <button
              onClick={() => handleNavClick('contact')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'contact' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>오시는 길 & 문의하기</span>
              <MapPin className="w-4 h-4 text-orange-400" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">관리자 전용 설정</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAdminOpen(true);
              }}
              className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> 관리자 모드
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
