import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, User, Trash2 } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { StudentProfile } from '../types';

function subscribeAllStudents(onUpdate: (students: StudentProfile[]) => void): () => void {
  const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const students = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          status: data.status || '승인대기',
          createdAt: data.createdAtIso || '',
        } as StudentProfile;
      });
      onUpdate(students);
    },
    (err) => console.error('수강생 목록 구독 실패:', err)
  );
}

/**
 * 수강생 승인 상태를 변경합니다.
 *
 * 1차 시도: 서버(api/set-student-approval)를 통해 Firestore 상태 변경과
 * 동시에 Firebase Authentication Custom Claims(approved: true/false)를
 * 설정합니다. 이 Claims는 Storage 규칙에서 "승인된 수강생만 실제 파일
 * 다운로드 가능"을 판단하는 근거로 쓰입니다.
 *
 * 서버 기능이 아직 설정되지 않았다면(FIREBASE_SERVICE_ACCOUNT_KEY 미등록),
 * Firestore 상태만이라도 직접 변경합니다. 이 경우 화면상으로는 승인된
 * 것처럼 보이지만, 실제 파일 다운로드(Storage) 권한은 Custom Claims가
 * 없어서 막힐 수 있습니다 - 서버 설정을 완료하시는 것을 권장합니다.
 */
async function updateStudentStatus(uid: string, status: '승인됨' | '거절됨'): Promise<{ claimsUpdated: boolean }> {
  const idToken = await auth.currentUser?.getIdToken();

  if (idToken) {
    try {
      const response = await fetch('/api/set-student-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid, status }),
      });
      if (response.ok) {
        return { claimsUpdated: true };
      }
      const data = await response.json().catch(() => ({}));
      console.warn('서버 기반 승인 처리 실패, Firestore만 업데이트합니다:', data);
    } catch (err) {
      console.warn('서버 기반 승인 처리 요청 실패, Firestore만 업데이트합니다:', err);
    }
  }

  await updateDoc(doc(db, 'students', uid), { status });
  return { claimsUpdated: false };
}

/**
 * 수강생 등록 정보를 완전히 삭제(리셋)합니다.
 *
 * 1차 시도: 서버(api/delete-student)를 통해 Firebase Authentication 로그인
 * 계정 자체와 Firestore 프로필을 모두 삭제합니다. 이렇게 해야 같은 이메일로
 * 처음부터 다시 회원가입할 수 있습니다 (Auth 계정이 남아있으면 "이미 가입된
 * 이메일입니다" 오류로 재가입이 막힙니다).
 *
 * 서버 기능이 아직 설정되지 않았다면(Vercel에 FIREBASE_SERVICE_ACCOUNT_KEY
 * 환경변수 미등록 - SECURITY_SETUP.md 참고), Firestore 프로필만이라도 삭제하는
 * 방식으로 대체합니다. 이 경우 자료실 접근은 확실히 막히지만, 같은 이메일로
 * 재가입하려면 별도로 Firebase 콘솔에서 그 계정을 지워야 합니다.
 */
async function deleteStudentAccount(uid: string): Promise<{ fullyDeleted: boolean }> {
  const idToken = await auth.currentUser?.getIdToken();

  if (idToken) {
    try {
      const response = await fetch('/api/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid }),
      });
      if (response.ok) {
        return { fullyDeleted: true };
      }
      const data = await response.json().catch(() => ({}));
      console.warn('서버 기반 계정 삭제 실패, Firestore만 삭제합니다:', data);
    } catch (err) {
      console.warn('서버 기반 계정 삭제 요청 실패, Firestore만 삭제합니다:', err);
    }
  }

  // 서버 삭제가 안 되면 최소한 Firestore 프로필만이라도 지웁니다.
  await deleteDoc(doc(db, 'students', uid));
  return { fullyDeleted: false };
}

export const StudentApprovalPanel: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'전체' | '승인대기' | '승인됨' | '거절됨'>('승인대기');
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAllStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = students.filter((s) => filter === '전체' || s.status === filter);
  const pendingCount = students.filter((s) => s.status === '승인대기').length;

  const handleUpdate = async (uid: string, status: '승인됨' | '거절됨') => {
    setProcessingUid(uid);
    try {
      const { claimsUpdated } = await updateStudentStatus(uid, status);
      if (!claimsUpdated && status === '승인됨') {
        alert(
          '승인 처리는 됐지만, 서버 설정이 안 돼 있어 실제 파일 다운로드 권한(Storage)은 아직 적용 안 됐을 수 있어요.\n' +
          'SECURITY_SETUP.md의 서버 설정 안내를 참고해 주세요.'
        );
      }
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingUid(null);
    }
  };

  const handleDelete = async (uid: string) => {
    setProcessingUid(uid);
    try {
      const { fullyDeleted } = await deleteStudentAccount(uid);
      if (!fullyDeleted) {
        alert(
          '수강생 정보는 삭제됐지만, 로그인 계정 자체는 서버 설정이 안 돼 있어 그대로 남아있어요.\n' +
          '같은 이메일로 재가입하려면 Firebase 콘솔(Authentication)에서 별도로 계정을 지워야 해요.\n' +
          '(SECURITY_SETUP.md의 서버 설정 안내를 참고해 주세요)'
        );
      }
    } catch (err) {
      console.error('수강생 정보 삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessingUid(null);
      setConfirmDeleteUid(null);
    }
  };

  const statusBadge = (status: StudentProfile['status']) => {
    if (status === '승인대기')
      return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black">승인대기</span>;
    if (status === '승인됨')
      return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black">승인됨</span>;
    return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-black">거절됨</span>;
  };

  return (
    <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(['승인대기', '승인됨', '거절됨', '전체'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === f ? 'bg-teal-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f}
            {f === '승인대기' && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">해당하는 수강생이 없습니다.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <div key={s.uid} className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                    {statusBadge(s.status)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.phone} · {s.email}</p>
                </div>

                {confirmDeleteUid === s.uid ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(s.uid)}
                      disabled={processingUid === s.uid}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      {processingUid === s.uid ? '삭제 중...' : '삭제 확인'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteUid(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    {s.status !== '승인됨' && (
                      <button
                        onClick={() => handleUpdate(s.uid, '승인됨')}
                        disabled={processingUid === s.uid}
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                        title="승인"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                    {s.status !== '거절됨' && (
                      <button
                        onClick={() => handleUpdate(s.uid, '거절됨')}
                        disabled={processingUid === s.uid}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="거절"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteUid(s.uid)}
                      disabled={processingUid === s.uid}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="계정 정보 삭제 (리셋)"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
