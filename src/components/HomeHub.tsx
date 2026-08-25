import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CreditCard,
  Calculator,
  Award,
  Bell,
  FileText,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Phone,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { COURSES_DATA, ACADEMY_INFO } from '../data/coursesData';
import { Notice, Course } from '../types';
import {
  subscribeNoticesFromFirestore,
  subscribePopularCoursesFromFirestore,
  subscribeCoursesFromFirestore,
} from '../lib/firestoreService';
import { PopularCourseAdminItem } from './InquiryAdminModal';

interface HomeHubProps {
  onNavigate: (pageId: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectCourseForInquiry: (courseTitle: string) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectCourseForInquiry,
}) => {
  const [boardNotices, setBoardNotices] = useState<Notice[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourseAdminItem[]>([]);
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);

  useEffect(() => {
    const unsubNotices = subscribeNoticesFromFirestore((data) => setBoardNotices(data));
    const unsubPopular = subscribePopularCoursesFromFirestore((data) => setPopularCourses(data));
    const unsubCourses = subscribeCoursesFromFirestore((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    });
    return () => {
      unsubNotices();
      unsubPopular();
      unsubCourses();
    };
  }, []);

  const recentNotices = boardNotices.slice(0, 3);

  const mainPages = [
    {
      id: 'courses',
      title: '전체 교육과정',
      desc: '컴활 1/2급, 전산세무회계, 시니어, 파이썬 등',
      icon: BookOpen,
      badge: '12개 과정',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'national-support',
      title: '국민내일배움카드',
      desc: '국비지원 신청 자격, 발급 절차 및 지원금 혜택 안내',
      icon: CreditCard,
      badge: '최대 100% 지원',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'intro',
      title: '학원소개 & 원장인사',
      desc: '1999년 설립 27년 전통, 1:1 맞춤 지도 실습 환경',
      icon: Award,
      badge: 'SINCE 1999',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      id: 'notices',
      title: '공지사항 & 시험일정',
      desc: '2026년 자격증 개강일, 검정 시험 일정 및 합격 소식',
      icon: Bell,
      badge: '최신 업데이트',
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 'inquiry',
      title: '온라인 수강문의',
      desc: '1분 간편 수강 신청 및 원장님 1:1 진로 상담',
      icon: FileText,
      badge: '24시간 접수',
      color: 'from-cyan-600 to-blue-700',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* 1. Page Hub Menu Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-2 border border-blue-200/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            SELECT PAGE MENU
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            원하시는 메뉴/페이지를 선택해 보세요
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            각 탭별 독립된 페이지에서 세부 정보와 혜택을 확인하실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mainPages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className="group relative text-left bg-white/60 hover:bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${page.color} text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-full border border-slate-200">
                      {page.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>{page.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-blue-600" />
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    {page.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>해당 페이지 바로가기</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Featured Courses Section */}
      <div className="bg-white/40 backdrop-blur-md border-y border-white/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-700 font-extrabold text-xs mb-2 border border-emerald-200/60 shadow-sm">
                RECOMMENDED COURSES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                주요 대표 국비지원 & 자격증 과정
              </h2>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow"
            >
              <span>전체 교육과정 목록 보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(popularCourses.length > 0 ? popularCourses.slice(0, 3) : courses.slice(0, 3)).map((item: any) => {
              const isFirestorePop = Boolean(item.badge || item.timeSlot);
              const title = item.title || item.courseTitle;
              const badge = item.badge || item.category || '인기강좌';
              const timeOrDuration = item.timeSlot ? `시간: ${item.timeSlot}` : `수강 기간: ${item.duration}`;
              const desc = item.description || item.summary || '';

              return (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/90 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                        {badge}
                      </span>
                      {item.startDate && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                          {item.startDate}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span>{timeOrDuration}</span>
                      <span className="text-blue-600 font-bold">{item.selfPayEstimate || '국비지원 가능'}</span>
                    </div>
                    <button
                      onClick={() => onSelectCourseForInquiry(title)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      이 과정 문의하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. National Support & Tuition Calculator Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-full inline-block">
                국비지원 혜택 안내
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                국민내일배움카드로 <br className="hidden sm:inline" />
                <span className="text-emerald-400">최대 100% 수강료 지원</span> 받아보세요!
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                구직자, 재직자, 대학생, 자영업자 누구나 5년간 300만원~500만원 지원!
                자세한 지원 자격 및 수강 신청은 온라인 수강 문의를 이용해 주세요.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate('inquiry')}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-lg transition-all"
                >
                  온라인 수강문의 바로가기
                </button>
                <button
                  onClick={() => onNavigate('national-support')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-full border border-white/20 transition-all"
                >
                  내일배움카드 발급 안내 보기
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <p className="text-xs font-bold text-emerald-300 uppercase">학원 바로 문의</p>
              <p className="text-2xl font-black text-white">{ACADEMY_INFO.phone}</p>
              <p className="text-xs text-slate-300">
                평일 09:00~21:30 | 토요일 09:00~15:00 <br />
                강원도 홍천군 홍천읍 신장대로 48, 2층
              </p>
              <a
                href={`tel:${ACADEMY_INFO.phoneClean}`}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl text-center block transition-colors shadow"
              >
                전화 바로 걸기
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
