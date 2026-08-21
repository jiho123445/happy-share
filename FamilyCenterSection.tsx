import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { INITIAL_SETTINGS } from '../data/initialData';
import { Building2, Users, Heart, Sparkles, BookOpen, ShieldCheck, ExternalLink, Phone, MapPin } from 'lucide-react';

export const FamilyCenterSection: React.FC = () => {
  const { settings } = useFoundation();

  return (
    <section id="family-center" className="py-16 md:py-24 bg-gradient-to-b from-emerald-50/60 via-teal-50/20 to-[#FFFDF8] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>위탁운영 기관 공식 안내</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            홍천군가족센터
          </h2>
          <p className="text-base text-slate-600 break-keep sm:whitespace-nowrap">
            사단법인 너브내행복나눔재단은 홍천군가족센터를 위탁 운영하며 홍천 관내 모든 가족의 건강한 성장을 다각도로 지원합니다.
          </p>
        </div>

        {/* Feature Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-100 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md">
                모든 가족이 더불어 행복한 홍천
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                <span className="inline-block -ml-[0.42em]">“</span>{settings.familyCenterQuote || INITIAL_SETTINGS.familyCenterQuote}”
              </h3>

              <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                {settings.familyCenterDescription || INITIAL_SETTINGS.familyCenterDescription}
              </p>

              {/* Official Website Link Button */}
              <div className="pt-1">
                <a
                  href="https://hongcheon.familynet.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all group"
                  title="홍천군가족센터 공식 홈페이지 새창으로 열기"
                >
                  <Building2 className="w-5 h-5 text-emerald-200" />
                  <span>홍천군가족센터 공식 홈페이지 바로가기</span>
                  <ExternalLink className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(() => {
                  const features = settings.familyCenterFeatures || INITIAL_SETTINGS.familyCenterFeatures || [];
                  const icons = [Users, Heart, BookOpen, ShieldCheck];
                  return features.slice(0, 4).map((feature, idx) => {
                    const Icon = icons[idx] || Users;
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-xs sm:text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-emerald-600" /> {feature.title}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {feature.description}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>

            </div>

            {/* Right Photo Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-emerald-50">
                <img
                  src={settings.familyCenterImageUrl || INITIAL_SETTINGS.familyCenterImageUrl}
                  alt="홍천군가족센터 수강 현장"
                  loading="lazy"
                  className="w-full h-72 object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (INITIAL_SETTINGS.familyCenterImageUrl && target.src !== INITIAL_SETTINGS.familyCenterImageUrl) {
                      target.src = INITIAL_SETTINGS.familyCenterImageUrl;
                    }
                  }}
                />
              </div>

              <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-3 shadow-md border border-emerald-800">
                <div className="text-xs text-emerald-300 font-bold flex items-center justify-between">
                  <span>홍천군가족센터 이용 문의</span>
                  <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold">홍천군 위탁</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>전화: {settings.familyCenterPhone || '033-433-1925'} | FAX: {settings.familyCenterFax || '033-433-1910'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-100">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>위치: {settings.familyCenterAddress || INITIAL_SETTINGS.familyCenterAddress}</span>
                </div>
                
                <a
                  href="https://hongcheon.familynet.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm mt-1"
                >
                  <span>가족센터 공식 홈페이지 방문</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
