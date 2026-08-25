import React from 'react';
import { ACADEMY_INFO } from '../data/coursesData';
import { GraduationCap, Award, CheckCircle2, ShieldCheck, Laptop, Users, Building2, Clock, Sparkles } from 'lucide-react';

export const AcademyIntro: React.FC = () => {
  return (
    <section id="intro" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-3 border border-blue-200/60 shadow-sm">
            ABOUT JAHRD · SINCE 1999
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            홍천 중앙정보처리학원을 소개합니다
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            25년 역사를 이어온 강원도 홍천 지역 대표 컴퓨터 및 정보처리 교육의 명문입니다.
          </p>
        </div>

        {/* Director Message & History Banner in Glass Panel */}
        <div className="glass-panel-dark text-white rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl relative overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/60 backdrop-blur-md border border-blue-400/40 text-blue-100 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-blue-300" />
                <span>원장 인사말 (Director's Welcome)</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                "디지털 시대의 꿈을 현실로 만들어 드리는 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">홍천의 배움터</span>가 되겠습니다."
              </h3>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                홍천 중앙정보처리학원은 <strong>1999년 설립</strong>된 이래, 빠르게 변화하는 IT 기술 환경 속에서 
                지역 주민, 청소년, 구직자, 직장인, 그리고 어르신들까지 모두가 컴퓨터와 IT 자격증을 쉽고 즐겁게 
                배우실 수 있도록 정성을 다해왔습니다.
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                고용노동부 지정 <strong>국민내일배움카드 국비지원 기관</strong>으로서 부담 없는 수강료 혜택과 함께, 
                시험장과 동일한 1인 1대 최신 모니터 및 컴퓨터 실습 환경을 구축하여 수강생 여러분의 
                성공적인 자격증 취득과 취업을 끝까지 지원하겠습니다.
              </p>

              <div className="pt-2 text-sm font-bold text-blue-300">
                홍천 중앙정보처리학원 원장 및 임직원 일동
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4 text-center shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30">
                25+
              </div>
              <h4 className="text-lg font-bold text-white">27년 전통의 깊은 신뢰</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                1999년부터 지금까지 홍천군민 수만 명의 IT 정보화 교육 및 국가기술자격증 배출을 책임져 왔습니다.
              </p>
              <div className="pt-2 border-t border-white/10 text-xs font-semibold text-emerald-300">
                고용노동부 우수 국비훈련기관
              </div>
            </div>

          </div>
        </div>

        {/* 6 Key Advantages Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              중앙정보처리학원의 6가지 핵심 경쟁력
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACADEMY_INFO.features.map((feat, idx) => (
              <div
                key={idx}
                className="glass-card glass-card-hover p-6 rounded-3xl border border-white/70 shadow-lg"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm mb-4 border border-blue-200">
                  0{idx + 1}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Classroom & Learning Facility Highlights in Frosted Glass Panel */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-xl">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              CLASSROOM ENVIRONMENT
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              최상의 교육을 위한 실습 강의실 환경
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
              <Laptop className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 mb-1">1인 1대 최신 고사양 PC</h4>
              <p className="text-slate-600 text-xs">
                모든 강의실에 시험장 동일 사양 PC와 대형 와이드 모니터 구축
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 mb-1">소수 정예 1:1 눈높이</h4>
              <p className="text-slate-600 text-xs">
                초보자도 느리지 않게 진도를 따라올 수 있도록 친절한 밀착 클리닉
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
              <Clock className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-bold text-slate-900 mb-1">수강생 실습 자습실 개방</h4>
              <p className="text-slate-600 text-xs">
                강의 시간 외에도 언제든지 자유롭게 기출문제를 실습할 수 있는 개방 공간
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
