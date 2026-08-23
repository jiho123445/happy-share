import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  validateNoticeFile,
  getFileExtension,
  MAX_IMAGE_FILE_BYTES,
  MAX_NOTICE_FILE_BYTES,
} from './uploadValidation';

/**
 * Builds a File-like object with a specific reported `size`, without
 * actually allocating that many bytes in memory (real File objects size
 * themselves from their content, which would make a 10MB+ test slow).
 */
function fakeFile(name: string, type: string, size: number): File {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('getFileExtension', () => {
  it('returns the lowercased extension', () => {
    expect(getFileExtension('사진.JPG')).toBe('jpg');
    expect(getFileExtension('report.PDF')).toBe('pdf');
  });

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('noext')).toBe('');
  });
});

describe('validateImageFile', () => {
  it('accepts a normal JPEG under the size limit', () => {
    const file = fakeFile('photo.jpg', 'image/jpeg', 1024);
    expect(() => validateImageFile(file)).not.toThrow();
  });

  it('rejects a disallowed extension even if the MIME type looks like an image', () => {
    const file = fakeFile('malware.exe', 'image/jpeg', 1024);
    expect(() => validateImageFile(file)).toThrow(/허용되지 않는 이미지 형식/);
  });

  it('rejects a mismatched MIME type (extension spoofing attempt)', () => {
    // .jpg name but a non-image MIME type — this is the classic trick of
    // renaming an executable/script to look like an image file.
    const file = fakeFile('photo.jpg', 'application/x-msdownload', 1024);
    expect(() => validateImageFile(file)).toThrow(/형식\(MIME Type\)/);
  });

  it('rejects a file larger than the max allowed size', () => {
    const file = fakeFile('huge.png', 'image/png', MAX_IMAGE_FILE_BYTES + 1);
    expect(() => validateImageFile(file)).toThrow(/최대/);
  });

  it('accepts a file exactly at the size limit', () => {
    const file = fakeFile('exact.png', 'image/png', MAX_IMAGE_FILE_BYTES);
    expect(() => validateImageFile(file)).not.toThrow();
  });
});

describe('validateNoticeFile', () => {
  it('accepts a normal PDF under the size limit', () => {
    const file = fakeFile('공지.pdf', 'application/pdf', 1024);
    expect(() => validateNoticeFile(file)).not.toThrow();
  });

  it('rejects disallowed extensions like executables or scripts', () => {
    const file = fakeFile('script.js', 'application/octet-stream', 1024);
    expect(() => validateNoticeFile(file)).toThrow(/허용되지 않는 첨부파일 형식/);
  });

  it('allows HWP/HWPX files even when the browser reports an opaque MIME type', () => {
    // Windows browsers commonly report .hwp/.hwpx with an empty or
    // generic MIME type; the validator has a documented exception for
    // exactly this case, since it is a legitimate common scenario, not
    // just a fallback for spoofing.
    const hwp = fakeFile('서식.hwp', '', 1024);
    const hwpx = fakeFile('서식.hwpx', 'application/octet-stream', 1024);
    expect(() => validateNoticeFile(hwp)).not.toThrow();
    expect(() => validateNoticeFile(hwpx)).not.toThrow();
  });

  it('still rejects a non-HWP file with an opaque/empty MIME type', () => {
    const file = fakeFile('mystery.pdf', '', 1024);
    expect(() => validateNoticeFile(file)).toThrow(/형식\(MIME Type\)/);
  });

  it('rejects a file larger than the max allowed attachment size', () => {
    const file = fakeFile('huge.pdf', 'application/pdf', MAX_NOTICE_FILE_BYTES + 1);
    expect(() => validateNoticeFile(file)).toThrow(/최대/);
  });
});
