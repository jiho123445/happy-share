import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { downloadNoticeFile } from '../utils/download';
import { X, Calendar, Eye, MapPin, CheckCircle2, Heart, Download, Building2, Paperclip } from 'lucide-react';

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
    goBackFromDetail
  } = useFoundation();

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
            const attachmentsList = [
              ...(selectedNotice.attachments || []),
              ...(selectedNotice.attachmentName && (!selectedNotice.attachments || !selectedNotice.attachments.some(a => a.name === selectedNotice.attachmentName))
                ? [{ name: selectedNotice.attachmentName, size: '첨부서식' }]
                : [])
            ];

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
                    <button
                      onClick={() => downloadNoticeFile(file)}
                      className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

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
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          <div className="relative max-h-[60vh] bg-slate-900 overflow-hidden flex items-center justify-center">
            <img
              src={selectedGallery.imageUrl}
              alt={selectedGallery.title}
              className="w-full h-full object-contain max-h-[60vh]"
            />
            <button
              onClick={() => setSelectedGallery(null)}
              className="absolute top-4 right-4 p-2 text-white bg-slate-900/80 hover:bg-slate-900 rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {selectedGallery.category}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedGallery.date}
                </span>
                {selectedGallery.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedGallery.location}
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {selectedGallery.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedGallery.description}
            </p>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedGallery(null)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
};
