import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Logo } from './Logo';
import { Waves, Heart, Shield, Lock, FileText, ArrowUp, MailX, Network, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, setAboutSubTab } = useFoundation();
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'email-refusal' | 'sitemap' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSitemapNav = (tab: any, subTab?: 'greeting' | 'purpose' | 'history' | 'organization') => {
    if (subTab) {
      setAboutSubTab(subTab);
    }
    setActiveTab(tab);
    setModalType(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Top Row: Brand & Slogan */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Logo className="h-10 sm:h-12 w-auto" variant="light" />
            </div>
            <p className="text-orange-400 font-semibold text-xs pt-1">
              "{settings.sloganMain}"
            </p>
          </div>

          <div className="flex items-center gap-3">
            {settings.snsLinks.naver && (
              <a
                href={settings.snsLinks.naver}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold hover:bg-emerald-800 transition-colors"
              >
                네이버 블로그
              </a>
            )}
            {settings.snsLinks.instagram && (
              <a
                href={settings.snsLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-pink-900/60 text-pink-300 border border-pink-700/60 font-bold hover:bg-pink-800 transition-colors"
              >
                인스타그램
              </a>
            )}
            {settings.snsLinks.youtube && (
              <a
                href={settings.snsLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-red-900/60 text-red-300 border border-red-700/60 font-bold hover:bg-red-800 transition-colors"
              >
                유튜브
              </a>
            )}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-800 text-white hover:bg-orange-500 transition-colors"
              title="맨 위로 스크롤"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-slate-400">
          
          <div className="md:col-span-8 space-y-2 leading-relaxed">
            <div className="text-slate-300 font-bold">법인 및 위치 정보</div>
            <p>법인명: {settings.name} ({settings.englishName}) | 대표자: {settings.chairmanName}</p>
            <p>소재지: {settings.address}</p>
            <p>전화: {settings.phone} | FAX: {settings.fax} | 이메일: {settings.email} | 운영시간: {settings.operatingHours}</p>
            <p className="text-[11px] text-slate-500 pt-1">
              [안내] 본 재단은 기부금 영수증 발급이 가능한 지정기부금 공익법인입니다.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="text-slate-300 font-bold">약관 및 사이트안내</div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setModalType('privacy')}
                className="text-left text-orange-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> 개인정보처리방침
              </button>
              <button
                onClick={() => setModalType('terms')}
                className="text-left hover:text-white flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> 이용약관
              </button>
              <button
                onClick={() => setModalType('email-refusal')}
                className="text-left hover:text-white flex items-center gap-1"
              >
                <MailX className="w-3.5 h-3.5" /> 이메일주소 무단수집거부
              </button>
              <button
                onClick={() => setModalType('sitemap')}
                className="text-left text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Network className="w-3.5 h-3.5" /> 전체 사이트맵
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            &copy; 2009-{new Date().getFullYear()} {settings.name}. All Rights Reserved.
          </div>
          <div>
            넓고 깊은 강물처럼, 홍천에 흐르는 나눔 · 홍천 복지 플랫폼
          </div>
        </div>

      </div>

      {/* Policy & Sitemap Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {modalType === 'privacy' && '개인정보처리방침'}
                {modalType === 'terms' && '이용약관'}
                {modalType === 'email-refusal' && '이메일주소 무단수집거부'}
                {modalType === 'sitemap' && '너브내행복나눔재단 사이트맵'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                닫기 [X]
              </button>
            </div>

            <div className="text-xs space-y-3 leading-relaxed text-slate-600">
              {modalType === 'privacy' && (
                <>
                  <p><strong>제1조 (목적)</strong> 사단법인 너브내행복나눔재단은 후원자 및 신청자의 개인정보를 중요시하며, 개인정보보호법 등 관련 법령을 준수합니다.</p>
                  <p><strong>제2조 (수집 항목)</strong> 이름, 연락처, 이메일, 후원 및 문의내용</p>
                  <p><strong>제3조 (이용 목적)</strong> 후원금 관리, 기부금 영수증 발급, 소식지 전달 및 문의사항 답변</p>
                  <p><strong>제4조 (보유 기간)</strong> 관계 법령에 따른 보존 의무 기간 동안 안전하게 관리 후 파기합니다.</p>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p><strong>제1조 (목적)</strong> 본 약관은 너브내행복나눔재단 공식 홈페이지 서비스 제공 및 이용조건을 규정함을 목적으로 합니다.</p>
                  <p><strong>제2조 (서비스의 제공)</strong> 재단은 공익사업 안내, 후원 신청, 공지사항 및 갤러리 정보를 제공합니다.</p>
                </>
              )}

              {modalType === 'email-refusal' && (
                <>
                  <p>본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부합니다.</p>
                  <p className="text-red-600 font-bold">이를 위반시 정보통신망법에 의해 형사처벌됨을 유의하시기 바랍니다.</p>
                </>
              )}

              {modalType === 'sitemap' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="font-extrabold text-orange-600">재단소개</div>
                    <div className="space-y-1 pl-2 text-[11px]">
                      <button onClick={() => handleSitemapNav('about', 'greeting')} className="block hover:underline">• 이사장 인사말</button>
                      <button onClick={() => handleSitemapNav('about', 'purpose')} className="block hover:underline">• 설립목적 및 정체성</button>
                      <button onClick={() => handleSitemapNav('about', 'history')} className="block hover:underline">• 재단 연혁</button>
                      <button onClick={() => handleSitemapNav('about', 'organization')} className="block hover:underline">• 조직도 및 위탁기관</button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="font-extrabold text-emerald-600">주요사업</div>
                    <div className="space-y-1 pl-2 text-[11px]">
                      <button onClick={() => handleSitemapNav('programs')} className="block hover:underline">• 꿈나무 장학사업</button>
                      <button onClick={() => handleSitemapNav('programs')} className="block hover:underline">• 긴급구호 및 주거개선</button>
                      <button onClick={() => handleSitemapNav('programs')} className="block hover:underline">• 공익 복지시설 공모</button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="font-extrabold text-blue-600">수탁기관 & 알림</div>
                    <div className="space-y-1 pl-2 text-[11px]">
                      <button onClick={() => handleSitemapNav('family-center')} className="block hover:underline">• 홍천군가족센터</button>
                      <button onClick={() => handleSitemapNav('news')} className="block hover:underline">• 알림마당 / 공지사항</button>
                      <button onClick={() => handleSitemapNav('gallery')} className="block hover:underline">• 현장 활동 갤러리</button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="font-extrabold text-amber-600">후원 및 안내</div>
                    <div className="space-y-1 pl-2 text-[11px]">
                      <button onClick={() => handleSitemapNav('donate')} className="block hover:underline">• 후원 안내 및 신청</button>
                      <button onClick={() => handleSitemapNav('contact')} className="block hover:underline">• 오시는 길 및 문의</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setModalType(null)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

