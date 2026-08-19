import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { downloadNoticeFile } from '../utils/download';
import { isAttachmentPreviewable } from '../utils/attachmentPreview';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { GalleryItem, NoticeAttachment } from '../types';
import {
  X,
  Calendar,
  Eye,
  MapPin,
  CheckCircle2,
  Heart,
  Download,
  Building2,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers
} from 'lucide-react';

interface GalleryModalProps {
  item: GalleryItem;
  onClose: () => void;
  getImageUrl: (url?: string) => string;
}

const GalleryModalContent: React.FC<GalleryModalProps> = ({ item, onClose, getImageUrl }) => {
  const allImages = (item.images && item.images.length > 0)
    ? item.images
    : (item.imageUrl ? [item.imageUrl] : []);

  const [activeIdx, setActiveIdx] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length, onClose]);

  const activePhotoUrl = allImages[activeIdx] || item.imageUrl;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Image Viewer Stage */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[55vh] overflow-hidden select-none">
          <img
            src={getImageUrl(activePhotoUrl)}
            alt={`${item.title} - 사진 ${activeIdx + 1}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-contain max-h-[55vh]"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 text-white bg-slate-900/80 hover:bg-slate-900 rounded-full shadow-lg transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo Counter Badge */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 z-20 shadow-md">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>사진 {activeIdx + 1} / {allImages.length}</span>
            </div>
          )}

          {/* Prev/Next Navigation Controls */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/75 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 z-20 backdrop-blur-xs"
                aria-label="이전 사진"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setActiveIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/75 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 z-20 backdrop-blur-xs"
                aria-label="다음 사진"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Preview Strip */}
        {allImages.length > 1 && (
          <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>전체 {allImages.length}장:</span>
            </span>
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                  activeIdx === idx
                    ? 'border-emerald-500 ring-2 ring-emerald-400/50 scale-105 shadow-md'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={getImageUrl(imgUrl)}
                  alt={`썸네일 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-slate-950/80 text-white text-[9px] font-bold px-1 rounded-tl">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Details & Metadata Footer */}
        <div className="p-6 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {item.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {item.date}
              </span>
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {item.location}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {item.description}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
            <span className="text-xs text-slate-400">
              총 {allImages.length}장의 고화질 사진이 등록되어 있습니다.
            </span>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const ModalViewer: React.FC = () => {
  const {
    selectedNotice,
    setSelectedNotice,
    selectedProgram,
    setSelectedProgram,
    selectedGallery,
    setSelectedGallery,
    activeTab,
    setActiveTab,
    goBackFromDetail,
    getImageUrl
  } = useFoundation();

  const [previewFile, setPreviewFile] = useState<NoticeAttachment | null>(null);

  // If we are currently on a dedicated detail page, do not render duplicate modal popups
  if (['notice-detail', 'gallery-detail', 'program-detail'].includes(activeTab)) {
    return null;
  }

  // Notice Detail Modal
  if (selectedNotice) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {selectedNotice.category}
            </span>
            <button
              onClick={() => goBackFromDetail('news')}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {selectedNotice.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>작성자: {selectedNotice.author}</span>
              <span>작성일: {selectedNotice.date}</span>
              <span>조회수: {selectedNotice.views}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {selectedNotice.content}
          </div>

          {(() => {
            const attachmentsList = selectedNotice.attachments !== undefined
              ? selectedNotice.attachments
              : (selectedNotice.attachmentName ? [{ name: selectedNotice.attachmentName, url: selectedNotice.attachmentUrl || '#', size: '첨부서식', type: 'FILE' }] : []);

            if (attachmentsList.length === 0) return null;

            return (
              <div className="space-y-2.5">
                {attachmentsList.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-[#FFFDF7] border border-orange-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-orange-950 text-xs sm:text-sm truncate">
                        첨부파일: {file.name}
                      </span>
                      {file.size && file.size !== '첨부서식' && (
                        <span className="text-[11px] font-medium text-slate-400 shrink-0">
                          ({file.size})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAttachmentPreviewable(file) && (
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>미리보기</span>
                        </button>
                      )}
                      <button
                        onClick={() => downloadNoticeFile(file)}
                        className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>다운로드</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {previewFile && (
            <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
          )}

          <div className="pt-2 text-right">
            <button
              onClick={() => goBackFromDetail('news')}
              className="bg-[#101828] hover:bg-slate-800 text-white font-extrabold text-sm px-7 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Program Detail Modal
  if (selectedProgram) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              사업 0{selectedProgram.code} · {selectedProgram.badge}
            </span>
            <button
              onClick={() => setSelectedProgram(null)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">
              {selectedProgram.title}
            </h3>
            <p className="text-xs text-slate-500 italic">
              "{selectedProgram.subtitle}"
            </p>
          </div>

          <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100 text-xs text-orange-900 font-medium">
            💡 {selectedProgram.impactMessage}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              세부 지원 항목 및 내용
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {selectedProgram.details.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              지원 대상: {selectedProgram.targetAudience}
            </span>

            <button
              onClick={() => {
                setSelectedProgram(null);
                setActiveTab('donate');
                setTimeout(() => {
                  const el = document.getElementById('donate-form');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>이 사업 후원하기</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Gallery Lightbox Modal
  if (selectedGallery) {
    return (
      <GalleryModalContent
        item={selectedGallery}
        onClose={() => setSelectedGallery(null)}
        getImageUrl={getImageUrl}
      />
    );
  }

  return null;
};
