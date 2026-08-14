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
  Lock,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Trash2,
  Plus,
  Tag,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

interface GalleryCardProps {
  item: GalleryItem;
  onViewDetail: (item: GalleryItem) => void;
  onAdminEdit: () => void;
  getImageUrl: (url?: string) => string;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, onViewDetail, onAdminEdit, getImageUrl }) => {
  const itemImages = (item.images && item.images.length > 0)
    ? item.images
    : (item.imageUrl ? [item.imageUrl] : []);
  
  const [currentIdx, setCurrentIdx] = useState(0);

  const activeImage = itemImages[currentIdx] || item.imageUrl;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === 0 ? itemImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === itemImages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectThumbnail = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCurrentIdx(idx);
  };

  return (
    <div
      onClick={() => onViewDetail(item)}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Main Photo Stage */}
        <div className="relative h-56 overflow-hidden bg-slate-900 select-none">
          <img
            src={getImageUrl(activeImage)}
            alt={`${item.title} - 사진 ${currentIdx + 1}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-slate-900 text-xs font-extrabold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>자세히 보기</span>
            </span>
          </div>

          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs z-10">
            {item.category}
          </span>

          {/* Multi-Photo Count & Index Indicator Badge */}
          {itemImages.length > 1 && (
            <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md border border-white/10 z-10">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>사진 {itemImages.length}장 ({currentIdx + 1}/{itemImages.length})</span>
            </span>
          )}

          {/* Quick Photo Switcher Prev/Next Arrows on Card */}
          {itemImages.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 sm:opacity-90 transition-opacity">
              <button
                onClick={handlePrev}
                aria-label="이전 사진"
                className="w-7 h-7 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="다음 사진"
                className="w-7 h-7 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dot Indicators */}
          {itemImages.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10">
              {itemImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSelectThumbnail(e, idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIdx === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                  title={`${idx + 1}번 사진으로 전환`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Multi-Photo Thumbnail Bar directly in the card */}
        {itemImages.length > 1 && (
          <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 shrink-0 flex items-center gap-0.5 mr-1">
              <ImageIcon className="w-3 h-3 text-emerald-600" />
              <span>사진 목록:</span>
            </span>
            {itemImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSelectThumbnail(e, idx)}
                className={`relative w-9 h-9 rounded-md overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                  currentIdx === idx
                    ? 'border-emerald-600 ring-2 ring-emerald-400/40 scale-105 shadow-xs'
                    : 'border-white opacity-70 hover:opacity-100 hover:border-slate-400'
                }`}
                title={`${idx + 1}번째 사진 보기`}
              >
                <img
                  src={getImageUrl(imgUrl)}
                  alt={`썸네일 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded-tl">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content Box */}
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

      {/* Card Footer Actions */}
      <div className="px-5 pb-4 pt-0 flex items-center justify-between border-t border-slate-50 mt-1">
        <span className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1">
          <span>사진 상세보기</span>
          {itemImages.length > 1 && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
              {itemImages.length}장 전체보기
            </span>
          )}
          <span>&rarr;</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdminEdit();
          }}
          className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="관리자 계정 전용 (비밀번호 인증 필요)"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> 관리자 수정
        </button>
      </div>
    </div>
  );
};

