import React, { useState } from 'react';
import { PartyPopper, Utensils, Trophy, Users, Sparkles, HeartHandshake, Globe2, Music, Calendar, MapPin, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { useFoundation } from '../context/FoundationContext';
import { INITIAL_PROGRAMS } from '../data/initialData';

export const AIFeatureShowcase: React.FC = () => {
  const { setActiveTab, viewProgramDetail, programs } = useFoundation();
  const [selectedTab, setSelectedTab] = useState<'programs' | 'history' | 'participation'>('programs');

  const FESTIVAL_HIGHLIGHTS = [
    {
      icon: <Globe2 className="w-6 h-6 text-pink-500" />,
      title: '세계 전통요리 & 문화 체험',
      subtitle: '아시아 10여 개국 전통 문화',
      desc: '베트남 쌀국수, 필리핀 룸피아, 캄보디아 록락 등 각국 전통 음식 시식과 아오자이 등 전통 의상 체험관을 운영합니다.',
      tag: '문화 체험'
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: '명랑운동회 & 한마음 체육대회',
      subtitle: '주민과 이주민이 함께하는 팀 스포츠',
      desc: '다문화가족과 지역 군민, 봉사자가 한 팀이 되어 대형 공굴리기, 단체 줄다리기, 신나는 릴레이 소통 게임을 펼칩니다.',
      tag: '체육 화합'
    },
    {
      icon: <Music className="w-6 h-6 text-purple-500" />,
      title: '다문화 장기자랑 & 축하 공연',
      subtitle: '어울림 무대와 감동의 공연',
      desc: '결혼이민자와 자녀들의 세계 전통 무용 공연, 군민 노래자랑 경연 및 초청 가수의 다채로운 축하 무대가 이어집니다.',
      tag: '공연 경연'
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      title: '모범가족 표창 & 장학금 전달',
      subtitle: '당당한 군민으로의 정착 격려',
      desc: '지역 사회 정착과 봉사에 이바지한 모범 다문화가족을 표창하고 다문화 자녀 대상 너브내 꿈나무 장학금을 전달합니다.',
      tag: '표창 장학'
    }
  ];

  const handleGoDetail = () => {
    const festivalProg = programs.find(p => p.code === '06') || INITIAL_PROGRAMS.find(p => p.code === '06');
    if (festivalProg) {
      viewProgramDetail(festivalProg);
    } else {
      setActiveTab('programs');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30 backdrop-blur-xs">
            <PartyPopper className="w-4 h-4 text-rose-400" />
            <span>(사)너브내행복나눔재단 & 홍천군가족센터 대표 축제</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            홍천 다문화가족 한마음 축제
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            2009년부터 다문화가족과 홍천군민이 서로의 문화를 공유하고 온 군민이 하나 되는 화합과 나눔의 대축제입니다.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FESTIVAL_HIGHLIGHTS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-rose-400/40 transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Festival Info Showcase Box */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-rose-300">연례 대표 행사 개요</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                세계 문화 가득한 너브내 다문화 한마당
              </h3>
            </div>

            {/* Segment Tab Buttons */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-bold">
              <button
                onClick={() => setSelectedTab('programs')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  selectedTab === 'programs' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                주요 프로그램
              </button>
              <button
                onClick={() => setSelectedTab('history')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  selectedTab === 'history' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                최근 개최 현황
              </button>
              <button
                onClick={() => setSelectedTab('participation')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  selectedTab === 'participation' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                참여 & 후원 안내
              </button>
            </div>
          </div>

          {/* Tab Content 1: Programs */}
          {selectedTab === 'programs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Utensils className="w-4 h-4" />
                  <span>세계 음식 체험 존</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  결혼이민자분들이 직접 준비한 국가별 고유 전통 요리를 현장에서 함께 맛보며 문화적 다양성을 존중합니다.
                </p>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>소통 & 체육 어울림</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  어린이부터 어르신까지 온 가족이 함께 참여하는 단체 레크리에이션과 명랑운동회로 웃음과 정을 나눕니다.
                </p>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <HeartHandshake className="w-4 h-4" />
                  <span>지역사회 포용 사회</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  홍천군, 홍천군가족센터, 지역 자원봉사 단체들이 다 함께 협력하여 따뜻한 공동체망을 만듭니다.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 2: History */}
          {selectedTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Calendar className="w-4 h-4" />
                    <span>제13회 홍천 다문화가족 한마음 축제</span>
                  </div>
                  <h4 className="text-base font-bold text-white">홍천 도시산림공원 토리숲 개최 (600여 명 참여)</h4>
                  <p className="text-xs text-slate-300">
                    (사)너브내행복나눔재단과 홍천군가족센터 공동 주관으로 세계 문화 체험관, 명랑운동회 및 장기자랑을 개최했습니다.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30">
                  토리숲 야외 무대
                </span>
              </div>

              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <Calendar className="w-4 h-4" />
                    <span>제14회 홍천 다문화가족 한마음 축제</span>
                  </div>
                  <h4 className="text-base font-bold text-white">홍천 관내 개최 예정 (세계 요리관 & 한마음 운동회)</h4>
                  <p className="text-xs text-slate-300">
                    홍천군이 주최하고 (사)너브내행복나눔재단이 주관하여 더 넓은 군민 소통 프로그램으로 펼쳐집니다.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30">
                  매년 10월 연례 개최
                </span>
              </div>
            </div>
          )}

          {/* Tab Content 3: Participation */}
          {selectedTab === 'participation' && (
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-3 animate-in fade-in duration-200">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>함께하는 다문화 한마음 축제 참여 방법</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                홍천 관내 다문화가족, 이주민, 자원봉사를 희망하는 홍천군민 및 후원자 누구나 자유롭게 축제에 참여하고 함께 봉사하실 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-600">
                  • 자원봉사 및 부스 운영 문의
                </span>
                <span className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-600">
                  • 세계 전통 의상 & 요리 찬조
                </span>
                <span className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-600">
                  • 다문화 장학금 후원
                </span>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>주최: 홍천군 · 주관: (사)너브내행복나눔재단 / 홍천군가족센터</span>
            </div>
            
            <button
              onClick={handleGoDetail}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>사업 상세 정보 보기</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export const MulticulturalFestivalShowcase = AIFeatureShowcase;
