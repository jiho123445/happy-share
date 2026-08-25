import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  X,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  FileSpreadsheet as FileSpreadsheetIcon,
} from 'lucide-react';
import { MaterialItem } from '../types';
import { MATERIAL_COURSE_CATEGORIES, MATERIAL_TYPES } from '../data/coursesData';
import {
  subscribeMaterialsFromFirestore,
  uploadMaterialToFirestore,
  deleteMaterialFromFirestore,
  getMaterialDownloadUrl,
  backfillLegacyMaterialsVisibility,
} from '../lib/firestoreService';

// 업로드 용량 상한 (Storage 규칙과 동일하게 100MB로 맞춰둠 - 채점프로그램 설치파일 등을 고려)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

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

export const MaterialsAdminPanel: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState(MATERIAL_COURSE_CATEGORIES[0]);
  const [materialType, setMaterialType] = useState<MaterialItem['materialType']>('학원서식');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState(0); // 몇 번째 파일을 업로드 중인지 (0-based)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const unsub = subscribeMaterialsFromFirestore(
      (data) => {
        setMaterials(data);
        setLoading(false);
      },
      (error) => {
        setMaterials([]);
        setLoading(false);
        setLoadError(error?.message || "자료실 목록을 불러오지 못했습니다.");
      }
    );
    return () => unsub();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    const files: File[] = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE);

    if (oversized.length > 0) {
      setStatusMessage({
        type: 'error',
        text: `${oversized.map((f) => f.name).join(', ')} 파일은 최대 ${formatFileSize(MAX_FILE_SIZE)}를 초과해 제외됐습니다.`,
      });
    } else {
      setStatusMessage(null);
    }

    // 같은 파일을 다시 선택했을 때 중복 추가되지 않도록 이름+크기 기준으로 걸러냅니다.
    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}`));
      const toAdd = validFiles.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
      return [...prev, ...toAdd];
    });

    // 파일이 하나뿐이고 제목이 비어 있으면 확장자를 뺀 파일명을 기본값으로 채워줍니다.
    // (여러 개를 선택한 경우엔 제목을 공통으로 쓰지 않고 파일명을 그대로 각자 제목으로 사용합니다.)
    if (validFiles.length === 1 && !title) {
      setTitle(validFiles[0].name.replace(/\.[^/.]+$/, ''));
    }

    e.target.value = '';
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: '업로드할 파일을 선택해 주세요.' });
      return;
    }
    if (selectedFiles.length === 1 && !title.trim()) {
      setStatusMessage({ type: 'error', text: '자료 제목을 입력해 주세요.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingIndex(0);
    setStatusMessage(null);

    const failedFiles: string[] = [];
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadingIndex(i);
      setUploadProgress(0);

      // 파일이 하나면 입력한 제목을 그대로 쓰고, 여러 개면 각 파일명(확장자 제외)을
      // 개별 제목으로 사용합니다. 설명/과정/유형은 선택한 모든 파일에 공통 적용됩니다.
      const itemTitle = selectedFiles.length === 1 ? title : file.name.replace(/\.[^/.]+$/, '');

      try {
        await uploadMaterialToFirestore(
          file,
          { title: itemTitle, description, courseCategory, materialType },
          (percent) => setUploadProgress(percent)
        );
        successCount++;
      } catch (err) {
        console.error(`'${file.name}' 업로드 실패:`, err);
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length === 0) {
      setStatusMessage({
        type: 'success',
        text: successCount === 1 ? `'${title}' 자료가 업로드되었습니다.` : `${successCount}개 자료가 업로드되었습니다.`,
      });
      setSelectedFiles([]);
      setTitle('');
      setDescription('');
    } else {
      setStatusMessage({
        type: 'error',
        text: `${successCount}개 성공, ${failedFiles.length}개 실패했습니다. (실패: ${failedFiles.join(', ')})`,
      });
      // 실패한 파일만 다시 선택 목록에 남겨서 재시도하기 쉽게 합니다.
      setSelectedFiles((prev) => prev.filter((f) => failedFiles.includes(f.name)));
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadingIndex(0);
  };

  const handleDownload = async (item: MaterialItem) => {
    if (downloadingId) return;
    setDownloadingId(item.id);
    try {
      const { url } = await getMaterialDownloadUrl(item.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err?.message || '다운로드에 실패했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (item: MaterialItem) => {
    setDeletingId(item.id);
    try {
      await deleteMaterialFromFirestore(item.id, item.storagePath);
    } catch (err) {
      console.error('자료 삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // 예전(자료실 공개 필터 기능이 생기기 전)에 등록한 자료는 studentVisible
  // 필드가 없어서, 홈페이지 자료실(수강생/재원생용) 쿼리에는 아예 잡히지
  // 않았습니다. 이 버튼으로 한 번만 필드를 채워 넣어 복구합니다.
  const handleBackfillVisibility = async () => {
    setIsBackfilling(true);
    setStatusMessage(null);
    try {
      const { updatedCount, totalCount } = await backfillLegacyMaterialsVisibility();
      setStatusMessage({
        type: 'success',
        text:
          updatedCount > 0
            ? `예전 자료 ${updatedCount}건(전체 ${totalCount}건 중)의 홈페이지 노출 설정을 복구했습니다.`
            : `복구할 예전 자료가 없습니다 (전체 ${totalCount}건 모두 정상).`,
      });
    } catch (err) {
      console.error('자료 노출 필드 복구 실패:', err);
      setStatusMessage({ type: 'error', text: '복구 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
      {loadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-bold">
          자료실 목록을 불러오지 못했습니다.<br />
          <span className="font-normal break-all">{loadError}</span>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Legacy visibility backfill */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="text-xs sm:text-sm text-amber-900">
          <p className="font-black">예전 자료가 홈페이지 자료실에 안 보이나요?</p>
          <p className="text-amber-700 mt-0.5">
            자료실 공개 기능이 생기기 전에 등록한 자료는 노출 설정 값이 비어 있어 홈페이지에 표시되지
            않을 수 있습니다. 아래 버튼을 눌러 한 번 복구해 주세요(여러 번 눌러도 안전합니다).
          </p>
        </div>
        <button
          type="button"
          onClick={handleBackfillVisibility}
          disabled={isBackfilling}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {isBackfilling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{isBackfilling ? '복구 중...' : '예전 자료 노출 복구'}</span>
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          새 자료 업로드
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">과정 분류</label>
            <select
              value={courseCategory}
              onChange={(e) => setCourseCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
            >
              {MATERIAL_COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">자료 유형 <span className="text-[10px] font-normal text-slate-400">(예제서식·채점프로그램만 학생 공개)</span></label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as MaterialItem['materialType'])}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
            >
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            자료 제목 {selectedFiles.length <= 1 ? '*' : '(여러 파일 선택 시 파일명이 각각 제목이 됩니다)'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={selectedFiles.length > 1}
            placeholder="예: 컴활 1급 실기 예제 파일 (2026)"
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="예: 실기 시험 대비 연습용 예제 파일입니다."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">파일 선택 * (여러 개 선택 가능)</label>
          <input
            id="material-file-input"
            type="file"
            multiple
            onChange={handleFileSelect}
            className="w-full text-xs sm:text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold file:cursor-pointer cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            파일당 최대 {formatFileSize(MAX_FILE_SIZE)}까지 업로드 가능합니다. 채점프로그램(.exe) 등 실행 파일은
            브라우저 보안 경고를 피하기 위해 .zip으로 압축해서 올리는 것을 권장합니다.
          </p>

          {selectedFiles.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}_${file.size}_${idx}`}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="flex-1 min-w-0 text-xs text-slate-700 font-semibold truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(idx)}
                    disabled={isUploading}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer disabled:opacity-40"
                    title="선택 목록에서 제거"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-bold">
              {selectedFiles.length > 1
                ? `업로드 중... (${uploadingIndex + 1}/${selectedFiles.length}) ${uploadProgress}%`
                : `업로드 중... ${uploadProgress}%`}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>{selectedFiles.length > 1 ? `자료 ${selectedFiles.length}개 업로드` : '자료 업로드'}</span>
            </>
          )}
        </button>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm">등록된 자료 ({materials.length}건)</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">불러오는 중...</div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">등록된 자료가 없습니다.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {materials.map((item) => {
              const Icon = getFileIcon(item.fileName);
              return (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {item.courseCategory} · {item.materialType} · {formatFileSize(item.fileSize)}
                      {' · '}등록자 {formatUploader(item.uploadedBy)} · {formatDate(item.createdAt)}
                      {' · '}다운로드 {item.downloadCount ?? 0}회
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId !== null}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 disabled:opacity-60"
                    title="다운로드"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {deletingId === item.id ? '삭제 중...' : '삭제 확인'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
