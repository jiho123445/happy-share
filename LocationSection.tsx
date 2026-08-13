import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { MapPin, Phone, Mail, Clock, Navigation, Send, CheckCircle2, Building } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { settings, addInquiry } = useFoundation();

  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.phone || !inquiryData.message) {
      alert('필수 입력항목(성함, 연락처, 문의내용)을 작성해 주세요.');
      return;
    }

    addInquiry({
      name: inquiryData.name,
      phone: inquiryData.phone,
      email: inquiryData.email,
      subject: inquiryData.subject || '일반 사업 및 후원 문의',
      message: inquiryData.message
    });

    setSubmitted(true);
  };

  return (
    <section id="contact-section" className="py-16 md:py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>오시는 길 & 문의하기</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            너브내행복나눔재단 찾아오시는 길
          </h2>
          <p className="text-base text-slate-600">
            강원특별자치도 홍천군에 위치한 재단 사무실 안내 및 문의사항 창구입니다.
          </p>
        </div>

        {/* Map & Office Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6 flex flex-col justify-between">
            
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-bold text-orange-600">공식 본부 사무국</div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  사단법인 너브내행복나눔재단
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  (홍천군가족센터 동일 건물 연계)
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">주소</div>
                    <div className="text-slate-600 mt-0.5">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">전화번호 및 팩스</div>
                    <div className="text-slate-600 mt-0.5">TEL: {settings.phone}</div>
                    <div className="text-slate-600">FAX: {settings.fax}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">이메일</div>
                    <div className="text-slate-600 mt-0.5">{settings.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">운영시간</div>
                    <div className="text-slate-600 mt-0.5">{settings.operatingHours}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <a
                href="https://map.kakao.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>카카오맵 길찾기</span>
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>구글 지도 열기</span>
              </a>
            </div>

          </div>

          {/* Right Interactive Map Graphic Placeholder Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-orange-400" />
                <span>강원특별자치도 홍천군 위치 지도</span>
              </span>
              <span className="text-[11px] text-slate-300">
                홍천읍 산림조합길 12
              </span>
            </div>

            <div className="relative flex-1 min-h-[300px] bg-slate-100 flex items-center justify-center overflow-hidden">
              {/* Simulated Map Visual */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl animate-bounce">
                  <MapPin className="w-8 h-8 fill-white" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">
                    사단법인 너브내행복나눔재단
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    홍천군가족센터 동일 건물 (산림조합길 12)
                  </div>
                </div>
                <div className="inline-block bg-white text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  대중교통: 홍천시외버스터미널에서 차로 5분 거리
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Direct Online Contact Inquiry Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900">온라인 빠른 문의하기</h3>
            <p className="text-xs text-slate-500">사업, 후원, 봉사활동 관련 문의사항을 남겨주시면 빠르게 답변드립니다.</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">문의가 정상 접수되었습니다.</h4>
              <p className="text-xs text-slate-600">남겨주신 연락처로 담당자가 확인 후 답변드리겠습니다.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-emerald-700 underline"
              >
                추가 문의 작성
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">성함 *</label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">연락처 *</label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">문의 제목</label>
                <input
                  type="text"
                  placeholder="예: 다문화 장학금 신청 절차 문의"
                  value={inquiryData.subject}
                  onChange={(e) => setInquiryData({ ...inquiryData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">문의 내용 *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="궁금하신 내용을 자세히 적어주세요."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>문의사항 전송</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
