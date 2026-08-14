import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { INITIAL_SETTINGS } from '../data/initialData';
import { getImageApiFallbackUrl } from '../utils/imageUrl';
import {
  Newspaper,
  Image as ImageIcon,
  Heart,
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  GraduationCap,
  Calendar,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Quote,
  Settings
} from 'lucide-react';

export const MainDashboardQuickPortal: React.FC = () => {
  const {
    notices,
    gallery,
    programs,
    settings,
    setActiveTab,
    setAboutSubTab,
    viewNoticeDetail,
    viewGalleryDetail,
    viewProgramDetail,
    getImageUrl,
    isAdmin,
    setAdminOpen
  } = useFoundation();

  // Get latest 3 notices
  const recentNotices = notices.slice(0, 3);
  
  // Get latest 3 gallery items
  const recentGallery = gallery.slice(0, 3);

  // Get top 4 core programs
  const topPrograms = programs.slice(0, 4);

  return (
    <div className="py-12 md:py-20 bg-[#FFFDF8] space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section 1: Notice & News Highlights (알림마당) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-100/80 px-2.5 py-1 rounded-md mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                <span>재단 소식 & 공지사항</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                너브내행복나눔재단 알림마당
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveTab('news');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-xl border border-orange-200 transition-all shrink-0"
            >
              <span>알림마당 전체보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => viewNoticeDetail(item)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-orange-500" /> 조회수 {item.views}
                  </span>
                  <span className="font-bold text-orange-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    자세히 보기 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Core Programs Quick Cards (주요사업) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>주요 공익 복지사업</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                너브내행복나눔재단의 핵심 사업
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveTab('programs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-all shrink-0"
            >
              <span>전체 사업 안내 페이지로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topPrograms.map((program) => (
              <div
                key={program.id}
                onClick={() => viewProgramDetail(program)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                      사업 0{program.code}
                    </span>
                    {program.badge && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {program.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                    {program.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {program.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
                  <span>사업 세부내용 확인</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2.5: Chairman Greeting & Vision Spotlight (메인페이지 이사장 인사말 & 비전) */}
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white rounded-3xl p-6 sm:p-10 border border-orange-200/80 shadow-md relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Chairman Photo Profile Box */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div className="w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 ring-2 ring-orange-200/60">
                  <img
                    src={getImageUrl(settings.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl)}
                    alt={`${settings.chairmanName} 이사장`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const originalUrl = settings.chairmanImageUrl;
                      if (originalUrl && !target.dataset.hasRetried) {
                        target.dataset.hasRetried = 'true';
                        target.src = getImageApiFallbackUrl(originalUrl);
                      } else if (INITIAL_SETTINGS.chairmanImageUrl && target.src !== INITIAL_SETTINGS.chairmanImageUrl) {
                        target.src = INITIAL_SETTINGS.chairmanImageUrl;
                      }
                    }}
                  />
                </div>
                <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2.5 rounded-xl shadow-lg">
                  <Quote className="w-5 h-5 fill-white" />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {settings.chairmanName} <span className="text-sm font-bold text-orange-600">이사장</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  사단법인 너브내행복나눔재단 대표
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setAdminOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 bg-orange-100/70 hover:bg-orange-100 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer mt-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>관리자 사진 수정</span>
                  </button>
                )}
              </div>
            </div>

            {/* Greeting & Message Content */}
            <div className="lg:col-span-8 space-y-5 text-slate-700">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold border border-orange-200">
                <Quote className="w-3.5 h-3.5 text-orange-600" />
                <span>이사장 인사말 & 나눔 비전</span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                "넓고 깊게 흐르는 너브내 강물처럼,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  홍천 이웃을 향한 따뜻한 온기와 희망
                </span>
                이 스며듭니다."
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4 sm:line-clamp-none">
                {settings.chairmanGreeting ? (
                  settings.chairmanGreeting.split('\n\n')[0] || settings.chairmanGreeting
                ) : (
                  "안녕하십니까. 사단법인 너브내 행복나눔재단 이사장 윤성일입니다. '너브내'라는 이름처럼 이웃을 향한 정과 사랑이 넓고 깊게 흘러, 우리 지역사회 곳곳에 따뜻하게 스며들기를 바라는 마음으로 너브내 행복나눔재단은 첫걸음을 내디뎠습니다. 복지 사각지대 이웃들의 곁을 지키는 든든한 버팀목이 되겠습니다."
                )}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('about');
                    setAboutSubTab('greeting');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span>이사장 인사말 전문 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('about');
                    setAboutSubTab('purpose');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl border border-slate-200 shadow-2xs transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>설립목적 및 연혁</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Photo Gallery Highlights (활동 갤러리) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md mb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>현장 생생 포토</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                따뜻한 나눔 현장 갤러리
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveTab('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-200 transition-all shrink-0"
            >
              <span>활동 갤러리 전체보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => viewGalleryDetail(item)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-slate-100">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 text-xs bg-slate-900/80 backdrop-blur-xs text-white font-bold px-2.5 py-1 rounded-md">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50">
                  <span>{item.date}</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    사진 크게보기 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Quick Portals for Foundation Info, Family Center & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card A: Foundation & Family Center */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                <Building2 className="w-3.5 h-3.5" />
                <span>위탁운영 기관 안내</span>
              </div>

              <h3 className="text-2xl font-extrabold text-white">
                홍천군가족센터 안내
              </h3>

              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                재단은 홍천군으로부터 홍천군가족센터를 수탁받아 다문화가족 및 관내 다양한 형태의 가족들에게 맞춤형 교육, 상담, 돌봄 서비스를 제공합니다.
              </p>

              <div className="pt-2 text-xs text-orange-100 space-y-1">
                <div>• 문의전화: <span className="font-bold text-white">{settings.familyCenterPhone || '033-433-1925'}</span> (FAX: {settings.familyCenterFax || '033-433-1910'})</div>
                <div>• 위치: 강원특별자치도 홍천군 홍천읍 산림조합길 12</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3 relative z-10">
              <button
                onClick={() => {
                  setActiveTab('family-center');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white hover:bg-orange-50 text-slate-900 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>가족센터 상세 안내</span>
                <ArrowRight className="w-4 h-4 text-orange-500" />
              </button>

              <a
                href="https://hongcheon.familynet.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-400/50 text-emerald-100 hover:text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                title="홍천군가족센터 공식 홈페이지 바로가기"
              >
                <span>가족센터 공식 홈페이지</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
              </a>

              <button
                onClick={() => {
                  setActiveTab('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-orange-700/60 hover:bg-orange-700/80 border border-white/30 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all"
              >
                재단 연혁 & 인사말
              </button>
            </div>
          </div>

          {/* Card B: Donation & Location Access */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                <span>함께 만드는 나눔</span>
              </div>

              <h3 className="text-2xl font-extrabold text-white">
                후원 참여 & 오시는 길
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                여러분의 정성 어린 후원금은 100% 투명하게 영수증이 발급되며, 홍천 관내 복지 사각지대 취약계층 장학금 및 생필품 지원에 쓰입니다.
              </p>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                {((settings.bankAccounts && settings.bankAccounts.length >= 2)
                  ? settings.bankAccounts
                  : [
                      { bank: '농협', accountNumber: '351-1040-2310-53', holder: '(사)너브내행복나눔재단' },
                      { bank: '신한은행', accountNumber: '100-026-882834', holder: '(사)너브내행복나눔재단' }
                    ]
                ).map((acc, idx) => (
                  <div key={idx}>
                    • 후원 계좌: <span className="font-bold text-amber-400">{acc.bank} {acc.accountNumber}</span> <span className="text-slate-300">(예금주: {acc.holder})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3 relative z-10">
              <button
                onClick={() => {
                  setActiveTab('donate');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>후원 안내 신청</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>오시는 길 (지도)</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
