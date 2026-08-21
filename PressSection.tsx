import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Pagination } from './Pagination';
import { YearFilter, extractYears } from './YearFilter';
import { Newspaper, Calendar, ExternalLink, Search } from 'lucide-react';

export const PressSection: React.FC = () => {
  const { pressItems } = useFoundation();
  const sortedItems = [...pressItems].sort((a, b) => (a.date < b.date ? 1 : -1));

  const [selectedYear, setSelectedYear] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 9;

  const items = sortedItems.filter((item) => {
    const matchesYear = selectedYear === '전체' || item.date?.startsWith(selectedYear);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outlet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const availableYears = extractYears(sortedItems);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section id="press-section" className="py-16 md:py-24 bg-[#FFFDF8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Newspaper className="w-4 h-4 text-orange-600" />
            <span>언론 보도</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            보도자료
          </h2>
          <p className="text-base text-slate-600">
            너브내행복나눔재단의 활동이 소개된 언론 보도를 모았습니다. 각 기사는 해당 언론사 원문으로 연결됩니다.
          </p>
        </div>

        {/* Filter Bar: year + search */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <YearFilter years={availableYears} selectedYear={selectedYear} onChange={setSelectedYear} focusRingClassName="focus:border-orange-500" />
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="제목 또는 언론사 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Press List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="md:col-span-2 p-10 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              등록된 보도자료가 없습니다.
            </div>
          ) : (
            paginatedItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all p-5 sm:p-6 flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-orange-700 bg-orange-100/80 px-2.5 py-0.5 rounded border border-orange-200 shrink-0">
                    {item.outlet}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-orange-600">
                  <span>기사 원문 보기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          accentClassName="bg-orange-600"
        />

      </div>
    </section>
  );
};
