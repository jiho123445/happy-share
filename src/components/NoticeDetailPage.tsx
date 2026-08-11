import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Share2,
  Printer,
  Pin,
  Download,
  Heart,
  MessageSquare,
  ChevronRight,
  Newspaper,
  Sparkles
} from 'lucide-react';

export const NoticeDetailPage: React.FC = () => {
  const { selectedNotice, notices, setActiveTab, setSelectedNotice, incrementNoticeViews } = useFoundation();

  if (!selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-500">선택된 공지사항이 없습니다.</p>
        <button
          onClick={() => setActiveTab('news')}
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          공지사항 목록으로 이동
        </button>
      </div>
    );
  }

  // Find currentIndex and related notices
  const currentIndex = notices.findIndex((n) => n.id === selectedNotice.id);
  const prevNotice = currentIndex > 0 ? notices[currentIndex - 1] : null;
  const nextNotice = currentIndex < notices.length - 1 ? notices[currentIndex + 1] : null;

  const handleSelectRelatedNotice = (notice: typeof selectedNotice) => {
    incrementNoticeViews(notice.id);
    setSelectedNotice(notice);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedNotice.title,
        text: selectedNotice.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('공지글 링크가 클립보드에 복사되었습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 md:py-16 bg-[#FFFDF8] min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => setActiveTab('main')} className="hover:text-orange-600">홈</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button onClick={() => setActiveTab('news')} className="hover:text-orange-600">알림마당</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-orange-600 font-bold">{selectedNotice.category}</span>
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={() => setActiveTab('news')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs hover:border-orange-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>공지사항 목록으로 돌아가기</span>
          </button>
        </div>

        {/* Notice Main Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-8">
          
          {/* Header Metadata */}
          <div className="border-b border-slate-100 pb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {selectedNotice.isImportant && (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs">
                  <Pin className="w-3.5 h-3.5" /> 필독 공지
                </span>
              )}
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-md border border-orange-200">
                {selectedNotice.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {selectedNotice.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>작성자: {selectedNotice.author}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>등록일: {selectedNotice.date}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  <span>조회수: {selectedNotice.views}회</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 transition-colors"
                  title="공유하기"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 transition-colors"
                  title="인쇄하기"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Attachment Box if any */}
          {selectedNotice.attachmentName && (
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500 text-white rounded-xl">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">첨부파일 다운로드</div>
                  <div className="text-[11px] text-slate-600">{selectedNotice.attachmentName}</div>
                </div>
              </div>
              <button
                onClick={() => alert(`'${selectedNotice.attachmentName}' 파일이 다운로드됩니다.`)}
                className="bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                다운로드
              </button>
            </div>
          )}

          {/* Article Body Content */}
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line min-h-[160px] py-2">
            {selectedNotice.content}
          </div>

          {/* Foundation Contact & Support Callout */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-2xl p-0.5 shadow-md">
            <div className="bg-white rounded-[15px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-orange-600 flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>사단법인 너브내행복나눔재단 사업본부</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  사업 신청 및 후원 문의: 033-433-1925 (FAX: 033-433-1910)
                </div>
                <div className="text-xs text-slate-500">
                  강원특별자치도 홍천군 홍천읍 산림조합길 12
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('donate')}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>후원 참여하기</span>
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>온라인 문의</span>
                </button>
              </div>
            </div>
          </div>

        </article>

        {/* Previous / Next Post Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
          {prevNotice && (
            <button
              onClick={() => handleSelectRelatedNotice(prevNotice)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-50/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-orange-600 shrink-0">▲ 이전글</span>
                <span className="text-slate-700 font-medium truncate group-hover:text-orange-600">
                  {prevNotice.title}
                </span>
              </div>
              <span className="text-slate-400 shrink-0 ml-2">{prevNotice.date}</span>
            </button>
          )}

          {nextNotice && (
            <button
              onClick={() => handleSelectRelatedNotice(nextNotice)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-50/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-emerald-600 shrink-0">▼ 다음글</span>
                <span className="text-slate-700 font-medium truncate group-hover:text-emerald-600">
                  {nextNotice.title}
                </span>
              </div>
              <span className="text-slate-400 shrink-0 ml-2">{nextNotice.date}</span>
            </button>
          )}
        </div>

        {/* Bottom List Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('news')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-colors"
          >
            공지사항 전체목록 보기
          </button>
        </div>

      </div>
    </div>
  );
};
