import React from 'react';
import { Course } from '../types';
import { X, CheckCircle2, Clock, Users, Calendar, Award, CreditCard, Phone } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';
import { useModalA11y } from '../lib/useModalA11y';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onApply: (courseTitle: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onApply,
}) => {
  const panelRef = useModalA11y(!!course, onClose);

  if (!course) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-detail-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80"
      >
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md text-white p-5 sm:p-6 flex items-start justify-between rounded-t-3xl z-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs">
                {course.category}
              </span>
              {course.nationalSupport && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                  {course.subsidyRate}
                </span>
              )}
            </div>
            <h3 id="course-detail-title" className="text-xl sm:text-2xl font-black">{course.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-800">
          
          {/* Description */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              강좌 개요 및 소개
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white/60 p-4 rounded-2xl border border-white/80 shadow-sm">
              {course.description}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-blue-50/80 backdrop-blur-sm border border-blue-100 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-800 font-bold">교육 기간</p>
                <p className="font-bold text-slate-900">{course.duration}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 backdrop-blur-sm border border-blue-100 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-800 font-bold">강의 시간대</p>
                <p className="font-bold text-slate-900">{course.schedule}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-600 font-bold">수강 대상</p>
                <p className="font-bold text-slate-900">{course.target}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-600 font-bold">예상 자부담금</p>
                <p className="font-extrabold text-blue-600">{course.selfPayEstimate}</p>
              </div>
            </div>
          </div>

          {/* Detailed Curriculum */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              단계별 세부 커리큘럼
            </h4>
            <div className="space-y-2">
              {course.curriculum.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 flex items-start gap-3 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Certifications */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              취득 가능 주요 자격증
            </h4>
            <div className="flex flex-wrap gap-2">
              {course.certificationTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 bg-blue-50/90 text-blue-800 border border-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Box */}
          <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div>
              <p className="font-bold text-amber-900">전화 빠른 상담 문의</p>
              <p className="text-amber-800">월~금 09:00 - 21:30 | 토 09:00 - 15:00</p>
            </div>
            <a
              href={`tel:${ACADEMY_INFO.phoneClean}`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full flex items-center gap-1 text-xs shadow-md shadow-amber-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{ACADEMY_INFO.phone}</span>
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/40 border-t border-white/60 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-sm hover:bg-white/80 transition-all"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onApply(course.title);
              onClose();
            }}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-200 transition-all"
          >
            이 강좌 수강 문의하기
          </button>
        </div>

      </div>
    </div>
  );
};
