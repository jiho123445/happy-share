import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { INITIAL_SETTINGS } from '../data/initialData';
import { AboutSubTab } from '../types';
import {
  Heart,
  Waves,
  Users,
  Building2,
  Quote,
  Sparkles,
  History,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Award,
  BookOpen,
  ArrowRight,
  Phone,
  MapPin,
  Siren,
  Settings,
  Camera
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings, timeline, aboutSubTab, setAboutSubTab, setActiveTab, setAdminOpen, isAdmin } = useFoundation();

  const handleSubTabChange = (tab: AboutSubTab) => {
    setAboutSubTab(tab);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="py-10 md:py-16 bg-[#FFFDF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => setActiveTab('main')} className="hover:text-orange-600">홈</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-orange-600 font-bold">재단소개</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">
            {aboutSubTab === 'greeting' && '이사장 인사말'}
            {aboutSubTab === 'purpose' && '설립목적 및 정체성'}
            {aboutSubTab === 'history' && '재단 연혁'}
            {aboutSubTab === 'organization' && '조직도 및 위탁기관'}
          </span>
        </div>

        {/* Section Title Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Waves className="w-4 h-4 text-orange-600" />
            <span>사단법인 너브내행복나눔재단 소개</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            사람을 향한 따뜻한 마음,
            <br />
            홍천을 보듬는 행복의 강물
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            너브내행복나눔재단은 지역 이웃과 다문화 가정, 어린이와 어르신 모두가 당당하고 행복하게 살아가도록 함께합니다.
          </p>
        </div>

        {/* Sub Navigation Bar (Tab Menu) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              onClick={() => handleSubTabChange('greeting')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                aboutSubTab === 'greeting'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Quote className="w-4 h-4" />
              <span>이사장 인사말</span>
            </button>

            <button
              onClick={() => handleSubTabChange('purpose')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                aboutSubTab === 'purpose'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>설립목적 & 정체성</span>
            </button>

            <button
              onClick={() => handleSubTabChange('history')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                aboutSubTab === 'history'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <History className="w-4 h-4" />
              <span>재단 연혁</span>
            </button>

            <button
              onClick={() => handleSubTabChange('organization')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                aboutSubTab === 'organization'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>조직도 & 위탁기관</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content View based on aboutSubTab */}
        <div className="pt-2">

          {/* SUB-PAGE 1: 이사장 인사말 */}
          {aboutSubTab === 'greeting' && (
            <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-200 space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Photo & Profile */}
                <div className="lg:col-span-4 text-center space-y-4 lg:sticky lg:top-28">
                  <div className="relative inline-block mx-auto">
                    <div className="w-56 h-64 sm:w-64 sm:h-72 rounded-2xl overflow-hidden shadow-xl border-4 border-orange-100 mx-auto bg-slate-100">
                      <img
                        src={settings.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl}
                        alt={`${settings.chairmanName} 이사장`}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== INITIAL_SETTINGS.chairmanImageUrl && INITIAL_SETTINGS.chairmanImageUrl) {
                            target.src = INITIAL_SETTINGS.chairmanImageUrl;
                          }
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-xl shadow-lg">
                      <Quote className="w-6 h-6 fill-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-extrabold text-slate-900">
                      {settings.chairmanName} <span className="text-sm font-semibold text-orange-600">이사장</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      사단법인 너브내행복나눔재단 대표
                    </p>

                    {isAdmin && (
                      <div className="pt-2">
                        <button
                          onClick={() => setAdminOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-orange-200 font-bold transition-all cursor-pointer"
                          title="관리자 모드에서 이사장 사진 및 인사말 수정"
                        >
                          <Settings className="w-3.5 h-3.5 text-orange-500" />
                          <span>사진/인사말 수정</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Message Body */}
                <div className="lg:col-span-8 space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <div className="inline-block bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-md border border-orange-200">
                    이사장 환영사 & 나눔 철학
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    "넓고 깊게 흐르는 너브내 강물처럼,
                    <br />
                    이웃을 향한 온기와 희망이 따뜻하게 스며듭니다."
                  </h2>
                  
                  <div className="space-y-4 text-slate-700 leading-relaxed">
                    {settings.chairmanGreeting ? (
                      <div className="space-y-4 text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {settings.chairmanGreeting}
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-slate-900 text-base sm:text-lg">
                          안녕하십니까. 사단법인 너브내 행복나눔재단 이사장 윤성일입니다.
                        </p>

                        <p>
                          먼저 바쁘신 가운데 저희 재단 홈페이지를 찾아주신 후원자님, 자원봉사자님, 그리고 지역주민 여러분께 진심으로 감사의 인사를 드립니다.
                        </p>

                        <p>
                          <strong>'너브내'</strong>라는 이름은 넓고 깊게 흐르는 물줄기를 뜻하는 우리말입니다. 그 이름처럼 이웃을 향한 정과 사랑이 넓고 깊게 흘러, 우리 지역사회 곳곳에 따뜻하게 스며들기를 바라는 마음으로 너브내 행복나눔재단은 첫걸음을 내디뎠습니다.
                        </p>

                        <p>
                          오늘도 복지의 손길이 미처 닿지 못한 곳에서 외로움과 어려움을 겪고 계신 이웃들이 적지 않습니다. 저희 재단은 작은 나눔이 모여 커다란 희망의 물결을 이룬다는 믿음으로, 그러한 이웃들의 곁을 지키는 든든한 버팀목이 되고자 합니다.
                        </p>

                        {/* 3 Pillars Highlight Box */}
                        <div className="bg-amber-50/80 p-6 rounded-2xl border-l-4 border-orange-500 space-y-3 my-6">
                          <p className="font-extrabold text-slate-900 text-sm sm:text-base">
                            저희 재단은 다음과 같은 마음으로 걸어가고 있습니다.
                          </p>
                          
                          <div className="space-y-2.5 text-xs sm:text-sm">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-orange-600 shrink-0">• 소외된 이웃과의 동행:</span>
                              <span className="text-slate-800">어르신, 다문화 가정, 취약계층 아동·청소년 등 복지 사각지대에 놓인 이웃들을 꾸준히 찾아 나서고, 실질적인 도움을 드리기 위해 노력하고 있습니다.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-orange-600 shrink-0">• 투명하고 성실한 법인 운영:</span>
                              <span className="text-slate-800">여러분께서 보내주신 따뜻한 정성이 가장 필요한 곳에 정직하게 전달될 수 있도록, 투명성과 공정성을 최우선 가치로 삼고 있습니다.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-orange-600 shrink-0">• 지역사회와 함께하는 나눔 문화 확산:</span>
                              <span className="text-slate-800">모두가 서로를 돌보고 온기를 나누는 행복한 공동체를 만드는 일에 앞장서고자 합니다.</span>
                            </div>
                          </div>
                        </div>

                        <p>
                          혼자 가면 빠른 길이 될 수 있지만, 함께 가면 더 멀리, 그리고 더 따뜻하게 갈 수 있습니다. 여러분의 관심과 참여 하나하나가 우리 이웃들에게는 삶을 살아갈 큰 용기와 희망이 됩니다.
                        </p>

                        <p>
                          너브내 행복나눔재단이 지역사회의 빛과 소금이 되는 그 여정에 앞으로도 늘 함께해 주시기를 부탁드리며, 이 자리를 찾아주신 모든 분들의 가정에 건강과 행복이 가득하시기를 진심으로 기원합니다.
                        </p>

                        <p className="font-semibold text-slate-800 pt-2">
                          감사합니다.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs sm:text-sm text-slate-500 border-t border-slate-100">
                    <div>사단법인 너브내행복나눔재단 임직원 일동</div>
                    <div className="font-bold text-slate-900 text-base">
                      사단법인 너브내 행복나눔재단 이사장 <span className="text-orange-600 font-extrabold">{settings.chairmanName}</span> 올림
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-PAGE 2: 설립목적 및 정체성 */}
          {aboutSubTab === 'purpose' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Etymology & Vision Banner */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white">
                  <Waves className="w-4 h-4 text-white" />
                  <span>'너브내' 어원과 재단 명칭</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    '너브내'는 넓고 깊게 흐르는 홍천의 옛 이름입니다
                  </h2>
                  <p className="text-sm sm:text-base text-orange-100 max-w-3xl leading-relaxed">
                    ‘너브내’는 너른 천(川)을 뜻하는 Pure Korean 순우리말입니다. 
                    가뭄에도 마르지 않고 마을 곳곳을 어루만지며 흐르는 강물처럼, 
                    복지 사각지대에 놓인 이웃들의 삶 속에 따뜻한 희망과 행복을 지속적으로 퍼뜨리고자 하는 소명을 담고 있습니다.
                  </p>
                </div>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">포용적 맞춤 복지 실천</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    다문화가정, 한부모가족, 독거어르신, 장애인 등 도움의 손길이 필요한 모든 계층에게 맞춤형 복지 서비스를 전달합니다.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">미래 꿈나무 인재 육성</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    경제적 여건 때문에 학업을 포기하지 않도록 초·중·고등학생 대상 '꿈나무 장학금'을 매년 지속적으로 배분합니다.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">지역 연대 및 민관협력</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    홍천군청, 복지관, 후원단체 및 자원봉사자와 단단하게 연대하여 복지 사각지대를 적극 발굴하고 해소합니다.
                  </p>
                </div>
              </div>

              {/* 7 Core Values Grid */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    너브내행복나눔재단의 7가지 핵심 가치
                  </h3>
                  <p className="text-xs text-slate-500">
                    재단의 임직원과 자원봉사자가 지켜나가는 행동 기준입니다
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: '나눔', desc: '아낌없는 이웃 사랑', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    { label: '행복', desc: '군민 삶의 질 향상', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                    { label: '상생', desc: '지역사회 동반 성장', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { label: '포용', desc: '다양성 존중과 통합', color: 'bg-teal-50 text-teal-700 border-teal-200' },
                    { label: '가족', desc: '건강한 가정 기틀', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { label: '지역사회', desc: '홍천 기반 실천', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                    { label: '함께하는 변화', desc: '지속가능 미래', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  ].map((v, i) => (
                    <div key={i} className={`p-4 rounded-2xl border text-center font-bold ${v.color} hover:scale-105 transition-transform`}>
                      <div className="text-sm font-extrabold">{v.label}</div>
                      <div className="text-[10px] font-normal opacity-80 mt-1">{v.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SUB-PAGE 3: 재단 연혁 */}
          {aboutSubTab === 'history' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md">
                    2026년 ~ 2009년
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    너브내행복나눔재단 걸어온 길 (연혁)
                  </h2>
                </div>
                <div className="text-xs text-slate-500">
                  15년 넘게 홍천 이웃과 함께 동행해 온 나눔의 소중한 발자취입니다.
                </div>
              </div>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-200 space-y-8">
                {timeline.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-5 h-5 rounded-full bg-white border-4 border-orange-500 group-hover:scale-125 transition-transform" />

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-orange-300 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-orange-600 bg-orange-100/80 px-3 py-0.5 rounded-lg border border-orange-200">
                          {item.year.endsWith('년') ? item.year : `${item.year}년`}
                        </span>
                        {item.isMilestone && (
                          <span className="text-[11px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded shadow-2xs">
                            주요 도약 시점
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PAGE 4: 조직도 및 위탁기관 */}
          {aboutSubTab === 'organization' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Organization Chart Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
                <div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md">
                    재단 수평적 조직망
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    너브내행복나눔재단 조직도
                  </h2>
                </div>

                {/* Visual Organization Tree */}
                <div className="max-w-3xl mx-auto space-y-6 text-center">
                  
                  {/* Top Level: Board & Chairman */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-5 shadow-lg max-w-md mx-auto space-y-1">
                    <div className="text-xs font-bold opacity-90">의결 및 총괄 기구</div>
                    <div className="text-lg font-extrabold">이사회 / 이사장 ({settings.chairmanName})</div>
                  </div>

                  <div className="w-0.5 h-6 bg-orange-300 mx-auto" />

                  {/* Middle Level: Advisory & Steering */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="bg-slate-100 rounded-xl p-3 border border-slate-300 text-slate-800 text-xs font-bold">
                      자문위원회 (복지·법률·의료)
                    </div>
                    <div className="bg-slate-100 rounded-xl p-3 border border-slate-300 text-slate-800 text-xs font-bold">
                      감사 기구 (회계 및 사업감사)
                    </div>
                  </div>

                  <div className="w-0.5 h-6 bg-orange-300 mx-auto" />

                  {/* Operational Core: Secretariat */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md max-w-lg mx-auto space-y-1">
                    <div className="text-xs text-orange-400 font-bold">집행 총괄</div>
                    <div className="text-base font-extrabold">사무국(상임이사)</div>
                  </div>

                  <div className="w-0.5 h-6 bg-orange-300 mx-auto" />

                  {/* Department Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 space-y-1">
                      <div className="font-extrabold text-xs text-orange-700">기획·나눔사업팀</div>
                      <div className="text-[11px] text-slate-600">장학금 기획, 후원금 관리, 긴급구호</div>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-1">
                      <div className="font-extrabold text-xs text-emerald-700">복지시설·배분팀</div>
                      <div className="text-[11px] text-slate-600">시설 공모사업, 물품 배분, 봉사 연계</div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-1">
                      <div className="font-extrabold text-xs text-blue-700">홍천군가족센터 (수탁)</div>
                      <div className="text-[11px] text-slate-600">다문화 및 가족맞춤 복지 수탁 운영</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Family Center Sub-agency Callout */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                    수탁운영 기관
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    홍천군가족센터
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    재단은 홍천군으로부터 홍천군가족센터를 위탁 운영받아 지역 사회 모든 가족의 건강한 가정 형성 및 다문화 이주민 정착을 종합 지원합니다.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('family-center');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  <span>가족센터 상세 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
