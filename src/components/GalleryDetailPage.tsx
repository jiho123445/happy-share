import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Share2,
  Heart,
  ChevronRight,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export const GalleryDetailPage: React.FC = () => {
  const { selectedGallery, gallery, setActiveTab, setSelectedGallery } = useFoundation();

  if (!selectedGallery) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-500">선택된 갤러리 항목이 없습니다.</p>
        <button
          onClick={() => setActiveTab('gallery')}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          갤러리 목록으로 이동
        </button>
      </div>
    );
  }

  // Related gallery items
  const relatedGallery = gallery.filter((g) => g.id !== selectedGallery.id).slice(0, 3);

  const handleSelectRelated = (item: typeof selectedGallery) => {
    setSelectedGallery(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedGallery.title,
        text: selectedGallery.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('갤러리 링크가 클립보드에 복사되었습니다.');
    }
  };

  return (
    <div className="py-10 md:py-16 bg-[#FFFDF8] min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => setActiveTab('main')} className="hover:text-orange-600">홈</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button onClick={() => setActiveTab('gallery')} className="hover:text-orange-600">활동 갤러리</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-emerald-600 font-bold">{selectedGallery.category}</span>
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={() => setActiveTab('gallery')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs hover:border-emerald-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500" />
            <span>활동 갤러리 목록으로 돌아가기</span>
          </button>
        </div>

        {/* Main Photo Card & Article Body */}
        <article className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          
          {/* Main Photo Display */}
          <div className="relative bg-slate-900 max-h-[500px] overflow-hidden flex items-center justify-center">
            <img
              src={selectedGallery.imageUrl}
              alt={selectedGallery.title}
              className="w-full h-full max-h-[500px] object-cover"
            />
            <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-400/40 shadow-md">
              {selectedGallery.category}
            </div>
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg transition-all"
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Details Body Container */}
          <div className="p-6 sm:p-10 space-y-6">
            
            {/* Title & Metadata */}
            <div className="border-b border-slate-100 pb-5 space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {selectedGallery.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>봉사/행사 일자: {selectedGallery.date}</span>
                </span>
                {selectedGallery.location && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>진행 장소: {selectedGallery.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>나눔 활동 개요 및 성과</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {selectedGallery.description}
              </div>
            </div>

            {/* Impact Points */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-3">
              <div className="text-xs font-bold text-emerald-900">지역사회 나눔 영향</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>홍천 관내 복지 사각지대 및 취약계층 직접 지원</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>지역 자원봉사자와 후원자 정성 기반 활동</span>
                </li>
              </ul>
            </div>

            {/* Contact Callout */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-orange-400">사단법인 너브내행복나눔재단</div>
                <div className="text-sm font-bold text-white">다음 봉사 및 나눔 활동에 함께 참여하세요!</div>
                <div className="text-xs text-slate-400">전화문의: 033-436-1926 | FAX: 033-436-1910</div>
              </div>

              <button
                onClick={() => setActiveTab('donate')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>봉사 및 후원 신청</span>
              </button>
            </div>

          </div>
        </article>

        {/* Related Gallery Items */}
        {relatedGallery.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>다른 나눔 현장 둘러보기</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectRelated(item)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="h-36 overflow-hidden relative bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 text-[10px] bg-slate-900/80 text-white font-bold px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-600">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-colors"
          >
            활동 갤러리 전체목록 보기
          </button>
        </div>

      </div>
    </div>
  );
};
