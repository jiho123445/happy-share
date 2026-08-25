import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Download, FileText, FileArchive, FileSpreadsheet as FileSpreadsheetIcon, FolderOpen, Loader2 } from 'lucide-react';
import { MaterialItem } from '../types';
import { MATERIAL_TYPES } from '../data/coursesData';
import { db } from '../lib/firebase';
import { onStudentAuthStateChanged } from '../lib/studentAuth';
import {
  subscribeVisibleMaterialsFromFirestore,
  subscribeMaterialsFromFirestore,
  getMaterialDownloadUrl,
} from '../lib/firestoreService';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10).replace(/-/g, '.');
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 등록자 표시는 개인정보 보호 차원에서 이메일 전체가 아니라 '@' 앞부분만 보여줍니다.
function formatUploader(email: string): string {
  if (!email) return '관리자';
  return email.split('@')[0];
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['zip', 'exe'].includes(ext)) return FileArchive;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheetIcon;
  return FileText;
}

export const MaterialsSection: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // undefined = 관리자 여부 확인 중 (이 단계에서는 아직 어떤 목록도 구독하지 않습니다)
  const [isAdminViewer, setIsAdminViewer] = useState<boolean | undefined>(undefined);

  // 관리자 로그인 상태라면 학원서식을 포함한 전체 자료를, 그 외(비로그인/수강생)에는
  // 기존처럼 학생에게 공개된 자료만 보여주기 위해 admins 컬렉션에 본인 UID로 된
  // 문서가 있는지 확인합니다. (StudentAuthGate가 이미 같은 방식으로 관리자를
  // 판별하지만, 그 결과를 이 컴포넌트로 전달해주지 않으므로 여기서 별도로 확인합니다.)
  useEffect(() => {
    let cancelled = false;
    const unsub = onStudentAuthStateChanged((user) => {
      if (!user) {
        if (!cancelled) setIsAdminViewer(false);
        return;
      }
      getDoc(doc(db, 'admins', user.uid))
        .then((snap) => {
          if (!cancelled) setIsAdminViewer(snap.exists());
        })
        .catch(() => {
          if (!cancelled) setIsAdminViewer(false);
        });
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (isAdminViewer === undefined) return; // 관리자 여부 확인 전에는 구독하지 않음
    setIsLoading(true);
    const unsub = isAdminViewer
      ? subscribeMaterialsFromFirestore((data) => {
          setMaterials(data);
          setIsLoading(false);
        })
      : subscribeVisibleMaterialsFromFirestore((data) => {
          setMaterials(data);
          setIsLoading(false);
        });
    return () => unsub();
  }, [isAdminViewer]);

  const filtered = materials.filter((m) => {
    return selectedType === '전체' || m.materialType === selectedType;
  });

  const handleDownload = async (item: MaterialItem) => {
    if (downloadingId) return;
    setDownloadingId(item.id);
    try {
      const { url } = await getMaterialDownloadUrl(item.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err?.message || '다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDownloadingId(null);
    }
  };


  return (
    <section id="materials" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 font-extrabold text-xs mb-3 border border-blue-200/60 shadow-sm">
            <FolderOpen className="w-3.5 h-3.5" />
            자료실
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            서식 · 예제 · 프로그램 다운로드
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            수강생을 위한 각종 서식, 과정별 예제 파일, 채점프로그램을 내려받으실 수 있습니다.
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8">
          <span className="text-xs font-bold text-slate-500 shrink-0">유형</span>
          {['전체', ...MATERIAL_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white/60 backdrop-blur-md text-slate-700 border border-white/80 hover:bg-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden divide-y divide-white/60">
          {isLoading ? (
            <div className="divide-y divide-white/60">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 sm:p-6 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/80 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-200/80" />
                    <div className="h-3 w-1/3 rounded bg-slate-200/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              조건에 맞는 자료가 없습니다.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = getFileIcon(item.fileName);
              const isThisDownloading = downloadingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={downloadingId !== null}
                  className="w-full text-left p-5 sm:p-6 hover:bg-white/60 transition-colors flex items-center gap-4 group disabled:opacity-70 disabled:cursor-wait"
                >
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {item.materialType} · {formatFileSize(item.fileSize)} · 등록자 {formatUploader(item.uploadedBy)}
                      {' · '}{formatDate(item.createdAt)} · 다운로드 {item.downloadCount ?? 0}회
                    </p>
                  </div>
                  <div className="shrink-0 p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white transition-all">
                    {isThisDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
