import React, { useState, useRef } from 'react';
import { Mail, Send, CheckCircle2, HeartHandshake, RefreshCw } from 'lucide-react';
import { useFoundation } from '../context/FoundationContext';
import { HONEYPOT_FIELD_NAME, honeypotStyle, isLikelyBot, checkRateLimit } from '../utils/spamGuard';

export const NewsletterSection: React.FC = () => {
  const { addSubscriber } = useFoundation();
  const formMountedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    if (isLikelyBot(honeypot, formMountedAt.current)) {
      setSubscribed(true);
      setEmail('');
      return;
    }

    const rateLimit = checkRateLimit('nerve_nae_subscriber_rate');
    if (!rateLimit.allowed) {
      alert(`짧은 시간에 너무 많이 시도되었습니다. ${rateLimit.retryAfterMinutes}분 후 다시 시도해 주세요.`);
      return;
    }

    setSubmitting(true);
    try {
      await addSubscriber(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      alert('구독 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/60 rounded-3xl p-6 sm:p-10 border border-orange-500/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Information */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>너브내행복나눔 재단소식지</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            재단의 따뜻한 공익 소식을 이메일로 받아보세요
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            너브내행복나눔재단의 월간 복지 현장 이야기, 장학생 선발 소식, 후원금 집행 내역을 누구보다 먼저 전해드립니다.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-auto shrink-0">
          {subscribed ? (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 text-xs sm:text-sm font-bold shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>소식지 신청이 성공적으로 완료되었습니다. 감사합니다!</span>
              </div>
              <button
                type="button"
                onClick={() => setSubscribed(false)}
                className="inline-flex items-center gap-1 text-xs bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>추가 신청하기</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
              <input
                type="text"
                name={HONEYPOT_FIELD_NAME}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={honeypotStyle}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div className="relative w-full sm:w-80">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="구독하실 이메일 주소 입력"
                  className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>구독신청</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
