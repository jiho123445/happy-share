import React from 'react';
import { ACADEMY_INFO } from '../data/coursesData';
import { MapPin, Phone, Mail, Printer, Bus, Car, ExternalLink, Navigation } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent('홍천 중앙정보처리학원')}`;
  const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent('홍천 중앙정보처리학원')}`;

  return (
    <section id="location" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-3 border border-blue-200/60 shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
            LOCATION & DIRECTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            오시는 길 & 위치 안내
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            홍천여자고등학교 인근 및 버스터미널 근처로 접근성이 뛰어난 곳에 위치해 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column in Frosted Glass */}
          <div className="lg:col-span-5 bg-white/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-blue-100/80 text-blue-700 flex-shrink-0 border border-blue-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold uppercase">학원 주소</h3>
                  <p className="font-black text-slate-900 text-base mt-0.5">
                    {ACADEMY_INFO.address}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    (홍천여자고등학교 인근 중앙약국 맞은편)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-blue-100/80 text-blue-700 flex-shrink-0 border border-blue-200">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold uppercase">대표 전화 / FAX</h3>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    TEL: {ACADEMY_INFO.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FAX: {ACADEMY_INFO.fax}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-blue-100/80 text-blue-700 flex-shrink-0 border border-blue-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold uppercase">이메일 문의</h3>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {ACADEMY_INFO.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 space-y-3">
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <Bus className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">대중교통 버스 안내</p>
                  <p className="text-slate-600">{ACADEMY_INFO.busInfo}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-700">
                <Car className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">주차 안내</p>
                  <p className="text-slate-600">
                    인근 중앙시장 공영주차장 및 학원 수강생 주차 공간 이용 가능
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Map Navigation Links */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <a
                href={naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>네이버 길찾기</span>
              </a>

              <a
                href={kakaoMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>카카오맵 길찾기</span>
              </a>
            </div>

          </div>

          {/* Right Column: Custom Visual Map Display */}
          <div className="lg:col-span-7 bg-white/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/80 shadow-xl space-y-4">
            
            <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
              
              {/* Map Illustration / Visual Badge */}
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-300 animate-bounce mb-3">
                <MapPin className="w-8 h-8" />
              </div>

              <span className="px-3.5 py-1 bg-blue-100 text-blue-800 font-black text-xs rounded-full mb-2 border border-blue-200">
                홍천 중앙정보처리학원
              </span>

              <h4 className="text-lg font-black text-slate-900">
                강원도 홍천군 홍천읍 신장대로 48 (2층)
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mt-1 font-medium">
                홍천여자고등학교 인근 중앙약국 맞은편 건물 2층 위치
              </p>

              {/* Map Action Buttons overlay */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <a
                  href={`tel:${ACADEMY_INFO.phoneClean}`}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>위치 문의 전화: {ACADEMY_INFO.phone}</span>
                </a>
              </div>

              {/* Background Grid Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 backdrop-blur-sm border border-blue-100 flex items-center justify-between text-xs font-medium text-blue-900">
              <span>📍 홍천시외버스터미널에서 도보로 단 5분 거리입니다.</span>
              <a
                href={naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                지도로 큰화면 보기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
