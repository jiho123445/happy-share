import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Heart, CreditCard, Gift, Users, CheckCircle2, AlertCircle, Send, Sparkles, ShieldCheck } from 'lucide-react';

export const DonateSection: React.FC = () => {
  const { settings, addDonation } = useFoundation();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    donationType: '정기후원' as '정기후원' | '일시후원' | '물품후원' | '봉사활동',
    targetCategory: '장학·교육',
    amountOrItem: '',
    message: '',
    privacyAgreed: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('이름과 연락처를 작성해 주세요.');
      return;
    }
    if (!formData.privacyAgreed) {
      alert('개인정보 수집 및 이용 동의에 체크해 주세요.');
      return;
    }

    addDonation({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      donationType: formData.donationType,
      targetCategory: formData.targetCategory,
      amountOrItem: formData.amountOrItem,
      message: formData.message,
      privacyAgreed: formData.privacyAgreed
    });

    setSubmitted(true);
  };

  return (
    <section id="donate-section" className="py-16 md:py-24 bg-[#FFFDF8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
            <Heart className="w-4 h-4 text-orange-600 fill-orange-600" />
            <span>따뜻한 후원 참여</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            “작은 나눔이 누군가에게는 새로운 시작이 됩니다.”
          </h2>
          <p className="text-base text-slate-600">
            당신의 따뜻한 마음이 홍천 곳곳에 행복으로 이어집니다. 투명하게 꼭 필요한 이웃에게 집행됩니다.
          </p>
        </div>

        {/* 4 Donation Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">정기후원</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              매월 지속적인 일정 금액 나눔으로 홍천지역 아동과 취약계층의 안정적인 생활 기반을 지원합니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">일시후원</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              원하는 시기에 원하는 만큼, 긴급한 위기 상황에 처한 이웃과 명절 나눔 기금에 참여하실 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">물품후원</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              쌀, 생필품, 계절용품(선풍기, 난방유), 도서, 학용품 등 이웃에게 직접 전달할 따뜻한 물품 기부입니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">봉사활동 참여</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              명절 물품 포장, 삼계탕 나눔, 주거환경 개보수 도배 시공, 다문화 학습 지도로 현장에서 온기를 보탭니다.
            </p>
          </div>

        </div>

        {/* Bank Account Info Box (Fact Policy Rule #28 Mandate) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>공익법인 지정 후원 계좌</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                후원금 전용 계좌 안내
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                기부금 영수증 발급 가능 (국세청 연말정산 간소화 서비스 자동 연동)
              </p>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-700 w-full lg:w-auto space-y-3">
              {settings.bankAccounts.map((acc, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-4 text-xs border-b border-slate-800/80 pb-2.5 last:border-none last:pb-0">
                  <span className="font-bold text-orange-400">{acc.bank}</span>
                  <span className="font-mono text-sm font-extrabold text-white tracking-wider">{acc.accountNumber}</span>
                  <span className="text-slate-300">예금주: {acc.holder}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Donation Application Form */}
        <div id="donate-form" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-orange-100 max-w-3xl mx-auto">
          
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-bold text-slate-900">
              후원 및 봉사참여 간편 신청서
            </h3>
            <p className="text-xs text-slate-500">
              신청 정보를 남겨주시면 재단 담당자가 확인 후 따뜻하게 안내해 드립니다.
            </p>
          </div>

          {submitted ? (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900">
                소중한 나눔의 마음을 보내주셔서 감사합니다.
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                신청해 주신 후원/봉사 의사를 재단 사무국에서 소중히 접수하였습니다. 
                빠른 시일 내에 연락드리겠습니다.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    donationType: '정기후원',
                    targetCategory: '장학·교육',
                    amountOrItem: '',
                    message: '',
                    privacyAgreed: false
                  });
                }}
                className="inline-block bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                새로운 신청서 작성
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  후원/참여 유형 선택 <span className="text-orange-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['정기후원', '일시후원', '물품후원', '봉사활동'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, donationType: type })}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                        formData.donationType === type
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이름 (또는 단체명) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    연락처 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이메일 (선택)
                  </label>
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    희망 후원/지침 분야
                  </label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="장학·교육">장학·교육 지원</option>
                    <option value="긴급지원">취약계층 긴급 구호</option>
                    <option value="주거환경">주거환경 개선 (도배, 창호)</option>
                    <option value="다문화가족">다문화·가족지원</option>
                    <option value="복지시설배분">복지시설 배분사업</option>
                    <option value="지역나눔">명절 및 지역사회 나눔</option>
                  </select>
                </div>
              </div>

              {/* Amount or Item description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  희망 후원 금액 또는 물품/봉사 내용
                </label>
                <input
                  type="text"
                  placeholder="예: 월 3만원 정기후원 / 쌀 20kg 5포대 물품기부 / 명절 포장 봉사참여"
                  value={formData.amountOrItem}
                  onChange={(e) => setFormData({ ...formData, amountOrItem: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  응원 메시지 및 기타 문의사항
                </label>
                <textarea
                  rows={3}
                  placeholder="따뜻한 마음과 함께 전하고 싶은 말씀을 적어주세요."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* Privacy Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={formData.privacyAgreed}
                  onChange={(e) => setFormData({ ...formData, privacyAgreed: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
                <label htmlFor="privacy" className="text-xs text-slate-600 cursor-pointer">
                  [필수] 개인정보 수집 및 이용 동의: 신청 결과 안내 및 후원 관리를 위한 최소한의 개인정보를 수집함에 동의합니다.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>소중한 나눔 신청서 제출하기</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
