import React, { useState, useEffect } from 'react';
import { Phone, Award, CreditCard, Sparkles, Search, ChevronRight, CheckCircle2, Users, Laptop, Bot } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';
import { subscribePopularCoursesFromFirestore } from '../lib/firestoreService';

export interface PopularCourseItem {
  id: string;
  badge: string;
  badgeColor?: string;
  timeSlot: string;
  startDate?: string;
  createdAt?: string;
  title: string;
  description: string;
}

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  onOpenAiModal: () => void;
  onSelectCategory: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenAiModal,
  onSelectCategory,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [popularCourses, setPopularCourses] = useState<PopularCourseItem[]>([
    {
      id: 'pop-1',
      badge: '모집중 · 국비지원',
      badgeColor: 'blue',
      timeSlot: '09:30 - 12:30',
      startDate: '2026-09-01 개강',
      createdAt: '2026-08-01',
      title: '컴퓨터활용능력 1급/2급 (실기)',
      description: '자부담금 0원~최대 100% 정부지원',
    },
    {
      id: 'pop-2',
      badge: '모집중 · 인기',
      badgeColor: 'emerald',
      timeSlot: '14:00 - 17:00',
      startDate: '2026-09-01 개강',
      createdAt: '2026-08-01',
      title: '전산세무회계 & KcLep 실무',
      description: '회계원리부터 세무 신고 실무 원스톱',
    },
    {
      id: 'pop-3',
      badge: '추천 · 오전반',
      badgeColor: 'amber',
      timeSlot: '10:00 - 12:00',
      startDate: '수시 개강',
      createdAt: '2026-08-01',
      title: '어르신 스마트폰 & 타자·컴퓨터 기초',
      description: '친절한 1:1 눈높이 특별지도',
    },
  ]);

  useEffect(() => {
    const unsub = subscribePopularCoursesFromFirestore((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPopularCourses(data as PopularCourseItem[]);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('courses');
  };

  const quickCategories = [
    { label: '국비지원(내일배움)', value: '국비지원', icon: CreditCard, color: 'bg-emerald-500 text-white' },
    { label: '컴활/자격증', value: '자격증', icon: Award, color: 'bg-blue-600 text-white' },
    { label: '시니어/컴퓨터기초', value: '실무·기초', icon: Laptop, color: 'bg-amber-500 text-white' },
    { label: '코딩 & AI', value: '코딩·AI', icon: Sparkles, color: 'bg-purple-600 text-white' },
  ];

  return (
    <section id="hero" className="relative py-12 lg:py-20 overflow-hidden">
      {/* Decorative ambient glass light flares */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badge */}
            <div className="inline-block px-4 py-1.5 bg-blue-100/80 backdrop-blur-sm text-blue-700 rounded-full text-xs sm:text-sm font-extrabold tracking-wide uppercase border border-blue-200/60 shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse mr-2"></span>
              Professional IT Education · SINCE 1999
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              홍천의 미래,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500">
                기술로 디자인하다
              </span>
            </h1>

            {/* Paragraph Description */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              <strong>홍천 중앙정보처리학원</strong>은 27년 전통의 노하우로 초보자부터 취업준비생, 직장인, 어르신까지 
              1인 1대 최신 PC 환경에서 1:1 맞춤형으로 친절하게 교육합니다.
            </p>

            {/* Feature Checkpoints in Glass Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/60 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">국민내일배움</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/60 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">컴활·전산세무</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/60 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">시니어 1:1</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/60 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">파이썬 & AI</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('inquiry')}
                id="hero-inquiry-btn"
                className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                <span>상담 신청하기</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <a
                href={`tel:${ACADEMY_INFO.phoneClean}`}
                className="px-5 py-3.5 rounded-full bg-white/70 hover:bg-white backdrop-blur-md border border-white/80 text-slate-800 font-bold text-base shadow-sm transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{ACADEMY_INFO.phone}</span>
              </a>

              <button
                onClick={onOpenAiModal}
                className="px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4 text-emerald-100" />
                <span>AI 맞춤 과정 추천</span>
              </button>
            </div>

            {/* Quick Category Buttons */}
            <div className="pt-4 border-t border-slate-200/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                빠른 과정 바로가기
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {quickCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        onSelectCategory(cat.value);
                        onNavigate('courses');
                      }}
                      className="p-3.5 rounded-2xl bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 text-left transition-all hover:scale-[1.02] shadow-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl ${cat.color} shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                          {cat.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Card: Quick Consultation Box / Highlights in Frosted Glass */}
          <div className="lg:col-span-5">
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl select-none">
                🗓️
              </div>
              
              <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow mb-3">
                실시간 인기 수강 강좌
              </div>

              <h2 className="text-xl font-extrabold text-slate-800 mb-1">
                2026년 하반기 모집 일정
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                국비지원 혜택 및 인기 자격증 과정을 빠르게 상담받으세요.
              </p>

              <div className="space-y-3 mb-6">
                {popularCourses.map((item, index) => {
                  const badgeColor = item.badgeColor || 'blue';
                  const colorClasses = badgeColor === 'emerald'
                    ? { border: 'border-emerald-100', text: 'text-emerald-600' }
                    : badgeColor === 'amber'
                    ? { border: 'border-amber-100', text: 'text-amber-600' }
                    : badgeColor === 'purple'
                    ? { border: 'border-purple-100', text: 'text-purple-600' }
                    : { border: 'border-blue-100', text: 'text-blue-600' };

                  return (
                    <div key={item.id || index} className={`p-4 bg-white/80 rounded-2xl border ${colorClasses.border} shadow-sm transition-all hover:scale-[1.01]`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${colorClasses.text}`}>{item.badge}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          {item.startDate && (
                            <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              개강: {item.startDate}
                            </span>
                          )}
                          <span>{item.timeSlot}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                        {item.description ? (
                          <p>{item.description}</p>
                        ) : (
                          <span />
                        )}
                        {item.createdAt && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            등록일: {item.createdAt}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Inquiry Direct Buttons inside Hero card */}
              <div className="space-y-2.5">
                <button
                  onClick={() => onNavigate('inquiry')}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>1분 간편 수강 문의하기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>📍 홍천읍 신장대로 48, 2층</span>
                  <span>☎ 033-433-1926</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
