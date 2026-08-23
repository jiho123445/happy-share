import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Lock } from 'lucide-react';

/**
 * COMPLIANCE (2026-08 addition): a real, linkable, indexable page at
 * /privacy, replacing the footer's quick-view modal as the canonical
 * version. The modal was four short clauses — enough for a glance, but
 * thin for a foundation that actually collects names/phone numbers/
 * emails through donation and inquiry forms. This expands it to the
 * items Korea's 개인정보보호법 (Personal Information Protection Act)
 * expects a processing policy to actually cover: what's collected, why,
 * how long it's kept, who (if anyone) it's shared with, the subject's
 * rights, and a named contact for privacy questions.
 *
 * Fields marked with settings.* pull from the same admin-editable
 * foundation settings used across the rest of the site, so this stays in
 * sync automatically if the address/phone/email ever change.
 *
 * NOTE: this is a solid starting template, not a substitute for review
 * by someone qualified to confirm it fully matches this foundation's
 * actual data-handling practices (e.g. exact retention periods for
 * donation records, whether any processing is ever outsourced to a third
 * party). Whoever maintains this site should review it periodically.
 */
export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useFoundation();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-orange-100 rounded-2xl text-orange-600">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">개인정보처리방침</h1>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 leading-relaxed">
        <p>
          {settings.name}(이하 '재단')은 「개인정보보호법」 등 관련 법령을 준수하며, 후원자·신청자·문의자의
          개인정보를 안전하게 관리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제1조 (수집하는 개인정보 항목 및 수집 방법)</h2>
          <p>재단은 아래와 같이 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>후원 신청 시:</strong> 이름, 연락처, 이메일(선택), 후원 종류 및 금액/품목, 신청 내용</li>
            <li><strong>문의하기 이용 시:</strong> 이름, 연락처, 이메일(선택), 문의 제목·내용</li>
            <li><strong>소식지 구독 신청 시:</strong> 이메일 주소</li>
          </ul>
          <p>위 정보는 홈페이지 내 각 신청/입력 화면을 통해 이용자가 직접 입력하는 방식으로 수집됩니다.</p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제2조 (개인정보의 수집 및 이용 목적)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>후원금(품) 접수 확인, 기부금영수증 발급 및 관련 세법상 의무 이행</li>
            <li>문의사항에 대한 답변 및 민원 처리</li>
            <li>소식지·공지사항 등 재단 활동 정보 전달(구독 신청자에 한함)</li>
            <li>부정 이용 방지 및 서비스 안정적 운영</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제3조 (개인정보의 보유 및 이용 기간)</h2>
          <p>
            재단은 원칙적으로 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            다만 다음의 정보에 대해서는 명시한 사유가 발생하는 시점까지 또는 관계 법령이 정한 기간 동안
            보존합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>기부금영수증 관련 기록:</strong> 「소득세법」 및 「법인세법」 등에 따라 관계 법령이 정한
              기간 동안 보존
            </li>
            <li><strong>문의·민원 처리 기록:</strong> 처리 완료 후 1년간 보존 후 파기</li>
            <li><strong>소식지 구독 정보:</strong> 구독 해지 요청 시 즉시 파기</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제4조 (개인정보의 제3자 제공)</h2>
          <p>
            재단은 이용자의 개인정보를 제2조에서 명시한 목적 범위 내에서만 이용하며, 원칙적으로 이용자의
            사전 동의 없이 이를 외부에 제공하지 않습니다. 다만 법령의 규정에 의거하거나 수사 목적으로
            법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제5조 (개인정보 처리의 위탁)</h2>
          <p>
            재단은 서비스 향상을 위해 개인정보 처리 업무를 외부에 위탁하는 경우, 위탁 계약 시
            개인정보보호법에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치 등을
            명확히 규정하고 이를 준수하도록 관리·감독합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제6조 (정보주체의 권리와 행사 방법)</h2>
          <p>이용자는 재단에 대해 언제든지 다음 각 호의 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
          </ul>
          <p>
            권리 행사는 아래 개인정보 보호책임자에게 서면, 전화, 이메일 등을 통해 요청하실 수 있으며,
            재단은 이에 대해 지체 없이 조치합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제7조 (개인정보의 안전성 확보 조치)</h2>
          <p>
            재단은 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적 및 물리적
            조치를 하고 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>개인정보에 대한 접근 권한을 관리자로 제한하고, 관리자 인증에 별도의 계정 인증 절차를 적용</li>
            <li>개인정보가 포함된 데이터베이스에 대한 접근 통제 및 암호화 조치</li>
            <li>해킹 등에 대비한 보안 프로그램의 설치 및 갱신</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제8조 (쿠키의 운용)</h2>
          <p>
            본 홈페이지는 이용자의 로그인 상태 유지 등 서비스 제공을 위해 필요한 최소한의 브라우저 저장소를
            사용할 수 있으며, 이는 이용자를 식별하는 별도의 광고성 쿠키를 포함하지 않습니다. 이용자는
            브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 어려움이 있을 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제9조 (개인정보 보호책임자)</h2>
          <p>
            재단은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만
            처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="bg-slate-50 rounded-2xl p-5 mt-3 space-y-1 text-slate-700">
            <p><strong>개인정보 보호책임자:</strong> {settings.chairmanName || '이사장'}</p>
            <p><strong>소속/직책:</strong> {settings.name} 이사장</p>
            <p><strong>연락처:</strong> {settings.phone}</p>
            <p><strong>이메일:</strong> {settings.email}</p>
            <p><strong>주소:</strong> {settings.address}</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제10조 (개인정보처리방침의 변경)</h2>
          <p>
            이 개인정보처리방침은 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을
            시에는 변경사항의 시행 최소 7일 전부터 홈페이지를 통해 공지합니다.
          </p>
          <p className="text-slate-500 text-xs mt-4">시행일자: 2026년 8월 24일</p>
        </section>
      </div>
    </div>
  );
};
