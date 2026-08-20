import React from 'react';

interface YearFilterProps {
  years: string[]; // sorted descending, e.g. ['2026', '2025', '2024']
  selectedYear: string; // '전체' or a year string
  onChange: (year: string) => void;
  focusRingClassName?: string; // e.g. 'focus:border-emerald-500'
}

/**
 * Simple year dropdown shared by GallerySection, NoticeSection, and
 * PressSection. Always includes a "전체" (all years) option first.
 */
export const YearFilter: React.FC<YearFilterProps> = ({
  years,
  selectedYear,
  onChange,
  focusRingClassName = 'focus:border-emerald-500'
}) => {
  if (years.length === 0) return null;

  return (
    <select
      value={selectedYear}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none ${focusRingClassName} focus:bg-white cursor-pointer`}
      aria-label="연도별 필터"
    >
      <option value="전체">전체 연도</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}년
        </option>
      ))}
    </select>
  );
};

/**
 * Extracts a descending, de-duplicated list of 4-digit years from an
 * array of items that have a `date` field in `YYYY-MM-DD` (or any
 * string starting with a 4-digit year) format. Malformed dates are
 * skipped rather than throwing.
 */
export function extractYears(items: Array<{ date?: string }>): string[] {
  const years = new Set<string>();
  items.forEach((item) => {
    const match = item.date?.match(/^(\d{4})/);
    if (match) years.add(match[1]);
  });
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}
