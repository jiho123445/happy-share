import { NoticeAttachment } from '../types';

export type AttachmentKind = 'image' | 'pdf' | 'other';

const IMAGE_EXTS = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'BMP', 'SVG'];

/**
 * Determine what kind of inline preview (if any) an attachment supports.
 * Falls back to inspecting the file name/URL extension when the stored
 * `type` field is missing or generic (e.g. legacy 'FILE' records).
 */
export function getAttachmentKind(file: NoticeAttachment): AttachmentKind {
  const rawExt = (file.type || file.name?.split('.').pop() || '').toUpperCase();

  if (IMAGE_EXTS.includes(rawExt)) return 'image';
  if (rawExt === 'PDF') return 'pdf';

  // Fallback: infer from the URL itself (covers cases where `type` wasn't set).
  const urlExtMatch = file.url?.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  const urlExt = urlExtMatch ? urlExtMatch[1].toUpperCase() : '';
  if (IMAGE_EXTS.includes(urlExt)) return 'image';
  if (urlExt === 'PDF') return 'pdf';

  if (file.url?.startsWith('data:image/')) return 'image';
  if (file.url?.startsWith('data:application/pdf')) return 'pdf';

  return 'other';
}

export function isAttachmentPreviewable(file: NoticeAttachment): boolean {
  return getAttachmentKind(file) !== 'other';
}
