import React, { useState, useEffect } from 'react';
import { Lock, UserPlus, LogIn, Clock, XCircle, LogOut, User as UserIcon, Mail } from 'lucide-react';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentProfile } from '../types';
import {
  signUpStudent,
  loginStudent,
  logoutStudent,
  onStudentAuthStateChanged,
  subscribeStudentProfile,
  resetStudentPassword,
} from '../lib/studentAuth';

interface StudentAuthGateProps {
  children: React.ReactNode;
}

/**
 * 입력 중인 숫자를 한국 전화번호 형식(하이픈 자동 삽입)으로 변환합니다.
 * - 서울(02) 지역번호: 02-XXX-XXXX / 02-XXXX-XXXX
 * - 그 외(010, 011, 033 등 3자리 국번): 0XX-XXX-XXXX / 0XX-XXXX-XXXX
 */
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

// 완성된 형식인지 확인 (예: 033-433-1926, 010-9079-1234).
// 하이픈 포함, 마지막 4자리까지 다 채워진 경우만 통과시킵니다.
const COMPLETE_PHONE_REGEX = /^0\d{1,2}-\d{3,4}-\d{4}$/;

/**
 * StudentAuthGate - 자료실 페이지를 감싸서, 로그인/가입/승인 상태에 따라
 * 다른 화면을 보여줍니다.
 *
 * - 비로그인: 로그인/회원가입 폼
 * - 로그인했고 admins 컬렉션에 등록된 관리자 계정인 경우: 그대로 통과
 * - 로그인했고 수강생인데 승인대기: "승인 대기 중" 안내
 * - 로그인했고 수강생인데 거절됨: 안내 + 문의 유도
 * - 로그인했고 수강생 승인됨: 자료실(children) 표시
 * - 로그인은 됐는데 관리자도 아니고 students 문서도 없는 경우: 관리자가 계정
 *   정보를 삭제(리셋)한 상태이므로, 통과시키지 않고 재가입을 안내합니다.
 */
