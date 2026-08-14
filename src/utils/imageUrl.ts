/**
 * Firebase Storage 원본 URL 및 정적 이미지 경로를 안전하게 반환하는 유틸리티
 */

export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '';

  const cleanPath = path.trim();

  // 1. 이미 완전한 http/https URL인 경우 (Firebase Storage 다운로드 URL 포함) 그대로 반환
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // 2. data: URL (base64 이미지)인 경우 그대로 반환
  if (cleanPath.startsWith('data:image/')) {
    return cleanPath;
  }

  // 3. 로컬 public 폴더 경로 (/uploads/...)인 경우 정적 경로 반환
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }

  return `/${cleanPath}`;
}

export function getImageApiFallbackUrl(path: string | undefined | null): string {
  if (!path) return '';
  const cleanPath = path.trim();
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}
