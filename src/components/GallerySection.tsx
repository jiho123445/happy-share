import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { GalleryItem } from '../types';
import { Image as ImageIcon, MapPin, Calendar, Search, Sparkles, Filter, Eye } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { gallery, viewGalleryDetail } = useFoundation();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const CATEGORIES = [
    '전체',
    '장학금 전달',
    '교육지원',
    '명절 나눔',
    '삼계탕 나눔',
    '주거환경 개선',
    '복지시설 지원'
  ];

  const filteredGallery = gallery.filter((item) => {
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="gallery-section" className="py-16 md:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>생생한 나눔 현장</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            너브내행복나눔 활동 갤러리
          </h2>
          <p className="text-base text-slate-600">
            홍천 곳곳에서 주민들과 온기를 모아온 실제 나눔 사진기록입니다.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="갤러리 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

        </div>

        {/* Grid */}
        {filteredGallery.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              해당 조건의 활동 사진이 존재하지 않습니다.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('전체');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-600 underline"
            >
              검색 조건 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => viewGalleryDetail(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                        <Eye className="w-3.5 h-3.5" /> 원본 크게 보기
                      </span>
                    </div>
                    <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-0">
                  <span className="text-[11px] text-emerald-600 font-bold hover:underline">
                    사진 상세보기 &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
