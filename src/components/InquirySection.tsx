import React, { useState, useEffect } from 'react';
import { ConsultationForm, Course } from '../types';
import { COURSES_DATA, ACADEMY_INFO } from '../data/coursesData';
import { FileText, Send, Phone, CheckCircle2, AlertCircle, Clock, ShieldCheck, Sparkles, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { submitApplicationToFirestore, formatReceiptNumber, subscribeCoursesFromFirestore } from '../lib/firestoreService';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface InquirySectionProps {
  preselectedCourse?: string;
  onOpenAdminModal?: () => void;
  pendingInquiryCount?: number;
}

export const InquirySection: React.FC<InquirySectionProps> = ({ preselectedCourse, onOpenAdminModal, pendingInquiryCount = 0 }) => {
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);

  useEffect(() => {
    const unsubscribe = subscribeCoursesFromFirestore((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    });
    return () => unsubscribe();
  }, []);

  const getInitialForm = (courseOverride?: string): ConsultationForm => ({
    name: '',
    phone: '',
    courseInterest: courseOverride || preselectedCourse || (COURSES_DATA[0] ? COURSES_DATA[0].title : '상담 후 결정'),
    preferredTime: '상관없음',
    hasNaeilCard: '유',
    userCategory: '취업준비생',
    message: '',
  });

  const [formData, setFormData] = useState<ConsultationForm>(() => getInitialForm());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 개인정보 수집·이용 동의
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Spam protection: honeypot field (bots tend to fill every input; humans never see or fill this)
  const [honeypot, setHoneypot] = useState('');
  // Spam protection: form-render timestamp. Bots that submit within ~2 seconds of page load are blocked.
  const formOpenedAtRef = React.useRef<number>(Date.now());

  useEffect(() => {
    if (preselectedCourse) {
      setFormData((prev) => ({ ...prev, courseInterest: preselectedCourse }));
    }
  }, [preselectedCourse]);

  const handleResetForm = () => {
    setFormData(getInitialForm());
    setStatusMessage(null);
    setHoneypot('');
    setPrivacyConsent(false);
    formOpenedAtRef.current = Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatusMessage({ type: 'error', text: '성함과 연락처(전화번호)를 정확히 입력해 주세요.' });
      return;
    }

    if (!privacyConsent) {
      setStatusMessage({ type: 'error', text: '개인정보 수집·이용에 동의해 주셔야 신청이 가능합니다.' });
      return;
    }

    // Basic Korean phone number format check (mobile 010-xxxx-xxxx or landline formats).
    // Accepts digits with optional hyphens/spaces, 9~11 digits total.
    const digitsOnly = formData.phone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 11) {
      setStatusMessage({ type: 'error', text: '연락처(전화번호) 형식을 다시 확인해 주세요. (예: 010-1234-5678)' });
      return;
    }

    // Honeypot check: a real visitor never fills this hidden field, so any value means a bot.
    if (honeypot.trim().length > 0) {
      console.warn('Spam submission blocked (honeypot triggered).');
      setStatusMessage({
        type: 'success',
        text: `${formData.name.trim()}님의 수강 신청이 성공적으로 접수되었습니다! 빠르게 확인 후 안내 연락을 드리겠습니다.`,
      });
      setFormData(getInitialForm());
      setHoneypot('');
      return;
    }

    // Time-trap check: legitimate users take at least a couple of seconds to fill out the form.
    const elapsedMs = Date.now() - formOpenedAtRef.current;
    if (elapsedMs < 1500) {
      console.warn('Spam submission blocked (submitted too quickly).');
      setStatusMessage({
        type: 'error',
        text: '입력 확인 중입니다. 잠시 후 다시 시도해 주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const submittedName = formData.name.trim();

    try {
      const record = await submitApplicationToFirestore(formData);
      window.dispatchEvent(new Event('inquiry_submitted'));
      
      // Reset form input values completely for the next inquiry
      setFormData(getInitialForm());
      setHoneypot('');
      setPrivacyConsent(false);
      formOpenedAtRef.current = Date.now();

      setStatusMessage({
        type: 'success',
        text: `${submittedName}님의 수강 신청이 성공적으로 접수되었습니다! (접수번호: ${formatReceiptNumber(record)}) 빠르게 확인 후 안내 연락을 드리겠습니다.`,
      });
    } catch (err) {
      console.error('Firestore application submission failed:', err);
      setStatusMessage({
        type: 'error',
        text: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도하시거나 학원 전화(033-433-1926)로 문의해 주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="inquiry" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Info & Phone CTA */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 border border-blue-200/60 font-extrabold text-xs shadow-sm">
              <FileText className="w-3.5 h-3.5" />
              ONLINE CONSULTATION
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              1분 간편 수강 신청 & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                맞춤 교육 상담
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              궁금하신 강좌나 국민내일배움카드 발급 방법, 국비지원 자부담금에 대해 문의를 남겨주시면 
              상담 직원이 친절하고 신속하게 안내해 드립니다.
            </p>

            <div className="glass-card p-6 rounded-3xl border border-white/70 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">전화 즉시 상담</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{ACADEMY_INFO.phone}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-3 border-t border-slate-200/60">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>상담 가능 시간: 평일 09:00 ~ 21:30 | 토 09:00 ~ 15:00</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>학원 위치: 강원도 홍천군 홍천읍 신장대로 48, 2층</span>
                </p>
              </div>

              <a
                href={`tel:${ACADEMY_INFO.phoneClean}`}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full text-center block transition-all shadow-md shadow-emerald-200"
              >
                전화 바로 걸기 ({ACADEMY_INFO.phone})
              </a>

              {/* Admin Data Management Button */}
              {onOpenAdminModal && (
                <div className="pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={onOpenAdminModal}
                    className={`w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all group ${
                      pendingInquiryCount > 0 ? 'border-2 border-red-500 ring-2 ring-red-500/30' : ''
                    }`}
                  >
                    {pendingInquiryCount > 0 ? (
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>신청 내역 관리 & 엑셀 다운로드 (원장님용)</span>
                    {pendingInquiryCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-black animate-pulse">
                        신규대기 {pendingInquiryCount}건
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Form in Frosted Glass */}
          <div className="lg:col-span-7 bg-white/60 backdrop-blur-xl text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-xl font-black text-slate-900">
                온라인 수강 문의 작성
              </h3>
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer shadow-xs border border-slate-200/60"
                title="작성 중인 입력 내용 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>입력 초기화</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              * 표시는 필수 입력 항목입니다. 작성하신 정보는 상담 목적으로만 사용됩니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Honeypot field: hidden from real users via CSS, but bots that auto-fill every
                  field will populate it. Kept out of the tab order and screen readers. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
              >
                <label htmlFor="website">웹사이트 (작성하지 마세요)</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    성함 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    lang="ko"
                    style={{ imeMode: 'active' }}
                    className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    연락처 (전화번호) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Course Interest */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  관심 수강 강좌 *
                </label>
                <select
                  value={formData.courseInterest}
                  onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      [{c.category}] {c.title}
                    </option>
                  ))}
                  <option value="기타/상담후결정">기타 / 상담 후 결정</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    희망 시간대
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredTime: e.target.value as any })
                    }
                    className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  >
                    <option value="상관없음">상관없음</option>
                    <option value="오전반">오전반 (10시~)</option>
                    <option value="오후반">오후반 (14시~)</option>
                    <option value="야간반">야간반 (19시~)</option>
                    <option value="주말반">주말반 (토요일)</option>
                  </select>
                </div>

                {/* Has Naeil Card */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    내일배움카드 소지
                  </label>
                  <select
                    value={formData.hasNaeilCard}
                    onChange={(e) =>
                      setFormData({ ...formData, hasNaeilCard: e.target.value as any })
                    }
                    className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  >
                    <option value="유">소지하고 있음</option>
                    <option value="무">미소지 (발급필요)</option>
                    <option value="발급예정/잘모름">잘 모름 / 발급예정</option>
                  </select>
                </div>

                {/* User Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    구분
                  </label>
                  <select
                    value={formData.userCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, userCategory: e.target.value as any })
                    }
                    className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  >
                    <option value="취업준비생">취업준비생</option>
                    <option value="재직자">재직자/직장인</option>
                    <option value="대학생/학생">대학생/학생</option>
                    <option value="주부/시니어">주부/시니어</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  추가 문의 사항 (선택)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="예: 자부담금 문의, 개강 날짜, 주차 가능 여부 등 자유롭게 남겨주세요."
                  className="w-full p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                />
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                />
                <label htmlFor="privacy-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  (필수) 수강 상담을 위한 개인정보(성함, 연락처) 수집·이용에 동의합니다.{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyModalOpen(true);
                    }}
                    className="text-blue-600 font-bold underline underline-offset-2 hover:text-blue-700"
                  >
                    자세히 보기
                  </button>
                </label>
              </div>

              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50/90 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50/90 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                  {statusMessage.type === 'success' && (
                    <button
                      type="button"
                      onClick={() => setStatusMessage(null)}
                      className="shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer text-center"
                    >
                      새 수강 문의 작성하기
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-full shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '상담 신청 접수 중...' : '온라인 수강 상담 신청하기'}</span>
              </button>

            </form>
          </div>

        </div>

      </div>

      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </section>
  );
};
