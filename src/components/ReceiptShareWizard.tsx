import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import { IssuedReceiptRecord } from '../types/donation';
import {
  downloadPdfBlob,
  generateReceiptPdfFile,
  getReceiptPdfFileName,
} from '../utils/pdfExport';
import { formatKRW } from '../utils/hangulCurrency';

interface ReceiptShareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: IssuedReceiptRecord;
  receiptElement: HTMLElement | null;
}

type ShareMode = 'kakao' | 'email';

type ShareResult =
  | { kind: 'shared' }
  | { kind: 'fallback'; message: string }
  | { kind: 'error'; message: string };

const buildMessage = (receipt: IssuedReceiptRecord) =>
  `[사단법인 너브내행복나눔재단 기부금영수증 발급 안내]\n\n안녕하세요, ${receipt.donorName}님.\n따뜻한 나눔으로 함께해주신 ${receipt.donorName}님께 깊은 감사를 드립니다.\n\n${receipt.taxYear}년도 기부금영수증 발급번호: ${receipt.receiptNo}\n기부금액: ${formatKRW(receipt.totalAmount)}원\n\n첨부된 PDF 파일을 확인해 주세요.`;

const canShareFiles = (file: File) => {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare === 'function') {
    try {
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }
  return false;
};

export const ReceiptShareWizard: React.FC<ReceiptShareWizardProps> = ({
  isOpen,
  onClose,
  receipt,
  receiptElement,
}) => {
  const [mode, setMode] = useState<ShareMode>('kakao');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState<ShareResult | null>(null);

  const message = useMemo(() => buildMessage(receipt), [receipt]);
  const fileName = useMemo(() => getReceiptPdfFileName(receipt), [receipt]);

  if (!isOpen) return null;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setStatus({ kind: 'fallback', message: '안내 문구를 클립보드에 복사했습니다.' });
    } catch {
      setStatus({ kind: 'error', message: '안내 문구 복사에 실패했습니다.' });
    }
  };

  const downloadAndPrepare = async (actionLabel: string) => {
    if (!receiptElement) {
      setStatus({ kind: 'error', message: '영수증 PDF를 만들 화면을 찾을 수 없습니다. 영수증 미리보기를 다시 열어주세요.' });
      return;
    }

    setIsWorking(true);
    setStatus(null);
    try {
      const { file, blob } = await generateReceiptPdfFile(receiptElement, receipt);
      downloadPdfBlob(blob, fileName);
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        // Clipboard permission is optional.
      }
      setStatus({
        kind: 'fallback',
        message: `${actionLabel}: PDF를 다운로드했고 안내 문구를 복사했습니다. 다운로드된 PDF를 ${mode === 'kakao' ? '카카오톡 대화창' : '이메일 첨부'}에 한 번 첨부해 주세요.`,
      });
      return file;
    } catch (error: any) {
      setStatus({ kind: 'error', message: error?.message || 'PDF 생성 중 오류가 발생했습니다.' });
      return null;
    } finally {
      setIsWorking(false);
    }
  };

  const handleShare = async () => {
    if (!receiptElement) {
      setStatus({ kind: 'error', message: '영수증 미리보기 화면을 찾을 수 없습니다.' });
      return;
    }

    setIsWorking(true);
    setStatus(null);
    try {
      const { file } = await generateReceiptPdfFile(receiptElement, receipt);

      if (canShareFiles(file)) {
        try {
          await navigator.share({
            title: `기부금영수증 - ${receipt.donorName}`,
            text: message,
            files: [file],
          });
          setStatus({ kind: 'shared', message: 'PDF 파일을 공유 창으로 전달했습니다. 카카오톡 또는 이메일을 선택해 전송하세요.' });
          return;
        } catch (error: any) {
          if (error?.name === 'AbortError') {
            setStatus(null);
            return;
          }
          console.warn('Web Share API failed:', error);
        }
      }

      // Desktop Chrome/Edge or other browsers may not support file sharing.
      downloadPdfBlob(file, fileName);
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        // Optional enhancement only.
      }

      if (mode === 'email') {
        const subject = encodeURIComponent(`[기부금영수증] ${receipt.taxYear}년도 ${receipt.donorName}님`);
        const body = encodeURIComponent(message);
        const target = email.trim();
        window.location.href = `mailto:${encodeURIComponent(target)}?subject=${subject}&body=${body}`;
        setStatus({
          kind: 'fallback',
          message: '이메일 작성창을 열었습니다. 다운로드된 PDF 파일을 이메일에 첨부해 주세요. 웹 브라우저는 보안상 파일 자동 첨부를 허용하지 않습니다.',
        });
      } else {
        setStatus({
          kind: 'fallback',
          message: '이 브라우저에서는 파일 공유가 지원되지 않습니다. PDF를 다운로드했습니다. 카카오톡 대화창에 PDF를 끌어놓고 전송해 주세요.',
        });
      }
    } catch (error: any) {
      setStatus({ kind: 'error', message: error?.message || 'PDF 생성 또는 공유 중 오류가 발생했습니다.' });
    } finally {
      setIsWorking(false);
    }
  };

  const handleSms = async () => {
    const phoneNumber = phone.replace(/[^0-9+]/g, '');
    const body = encodeURIComponent(message);
    try {
      if (phoneNumber) {
        window.location.href = `sms:${phoneNumber}?body=${body}`;
      } else {
        window.location.href = `sms:?body=${body}`;
      }
      await downloadAndPrepare('문자 메시지 앱 실행');
    } catch {
      setStatus({ kind: 'error', message: '문자 메시지 앱을 실행하지 못했습니다.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-slate-100 rounded-2xl shadow-2xl border border-white/40">
        <div className="bg-slate-950 text-white px-5 py-4 rounded-t-2xl flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-blue-600 p-2"><Share2 className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-extrabold">기부금영수증 발송 & 공유 마법사</h2>
              <p className="text-xs text-slate-300 mt-0.5">{receipt.donorName} 후원회원 | 발급번호 {receipt.receiptNo} | {receipt.taxYear}년도 / {formatKRW(receipt.totalAmount)}원</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white" title="닫기"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-2">
          <button
            onClick={() => { setMode('kakao'); setStatus(null); }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-extrabold transition ${mode === 'kakao' ? 'bg-yellow-400 text-slate-950 shadow' : 'bg-white border border-slate-300 text-slate-600'}`}
          >
            <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" /> 카카오톡 / 문자(SMS) 전송</span>
          </button>
          <button
            onClick={() => { setMode('email'); setStatus(null); }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-extrabold transition ${mode === 'email' ? 'bg-white border-2 border-blue-500 text-blue-900 shadow-sm' : 'bg-white border border-slate-300 text-slate-600'}`}
          >
            <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> 이메일(E-mail) 발송</span>
          </button>
        </div>

        <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-bold">
          <span className="text-blue-900">① 발급 안내 & PDF첨부</span><ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-blue-900">② 상대방(수신자) 선택</span><ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-emerald-600">③ 원클릭 전송 & 공유</span>
        </div>

        {status && (
          <div className={`mx-5 mt-4 rounded-xl border p-3 text-xs flex gap-2 ${status.kind === 'error' ? 'bg-red-50 border-red-200 text-red-800' : status.kind === 'shared' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            {status.kind === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : status.kind === 'shared' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          <section className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-800">1. 발급 안내 문구 및 첨부파일 확인</h3>
              <button onClick={copyMessage} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-lg"><Clipboard className="w-3.5 h-3.5" /> 문구 복사됨</button>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed">{message}</div>
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="w-9 h-9 rounded-md bg-red-50 text-red-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{fileName}</div>
                <div className="text-[11px] text-slate-500">법정 서식 A4 기부금영수증 PDF</div>
              </div>
              <button
                onClick={() => void downloadAndPrepare('PDF 준비')}
                disabled={isWorking}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-300 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50"
              ><Download className="w-3.5 h-3.5" /> PDF 다운로드</button>
            </div>
          </section>

          <section className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-800">2. 전송할 상대방(수신자) 정보 선택 및 확인</h3>
              <span className="text-xs text-blue-700 font-bold">기부자 자동 연동</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[11px] font-bold text-slate-600 mb-1">수신 회원 성명</span>
                <input value={receipt.donorName} readOnly className="w-full px-3 py-2.5 text-sm font-bold border border-slate-300 rounded-lg bg-slate-50" />
              </label>
              {mode === 'kakao' ? (
                <label className="block">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1 inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 수신자 휴대폰 번호 (문자/연락처)</span>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="예: 010-1234-5678 (문자 발송 시 필수)" className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg" />
                </label>
              ) : (
                <label className="block">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1 inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> 수신자 이메일</span>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="예: donor@example.com" className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg" />
                </label>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">💡 파일 공유가 지원되는 휴대폰/브라우저에서는 PDF가 실제 첨부파일로 공유됩니다. 지원되지 않는 PC 브라우저에서는 PDF 다운로드 후 직접 첨부하도록 안내합니다.</p>
          </section>

          <section className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-800">3. 공유 및 전송 방법 선택</h3>
              <span className="text-xs text-emerald-700 font-bold">파일 공유 지원 여부 자동 확인</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleShare}
                disabled={isWorking}
                className="rounded-xl bg-yellow-300 hover:bg-yellow-400 text-slate-950 p-4 text-left font-extrabold shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Share2 className="w-5 h-5" /> {mode === 'kakao' ? '카카오톡/기기 공유' : '이메일/기기 공유'}</span><ChevronRight className="w-5 h-5" /></div>
                <div className="text-[11px] font-semibold mt-2 opacity-80">PDF 파일을 실제 첨부한 상태로 기기 공유창을 엽니다.</div>
              </button>
              <button
                onClick={mode === 'kakao' ? handleSms : handleShare}
                disabled={isWorking}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-4 text-left font-extrabold text-slate-800 disabled:opacity-50"
              >
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2">{mode === 'kakao' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />} {mode === 'kakao' ? '휴대폰 문자(SMS)로 보내기' : '이메일 작성창 열기'}</span><ChevronRight className="w-5 h-5" /></div>
                <div className="text-[11px] font-semibold mt-2 text-slate-500">{mode === 'kakao' ? '휴대폰 문자 앱으로 안내 문구를 전달합니다.' : '파일 공유가 안 되는 브라우저에서는 PDF를 내려받아 직접 첨부합니다.'}</div>
              </button>
            </div>
            <button
              onClick={handleShare}
              disabled={isWorking}
              className="mt-3 w-full rounded-xl bg-slate-950 hover:bg-slate-900 text-white p-3 text-left font-bold disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2"><Share2 className="w-4 h-4" /> Windows / 기기 대상(성명) 목록에서 선택 전송</span>
              <span className="block text-[11px] text-slate-400 mt-1">시스템 공유 대상 목록을 열어 PDF 파일과 안내 문구를 함께 전송합니다.</span>
            </button>
          </section>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 rounded-b-2xl">
          <span>ⓘ 법정 서식 기부금영수증은 PDF 원본으로 첨부됩니다.</span>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold">닫기</button>
        </div>
      </div>
    </div>
  );
};
