import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertCircle, Download, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';

interface ErrorLogEntry {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent?: string;
  context?: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  summary: string;
  adminEmail?: string;
  createdAt: string;
}

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
};

/**
 * MONITORING + AUDIT TRAIL (2026-08 addition). Two panels:
 *
 * 1. 오류 로그 (error log) — populated by src/utils/errorLogger.ts, which
 *    is wired into the global ErrorBoundary and window error/rejection
 *    handlers (see main.tsx). This is what would have shown the /gallery
 *    404s and the CSP-blocked photo upload automatically, instead of the
 *    admin needing to screenshot the browser console.
 *
 * 2. 활동 로그 (audit log) — populated by src/utils/auditLog.ts, called
 *    after every successful admin write (see FoundationContext.tsx's
 *    postMutationToServer and the gallery/donation/inquiry/subscriber
 *    status-update functions). A simple "what changed and when" trail.
 *
 * Both collections are locked down in firestore.rules to admin-only read
 * (errorLogs can be *written* by anyone, since visitors who aren't logged
 * in are exactly who hits most of these errors — see the rules file for
 * the reasoning). Fetched with a plain getDocs() on demand rather than a
 * live onSnapshot listener, since this is a diagnostics view the admin
 * checks occasionally, not something that needs to update in real time.
 */
export const AdminSystemLogs: React.FC<{ onBackupDownload: () => void }> = ({ onBackupDownload }) => {
  const [subTab, setSubTab] = useState<'errors' | 'audit' | 'backup'>('errors');
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const load = async () => {
    if (subTab === 'backup') return;
    setLoading(true);
    setLoadError(null);
    try {
      if (subTab === 'errors') {
        const q = query(collection(db, 'errorLogs'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        setErrorLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ErrorLogEntry, 'id'>) })));
      } else {
        const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLogEntry, 'id'>) })));
      }
    } catch (err) {
      console.error('시스템 로그 조회 실패:', err);
      setLoadError('로그를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  const handleClearAll = async () => {
    const entries = subTab === 'errors' ? errorLogs : auditLogs;
    const collectionName = subTab === 'errors' ? 'errorLogs' : 'auditLogs';
    try {
      await Promise.all(entries.map((e) => deleteDoc(doc(db, collectionName, e.id))));
      setClearConfirm(false);
      load();
    } catch (err) {
      console.error('로그 삭제 실패:', err);
      setLoadError('로그 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setSubTab('errors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'errors' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            오류 로그
          </button>
          <button
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'audit' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            활동 로그
          </button>
          <button
            onClick={() => setSubTab('backup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'backup' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            백업
          </button>
        </div>

        {subTab !== 'backup' && (
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 새로고침
          </button>
          {clearConfirm ? (
            <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-lg">
              <span className="text-[10px] font-bold text-red-700 px-1">전체 삭제?</span>
              <button
                onClick={handleClearAll}
                className="bg-red-600 text-white font-black text-[10px] px-2 py-1 rounded-md"
              >
                삭제
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded-md"
              >
                취소
              </button>
            </div>
          ) : (
            (subTab === 'errors' ? errorLogs.length > 0 : auditLogs.length > 0) && (
              <button
                onClick={() => setClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 전체 삭제
              </button>
            )
          )}
        </div>
        )}
      </div>

      {loadError && (
        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200">
          {loadError}
        </div>
      )}

      {subTab === 'backup' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">전체 데이터 백업 다운로드</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                재단정보, 주요사업, 공지사항, 보도자료, 갤러리, 팝업, 후원 신청, 문의, 소식지 구독자 정보를
                하나의 JSON 파일로 내려받습니다. 실수로 데이터를 삭제했거나 복구가 필요할 때를 대비해,
                주기적으로(예: 매월 1회) 다운로드해서 안전한 곳(회사 PC, 클라우드 드라이브 등)에
                보관해두는 것을 권장합니다. 후원자·문의자 개인정보가 포함되어 있으니 파일을 함부로
                공유하지 않도록 주의해 주세요.
              </p>
              <button
                onClick={onBackupDownload}
                className="mt-4 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" /> 지금 백업 다운로드 (JSON)
              </button>
            </div>
          </div>
        </div>
      ) : subTab === 'errors' ? (
        errorLogs.length === 0 && !loading ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            기록된 오류가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {errorLogs.map((e) => (
              <div key={e.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 break-words">{e.message}</p>
                      <p className="text-slate-400 mt-1 break-all">{e.url}</p>
                      {e.context && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {e.context}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatTime(e.createdAt)}</span>
                </div>
                {e.stack && (
                  <button
                    onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    className="mt-2 text-[10px] font-bold text-orange-600 hover:underline"
                  >
                    {expandedId === e.id ? '스택 트레이스 접기' : '스택 트레이스 보기'}
                  </button>
                )}
                {expandedId === e.id && e.stack && (
                  <pre className="mt-2 bg-slate-900 text-slate-200 text-[10px] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                    {e.stack}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )
      ) : auditLogs.length === 0 && !loading ? (
        <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
          아직 기록된 활동이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {auditLogs.map((a) => (
            <div key={a.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 break-words">{a.summary}</p>
                <p className="text-slate-400 mt-0.5">
                  {a.adminEmail || '관리자'} · <span className="font-mono">{a.action}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatTime(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
