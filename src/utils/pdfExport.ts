import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { IssuedReceiptRecord } from '../types/donation';

export interface PdfExportResult {
  success: boolean;
  canceled?: boolean;
  isSecurityRestricted?: boolean;
  fileName: string;
  blobUrl?: string;
  method: 'picker' | 'download';
  error?: string;
}

export interface ReceiptPdfFile {
  file: File;
  fileName: string;
  blob: Blob;
}

export function getReceiptPdfFileName(receipt: IssuedReceiptRecord): string {
  const sanitizedDonorName = (receipt.donorName || '기부자').replace(/[\\/:*?"<>|]/g, '_').trim();
  const sanitizedReceiptNo = (receipt.receiptNo || '영수증').replace(/[\\/:*?"<>|]/g, '_').trim();
  return `기부금영수증_${sanitizedDonorName}_${sanitizedReceiptNo}.pdf`;
}

/**
 * Generate A4 PDF Blob (210mm x 297mm, high-speed optimized rendering)
 */
export async function generateReceiptPdfBlob(receiptElement: HTMLElement): Promise<Blob> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font ready check fails
    }
  }

  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '0';
  exportHost.style.top = '0';
  exportHost.style.width = '210mm';
  exportHost.style.height = '297mm';
  exportHost.style.margin = '0';
  exportHost.style.padding = '0';
  exportHost.style.overflow = 'hidden';
  exportHost.style.zIndex = '-2147483647';
  exportHost.style.background = '#ffffff';
  exportHost.style.pointerEvents = 'none';

  const clone = receiptElement.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.width = '210mm';
  clone.style.height = '297mm';
  clone.style.minHeight = '297mm';
  clone.style.maxHeight = '297mm';
  clone.style.margin = '0';
  clone.style.padding = '12mm 14mm';
  clone.style.boxSizing = 'border-box';
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.position = 'relative';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  exportHost.appendChild(clone);
  document.body.appendChild(exportHost);

  try {
    const canvas = await toCanvas(clone, {
      pixelRatio: 2,
      fontEmbedCSS: '',
      cacheBust: false,
      backgroundColor: '#ffffff',
      width: Math.ceil(210 * 96 / 25.4),
      height: Math.ceil(297 * 96 / 25.4),
      style: {
        width: '210mm',
        height: '297mm',
        margin: '0',
        transform: 'none',
        transformOrigin: 'top left',
        boxShadow: 'none',
        border: 'none',
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const jpegData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(jpegData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    return pdf.output('blob');
  } finally {
    exportHost.remove();
  }
}

/** Create a real PDF File object suitable for Web Share API file attachments. */
export async function generateReceiptPdfFile(
  receiptElement: HTMLElement,
  receipt: IssuedReceiptRecord,
): Promise<ReceiptPdfFile> {
  const blob = await generateReceiptPdfBlob(receiptElement);
  const fileName = getReceiptPdfFileName(receipt);
  const file = new File([blob], fileName, { type: 'application/pdf' });
  return { file, fileName, blob };
}

/** Download an already generated PDF blob without regenerating the document. */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Export receipt to PDF. Existing save behavior is intentionally preserved.
 */
export async function exportReceiptToPdf(
  receiptElement: HTMLElement,
  receipt: IssuedReceiptRecord
): Promise<PdfExportResult> {
  const fileName = getReceiptPdfFileName(receipt);
  const blobPromise = generateReceiptPdfBlob(receiptElement);

  const hasSaveFilePicker =
    typeof window !== 'undefined' &&
    'showSaveFilePicker' in window &&
    typeof (window as any).showSaveFilePicker === 'function';

  if (hasSaveFilePicker) {
    let fileHandle: any = null;

    try {
      fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'PDF 문서 (*.pdf)',
            accept: {
              'application/pdf': ['.pdf'],
            },
          },
        ],
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          canceled: true,
          fileName,
          method: 'picker',
        };
      }

      if (err.name === 'SecurityError') {
        try {
          const pdfBlob = await blobPromise;
          downloadPdfBlob(pdfBlob, fileName);
          return {
            success: true,
            isSecurityRestricted: true,
            fileName,
            method: 'download',
          };
        } catch (genErr: any) {
          return {
            success: false,
            fileName,
            method: 'download',
            error: genErr?.message || 'PDF 생성 도중 오류가 발생했습니다.',
          };
        }
      }

      console.warn('File System Access API failed, falling back to download:', err);
    }

    if (fileHandle) {
      try {
        const pdfBlob = await blobPromise;
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(pdfBlob);
        await writableStream.close();

        return {
          success: true,
          fileName,
          method: 'picker',
        };
      } catch (err: any) {
        console.error('Failed to write PDF to chosen file handle:', err);
        return {
          success: false,
          fileName,
          method: 'picker',
          error: '선택한 위치에 파일을 저장하는 도중 오류가 발생했습니다.',
        };
      }
    }
  }

  try {
    const pdfBlob = await blobPromise;
    downloadPdfBlob(pdfBlob, fileName);
    return {
      success: true,
      fileName,
      method: 'download',
    };
  } catch (err: any) {
    console.error('PDF generation fallback failed:', err);
    return {
      success: false,
      fileName,
      method: 'download',
      error: err?.message || 'PDF 생성 도중 오류가 발생했습니다.',
    };
  }
}