export const StudentAuthGate: React.FC<StudentAuthGateProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined); // undefined = 확인 중
  const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
  const [profileLoadError, setProfileLoadError] = useState(false);
  const [isAdminAccount, setIsAdminAccount] = useState<boolean | undefined>(undefined); // undefined = 확인 중

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [forgotSent, setForgotSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    const unsub = onStudentAuthStateChanged((user) => {
      setAuthUser(user);
      if (!user) {
        setProfile(null);
        setIsAdminAccount(false);
      }
    });
    return () => unsub();
  }, []);

  // admins 컬렉션에 실제로 등록된 계정인지 명시적으로 확인합니다. (예전에는
  // "students 문서가 없으면 관리자"로 단순 추정했는데, 관리자가 수강생 계정을
  // 삭제해서 정보를 리셋한 경우에도 마찬가지로 students 문서가 없어져서
  // 관리자 계정으로 잘못 인식되어 승인 없이 통과되는 문제가 있었습니다.)
  useEffect(() => {
    if (!authUser) {
      setIsAdminAccount(false);
      return;
    }
    let cancelled = false;
    setIsAdminAccount(undefined);
    getDoc(doc(db, 'admins', authUser.uid))
      .then((snap) => {
        if (!cancelled) setIsAdminAccount(snap.exists());
      })
      .catch(() => {
        if (!cancelled) setIsAdminAccount(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setProfileLoadError(false);
      return;
    }
    setProfileLoadError(false);
    const unsub = subscribeStudentProfile(
      authUser.uid,
      (p) => {
        setProfile(p);
      },
      () => {
        // 프로필 조회 자체가 실패한 경우: "문서 없음(=관리자)"으로 잘못
        // 처리해 통과시키지 않고, 별도의 오류 상태로 남겨둡니다.
        setProfileLoadError(true);
      }
    );
    return () => unsub();
  }, [authUser]);

  // 승인 상태가 '승인됨'으로 바뀌면, 로그인 토큰에 담긴 Custom Claims
  // (approved: true)를 최신 상태로 강제 갱신합니다. 관리자가 방금 승인
  // 처리를 해도 로그인 토큰 자체는 자동으로 갱신되지 않아서, 이 과정이
  // 없으면 화면에는 "승인됨"으로 보이는데도 실제 파일 다운로드(Storage
  // 권한 확인)는 옛 토큰 때문에 막히는 경우가 있을 수 있습니다.
  useEffect(() => {
    if (authUser && profile?.status === '승인됨') {
      authUser.getIdToken(true).catch((err) => {
        console.warn('토큰 갱신 실패(다운로드 시 다시 시도됩니다):', err);
      });
    }
  }, [authUser, profile?.status]);

  // 관리자 계정(admins 컬렉션에 등록됨)만 통과시킵니다. students 문서가 없다는
  // 사실만으로는 더 이상 관리자로 간주하지 않습니다(계정 삭제로 리셋된
  // 수강생일 수 있기 때문입니다).
  const isVerifiedAdmin = authUser && isAdminAccount === true;
  // 관리자도 아니고 students 문서도 없는 상태: 계정이 리셋됐거나(관리자가
  // 삭제) 정상적으로 가입 절차를 거치지 않은 경우입니다.
  const isResetOrUnregistered = authUser && isAdminAccount === false && profile === null;

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        if (!name.trim() || !phone.trim()) {
          setErrorMsg('성함과 연락처를 입력해 주세요.');
          setIsSubmitting(false);
          return;
        }
        if (!COMPLETE_PHONE_REGEX.test(phone.trim())) {
          setErrorMsg('연락처를 끝까지 정확히 입력해 주세요. (예: 010-9079-1234)');
          setIsSubmitting(false);
          return;
        }
        await signUpStudent({ name, phone, email, password });
        setSignupDone(true);
      } else {
        await loginStudent(email, password);
      }
      resetForm();
    } catch (err: any) {
      setErrorMsg(err?.message || '요청을 처리하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('이메일을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetStudentPassword(email);
      setForgotSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message || '요청을 처리하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인증 상태 확인 중
  if (authUser === undefined) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-sm text-slate-400">
        확인 중...
      </div>
    );
  }

  // 비로그인 상태: 로그인/가입 폼
  if (!authUser) {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">수강생 전용 자료실</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              서식·예제·프로그램 자료는 재원생만 열람할 수 있어요.
              <br />
              계정이 없으시면 회원가입 후 원장님 승인을 받아주세요.
            </p>
          </div>

          {signupDone ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700 font-bold">가입 신청이 접수됐어요!</p>
              <p className="text-xs text-slate-500">
                입력하신 이메일 형식이 정상적으로 확인되어 가입 신청이 접수됐어요.
                원장님 승인까지 마쳐야 자료실을 이용하실 수 있어요. 급하시면 학원으로 전화 주세요.
              </p>
              <button
                onClick={() => {
                  setSignupDone(false);
                  setMode('login');
                }}
                className="text-xs font-bold text-blue-600 underline underline-offset-2"
              >
                로그인 화면으로
              </button>
            </div>
          ) : mode === 'forgot' ? (
            <div>
              {forgotSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-700 font-bold">비밀번호 재설정 메일을 보냈어요</p>
                  <p className="text-xs text-slate-500">
                    입력하신 이메일로 메일이 도착했을 거예요(스팸함도 확인해 주세요). 메일 속
                    링크를 눌러 새 비밀번호를 설정해 주세요.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSent(false);
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-xs font-bold text-blue-600 underline underline-offset-2"
                  >
                    로그인 화면으로
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500 mb-1">
                    가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드려요.
                  </p>
                  <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                  />
                  {errorMsg && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isSubmitting ? '전송 중...' : '재설정 메일 보내기'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    로그인 화면으로 돌아가기
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  로그인
                </button>
                <button
                  onClick={() => { setMode('signup'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  회원가입
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <input
                      type="text"
                      placeholder="성함"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="연락처 (예: 010-1234-5678)"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      maxLength={13}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                    />
                  </>
                )}
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                />
                <input
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                />

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMsg(''); setForgotSent(false); }}
                      className="text-[11px] font-bold text-slate-400 hover:text-blue-600"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isSubmitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // 프로필 조회 실패: 권한 없이 통과시키지 않고 오류 화면을 보여줍니다.
  // (profile===undefined 체크보다 먼저 검사해야 합니다 - 오류가 나면 profile은
  // 계속 undefined로 남기 때문에, 순서가 바뀌면 이 분기에 영영 도달하지 못합니다.)
  if (profileLoadError) {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">확인 중 오류가 발생했어요</h3>
          <p className="text-sm text-slate-500">
            계정 정보를 불러오지 못했어요. 잠시 후 새로고침해 주시거나, 계속되면 학원으로
            문의해 주세요.
          </p>
          <button
            onClick={() => logoutStudent()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // 관리자 여부 확인 중
  if (isAdminAccount === undefined) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-sm text-slate-400">
        확인 중...
      </div>
    );
  }

  // 관리자 계정: 자료실 승인 절차 없이 바로 통과
  if (isVerifiedAdmin) {
    return <>{children}</>;
  }

  // 프로필 확인 중
  if (profile === undefined) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-sm text-slate-400">
        확인 중...
      </div>
    );
  }

  // 관리자도 아니고 students 문서도 없는 상태: 관리자가 계정 정보를 삭제해
  // 리셋했거나, 정상 가입 절차를 거치지 않은 경우입니다. 통과시키지 않고
  // 재가입을 안내합니다.
  if (isResetOrUnregistered) {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <UserIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">등록된 계정 정보가 없어요</h3>
          <p className="text-sm text-slate-500">
            이 계정의 수강생 정보가 초기화됐어요. 자료실을 이용하시려면 다시 회원가입해 주세요.
          </p>
          <button
            onClick={async () => {
              await logoutStudent();
              setMode('signup');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃하고 다시 가입하기
          </button>
        </div>
      </div>
    );
  }

  // 수강생 - 승인대기
  if (profile && profile.status === '승인대기') {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">승인 대기 중이에요</h3>
          <p className="text-sm text-slate-500">
            {profile.name}님, 회원가입이 접수됐어요. 원장님 승인 후 자료실을 이용하실 수
            있어요. 급하시면 학원으로 전화 주세요.
          </p>
          <button
            onClick={() => logoutStudent()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // 수강생 - 거절됨
  if (profile && profile.status === '거절됨') {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">승인되지 않았어요</h3>
          <p className="text-sm text-slate-500">
            계정 확인이 필요해요. 학원으로 문의해 주세요.
          </p>
          <button
            onClick={() => logoutStudent()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // 승인됨: 자료실 표시 + 상단에 로그아웃 바
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-2 mb-2 text-xs text-slate-500">
        <UserIcon className="w-3.5 h-3.5" />
        <span className="font-bold">{profile?.name}님</span>
        <button
          onClick={() => logoutStudent()}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          로그아웃
        </button>
      </div>
      {children}
    </div>
  );
};
