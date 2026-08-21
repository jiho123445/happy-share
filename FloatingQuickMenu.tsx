import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Newspaper, Heart, Building2, ArrowUp, PhoneCall, ChevronUp } from 'lucide-react';

export const FloatingQuickMenu: React.FC = () => {
  const { setActiveTab, settings } = useFoundation();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2.5 select-none">
      
      {/* Quick Action Buttons Group */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Quick Item 1: Donate */}
          <button
            onClick={() => {
              setActiveTab('donate');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
            title="후원 신청하기"
          >
            <Heart className="w-5 h-5 fill-white shrink-0" />
            <span className="hidden sm:inline text-xs font-extrabold tracking-tight">
              후원 참여
            </span>
          </button>

          {/* Quick Item 2: Family Center */}
          <button
            onClick={() => {
              setActiveTab('family-center');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105 border border-slate-700"
            title="홍천군가족센터"
          >
            <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-xs font-extrabold text-slate-100 tracking-tight">
              가족센터
            </span>
          </button>

          {/* Quick Item 3: News & Notice */}
          <button
            onClick={() => {
              setActiveTab('news');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 bg-white hover:bg-orange-50 text-slate-800 border border-slate-200 p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
            title="알림마당 공지사항"
          >
            <Newspaper className="w-5 h-5 text-orange-600 shrink-0" />
            <span className="hidden sm:inline text-xs font-bold text-slate-700 tracking-tight">
              알림마당
            </span>
          </button>

        </div>
      )}

      {/* Top Scroll Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          title="페이지 맨 위로 이동"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

    </div>
  );
};
