import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { ProgramItem } from '../types';
import {
  GraduationCap,
  HeartHandshake,
  Home,
  Users,
  Building2,
  Cpu,
  PartyPopper,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-6 h-6 text-orange-500" />,
  HeartHandshake: <HeartHandshake className="w-6 h-6 text-red-500" />,
  Home: <Home className="w-6 h-6 text-amber-500" />,
  Users: <Users className="w-6 h-6 text-emerald-500" />,
  Building2: <Building2 className="w-6 h-6 text-blue-500" />,
  Cpu: <Cpu className="w-6 h-6 text-purple-500" />,
  PartyPopper: <PartyPopper className="w-6 h-6 text-pink-500" />,
};

export const ProgramsSection: React.FC = () => {
  const { programs, viewProgramDetail } = useFoundation();

  return (
    <section id="programs-list" className="py-16 md:py-24 bg-[#FFFDF8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>재단의 핵심 6대 공익사업</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            홍천의 행복을 만들어가는 따뜻한 사업들
          </h2>
          <p className="text-base text-slate-600">
            아동 장학금부터 긴급 생계지원, 이주민 AI 교육, 관내 복지시설 배분사업까지 다각적 복지를 제공합니다.
          </p>
        </div>

        {/* 6 Major Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              id={program.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200/80 hover:shadow-xl hover:border-orange-300 transition-all group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Background watermark number */}
              <div className="absolute top-2 right-4 text-6xl font-black text-slate-100/80 pointer-events-none group-hover:text-orange-100/80 transition-colors">
                {program.code}
              </div>

              <div className="space-y-4 relative z-10">
                
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-orange-50 group-hover:border-orange-200 transition-colors">
                    {ICON_MAP[program.iconName] || <Sparkles className="w-6 h-6 text-orange-500" />}
                  </div>
                  {program.badge && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      {program.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div className="text-xs font-semibold text-orange-600">
                    사업 0{program.code}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 italic">
                    "{program.subtitle}"
                  </p>
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {program.summary}
                </p>

                {/* Bullet Highlights */}
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {program.details.slice(0, 2).map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                  {program.details.length > 2 && (
                    <li className="text-[11px] text-slate-400 pl-5">
                      외 {program.details.length - 2}개 지원 항목...
                    </li>
                  )}
                </ul>

              </div>

              {/* Card Footer Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                <span className="text-[11px] text-slate-500 font-medium">
                  {program.targetAudience}
                </span>

                <button
                  onClick={() => viewProgramDetail(program)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <span>자세히 보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Highlight Banner: 너브내행복나눔 배분사업 Focus */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block bg-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
              배분사업 공모 및 기관 연계
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              "너브내행복나눔 배분사업"으로 관내 복지기관을 지원합니다
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              단순 일회성 전달을 넘어 장애인복지관, 노인복지관, 지역아동센터 등 관내 복지 인프라가 더 질 높은 복지 서비스를 제공할 수 있도록 사업비를 배분·지원합니다.
            </p>
          </div>

          <button
            onClick={() => {
              const item = programs.find(p => p.code === '05');
              if (item) viewProgramDetail(item);
            }}
            className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md"
          >
            배분사업 상세 보기
          </button>
        </div>

      </div>
    </section>
  );
};
