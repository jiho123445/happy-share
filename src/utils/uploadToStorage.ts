/**
 * uploadToStorage.ts
 *
 * 이미지·첨부파일 업로드 전용 유틸리티.
 *
 * ⚠️ 중요: 절대로 이미지를 base64(data:image/...)로 인코딩해서
 * Firestore 문서(foundation/global)에 직접 저장하지 말 것.
 * Firestore는 문서 1개당 최대 1MB 제한이 있고, 이 앱은 재단의 모든 데이터를
 * 문서 하나에 저장하는 구조라 base64 이미지 몇 장만 들어가도 저장이 조용히
 * 실패하고, 이후 동기화 시 최신 데이터가 통째로 예전 상태로 "리셋"된다.
 *
 * 반드시 Cloud Storage에 실제 파일을 업로드하고, Firestore에는
 * 다운로드 URL(수십~수백 바이트 문자열)만 저장해야 한다.
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const generateFileName = (originalName: string): string => {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return `${unique}.${ext}`;
};

/**
 * 압축된 이미지(Blob)를 Cloud Storage에 업로드하고 다운로드 URL을 반환한다.
 * @param blob 업로드할 이미지 데이터 (canvas.toBlob() 등의 결과)
 * @param folder Storage 상위 폴더 (예: 'gallery', 'settings', 'popups')
 * @param originalName 원본 파일명 (확장자 추출용)
 */
export async function uploadImageBlob(
  blob: Blob,
  folder: string,
  originalName: string = 'image.jpg'
): Promise<string> {
  const fileName = generateFileName(originalName);
  const storageRef = ref(storage, `${folder}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'image/jpeg'
  });
  return getDownloadURL(snapshot.ref);
}

/**
 * 원본 파일(이미지가 아닌 첨부파일 등)을 Cloud Storage에 업로드하고
 * 다운로드 URL을 반환한다. 공지사항 첨부파일(PDF, HWP, DOCX 등)에 사용.
 * @param file 업로드할 원본 File 객체
 * @param folder Storage 상위 폴더 (예: 'notices')
 */
export async function uploadRawFile(file: File, folder: string): Promise<string> {
  const fileName = generateFileName(file.name);
  const storageRef = ref(storage, `${folder}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/octet-stream'
  });
  return getDownloadURL(snapshot.ref);
}

/**
 * <canvas> 엘리먼트를 JPEG Blob으로 변환한다. (Promise 래퍼)
 */
export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}
