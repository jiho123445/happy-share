import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { ActiveTab } from '../types';
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
  Image as ImageIcon
} from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, activeTab, setActiveTab, setAboutSubTab, setAdminOpen } = useFoundation();
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
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>강원특별자치도 홍천군</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 border-l border-slate-700 pl-4">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>문의: {settings.phone} | FAX: {settings.fax}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-slate-800 text-orange-300 px-2 py-0.5 rounded font-medium">
              2009년부터 시작된 홍천의 나눔
            </span>
            <button
              onClick={() => setAdminOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-slate-800"
              title="관리자 화면 열기"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">관리자</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Foundation Logo & Title */}
        <button
          onClick={() => handleNavClick('main')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Waves className="w-6 h-6 text-orange-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                사단법인 너브내행복나눔재단
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Nerve-Nae Happiness Sharing Foundation · 홍천 복지 플랫폼
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700">
          {/* 재단소개 */}
          <div className="relative group" onMouseEnter={() => setActiveDropdown('about')} onMouseLeave={() => setActiveDropdown(null)}>
            <button
              onClick={() => handleNavClick('about')}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'about' ? 'text-orange-600 bg-orange-50 font-bold' : 'hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              재단소개
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            {activeDropdown === 'about' && (
              <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button onClick={() => handleAboutSubTabClick('greeting')} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-orange-500" /> 이사장 인사말
                </button>
                <button onClick={() => handleAboutSubTabClick('purpose')} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-orange-500" /> 설립목적 및 정체성
                </button>
                <button onClick={() => handleAboutSubTabClick('history')} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" /> 재단 연혁 (2009~)
                </button>
                <button onClick={() => handleAboutSubTabClick('organization')} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" /> 조직도 및 위탁기관
                </button>
                <button onClick={() => handleNavClick('contact')} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> 오시는 길 (지도)
                </button>
              </div>
            )}
          </div>

          {/* 주요사업 */}
          <div className="relative group" onMouseEnter={() => setActiveDropdown('programs')} onMouseLeave={() => setActiveDropdown(null)}>
            <button
              onClick={() => handleNavClick('programs')}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'programs' ? 'text-orange-600 bg-orange-50 font-bold' : 'hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              주요사업
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            {activeDropdown === 'programs' && (
              <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button onClick={() => handleNavClick('programs', 'prog-01')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                  01. 장학·교육지원
                </button>
                <button onClick={() => handleNavClick('programs', 'prog-02')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                  02. 취약계층 긴급지원
                </button>
                <button onClick={() => handleNavClick('programs', 'prog-03')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                  03. 주거환경 개선
                </button>
                <button onClick={() => handleNavClick('programs', 'prog-04')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                  04. 다문화·가족지원
                </button>
                <button onClick={() => handleNavClick('programs', 'prog-05')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between">
                  <span>05. 복지시설 배분사업</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">너브내배분</span>
                </button>
                <button onClick={() => handleNavClick('programs', 'prog-06')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between">
                  <span>06. AI·디지털 복지</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </button>
              </div>
            )}
          </div>

          {/* 활동소식 */}
          <div className="relative group" onMouseEnter={() => setActiveDropdown('news')} onMouseLeave={() => setActiveDropdown(null)}>
            <button
              onClick={() => handleNavClick('news')}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'news' || activeTab === 'gallery' ? 'text-orange-600 bg-orange-50 font-bold' : 'hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              활동소식
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            {activeDropdown === 'news' && (
              <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button onClick={() => handleNavClick('news')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5 text-orange-500" /> 공지사항 & 뉴스
                </button>
                <button onClick={() => handleNavClick('gallery')} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> 활동 갤러리
                </button>
              </div>
            )}
          </div>

          {/* 후원·참여 */}
          <button
            onClick={() => handleNavClick('donate')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'donate' ? 'text-orange-600 bg-orange-50 font-bold' : 'hover:text-orange-600 hover:bg-slate-50'
            }`}
          >
            후원·참여
          </button>

          {/* 홍천군가족센터 */}
          <button
            onClick={() => handleNavClick('family-center')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'family-center'
                ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200'
                : 'text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/80'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>홍천군가족센터</span>
          </button>
        </nav>

        {/* Quick Donate CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('donate', 'donate-form')}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
          >
            <Heart className="w-4 h-4 fill-white animate-pulse" />
            <span>후원하기</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-6 py-4 shadow-xl space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('main')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'main' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>메인 홈</span>
              <Waves className="w-4 h-4 text-orange-400" />
            </button>

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                  activeTab === 'about' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>재단소개</span>
                <Users className="w-4 h-4 text-orange-400" />
              </button>

              <div className="pl-4 border-l-2 border-orange-200 space-y-1 my-1">
                <button
                  onClick={() => handleAboutSubTabClick('greeting')}
                  className="w-full text-left py-1.5 px-2 rounded text-xs text-slate-700 hover:text-orange-600"
                >
                  • 이사장 인사말
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('purpose')}
                  className="w-full text-left py-1.5 px-2 rounded text-xs text-slate-700 hover:text-orange-600"
                >
                  • 설립목적 및 정체성
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('history')}
                  className="w-full text-left py-1.5 px-2 rounded text-xs text-slate-700 hover:text-orange-600"
                >
                  • 재단 연혁 (2009~)
                </button>
                <button
                  onClick={() => handleAboutSubTabClick('organization')}
                  className="w-full text-left py-1.5 px-2 rounded text-xs text-slate-700 hover:text-orange-600"
                >
                  • 조직도 및 위탁기관
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('programs')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'programs' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>주요사업 (6대 핵심사업)</span>
              <BookOpen className="w-4 h-4 text-orange-400" />
            </button>

            <button
              onClick={() => handleNavClick('news')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'news' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>공지사항 & 소식</span>
              <Newspaper className="w-4 h-4 text-orange-400" />
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'gallery' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>활동 갤러리</span>
              <ImageIcon className="w-4 h-4 text-emerald-500" />
            </button>

            <button
              onClick={() => handleNavClick('donate')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'donate' ? 'bg-orange-50 text-orange-600' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>후원·참여 안내</span>
              <Heart className="w-4 h-4 text-orange-500" />
            </button>

            <button
              onClick={() => handleNavClick('family-center')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                activeTab === 'family-center' ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-900 bg-emerald-50/50'
              }`}
            >
              <span>홍천군가족센터 (위탁 운영)</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </button>

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
