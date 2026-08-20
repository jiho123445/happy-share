import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  accentClassName?: string; // e.g. 'bg-emerald-600' for the active page pill
}

/**
 * Numbered pagination bar with prev/next arrows and "..." collapsing for
 * long page ranges (e.g. "< 1 2 3 4 5 6 7 ... 14 >"). Shared by
 * GallerySection, NoticeSection, and PressSection so the three list pages
 * behave consistently.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  accentClassName = 'bg-emerald-600'
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm select-none">
            ...
          </span>
        ) : (
          <button
            type="button"
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={currentPage === p ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              currentPage === p ? `${accentClassName} text-white` : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="다음 페이지"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const delta = 2;
  const range: (number | '...')[] = [];
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  range.push(1);
  if (rangeStart > 2) range.push('...');
  for (let i = rangeStart; i <= rangeEnd; i++) range.push(i);
  if (rangeEnd < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}
