import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Heart, ArrowRight, Waves, Sparkles, Building2, ShieldCheck, Users } from 'lucide-react';

export const Hero: React.FC = () => {
  const { settings, setActiveTab, getImageUrl } = useFoundation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-[#FFFDF8] pt-8 pb-16 md:pt-16 md:pb-24 border-b border-orange-100/40">
      {/* Background River Wave Graphic Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <svg
          className="absolute -top-24 left-0 w-[180%] h-[150%] text-orange-200/30 animate-wave-slow"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,192C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
        <svg
          className="absolute -bottom-24 left-0 w-[200%] h-[150%] text-emerald-200/20 animate-wave-fast"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M0,64L60,80C120,96,240,128,360,133.3C480,139,600,117,720,128C840,139,960,181,1080,186.7C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text & CTAs Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 text-orange-800 text-xs sm:text-sm font-semibold border border-orange-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>2009년부터 시작된 따뜻한 연결 · 홍천 복지 플랫폼</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.25] tracking-tight">
              모든 군민이 행복한 삶을 누리는 홍천,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600">
                너브내행복나눔재단
              </span>
              이 함께합니다.
            </h1>

            {/* Sub Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              넓고 깊은 강물처럼, 홍천에 따뜻한 나눔이 흐릅니다. 2009년 홍천다문화가정후원회로 출발하여 
              15년 넘게 쌓아온 신뢰를 바탕으로, 이제 홍천군민 모두의 행복을 위한 지역사회 복지 재단으로 걸어갑니다.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => {
                  setActiveTab('donate');
                  scrollToSection('donate-form');
                }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Heart className="w-5 h-5 fill-white" />
                <span>따뜻한 후원 참여하기</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('programs');
                  scrollToSection('programs-list');
                }}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all transform hover:-translate-y-0.5"
              >
                <span>우리의 사업 보기</span>
                <ArrowRight className="w-4 h-4 text-orange-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('about');
                  scrollToSection('about-greeting');
                }}
                className="text-sm font-semibold text-slate-600 hover:text-orange-600 underline underline-offset-4 px-2 py-1 transition-colors"
              >
                재단 이야기 자세히
              </button>
            </div>

            {/* Core Values Pill Row */}
            <div className="pt-4 border-t border-orange-100/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-orange-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> 투명한 재정 운영
              </span>
              <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-orange-100 shadow-2xs">
                <Users className="w-4 h-4 text-emerald-500" /> 다문화·취약계층 이웃 포용
              </span>
              <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-orange-100 shadow-2xs">
                <Building2 className="w-4 h-4 text-blue-600" /> 홍천군가족센터 위탁
              </span>
            </div>

          </div>

          {/* Right Visual Image Card Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <img
                  src={getImageUrl(settings.heroImageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80")}
                  alt="홍천지역 나눔 및 봉사활동 현장"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="inline-flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md mb-2 shadow-sm">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>홍천 군민과 함께하는 봉사 현장</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    "나눔이 흐르면, 홍천 곳곳에 따뜻한 행복이 피어납니다."
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    취약계층 식사 지원, 주거 환경 개선, 다문화 아동 장학금 나눔
                  </p>
                </div>
              </div>

              {/* Floating Badge 1 - 2009 History */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3 animate-bounce-slow hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  15+
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">2009년부터 지속</div>
                  <div className="text-[11px] text-slate-500">홍천 나눔 역사의 시작</div>
                </div>
              </div>

              {/* Floating Badge 2 - Family Center */}
              <div className="absolute -bottom-5 -right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">홍천군가족센터 위탁</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">가족복지 전문 운영</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
