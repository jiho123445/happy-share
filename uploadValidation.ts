/** Client-side upload validation. Firebase Storage Rules remain the final security boundary. */

export const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per image file
export const MAX_NOTICE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per attachment

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const NOTICE_EXTENSIONS = new Set([
  'pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'webp', 'gif'
]);

const NOTICE_MIME_TYPES = new Set([
  'application/pdf',
  'application/haansofthwp',
  'application/vnd.hancom.hwp',
  'application/x-hwp',
  'application/vnd.hancom.hwpx',
  'application/x-hwpx',
  'application/octet-stream',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
]);

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function validateImageFile(file: File, maxBytes = MAX_IMAGE_FILE_BYTES): void {
  const ext = getFileExtension(file.name);
  if (!IMAGE_EXTENSIONS.has(ext)) {
    throw new Error('허용되지 않는 이미지 형식입니다. JPG, JPEG, PNG, WEBP, GIF 파일만 사용할 수 있습니다.');
  }
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error('이미지 파일의 형식(MIME Type)을 확인할 수 없습니다. 정상적인 JPG, PNG, WEBP, GIF 파일을 선택해 주세요.');
  }
  if (file.size > maxBytes) {
    throw new Error(`이미지 1개당 최대 ${maxBytes / (1024 * 1024)}MB까지 업로드할 수 있습니다.`);
  }
}

export function validateNoticeFile(file: File, maxBytes = MAX_NOTICE_FILE_BYTES): void {
  const ext = getFileExtension(file.name);
  if (!NOTICE_EXTENSIONS.has(ext)) {
    throw new Error('허용되지 않는 첨부파일 형식입니다. PDF, HWP, HWPX, DOC/DOCX, XLS/XLSX, PPT/PPTX, JPG/PNG/WEBP/GIF만 사용할 수 있습니다.');
  }
  const isHwpFamily = ext === 'hwp' || ext === 'hwpx';
  // Windows browsers can report HWP/HWPX as an empty/opaque MIME type.
  // The upload layer normalizes these two extensions to a canonical MIME type
  // before sending them to Storage, while Storage Rules still validate both
  // the normalized MIME type and the filename extension.
  if (!NOTICE_MIME_TYPES.has(file.type) && !isHwpFamily) {
    throw new Error('허용되지 않는 파일 형식(MIME Type)입니다. 파일 확장자와 실제 파일 형식을 확인해 주세요.');
  }
  if (file.size > maxBytes) {
    throw new Error(`첨부파일 1개당 최대 ${maxBytes / (1024 * 1024)}MB까지 업로드할 수 있습니다.`);
  }
}
