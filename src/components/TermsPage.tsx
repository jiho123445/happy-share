import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { FileText } from 'lucide-react';

/**
 * COMPLIANCE (2026-08 addition): companion page to PrivacyPolicyPage.tsx
 * at /terms, replacing the footer modal's two-clause placeholder as the
 * canonical version. See that file's header comment for the reasoning —
 * same idea, applied to the site's terms of use.
 */
export const TermsPage: React.FC = () => {
  const { settings } = useFoundation();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-orange-100 rounded-2xl text-orange-600">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">이용약관</h1>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제1조 (목적)</h2>
          <p>
            이 약관은 {settings.name}(이하 '재단')이 운영하는 공식 홈페이지(이하 '사이트')가 제공하는
            정보 열람, 후원 신청, 문의, 소식지 구독 등의 서비스(이하 '서비스') 이용과 관련하여 재단과
            이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제2조 (서비스의 내용)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>재단 소개, 연혁, 조직 등 정보 제공</li>
            <li>주요사업, 공지사항, 보도자료, 활동 갤러리 등 콘텐츠 제공</li>
            <li>후원 신청 및 안내</li>
            <li>문의하기 및 소식지 구독 신청</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제3조 (서비스 이용)</h2>
          <p>
            사이트에 게시된 정보의 열람은 별도의 회원가입 절차 없이 누구나 이용할 수 있습니다. 후원 신청,
            문의, 소식지 구독 등 개인정보 입력이 필요한 서비스를 이용하는 경우, 이용자는 사실에 근거한
            정보를 입력해야 하며, 허위 정보 입력으로 발생하는 불이익에 대해 재단은 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제4조 (저작권 및 콘텐츠 이용 제한)</h2>
          <p>
            사이트에 게시된 글, 사진, 영상 등 모든 콘텐츠에 대한 저작권은 재단 또는 정당한 권리자에게
            있습니다. 이용자는 재단의 사전 서면 동의 없이 사이트의 콘텐츠를 복제, 전송, 배포, 방송,
            2차적 저작물 작성 등 영리 또는 비영리 목적으로 이용할 수 없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제5조 (이용자의 의무)</h2>
          <p>이용자는 다음 각 호에 해당하는 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 정보를 도용하여 후원 신청, 문의 등을 하는 행위</li>
            <li>사이트의 운영을 방해하거나 서버에 과도한 부하를 유발하는 행위</li>
            <li>공공질서 및 미풍양속에 반하는 정보를 게시·전송하는 행위</li>
            <li>재단의 사전 동의 없이 사이트를 영리 목적으로 이용하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제6조 (서비스 제공의 중지)</h2>
          <p>
            재단은 시스템 점검, 교체, 고장, 통신 두절 또는 운영상 상당한 이유가 있는 경우 서비스 제공을
            일시적으로 중단할 수 있으며, 이 경우 사전에 사이트를 통해 공지합니다. 다만 긴급한 사유가 있는
            경우 사후에 통지할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제7조 (면책조항)</h2>
          <p>
            재단은 천재지변, 불가항력적 사유로 서비스를 제공할 수 없는 경우 서비스 제공에 대한 책임이
            면제됩니다. 또한 이용자의 귀책사유로 인한 서비스 이용 장애에 대해서는 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제8조 (약관의 개정)</h2>
          <p>
            재단은 필요한 경우 이 약관을 개정할 수 있으며, 개정된 약관은 사이트 내 공지사항을 통해 공지한
            날로부터 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-extrabold text-slate-900 mt-8 mb-2">제9조 (문의처)</h2>
          <div className="bg-slate-50 rounded-2xl p-5 mt-3 space-y-1 text-slate-700">
            <p><strong>{settings.name}</strong></p>
            <p><strong>연락처:</strong> {settings.phone}</p>
            <p><strong>이메일:</strong> {settings.email}</p>
            <p><strong>주소:</strong> {settings.address}</p>
          </div>
          <p className="text-slate-500 text-xs mt-4">시행일자: 2026년 8월 24일</p>
        </section>
      </div>
    </div>
  );
};
