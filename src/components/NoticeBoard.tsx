import React, { useState, useEffect } from 'react';
import { Notice } from '../types';
import { Bell, Calendar, ChevronRight, X, AlertCircle } from 'lucide-react';
import { subscribeNoticesFromFirestore } from '../lib/firestoreService';
import { useModalA11y } from '../lib/useModalA11y';

interface NoticeBoardProps {
  // 부모(App.tsx)가 URL(/notices/:id)과 동기화해서 관리하는 현재 열람 중인
  // 공지 id. 이렇게 해야 개별 공지에 실제 URL이 생겨서 카카오톡/문자 공유나
  // 구글·네이버 검색 노출이 가능해집니다(예전엔 팝업일 뿐 주소가 안 바뀌었음).
  selectedNoticeId?: string | null;
  onOpenNotice?: (noticeId: string) => void;
  onCloseDetail?: () => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ selectedNoticeId, onOpenNotice, onCloseDetail }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedNotice = selectedNoticeId ? notices.find((n) => n.id === selectedNoticeId) || null : null;
  const closeDetail = () => {
    if (onCloseDetail) onCloseDetail();
  };

  const detailModalRef = useModalA11y(!!selectedNotice, closeDetail);

  useEffect(() => {
    const unsubscribe = subscribeNoticesFromFirestore((data) => {
      setNotices(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['전체', '모집안내', '시험일정', '국비지원', '학원소개'];

  const filteredNotices = notices.filter(
    (n) => selectedCategory === '전체' || n.category === selectedCategory
  );

  return (
    <section id="notices" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-3 border border-blue-200/60 shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            NOTICE & EXAM SCHEDULE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            공지사항 & 자격시험 일정
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            학원의 주요 소식, 신규 개강 일정 및 상시 자격증 시험 일정을 안내해 드립니다.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white/60 backdrop-blur-md text-slate-700 border border-white/80 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notice List in Frosted Glass Container */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden divide-y divide-white/60">
          {isLoading ? (
            // Skeleton loading rows - Firestore 실시간 데이터가 도착하기 전까지
            // "공지사항이 없습니다"처럼 오해될 수 있는 빈 화면 대신 로딩 중임을 보여줍니다.
            <div className="divide-y divide-white/60">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 sm:p-6 flex items-center gap-3 animate-pulse">
                  <div className="h-6 w-16 rounded-full bg-slate-200/80 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200/80" />
                    <div className="h-3 w-1/3 rounded bg-slate-200/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => onOpenNotice && onOpenNotice(notice.id)}
              className="p-5 sm:p-6 hover:bg-white/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                    notice.important
                      ? 'bg-red-100 text-red-800 border border-red-200/80'
                      : 'bg-blue-50 text-blue-800 border border-blue-100'
                  }`}
                >
                  {notice.category}
                </span>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {notice.important && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-black shadow-sm">
                        중요
                      </span>
                    )}
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {notice.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {notice.date}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            ))
          )}
        </div>

        {/* Notice Detail Modal in Glass Style */}
        {selectedNotice && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn"
            onClick={() => closeDetail()}
          >
            <div
              ref={detailModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-detail-title"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/80"
            >
              <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 mb-4">
                <div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full border border-blue-200">
                    {selectedNotice.category}
                  </span>
                  <h3 id="notice-detail-title" className="text-lg font-black text-slate-900 mt-2">
                    {selectedNotice.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">등록일: {selectedNotice.date}</p>
                </div>
                <button
                  onClick={() => closeDetail()}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed bg-white/60 p-5 rounded-2xl border border-white/80 mb-6">
                {selectedNotice.content}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => closeDetail()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-200 transition-all cursor-pointer"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
