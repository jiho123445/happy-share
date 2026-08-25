import React, { useState, useCallback } from 'react';
import { ShieldCheck, User, HelpCircle, Trash2, RefreshCw } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AccountItem {
  uid: string;
  email: string;
  createdAt: string;
  role: 'admin' | 'student' | 'unknown';
  name?: string;
  phone?: string;
  status?: '승인대기' | '승인됨' | '거절됨';
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * AccountManagementPanel - Firebase Authentication에 등록된 모든 로그인
 * 계정을 관리자/수강생/미등록(고아 계정)으로 구분해서 보여주고, 정리(삭제)할
 * 수 있는 화면입니다.
 *
 * "미등록" 계정은 Authentication에는 로그인 정보가 남아있지만 Firestore의
 * admins/students 컬렉션 어디에도 연결돼 있지 않은 계정입니다. 과거에
 * 삭제가 절반만 처리됐던 경우(로그인 계정만 남고 프로필은 지워진 경우) 등에
 * 이런 상태가 생길 수 있어, 여기서 한 번에 확인하고 정리할 수 있습니다.
 */
export const AccountManagementPanel: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState<'전체' | 'admin' | 'student' | 'unknown'>('전체');
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('로그인 정보가 없습니다.');

      const response = await fetch('/api/list-accounts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === 'SERVICE_ACCOUNT_NOT_CONFIGURED') {
          throw new Error(
            '서버 설정이 아직 안 돼 있어요. SECURITY_SETUP.md의 "수강생 완전 삭제 기능 서버 설정" 안내를 참고해 FIREBASE_SERVICE_ACCOUNT_KEY를 등록해 주세요.'
          );
        }
        throw new Error(data.error || '계정 목록을 불러오지 못했습니다.');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err: any) {
      console.error('계정 목록 조회 실패:', err);
      setErrorMsg(err?.message || '계정 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (uid: string) => {
    setProcessingUid(uid);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('로그인 정보가 없습니다.');

      const response = await fetch('/api/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || '삭제 요청이 실패했습니다.');
      }

      setAccounts((prev) => (prev ? prev.filter((a) => a.uid !== uid) : prev));
    } catch (err: any) {
      console.error('계정 삭제 실패:', err);
      alert(err?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessingUid(null);
      setConfirmDeleteUid(null);
    }
  };

  const filtered = (accounts || []).filter((a) => filter === '전체' || a.role === filter);
  const unknownCount = (accounts || []).filter((a) => a.role === 'unknown').length;

  const roleBadge = (account: AccountItem) => {
    if (account.role === 'admin')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-black">
          <ShieldCheck className="w-3 h-3" />
          관리자
        </span>
      );
    if (account.role === 'student')
      return (
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
            account.status === '승인됨'
              ? 'bg-emerald-100 text-emerald-800'
              : account.status === '거절됨'
              ? 'bg-red-100 text-red-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          수강생 · {account.status}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[11px] font-black">
        <HelpCircle className="w-3 h-3" />
        미등록(고아 계정)
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600 leading-relaxed">
        Firebase Authentication에 등록된 <strong>모든 로그인 계정</strong>을 불러와서,
        관리자/수강생/<strong>미등록(고아 계정)</strong>으로 구분해 보여줘요. 미등록 계정은
        로그인 정보는 남아있지만 실제 역할 정보가 없는 상태라, 필요하면 여기서 정리(삭제)할 수 있어요.
      </div>

      {accounts === null ? (
        <button
          onClick={loadAccounts}
          disabled={loading}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? '불러오는 중...' : '전체 계정 목록 불러오기'}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          {(['전체', 'admin', 'student', 'unknown'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === f ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {f === '전체' ? '전체' : f === 'admin' ? '관리자' : f === 'student' ? '수강생' : '미등록'}
              {f === 'unknown' && unknownCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{unknownCount}</span>
              )}
            </button>
          ))}
          <button
            onClick={loadAccounts}
            disabled={loading}
            className="ml-auto p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl text-xs sm:text-sm font-bold bg-red-50 border border-red-200 text-red-800">
          {errorMsg}
        </div>
      )}

      {accounts !== null && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">해당하는 계정이 없습니다.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((account) => (
                <div key={account.uid} className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {account.name || account.email}
                      </p>
                      {roleBadge(account)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {account.email}
                      {account.phone && ` · ${account.phone}`}
                      {account.createdAt && ` · 가입일 ${formatDate(account.createdAt)}`}
                    </p>
                  </div>

                  {account.role === 'admin' ? (
                    <span className="text-[11px] text-slate-400 shrink-0 pr-1">
                      Firebase 콘솔에서만 삭제 가능
                    </span>
                  ) : confirmDeleteUid === account.uid ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDelete(account.uid)}
                        disabled={processingUid === account.uid}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {processingUid === account.uid ? '삭제 중...' : '삭제 확인'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUid(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteUid(account.uid)}
                      disabled={processingUid === account.uid}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="계정 완전 삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