export const GallerySection: React.FC = () => {
  const {
    gallery,
    galleryCategories,
    addGalleryCategory,
    updateGalleryCategory,
    deleteGalleryCategory,
    viewGalleryDetail,
    setAdminOpen,
    refreshData,
    isSyncing,
    getImageUrl
  } = useFoundation();

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [manualRefreshing, setManualRefreshing] = useState(false);

  // Category Manager Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatInput, setEditCatInput] = useState('');
  const [deletingCatName, setDeletingCatName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualRefresh = async () => {
    setManualRefreshing(true);
    await refreshData();
    setTimeout(() => setManualRefreshing(false), 500);
  };

  // Combine dynamic galleryCategories + any category that might exist in gallery items
  const allCategories = Array.from(
    new Set(['전체', ...galleryCategories, ...gallery.map((g) => g.category)])
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (galleryCategories.includes(trimmed)) {
      showToast(`'${trimmed}' 항목은 이미 존재합니다.`);
      return;
    }
    await addGalleryCategory(trimmed);
    setNewCategoryInput('');
    showToast(`'${trimmed}' 카테고리 항목이 추가되었습니다.`);
  };

  const handleStartEdit = (cat: string) => {
    setEditingCatName(cat);
    setEditCatInput(cat);
    setDeletingCatName(null);
  };

  const handleSaveEdit = async (oldCat: string) => {
    const trimmed = editCatInput.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCatName(null);
      return;
    }
    await updateGalleryCategory(oldCat, trimmed);
    if (selectedCategory === oldCat) {
      setSelectedCategory(trimmed);
    }
    setEditingCatName(null);
    showToast(`카테고리 이름이 '${oldCat}'에서 '${trimmed}'(으)로 수정되었습니다.`);
  };

  const handleDeleteCategory = async (cat: string) => {
    await deleteGalleryCategory(cat);
    if (selectedCategory === cat) {
      setSelectedCategory('전체');
    }
    setDeletingCatName(null);
    showToast(`'${cat}' 카테고리 항목이 삭제되었습니다.`);
  };

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
        
        {/* Header with Admin Management Trigger & Live Sync */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>생생한 나눔 현장</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                총 {gallery.length}개의 나눔 기록
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              너브내행복나눔 활동 갤러리
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              홍천 곳곳에서 주민들과 온기를 모아온 실제 나눔 사진기록입니다.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <button
              onClick={handleManualRefresh}
              disabled={manualRefreshing || isSyncing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer border border-slate-200 active:scale-95 disabled:opacity-60"
              title="최신 활동사진 동기화"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${manualRefreshing || isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">사진 새로고침</span>
            </button>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 border border-emerald-300 hover:border-emerald-500 shadow-xs hover:shadow transition-all cursor-pointer"
              title="카테고리 항목 추가, 수정, 삭제"
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>항목 수정/삭제</span>
            </button>

            <button
              onClick={() => setAdminOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>사진 등록/관리</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                {cat !== '전체' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCategory === cat ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {gallery.filter((g) => g.category === cat).length}
                  </span>
                )}
              </button>
            ))}

            {/* Quick Category Edit Trigger */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-2.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-dashed border-slate-300 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-1"
              title="카테고리 항목 관리 (추가/수정/삭제)"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">카테고리 관리</span>
            </button>
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
              <GalleryCard
                key={item.id}
                item={item}
                onViewDetail={viewGalleryDetail}
                onAdminEdit={() => setAdminOpen(true)}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        )}

      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Tag className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    활동 갤러리 카테고리(분류 항목) 관리
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    카테고리 항목을 추가, 수정, 삭제할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCatName(null);
                  setDeletingCatName(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  ➕ 새 카테고리(분류 항목) 추가
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="새 카테고리명 입력 (예: 다문화지원, 어르신돌봄)"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>추가</span>
                  </button>
                </div>
              </form>

              {/* Category List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span>현재 등록된 항목 목록</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      총 {galleryCategories.length}개
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    수정 시 기존 사진의 카테고리도 자동 업데이트됩니다
                  </span>
                </div>

                <div className="space-y-2">
                  {galleryCategories.map((cat) => {
                    const count = gallery.filter((g) => g.category === cat).length;
                    const isEditing = editingCatName === cat;
                    const isDeleting = deletingCatName === cat;

                    return (
                      <div
                        key={cat}
                        className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 animate-in fade-in">
                            <input
                              type="text"
                              value={editCatInput}
                              onChange={(e) => setEditCatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(cat);
                                if (e.key === 'Escape') setEditingCatName(null);
                              }}
                              className="flex-1 p-2 bg-emerald-50/50 border border-emerald-400 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> 저장
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCatName(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> 취소
                            </button>
                          </div>
                        ) : isDeleting ? (
                          <div className="flex items-center justify-between w-full bg-red-50 p-2 rounded-xl border border-red-200 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span>'{cat}' 항목을 삭제하시겠습니까?</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingCatName(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {cat}
                              </span>
                              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 font-medium">
                                사진 {count}장
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="이름 수정"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">수정</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingCatName(cat);
                                  setEditingCatName(null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="항목 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span className="hidden sm:inline">삭제</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safe Preservation Note */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-1 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>데이터 & 저장 구조 안전 보존 안내</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  카테고리 항목의 수정 및 삭제는 클라우드 데이터베이스(Firestore)와 실시간으로 안전하게 동기화되며, 기존에 등록된 모든 사진 파일과 세부 정보는 영구히 안전하게 보존됩니다.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCatName(null);
                  setDeletingCatName(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
};

