import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Award, Calendar, ChevronRight, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const { timeline } = useFoundation();

  return (
    <section id="about-timeline" className="py-16 md:py-24 bg-slate-50 relative overflow-hidden border-t border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>역사와 발자취</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            우리가 걸어온 15년의 나눔 길
          </h2>
          <p className="text-base text-slate-600">
            2009년 다문화가정 후원회에서 2024년 너브내행복나눔재단으로 이어지는 나눔의 역사입니다.
          </p>
        </div>

        {/* Awards Highlight Spotlight Banner */}
        <div id="about-awards" className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-amber-200" />
                <span>주요 수상 및 사회적 공로</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                정부 및 지자체로부터 인정받은 신뢰
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
                지역사회를 위해 변함없이 진심을 다해 봉사해 온 공로로 다수의 장관상과 대표적인 표창을 수상했습니다.
              </p>
            </div>

            {/* 3 Award Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center">
                <div className="text-xs font-bold text-amber-200">2016년</div>
                <div className="text-sm font-extrabold text-white mt-0.5">행정자치부장관상</div>
                <div className="text-[10px] text-orange-100 mt-1">지역 나눔 봉사 공로</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center">
                <div className="text-xs font-bold text-amber-200">2017년</div>
                <div className="text-sm font-extrabold text-white mt-0.5">여성가족부장관상</div>
                <div className="text-[10px] text-orange-100 mt-1">다문화가족 자립 조성</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center">
                <div className="text-xs font-bold text-amber-200">2019년</div>
                <div className="text-sm font-extrabold text-white mt-0.5">강원도 선행도민대상</div>
                <div className="text-[10px] text-orange-100 mt-1">이웃사랑 헌신 표창</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Flowing Timeline */}
        <div className="relative border-l-2 border-orange-200 ml-4 sm:ml-32 space-y-12">
          {timeline.map((item, index) => (
            <div key={index} className="relative pl-8 sm:pl-10 group">
              
              {/* Year Marker Badge on left side for wide view */}
              <div className="hidden sm:flex absolute -left-32 top-0 w-24 justify-end text-right">
                <span className={`text-base font-extrabold px-2.5 py-1 rounded-lg shadow-2xs border ${
                  item.category === '법인전환'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : item.category === '수상'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}>
                  {item.year}
                </span>
              </div>

              {/* Timeline Bullet Icon */}
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-md transition-transform group-hover:scale-125 ${
                item.category === '법인전환'
                  ? 'bg-orange-500 text-white'
                  : item.category === '수상'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-slate-900'
              }`}>
                {item.category === '수상' ? <Award className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Mobile Year Badge */}
              <div className="sm:hidden inline-block mb-1 font-bold text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                {item.year.endsWith('년') ? item.year : `${item.year}년`}
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 hover:shadow-lg transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      {item.subtitle || '나눔의 기록'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                      {item.title}
                    </h3>
                  </div>

                  {item.awardBadge && (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      {item.awardBadge}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
