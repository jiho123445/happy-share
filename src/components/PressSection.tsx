import React from 'react';
import { INITIAL_PRESS_COVERAGE } from '../data/pressCoverage';
import { Newspaper, Calendar, ExternalLink } from 'lucide-react';

export const PressSection: React.FC = () => {
  const items = [...INITIAL_PRESS_COVERAGE].sort((a, b) => (a.date < b.date ? 1 : -1));

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

        {/* Press List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="md:col-span-2 p-10 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              등록된 보도자료가 없습니다.
            </div>
          ) : (
            items.map((item) => (
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

      </div>
    </section>
  );
};
