import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { NoticeItem } from '../types';
import { Newspaper, Search, Eye, Calendar, Pin, FileText, ChevronRight, Paperclip } from 'lucide-react';

export const NoticeSection: React.FC = () => {
  const { notices, viewNoticeDetail, noticeCategory, setNoticeCategory } = useFoundation();
  const selectedCategory = noticeCategory || '전체';
  const setSelectedCategory = (cat: string) => setNoticeCategory(cat);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const CATEGORIES = ['전체', '공지사항', '재단소식', '사업소식', '후원소식', '모집공고', '보도자료'];

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = selectedCategory === '전체' || notice.category === selectedCategory;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNoticeClick = (notice: NoticeItem) => {
    viewNoticeDetail(notice);
  };

  return (
    <section id="notices-section" className="py-16 md:py-24 bg-[#FFFDF8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Newspaper className="w-4 h-4 text-orange-600" />
            <span>재단 알림마당</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            공지사항 및 소식
          </h2>
          <p className="text-base text-slate-600">
            너브내행복나눔재단의 최근 소식과 모집공고, 투명한 후원 현황을 안내합니다.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="공지글 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

        </div>

        {/* List View */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200">
            <div className="col-span-2">구분</div>
            <div className="col-span-7">제목</div>
            <div className="col-span-2 text-center">작성일</div>
            <div className="col-span-1 text-center">조회수</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredNotices.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                등록된 공지글이 없거나 검색 결과가 없습니다.
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice)}
                  className={`p-4 sm:px-6 sm:py-4 transition-colors cursor-pointer hover:bg-orange-50/50 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 items-start sm:items-center ${
                    notice.isImportant ? 'bg-amber-50/40' : ''
                  }`}
                >
                  
                  {/* Category Column */}
                  <div className="col-span-2 flex items-center gap-2">
                    {notice.isImportant && (
                      <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        <Pin className="w-3 h-3" /> 필독
                      </span>
                    )}
                    <span className="text-xs font-bold text-orange-700 bg-orange-100/80 px-2.5 py-0.5 rounded border border-orange-200">
                      {notice.category}
                    </span>
                  </div>

                  {/* Title Column */}
                  <div className="col-span-7 font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between group gap-2">
                    <span className="group-hover:text-orange-600 transition-colors line-clamp-1">
                      {notice.title}
                    </span>
                    {(notice.attachments !== undefined ? notice.attachments.length > 0 : !!notice.attachmentName) ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 bg-orange-100/80 border border-orange-200/80 px-2 py-0.5 rounded-full shrink-0">
                        <Paperclip className="w-3 h-3 text-orange-600" />
                        <span>첨부 {notice.attachments ? notice.attachments.length : 1}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Date Column */}
                  <div className="col-span-2 text-xs text-slate-500 sm:text-center flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:hidden text-slate-400" />
                    <span>{notice.date}</span>
                  </div>

                  {/* Views Column */}
                  <div className="col-span-1 text-xs text-slate-400 sm:text-center flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 sm:hidden text-slate-400" />
                    <span>{notice.views}</span>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
