import React, { useEffect, useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { downloadNoticeFile } from '../utils/download';
import { isAttachmentPreviewable } from '../utils/attachmentPreview';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { NoticeAttachment } from '../types';
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
  Sparkles,
  Paperclip,
  FileText,
  X
} from 'lucide-react';

export const NoticeDetailPage: React.FC = () => {
  const {
    selectedNotice,
    notices,
    setActiveTab,
    setSelectedNotice,
    incrementNoticeViews,
    goBackFromDetail,
    previousTab,
    viewNoticeDetail
  } = useFoundation();

  const [previewFile, setPreviewFile] = useState<NoticeAttachment | null>(null);

  useEffect(() => {
    if (!selectedNotice) {
      goBackFromDetail('news');
    }
  }, [selectedNotice]);

  if (!selectedNotice) {
    return null;
  }

  // Find currentIndex and related notices
  const currentIndex = notices.findIndex((n) => n.id === selectedNotice.id);
  const prevNotice = currentIndex > 0 ? notices[currentIndex - 1] : null;
  const nextNotice = currentIndex < notices.length - 1 ? notices[currentIndex + 1] : null;

  const handleSelectRelatedNotice = (notice: typeof selectedNotice) => {
    if (!notice) return;
    viewNoticeDetail(notice);
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
        
        {/* Breadcrumb Navigation & Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button onClick={() => { setSelectedNotice(null); setActiveTab('main'); }} className="hover:text-orange-600 transition-colors">홈</button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => { setSelectedNotice(null); setActiveTab('news'); }} className="hover:text-orange-600 transition-colors">알림마당</button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-orange-600 font-bold">{selectedNotice.category}</span>
          </div>

          <button
            onClick={() => goBackFromDetail('news')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 hover:text-white bg-white hover:bg-slate-900 border border-slate-300 px-4 py-2 rounded-xl shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500 group-hover:text-white" />
            <span>닫기 (이전 페이지로 돌아가기)</span>
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
          {(() => {
            const attachmentsList = selectedNotice.attachments !== undefined
              ? selectedNotice.attachments
              : (selectedNotice.attachmentName ? [{ name: selectedNotice.attachmentName, url: selectedNotice.attachmentUrl || '#', size: '첨부서식', type: 'FILE' }] : []);

            if (attachmentsList.length === 0) return null;

            return (
              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900">
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <span>첨부파일 목록 ({attachmentsList.length}개)</span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100/90 px-2.5 py-0.5 rounded-full border border-orange-200">
                    미리보기 · 다운로드 가능
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachmentsList.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {file.size || '첨부 문서'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAttachmentPreviewable(file) && (
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="inline-flex items-center gap-1.5 bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 font-bold text-xs px-3 py-2 rounded-xl transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>미리보기</span>
                          </button>
                        )}
                        <button
                          onClick={() => downloadNoticeFile(file)}
                          className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>다운로드</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {previewFile && (
            <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
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
                  사업 신청 및 후원 문의: 033-436-1925 (FAX: 033-436-1910)
                </div>
                <div className="text-xs text-slate-500">
                  강원특별자치도 홍천군 홍천읍 송학로3길 26, 2층
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
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => goBackFromDetail('news')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 text-orange-400" />
            <span>닫기 (이전 페이지로 돌아가기)</span>
          </button>
          <button
            onClick={() => goBackFromDetail('news')}
            className="bg-white hover:bg-orange-50 text-slate-800 hover:text-orange-600 border border-slate-300 font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-xs transition-all"
          >
            공지사항 전체목록 보기
          </button>
        </div>

      </div>
    </div>
  );
};
