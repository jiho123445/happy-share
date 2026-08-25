import React, { useState } from 'react';
import { CreditCard, CheckCircle2, HelpCircle, ExternalLink, ArrowRight, ShieldCheck, Award, AlertCircle } from 'lucide-react';

interface NationalSupportGuideProps {
  onNavigateToInquiry: () => void;
}

export const NationalSupportGuide: React.FC<NationalSupportGuideProps> = ({ onNavigateToInquiry }) => {
  // Quiz State
  const [jobStatus, setJobStatus] = useState<string>('seek'); // seek, employed, student, senior, other
  const [incomeLevel, setIncomeLevel] = useState<string>('standard'); // standard, low, youth
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const steps = [
    {
      step: '01',
      title: '카드 발급 신청',
      desc: 'HRD-Net 홈페이지(www.hrd.go.kr) 또는 홍천고용센터 방문 신청 (카드 발급까지 약 3~7일 소요)',
    },
    {
      step: '02',
      title: '학원 수강 상담',
      desc: '홍천 중앙정보처리학원 방문 또는 전화(033-433-1926)를 통해 희망 과정 및 자부담금 확인',
    },
    {
      step: '03',
      title: '수강 등록 & 교육',
      desc: '내일배움카드로 자부담금 결제 후 최신 PC 환경에서 1:1 맞춤 교육 참여 (출석률 80% 이상 준수)',
    },
    {
      step: '04',
      title: '자격증 취득 & 취업지원',
      desc: '컴활, 전산세무회계 자격증 취득 및 홍천 지역 협력업체 취업 연계 서비스 제공',
    },
  ];

  const handleCalculateEligibility = () => {
    if (jobStatus === 'seek' && incomeLevel === 'low') {
      setQuizResult('국민취업지원제도 1유형 대상 가능성 높음! 수강료 100% 전액 지원 + 월 최대 50만원 구직촉진수당');
    } else if (jobStatus === 'seek') {
      setQuizResult('구직자 국민내일배움카드 발급 가능! 수강료 70% ~ 100% 국비 지원');
    } else if (jobStatus === 'employed') {
      setQuizResult('재직자 국민내일배움카드 발급 가능! 수강료 60% ~ 100% 지원 (야간반/주말반 수강 가능)');
    } else if (jobStatus === 'student') {
      setQuizResult('대학 3~4학년 및 졸업예정자/고3 소지 가능! 수강료 70%~100% 지원');
    } else if (jobStatus === 'senior') {
      setQuizResult('만 75세 미만 시니어 수강 가능! 시니어 우대 및 국비지원 카드 발급 여부 학원 전담 안내');
    } else {
      setQuizResult('국민내일배움카드 발급 기본 대상입니다. 학원으로 문의해주시면 1:1로 카드 발급 절차를 안내해 드립니다.');
    }
  };

  return (
    <section id="national-support" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100/80 backdrop-blur-sm text-emerald-800 font-extrabold text-xs mb-3 border border-emerald-200/60 shadow-sm">
            <CreditCard className="w-3.5 h-3.5" />
            GOVERNMENT SUBSIDY GUIDE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            국민내일배움카드 국비지원 안내
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            국가가 지원하는 훈련비 혜택으로 <strong>수강료 0원 ~ 최대 100% 무료</strong>로 직업 능력 자격증을 취득하세요.
          </p>
        </div>

        {/* 4 Step Process Cards in Glass Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s) => (
            <div
              key={s.step}
              className="glass-card rounded-3xl p-6 border border-white/70 relative hover:border-emerald-400 hover:shadow-xl transition-all"
            >
              <div className="text-3xl font-black text-emerald-600 mb-2">
                {s.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Qualification Self-Checker Widget */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/60 shadow-xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full">
                셀프 국비지원 진단
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                나의 내일배움카드 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  지원율 확인하기
                </span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                간단한 2가지 질문에 답변하시면 예상 지원금 및 카드 발급 가능 여부를 빠르게 진단해 드립니다.
              </p>
              
              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <p>📍 홍천고용센터: 강원도 홍천군 홍천읍 신장대로 59 (도보 3분)</p>
                <p>☎ 카드발급 상담: 홍천 중앙정보처리학원 033-433-1926</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white/80 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg border border-white/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  1. 현재 귀하의 상태는 무엇인가요?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'seek', label: '구직자/취업준비생' },
                    { id: 'employed', label: '재직자/직장인' },
                    { id: 'student', label: '대학생/졸업예정자' },
                    { id: 'senior', label: '주부/시니어' },
                    { id: 'other', label: '자영업자/기타' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setJobStatus(item.id)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        jobStatus === item.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                          : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  2. 소득 및 자격 유형을 선택해 주세요
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'standard', label: '일반 국민 (기본)' },
                    { id: 'low', label: '저소득층/국민취업지원제도' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setIncomeLevel(item.id)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        incomeLevel === item.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                          : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculateEligibility}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-colors cursor-pointer"
              >
                진단 결과 확인하기
              </button>

              {quizResult && (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-900 animate-fadeIn space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{quizResult}</span>
                  </div>
                  <button
                    onClick={onNavigateToInquiry}
                    className="mt-2 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl text-center shadow cursor-pointer"
                  >
                    이 조건으로 수강 상담 예약하기
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* HRD-Net External Link Info */}
        <div className="p-6 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                고용노동부 직업훈련 포털 (HRD-Net)
              </h4>
              <p className="text-xs text-slate-600">
                인터넷에서 국민내일배움카드를 직접 발급신청 및 온라인 과정을 확인하실 수 있습니다.
              </p>
            </div>
          </div>
          <a
            href="https://www.hrd.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-blue-200 whitespace-nowrap"
          >
            <span>HRD-Net 바로가기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
