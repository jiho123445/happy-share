import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { COURSES_DATA } from '../data/coursesData';
import { subscribeCoursesFromFirestore } from '../lib/firestoreService';
import { Search, Award, Clock, Users, Calendar, CheckCircle2, ChevronRight, Info, Sparkles, Filter } from 'lucide-react';

interface CourseExplorerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenDetailModal: (course: Course) => void;
  onSelectCourseForInquiry: (courseTitle: string) => void;
}

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenDetailModal,
  onSelectCourseForInquiry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);

  useEffect(() => {
    const unsubscribe = subscribeCoursesFromFirestore((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = ['전체', '국비지원', '자격증', '실무·기초', '코딩·AI', '학생·특강'];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === '전체' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.certificationTags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="courses" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-3 border border-blue-200/60 shadow-sm">
            CURRICULUM & COURSES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            홍천 중앙정보처리학원 수강 강좌 안내
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            국비지원 국민내일배움카드 과정부터 자격증, 실무 엑셀, 시니어 맞춤 및 학생 코딩까지 다양하게 준비되어 있습니다.
          </p>
        </div>

        {/* Category Filter Tabs & Search Bar in Frosted Glass Panel */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/50 backdrop-blur-xl p-3.5 rounded-3xl border border-white/60 shadow-lg">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white/60 text-slate-700 hover:bg-white border border-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="강좌명, 자격증 검색 (예: 컴활, 전산회계)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/80 text-xs sm:text-sm bg-white/70 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>

        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">검색 조건에 맞는 강좌가 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">다른 검색어나 카테고리를 선택해 주세요.</p>
            <button
              onClick={() => {
                onSelectCategory('전체');
                setSearchTerm('');
              }}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md shadow-blue-200"
            >
              전체 강좌 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="glass-card glass-card-hover rounded-3xl border border-white/70 shadow-lg flex flex-col justify-between overflow-hidden group p-6"
              >
                {/* Card Top */}
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-[11px] border border-blue-200">
                      {course.category}
                    </span>
                    {course.nationalSupport && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100/80 backdrop-blur-sm text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {course.subsidyRate}
                      </span>
                    )}
                    {course.featured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 font-bold text-[10px] border border-amber-200">
                        추천강좌
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {course.summary}
                  </p>

                  {/* Key Meta Info */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span><strong>기간/시간:</strong> {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span><strong>시간대:</strong> {course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span><strong>대상:</strong> {course.target}</span>
                    </div>
                  </div>

                  {/* Certifications Tags */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {course.certificationTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-white/70 text-slate-700 text-[11px] rounded-full font-medium border border-white/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Self-Pay Cost Highlight */}
                  <div className="mt-4 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 flex items-center justify-between shadow-sm">
                    <span className="text-xs text-slate-500 font-medium">예상 자부담금</span>
                    <span className="text-xs sm:text-sm font-extrabold text-blue-700">
                      {course.selfPayEstimate}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenDetailModal(course)}
                    className="w-full py-2.5 px-3 bg-white/70 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-white/80 transition-all text-center shadow-sm cursor-pointer"
                  >
                    커리큘럼 보기
                  </button>
                  <button
                    onClick={() => onSelectCourseForInquiry(course.title)}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all text-center shadow-md shadow-blue-200 cursor-pointer"
                  >
                    수강 문의하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
