import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { GalleryItem } from '../types';
import {
  Image as ImageIcon,
  MapPin,
  Calendar,
  Search,
  Eye,
  Settings,
  Lock
} from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { gallery, viewGalleryDetail, setAdminOpen } = useFoundation();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const DEFAULT_CATEGORIES = [
    '전체',
    '장학금 전달',
    '교육지원',
    '명절 나눔',
    '삼계탕 나눔',
    '주거환경 개선',
    '복지시설 지원'
  ];

  // Dynamically include any new custom categories added by the user in admin mode
  const CATEGORIES = Array.from(new Set([...DEFAULT_CATEGORIES, ...gallery.map((g) => g.category)]));

  const filteredGallery = gallery.filter((item) => {
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="gallery-section" className="py-16 md:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header with Admin Management Trigger */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>생생한 나눔 현장</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              너브내행복나눔 활동 갤러리
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              홍천 곳곳에서 주민들과 온기를 모아온 실제 나눔 사진기록입니다.
            </p>
          </div>

          <button
            onClick={() => setAdminOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>관리자 모드 (사진 추가/삭제/수정)</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="갤러리 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredGallery.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                '{selectedCategory}' 카테고리의 활동 사진이 없습니다.
              </p>
              <p className="text-xs text-slate-500">
                새로운 사진 등록 및 관리는 관리자 모드에서 언제든지 가능합니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAdminOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>관리자 모드에서 사진 추가하기</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('전체');
                  setSearchQuery('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                전체 목록 보기
              </button>
            </div>
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
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> 상세보기
                      </span>
                    </div>

                    <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location || '홍천군 관내'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-0 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-bold hover:underline">
                    사진 상세보기 &rarr;
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdminOpen(true);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                    title="관리자 모드에서 수정/삭제"
                  >
                    <Lock className="w-3 h-3" /> 관리자 수정
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
