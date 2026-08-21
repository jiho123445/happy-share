import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Image as ImageIcon, 
  Layers, 
  Database,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export const SyncDebugOverlay: React.FC = () => {
  const { 
    isSyncing, 
    syncStatus, 
    lastSyncTime, 
    syncError, 
    debugLogs, 
    clearDebugLogs, 
    refreshData, 
    gallery, 
    notices, 
    programs, 
    popups,
    showDebugOverlay,
    setShowDebugOverlay
  } = useFoundation();

  const [isOpen, setIsOpen] = useState(false);

  // NOTE: this used to also call `/api/debug`, a public endpoint (no
  // login required) that dumped the server's internal file list and data
  // counts. That endpoint has been removed for security reasons — see
  // src/serverApp.ts — so the "서버 진단" button and its output panel
  // were removed here too rather than pointing at a dead/insecure route.

  const getStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />;
    if (syncStatus === 'error') return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) return '동기화 중...';
    if (syncStatus === 'error') return '동기화 오류';
    return '동기화 정상';
  };

  // If debug overlay is completely hidden by user
  if (!showDebugOverlay) {
    return (
      <button
        onClick={() => setShowDebugOverlay(true)}
        className="fixed bottom-4 right-4 z-50 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white p-2 rounded-full shadow-lg border border-slate-700/80 text-xs flex items-center gap-1.5 transition-all backdrop-blur-sm"
        title="디버그 오버레이 열기"
      >
        <Activity className="w-4 h-4 text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-md w-full font-sans text-xs">
      {/* Floating Status Bar / Trigger Pill */}
      {!isOpen && (
        <div className="bg-slate-950/90 text-slate-200 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 transition-all">
          <div 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-1"
          >
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              {getStatusIcon()}
              <span className="font-semibold text-slate-200">{getStatusText()}</span>
            </div>
            <div className="truncate text-slate-400 text-[11px]">
              갤러리 <span className="text-emerald-400 font-bold">{gallery.length}</span> · 공지 <span className="text-blue-400 font-bold">{notices.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => refreshData()}
              disabled={isSyncing}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="즉시 서버 동기화"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="상세 진단창 열기"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDebugOverlay(false)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="오버레이 숨기기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Debug Panel */}
      {isOpen && (
        <div className="bg-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col max-h-[85vh] sm:max-h-[500px]">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                  실시간 데이터 & 사진 동기화 진단
                </h4>
                <p className="text-[10px] text-slate-400">모바일 / PC 크로스 디바이스 상태 모니터링</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDebugOverlay(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900/50 border-b border-slate-800 text-center text-[11px]">
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">갤러리 사진</span>
              <span className="text-sm font-black text-emerald-400">{gallery.length}건</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">공지소식</span>
              <span className="text-sm font-black text-blue-400">{notices.length}건</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">사업안내</span>
              <span className="text-sm font-black text-amber-400">{programs.length}건</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">팝업안내</span>
              <span className="text-sm font-black text-purple-400">{popups.length}건</span>
            </div>
          </div>

          {/* Status info bar */}
          <div className="px-3 py-2 bg-slate-900/30 border-b border-slate-800 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                캐시 제어:
              </span>
              <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                no-store, no-cache 강제 적용
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                사진 보존소:
              </span>
              <span className="text-slate-200">
                영구 JSON Store + Disk 동기화
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">최근 동기화:</span>
              <span className="font-mono text-slate-300">{lastSyncTime || '확인 중...'}</span>
            </div>
            {syncError && (
              <div className="text-rose-400 bg-rose-950/50 p-1.5 rounded-lg border border-rose-800/60 mt-1">
                에러: {syncError}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-2 bg-slate-900 flex items-center gap-2 border-b border-slate-800">
            <button
              onClick={() => refreshData()}
              disabled={isSyncing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              즉시 강제 동기화
            </button>
            <button
              onClick={clearDebugLogs}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="로그 지우기"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Log Stream */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-950 font-mono text-[10px] min-h-[140px] max-h-[220px]">
            <div className="text-slate-500 text-[9px] uppercase font-bold tracking-wider px-1">동기화 실시간 로그</div>
            {debugLogs.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">기록된 로그가 없습니다.</div>
            ) : (
              debugLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-1.5 rounded-lg border flex items-start gap-1.5 ${
                    log.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                      : log.type === 'error'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : log.type === 'warn'
                      ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                  <div className="flex-1 break-all">
                    <span>{log.message}</span>
                    {log.details && (
                      <span className="block text-[9px] opacity-75 mt-0.5">{log.details}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
