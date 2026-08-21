import React, { useState } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useFoundation } from '../context/FoundationContext';

/**
 * Firestore 저장이 실패했을 때(예: 문서 용량 초과, 네트워크 오류 등) 화면에
 * 눈에 띄게 알려주는 배너. 예전에는 콘솔에만 경고가 찍히고 화면에는 아무 표시가
 * 없어서, 관리자가 "저장됐다"고 착각한 채 넘어갔다가 나중에 데이터가 사라진 것처럼
 * 보이는 문제가 있었다. 이 배너가 그 간극을 메운다.
 */
export const SyncErrorBanner: React.FC = () => {
  const { syncStatus, syncError, refreshData } = useFoundation();
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  if (syncStatus !== 'error' || !syncError || syncError === dismissedError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md">
      <div className="bg-red-50 border border-red-300 shadow-lg rounded-xl p-3.5 flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-700">저장에 실패했습니다</p>
          <p className="text-xs text-red-600 mt-0.5 break-words">{syncError}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                refreshData();
                setDismissedError(syncError);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg px-2.5 py-1.5 hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
            <button
              onClick={() => setDismissedError(syncError)}
              className="text-xs font-semibold text-slate-500 px-2.5 py-1.5 hover:text-slate-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissedError(syncError)}
          className="text-red-400 hover:text-red-600 shrink-0"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
