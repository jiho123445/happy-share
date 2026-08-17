import React, { useEffect, useState } from 'react';
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Layers
} from 'lucide-react';

export const GalleryDetailPage: React.FC = () => {
  const {
    selectedGallery,
    gallery,
    setActiveTab,
    goBackFromDetail,
    setAdminOpen,
    viewGalleryDetail,
    getImageUrl
  } = useFoundation();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!selectedGallery) {
      goBackFromDetail('gallery');
    } else {
      setActivePhotoIdx(0);
    }
  }, [selectedGallery]);

  if (!selectedGallery) {
    return null;
  }

  // Multi-image list with fallback to single imageUrl (100% backward compatible)
  const allImages =
    selectedGallery.images && selectedGallery.images.length > 0
      ? selectedGallery.images
      : selectedGallery.imageUrl
      ? [selectedGallery.imageUrl]
      : [];

  const currentPhoto = allImages[activePhotoIdx] || selectedGallery.imageUrl;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length, isLightboxOpen]);

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
              title="관리자 모드에서 사진 추가/수정/삭제"
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
              {allImages.length > 1 && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-600" />
                  <span>총 {allImages.length}장의 사진 수록</span>
                </span>
              )}
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
                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-bold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> 공유하기
              </button>
            </div>
          </div>

          {/* Interactive Multi-Photo Viewer Display */}
          <div className="bg-slate-950 p-4 sm:p-8 flex flex-col items-center justify-center relative select-none">
            {/* Top Bar inside Viewer (Counter & Fullscreen) */}
            <div className="w-full flex items-center justify-between text-white/90 text-xs font-bold mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    사진 {activePhotoIdx + 1} / {allImages.length}
                  </span>
                </span>
                {activePhotoIdx === 0 && (
                  <span className="bg-emerald-500/80 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                    대표 사진
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-white/15 hover:bg-white/30 text-white px-3 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                title="원본 전체화면 확대보기"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>크게보기</span>
              </button>
            </div>

            {/* Main Stage Image */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full flex items-center justify-center min-h-[320px] max-h-[560px] cursor-zoom-in group"
            >
              <img
                src={getImageUrl(currentPhoto)}
                alt={`${selectedGallery.title} - ${activePhotoIdx + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                }}
                className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
              />

              {/* Prev / Next Slide Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-emerald-600 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-xs shadow-lg transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
                    title="이전 사진"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-emerald-600 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-xs shadow-lg transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
                    title="다음 사진"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (when multiple photos exist) */}
            {allImages.length > 1 && (
              <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center gap-2.5 overflow-x-auto pb-1 px-1 scrollbar-thin">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all cursor-pointer border-2 ${
                      activePhotoIdx === idx
                        ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-500/20 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 rounded">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Attached Photos Gallery Grid (when multiple photos exist) */}
          {allImages.length > 1 && (
            <div className="px-6 sm:px-10 pt-8 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>수록된 전체 사진 목록 ({allImages.length}장)</span>
                </h3>
                <span className="text-xs text-slate-500">
                  사진을 클릭하면 크게 확인할 수 있습니다.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setIsLightboxOpen(true);
                    }}
                    className={`relative rounded-xl overflow-hidden bg-slate-100 aspect-4/3 cursor-pointer group border transition-all ${
                      activePhotoIdx === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={`${selectedGallery.title} - ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow">
                        <Eye className="w-3 h-3 text-emerald-600" /> 크게보기
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {idx === 0 ? '대표' : idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    src={getImageUrl(item.imageUrl)}
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

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md select-none animate-in fade-in duration-200"
        >
          {/* Lightbox Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl flex items-center justify-between text-white py-2 px-4"
          >
            <div className="flex items-center gap-3">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                {selectedGallery.category}
              </span>
              <span className="font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {selectedGallery.title}
              </span>
              <span className="text-xs text-white/70">
                ({activePhotoIdx + 1} / {allImages.length})
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors cursor-pointer"
              title="닫기 (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image & Navigation */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center p-2 min-h-0"
          >
            <img
              src={getImageUrl(currentPhoto)}
              alt={`${selectedGallery.title} - ${activePhotoIdx + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-emerald-600 text-white p-3 rounded-full backdrop-blur-md shadow-xl transition-all cursor-pointer active:scale-90"
                  title="이전 사진"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-emerald-600 text-white p-3 rounded-full backdrop-blur-md shadow-xl transition-all cursor-pointer active:scale-90"
                  title="다음 사진"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Carousel */}
          {allImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-4"
            >
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-emerald-400 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
