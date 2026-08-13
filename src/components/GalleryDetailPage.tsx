import React, { useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Share2,
  Eye,
  ImageIcon,
  Settings,
  Lock,
  ShieldCheck
} from 'lucide-react';

export const GalleryDetailPage: React.FC = () => {
  const {
    selectedGallery,
    gallery,
    setActiveTab,
    goBackFromDetail,
    setAdminOpen,
    viewGalleryDetail
  } = useFoundation();

  useEffect(() => {
    if (!selectedGallery) {
      goBackFromDetail('gallery');
    }
  }, [selectedGallery]);

  if (!selectedGallery) {
    return null;
  }

  // Related gallery items
  const relatedGallery = gallery.filter((g) => g.id !== selectedGallery.id).slice(0, 3);

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Navigation & Action Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <button
              onClick={() => setActiveTab('gallery')}
              className="hover:text-emerald-600 transition-colors"
            >
              활동갤러리
            </button>
            <span>&gt;</span>
            <span className="text-emerald-600 font-bold">{selectedGallery.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              title="관리자 모드에서 추가/수정/삭제"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-600" />
              <span>관리자 모드 (추가/수정/삭제)</span>
            </button>
            <button
              onClick={() => goBackFromDetail('gallery')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 hover:text-white bg-white hover:bg-slate-900 border border-slate-300 px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:text-white" />
              <span>닫기 (이전으로)</span>
            </button>
          </div>
        </div>

        {/* Main Photo Card & Article Body */}
        <article className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          {/* Header Info */}
          <div className="p-6 sm:p-10 space-y-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedGallery.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">|</span>
              <span className="text-xs text-slate-500 font-semibold">사단법인 너브내행복나눔재단 나눔기록</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {selectedGallery.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>활동일자: {selectedGallery.date}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>장소: {selectedGallery.location || '홍천군 관내'}</span>
                </span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('페이지 링크가 복사되었습니다!');
                }}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" /> 공유하기
              </button>
            </div>
          </div>

          {/* Photo Display */}
          <div className="bg-slate-900 p-4 sm:p-8 flex items-center justify-center min-h-[320px]">
            <img
              src={selectedGallery.imageUrl}
              alt={selectedGallery.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
              }}
              className="max-h-[550px] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Description Content */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>활동 요약 및 현장 스케치</span>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                {selectedGallery.description}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-700 mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>관리자 계정 공식 보호 자산 (임의 변경 불가)</span>
                </p>
                <p>본 나눔 활동 사진은 너브내행복나눔재단 관리자 계정에 의해 보호되며, 관리자 전용 비밀번호 인증 없이는 임의 변경/삭제가 엄격히 제한됩니다.</p>
              </div>
              <button
                onClick={() => setAdminOpen(true)}
                className="shrink-0 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg text-slate-700 hover:text-emerald-700 font-bold flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer"
                title="관리자 전용 로그인 인증 모드로 전환"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> 관리자 수정
              </button>
            </div>
          </div>
        </article>

        {/* Related Photo List */}
        {relatedGallery.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>관련된 다른 나눔 활동 기록</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    viewGalleryDetail(item);
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-center gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom List Button */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => goBackFromDetail('gallery')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-400" />
            <span>닫기 (이전 페이지로 돌아가기)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
