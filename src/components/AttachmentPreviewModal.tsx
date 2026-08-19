import React, { useEffect } from 'react';
import { NoticeAttachment } from '../types';
import { downloadNoticeFile } from '../utils/download';
import { getAttachmentKind } from '../utils/attachmentPreview';
import { X, Download, ExternalLink, FileWarning } from 'lucide-react';

interface AttachmentPreviewModalProps {
  file: NoticeAttachment;
  onClose: () => void;
}

/**
 * Full-screen preview for a notice attachment.
 * - Images render directly.
 * - PDFs render in an <iframe> using the browser's built-in PDF viewer.
 * - Anything else (HWP, DOCX, ZIP 등) has no reliable in-browser renderer,
 *   so we show a friendly notice with "새 창에서 열기" / "다운로드" actions instead.
 */
export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ file, onClose }) => {
  const kind = getAttachmentKind(file);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 shrink-0">
          <span className="text-sm font-bold text-slate-800 truncate" title={file.name}>
            {file.name}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[300px]">
          {kind === 'image' && (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-[75vh] object-contain mx-auto"
            />
          )}

          {kind === 'pdf' && (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-[75vh] bg-white"
            />
          )}

          {kind === 'other' && (
            <div className="text-center px-8 py-16 space-y-3">
              <FileWarning className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                이 파일 형식은 미리보기를 지원하지 않습니다.
              </p>
              <p className="text-xs text-slate-400">
                아래 버튼으로 새 창에서 열거나 다운로드해주세요.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 shrink-0">
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-orange-300 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>새 창에서 열기</span>
            </a>
          )}
          <button
            onClick={() => downloadNoticeFile(file)}
            className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>다운로드</span>
          </button>
        </div>
      </div>
    </div>
  );
};
