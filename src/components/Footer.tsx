import React, { useState } from 'react';
import { ACADEMY_INFO } from '../data/coursesData';
import { Phone, MapPin, Mail, Printer, ExternalLink } from 'lucide-react';
import { AcademyLogoSeal } from './AcademyLogoSeal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  return (
    <footer className="bg-slate-900/80 backdrop-blur-2xl text-slate-400 text-xs sm:text-sm pt-12 pb-24 lg:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          
          {/* Academy Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <AcademyLogoSeal className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full p-0.5 shadow-md" />
              <div>
                <span className="font-black text-lg sm:text-xl text-white block">홍천 중앙정보처리학원</span>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">고용노동부 국비지원 지정 IT·컴퓨터 교육기관</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              1999년 설립 이래 강원도 홍천 지역 주민과 구직자분들의 컴퓨터 활용능력, IT 국가기술자격증 취득 및 
              취업 지원을 위해 최고 수준의 실습 환경과 1:1 친절 교육을 제공하고 있습니다.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-slate-300">SINCE 1999</span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-slate-300">jahrd.com</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-bold text-white text-sm uppercase mb-3 tracking-wider">연락처 & 학원 정보</h4>
            <p className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{ACADEMY_INFO.address}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>전화: {ACADEMY_INFO.phone}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Printer className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>팩스: {ACADEMY_INFO.fax}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>이메일: {ACADEMY_INFO.email}</span>
            </p>
            <p className="text-xs text-slate-400 pt-1">
              운영시간: {ACADEMY_INFO.businessHours}
            </p>
          </div>

          {/* Quick Menu */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-white text-sm uppercase mb-3 tracking-wider">빠른 이동</h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-300">
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  교육과정 (컴활/전산세무)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('national-support')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  국민내일배움카드 안내
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('intro')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  학원 소개 & 원장 인사말
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('notices')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  공지사항 & 시험일정
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('inquiry')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  온라인 수강 문의
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('location')} className="hover:text-blue-300 transition-colors cursor-pointer">
                  오시는 길 (약도)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 1999-{new Date().getFullYear()} 홍천 중앙정보처리학원 (jahrd.com). All Rights Reserved.</p>
          <p>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              개인정보 처리방침
            </button>
            {' '}| 고용노동부 지정 훈련기관
          </p>
        </div>

      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  );
};
