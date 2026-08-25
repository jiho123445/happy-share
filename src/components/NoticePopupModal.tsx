import React from 'react';
import { Calendar, Sparkles, X, ChevronRight, CheckCircle2, Megaphone, Clock, BookOpen } from 'lucide-react';
import { useModalA11y } from '../lib/useModalA11y';

export interface ScheduleItem {
  courseName: string;
  startDate: string;
  timeSlot: string;
}

export interface PopupNoticeConfig {
  enabled: boolean;
  badgeText: string;
  title: string;
  subtitle: string;
  content: string;
  dateText: string;
  schedules?: ScheduleItem[];
  actionText: string;
  /** 우측 하단 "공지 다시보기" 플로팅 버튼에 표시되는 짧은 문구.
   *  비워두면(=falsy) 상단 뱃지 문구(badgeText)를 그대로 사용해
   *  팝업 뱃지 문구가 바뀌면 플로팅 버튼 문구도 함께 바뀐다. */
  buttonLabel?: string;
  updatedAt?: string;
}

interface NoticePopupModalProps {
  noticeConfig: PopupNoticeConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onActionClick: () => void;
  onHideToday: () => void;
}

export const NoticePopupModal: React.FC<NoticePopupModalProps> = ({
  noticeConfig,
  isOpen,
  onClose,
  onActionClick,
  onHideToday,
}) => {
  const shouldShow = isOpen && !!noticeConfig && noticeConfig.enabled;
  const panelRef = useModalA11y(shouldShow, onClose);

  if (!shouldShow) return null;

  const schedules = noticeConfig.schedules && noticeConfig.schedules.length > 0
    ? noticeConfig.schedules
    : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div 
        id="notice-popup-card"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-popup-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col transform transition-all animate-scale-up max-h-[90vh]"
      >
        {/* Header Visual Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white overflow-hidden shrink-0">
          {/* Subtle decorative background circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

          {/* Top Bar: Badge & Close Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
              <Megaphone className="w-3.5 h-3.5" />
              <span>{noticeConfig.badgeText || '개강 공지사항'}</span>
            </span>

            <button
              onClick={onClose}
              id="notice-popup-close-x"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Title & Subtitle */}
          <h2 id="notice-popup-title" className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug mb-1 relative z-10">
            {noticeConfig.title}
          </h2>
          {noticeConfig.subtitle && (
            <p className="text-xs sm:text-sm text-blue-200 font-medium relative z-10">
              {noticeConfig.subtitle}
            </p>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Detailed Content Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium shadow-inner">
            {noticeConfig.content}
          </div>

          {/* Structured Opening Schedules List (4+ Slots) */}
          {schedules.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-xs font-black text-slate-800">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>주요 과목 개강 일정 및 강의 시간</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {schedules.map((item, idx) => {
                  if (!item.courseName && !item.startDate && !item.timeSlot) return null;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs shadow-sm hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm">
                        <span className="w-5 h-5 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 hidden sm:inline" />
                        <span className="truncate">{item.courseName || '과정선택'}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold text-slate-700 pl-7 sm:pl-0">
                        {item.startDate && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{item.startDate}</span>
                          </span>
                        )}
                        {item.timeSlot && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{item.timeSlot}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : noticeConfig.dateText ? (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950">
              <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-blue-900 mb-0.5">개강 일정 및 시간대</p>
                <p className="font-semibold text-blue-800 leading-snug">{noticeConfig.dateText}</p>
              </div>
            </div>
          ) : null}

          {/* Key Advantages list */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>고용노동부 내일배움카드 최대 100% 국비 지원 대상</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1인 1대 최신 고성능 실습 PC 환경 & 1:1 밀착지도</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>홍천읍 신장대로 48 위치 (접근성 우수, 27년 전통)</span>
            </div>
          </div>

          {/* Main Call To Action Button */}
          <button
            onClick={onActionClick}
            id="notice-popup-apply-btn"
            className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span>{noticeConfig.actionText || '온라인 수강 신청하기'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Footer: Hide for today & Close */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold shrink-0">
          <button
            onClick={onHideToday}
            id="notice-popup-hide-today"
            className="hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="underline underline-offset-2">오늘 하루 동안 보지 않기</span>
          </button>

          <button
            onClick={onClose}
            id="notice-popup-close-btn"
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors cursor-pointer shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
