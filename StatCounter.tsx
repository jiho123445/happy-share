import React from 'react';
import { Calendar, Award, Heart, Users, Sparkles, AlertCircle } from 'lucide-react';

export const StatCounter: React.FC = () => {
  return (
    <section className="bg-white py-12 border-b border-slate-100 shadow-2xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>신뢰와 책임의 나눔 기록</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            숫자로 보는 너브내행복나눔재단
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            2009년 첫 발걸음부터 2024년 정식 재단으로 발돋움하기까지, 홍천 군민과 함께했습니다.
          </p>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Stat 1 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 sm:p-6 rounded-2xl border border-orange-100/80 text-center hover:shadow-md transition-shadow relative group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              2009<span className="text-orange-500 text-xl font-bold">년</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">나눔의 첫 시작</div>
            <p className="text-[11px] text-slate-500 mt-0.5">홍천다문화가정후원회 출범</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 sm:p-6 rounded-2xl border border-emerald-100/80 text-center hover:shadow-md transition-shadow relative group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              15<span className="text-emerald-600 text-xl font-bold">년+</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">지속적인 지역 활동</div>
            <p className="text-[11px] text-slate-500 mt-0.5">장관상 2회 & 선행도민대상</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 sm:p-6 rounded-2xl border border-blue-100/80 text-center hover:shadow-md transition-shadow relative group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              2024<span className="text-blue-600 text-xl font-bold">년</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">재단으로 도약</div>
            <p className="text-[11px] text-slate-500 mt-0.5">너브내행복나눔재단 정식 출범</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50/60 p-5 sm:p-6 rounded-2xl border border-purple-100/80 text-center hover:shadow-md transition-shadow relative group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              수많은 가정
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">함께 만든 따뜻함</div>
            <p className="text-[11px] text-slate-500 mt-0.5">홍천 관내 복지기관 협력</p>
          </div>

        </div>

        {/* Fact Policy Notice Box (Rule #28 Mandate) */}
        <div className="mt-6 bg-slate-50 rounded-xl p-3 px-4 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              <strong>[안내]</strong> 실제 정확한 누적 수혜 가구 수 및 후원 총액 등 통계 데이터는 관리자 시스템을 통해 업데이트 및 정식 공시됩니다.
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
            정확한 정보 준수
          </span>
        </div>

      </div>
    </section>
  );
};
