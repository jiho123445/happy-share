import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';
import { useModalA11y } from '../lib/useModalA11y';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PrivacyPolicyModal - 개인정보 수집·이용에 대한 안내를 보여주는 모달.
 *
 * ⚠️ 아래 내용은 일반적인 학원/교육기관 홈페이지 양식을 참고해 작성한
 * 기본 템플릿입니다. 실제 보유기간, 위탁 여부, 책임자 정보 등은 학원의
 * 실제 운영 방침에 맞게 원장님께서 검토·수정하신 뒤 사용하시는 것을
 * 권장드립니다 (필요시 노무사·법률 전문가 검토 권장).
 */
export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const panelRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 sm:p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 id="privacy-policy-title" className="text-lg sm:text-xl font-black text-slate-900">
              개인정보 수집·이용 안내
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            {ACADEMY_INFO.name}(이하 '학원')은 온라인 수강 상담·신청 서비스 제공을 위해
            아래와 같이 개인정보를 수집·이용합니다. 신청 전 아래 내용을 확인해 주세요.
          </p>

          <div>
            <h4 className="font-black text-slate-900 mb-2">1. 수집 항목</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>필수: 성함, 연락처(전화번호)</li>
              <li>선택: 관심 강좌, 희망 시간대, 내일배움카드 소지 여부, 추가 문의 사항</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-2">2. 수집 및 이용 목적</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>수강 상담 및 신청 접수, 본인 확인</li>
              <li>강좌 안내, 개강 일정 등 상담 관련 연락</li>
              <li>국민내일배움카드 등 국비지원 자격 확인을 위한 상담 지원</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-2">3. 보유 및 이용 기간</h4>
            <p className="text-slate-600">
              수집일로부터 <strong>1년간</strong> 보관 후 파기합니다. 다만 실제 수강 등록으로
              이어진 경우, 관계 법령(전자상거래법 등)에 따라 별도로 정한 기간 동안 보관할 수
              있습니다. 이용자가 삭제를 원하시는 경우 아래 문의처로 연락 주시면 지체 없이
              삭제해 드립니다.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-2">4. 동의 거부 권리 및 불이익</h4>
            <p className="text-slate-600">
              이용자는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 필수 항목(성함,
              연락처) 수집에 동의하지 않으실 경우 온라인 수강 상담·신청 서비스 이용이
              제한될 수 있습니다.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-2">5. 문의처</h4>
            <p className="text-slate-600">
              개인정보 관련 문의는 아래로 연락 주세요.
              <br />
              전화: {ACADEMY_INFO.phone} · 이메일: {ACADEMY_INFO.email}
            </p>
          </div>

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            본 안내는 일반적인 양식을 바탕으로 작성되었으며, 실제 운영 방침에 맞게 학원에서
            검토 후 수정하여 게시하는 것을 권장합니다.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
