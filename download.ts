import ExcelJS from 'exceljs';
import { NoticeAttachment, DonationApplication, ContactInquiry, NewsletterSubscriber } from '../types';

/**
 * Utility function to download attached files in notices.
 * If file has a data URL, triggers browser download directly.
 * Otherwise, generates a downloadable sample file blob with official foundation metadata.
 */
export const downloadNoticeFile = (file: NoticeAttachment) => {
  const fileName = file.name || '너브내행복나눔재단_첨부서식.hwp';

  if (file.url && file.url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const content = `================================================
사단법인 너브내행복나눔재단 공식 첨부문서
================================================

문서명: ${fileName}
발행기관: 사단법인 너브내행복나눔재단
발행일자: ${new Date().toLocaleDateString('ko-KR')}

[안내사항]
사단법인 너브내행복나눔재단 공지사항 첨부 서식입니다.
서식을 작성하신 후 구비서류와 함께 재단 사무국으로 제출해주시기 바랍니다.

- 재단 주소: 강원특별자치도 홍천군 홍천읍 송학로3길 26, 2층
- 문의전화: 033-436-1925
- 팩스: 033-436-1910
- 대표 이메일: hcdmh1026@naver.com
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Colors matching the attached image specification
const COLORS = {
  emeraldHeader: 'FF006B4D',  // Deep Emerald Green (A1:G2 Banner & Table Header)
  emeraldHeaderBorder: 'FF005039',
  summaryHeaderBg: 'FFF2F4F7',// Light gray for summary table header (Row 5)
  summaryBorder: 'FFD0D5DD',  // Gray border for summary card
  greenFill: 'FFE6F4EA',       // Soft green for active / confirmed / regular
  greenText: 'FF008000',       // Dark green font
  amberFill: 'FFFEF7E0',       // Soft yellow/amber for one-time
  amberText: 'FFD97706',       // Dark orange font
  grayFill: 'FFF8FAFC',        // Slate gray fill
  borderLight: 'FFE2E8F0',     // Light grid borders
  textMain: 'FF1E293B',
  textMuted: 'FF4A5568',
};

const BORDERS = {
  thinGray: {
    top: { style: 'thin' as const, color: { argb: COLORS.summaryBorder } },
    bottom: { style: 'thin' as const, color: { argb: COLORS.summaryBorder } },
    left: { style: 'thin' as const, color: { argb: COLORS.summaryBorder } },
    right: { style: 'thin' as const, color: { argb: COLORS.summaryBorder } },
  },
  tableData: {
    top: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
    bottom: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
    left: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
    right: { style: 'thin' as const, color: { argb: COLORS.borderLight } },
  },
};

/**
 * Helper to apply styling across a cell range (e.g. merged cells)
 */
const styleCellRange = (
  ws: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  style: {
    fill?: ExcelJS.Fill;
    font?: Partial<ExcelJS.Font>;
    alignment?: Partial<ExcelJS.Alignment>;
    border?: Partial<ExcelJS.Borders>;
  }
) => {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      if (style.fill) cell.fill = style.fill;
      if (style.font) cell.font = style.font;
      if (style.alignment) cell.alignment = style.alignment;
      if (style.border) cell.border = style.border;
    }
  }
};

/**
 * Generates a styled Excel (.xlsx) workbook with separate worksheet tabs
 * following the attached official template formatting.
 */
export const exportDonationsToExcel = async (donations: DonationApplication[]) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const totalCount = donations.length;
  const regularDonations = donations.filter(d => d.donationType?.includes('정기'));
  const oneTimeDonations = donations.filter(d => d.donationType?.includes('일시'));
  const itemDonations = donations.filter(d => d.donationType?.includes('물품'));
  const volunteerDonations = donations.filter(d => 
    d.donationType?.includes('봉사') || 
    d.donationType?.includes('지정') || 
    (!d.donationType?.includes('정기') && !d.donationType?.includes('일시') && !d.donationType?.includes('물품'))
  );

  const regularCount = regularDonations.length;
  const oneTimeCount = oneTimeDonations.length;
  const itemCount = itemDonations.length;
  const volunteerCount = volunteerDonations.length;

  const workbook = new ExcelJS.Workbook();

  const sheetDefinitions = [
    { name: '전체 명단', title: '전체 후원 신청자', data: donations },
    { name: '정기후원', title: '정기후원 신청자', data: regularDonations },
    { name: '일시후원', title: '일시후원 신청자', data: oneTimeDonations },
    { name: '물품후원', title: '물품후원 신청자', data: itemDonations },
    { name: '봉사활동', title: '봉사활동 및 지정후원 참여자', data: volunteerDonations },
  ];

  sheetDefinitions.forEach(sheetDef => {
    const ws = workbook.addWorksheet(sheetDef.name, {
      views: [{ showGridLines: true }]
    });

    // Column widths matching format
    ws.columns = [
      { key: 'colA', width: 9 },   // 연번
      { key: 'colB', width: 20 },  // 성함 / 단체명
      { key: 'colC', width: 28 },  // 연락처 / 이메일
      { key: 'colD', width: 18 },  // 후원 구분
      { key: 'colE', width: 24 },  // 후원 금액 / 물품
      { key: 'colF', width: 42 },  // 비고 및 전달사항
      { key: 'colG', width: 24 },  // 신청 일시
    ];

    // 1. Title Banner (Rows 1-2 merged A1:G2)
    ws.mergeCells('A1:G2');
    ws.getCell('A1').value = `(사)너브내행복나눔재단 ${sheetDef.title} 명단`;
    ws.getRow(1).height = 22;
    ws.getRow(2).height = 22;
    styleCellRange(ws, 1, 1, 2, 7, {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
      font: { name: '맑은 고딕', size: 15, bold: true, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    });

    // 2. Info Bar (Row 3 merged A3:G3 right aligned)
    ws.mergeCells('A3:G3');
    ws.getCell('A3').value = `출력일시: ${dateStr}  |  총 제출 건수: ${sheetDef.data.length}건`;
    ws.getRow(3).height = 20;
    styleCellRange(ws, 3, 1, 3, 7, {
      font: { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: COLORS.textMuted } },
      alignment: { horizontal: 'right', vertical: 'middle' },
    });

    // 3. Blank spacing row (Row 4)
    ws.getRow(4).height = 10;

    // 4. Summary Table Header (Row 5)
    ws.getRow(5).height = 22;
    ws.getCell('A5').value = '구분';
    ws.getCell('B5').value = '정기 후원';
    ws.getCell('C5').value = '일시 후원';
    ws.getCell('D5').value = '물품 후원';
    ws.getCell('E5').value = '봉사/지정 후원';
    ws.mergeCells('F5:G5');
    ws.getCell('F5').value = '전체 제출';

    styleCellRange(ws, 5, 1, 5, 7, {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.summaryHeaderBg } },
      font: { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.textMain } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: BORDERS.thinGray,
    });

    // 5. Summary Table Values (Row 6)
    ws.getRow(6).height = 26;
    ws.getCell('A6').value = '인원(명)';
    ws.getCell('B6').value = `${regularCount} 명`;
    ws.getCell('C6').value = `${oneTimeCount} 명`;
    ws.getCell('D6').value = `${itemCount} 명`;
    ws.getCell('E6').value = `${volunteerCount} 명`;
    ws.mergeCells('F6:G6');
    ws.getCell('F6').value = `${totalCount} 명`;

    // Row 6 basic styles
    styleCellRange(ws, 6, 1, 6, 7, {
      font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMain } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: BORDERS.thinGray,
    });

    // Highlight specific summary cards
    ws.getCell('A6').font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.textMain } };
    ws.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayFill } };

    ws.getCell('B6').font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: COLORS.greenText } };
    ws.getCell('B6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenFill } };

    ws.getCell('C6').font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: COLORS.amberText } };
    ws.getCell('C6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberFill } };

    ws.getCell('F6').font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    ws.getCell('F6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayFill } };

    // 6. Blank spacing row (Row 7)
    ws.getRow(7).height = 12;

    // 7. Main Data Table Header (Row 8)
    ws.getRow(8).height = 28;
    const headers = ['연번', '성함 / 단체명', '연락처 / 이메일', '후원 구분', '후원 금액 / 물품', '비고 및 전달사항', '신청 일시'];
    headers.forEach((h, idx) => {
      const cell = ws.getCell(8, idx + 1);
      cell.value = h;
    });

    styleCellRange(ws, 8, 1, 8, 7, {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
      font: { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: COLORS.emeraldHeaderBorder } },
        bottom: { style: 'thin', color: { argb: COLORS.emeraldHeaderBorder } },
        left: { style: 'thin', color: { argb: COLORS.emeraldHeaderBorder } },
        right: { style: 'thin', color: { argb: COLORS.emeraldHeaderBorder } },
      },
    });

    // 8. Main Data Rows (Row 9+)
    if (sheetDef.data.length === 0) {
      ws.getRow(9).height = 24;
      ws.getCell('A9').value = '-';
      ws.getCell('B9').value = '접수 내역 없음';
      ws.getCell('C9').value = '-';
      ws.getCell('D9').value = '-';
      ws.getCell('E9').value = '-';
      ws.getCell('F9').value = `접수된 ${sheetDef.title} 내역이 없습니다.`;
      ws.getCell('G9').value = '-';

      styleCellRange(ws, 9, 1, 9, 7, {
        font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMuted } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: BORDERS.tableData,
      });
      ws.getCell('F9').alignment = { horizontal: 'left', vertical: 'middle' };
    } else {
      sheetDef.data.forEach((d, index) => {
        const rowNum = 9 + index;
        const row = ws.getRow(rowNum);
        row.height = 24;

        const contact = [d.phone, d.email].filter(Boolean).join(' / ') || '-';
        const remarks = [
          d.targetCategory ? `[희망분야: ${d.targetCategory}]` : '',
          d.message ? d.message : ''
        ].filter(Boolean).join(' ') || '-';

        ws.getCell(`A${rowNum}`).value = index + 1;
        ws.getCell(`B${rowNum}`).value = d.name || '-';
        ws.getCell(`C${rowNum}`).value = contact;
        ws.getCell(`D${rowNum}`).value = d.donationType || '후원';
        ws.getCell(`E${rowNum}`).value = d.amountOrItem || '미지정';
        ws.getCell(`F${rowNum}`).value = remarks;
        ws.getCell(`G${rowNum}`).value = d.createdAt || '-';

        styleCellRange(ws, rowNum, 1, rowNum, 7, {
          font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMain } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: BORDERS.tableData,
        });

        // Specific alignments & highlights
        ws.getCell(`B${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.textMain } };
        ws.getCell(`F${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

        // Category highlight for Col D (similar to '참석' cell in attachment)
        const typeStr = d.donationType || '';
        if (typeStr.includes('정기') || typeStr.includes('참석')) {
          ws.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenFill } };
          ws.getCell(`D${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.greenText } };
        } else if (typeStr.includes('일시')) {
          ws.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberFill } };
          ws.getCell(`D${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.amberText } };
        } else {
          ws.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayFill } };
        }
      });
    }
  });

  const fileNameDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `사단법인_너브내행복나눔재단_후원신청자명단_${fileNameDate}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export contact inquiries to formatted Excel
 */
export const exportInquiriesToExcel = async (inquiries: ContactInquiry[]) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('문의사항 목록', { views: [{ showGridLines: true }] });

  ws.columns = [
    { key: 'colA', width: 9 },   // 연번
    { key: 'colB', width: 16 },  // 성함
    { key: 'colC', width: 20 },  // 연락처
    { key: 'colD', width: 28 },  // 이메일
    { key: 'colE', width: 25 },  // 문의 제목
    { key: 'colF', width: 45 },  // 문의 내용
    { key: 'colG', width: 14 },  // 답변 상태
    { key: 'colH', width: 22 },  // 접수 일시
  ];

  // Title Banner
  ws.mergeCells('A1:H2');
  ws.getCell('A1').value = `(사)너브내행복나눔재단 홈페이지 문의사항 접수 명단`;
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 22;
  styleCellRange(ws, 1, 1, 2, 8, {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
    font: { name: '맑은 고딕', size: 15, bold: true, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  });

  // Info Bar
  ws.mergeCells('A3:H3');
  ws.getCell('A3').value = `출력일시: ${dateStr}  |  총 접수 건수: ${inquiries.length}건`;
  ws.getRow(3).height = 20;
  styleCellRange(ws, 3, 1, 3, 8, {
    font: { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: COLORS.textMuted } },
    alignment: { horizontal: 'right', vertical: 'middle' },
  });

  ws.getRow(4).height = 10;

  // Header Row (Row 5)
  ws.getRow(5).height = 28;
  const headers = ['연번', '성함', '연락처', '이메일', '문의 제목', '문의 내용', '답변 상태', '접수 일시'];
  headers.forEach((h, idx) => {
    ws.getCell(5, idx + 1).value = h;
  });

  styleCellRange(ws, 5, 1, 5, 8, {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
    font: { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  });

  // Data Rows
  if (inquiries.length === 0) {
    ws.getRow(6).height = 24;
    ws.getCell('A6').value = '-';
    ws.getCell('B6').value = '접수 내역 없음';
    ws.getCell('C6').value = '-';
    ws.getCell('D6').value = '-';
    ws.getCell('E6').value = '-';
    ws.getCell('F6').value = '접수된 문의사항이 없습니다.';
    ws.getCell('G6').value = '-';
    ws.getCell('H6').value = '-';
    styleCellRange(ws, 6, 1, 6, 8, {
      font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMuted } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: BORDERS.tableData,
    });
  } else {
    inquiries.forEach((inq, index) => {
      const rowNum = 6 + index;
      const row = ws.getRow(rowNum);
      row.height = 24;

      ws.getCell(`A${rowNum}`).value = index + 1;
      ws.getCell(`B${rowNum}`).value = inq.name || '-';
      ws.getCell(`C${rowNum}`).value = inq.phone || '-';
      ws.getCell(`D${rowNum}`).value = inq.email || '-';
      ws.getCell(`E${rowNum}`).value = inq.subject || '-';
      ws.getCell(`F${rowNum}`).value = inq.message || '-';
      ws.getCell(`G${rowNum}`).value = inq.status || '대기중';
      ws.getCell(`H${rowNum}`).value = inq.createdAt || '-';

      styleCellRange(ws, rowNum, 1, rowNum, 8, {
        font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMain } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: BORDERS.tableData,
      });

      ws.getCell(`B${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.textMain } };
      ws.getCell(`E${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' };
      ws.getCell(`F${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      if (inq.status === '답변완료') {
        ws.getCell(`G${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenFill } };
        ws.getCell(`G${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.greenText } };
      } else {
        ws.getCell(`G${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberFill } };
        ws.getCell(`G${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.amberText } };
      }
    });
  }

  const fileNameDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `사단법인_너브내행복나눔재단_문의사항접수명단_${fileNameDate}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export subscribers to formatted Excel
 */
export const exportSubscribersToExcel = async (subscribers: NewsletterSubscriber[]) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('소식지 구독자 목록', { views: [{ showGridLines: true }] });

  ws.columns = [
    { key: 'colA', width: 9 },   // 연번
    { key: 'colB', width: 35 },  // 구독 이메일 주소
    { key: 'colC', width: 22 },  // 신청 일시
    { key: 'colD', width: 15 },  // 구독 상태
  ];

  // Title Banner
  ws.mergeCells('A1:D2');
  ws.getCell('A1').value = `(사)너브내행복나눔재단 소식지 구독 신청자 명단`;
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 22;
  styleCellRange(ws, 1, 1, 2, 4, {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
    font: { name: '맑은 고딕', size: 15, bold: true, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  });

  // Info Bar
  ws.mergeCells('A3:D3');
  ws.getCell('A3').value = `출력일시: ${dateStr}  |  총 구독 신청: ${subscribers.length}건`;
  ws.getRow(3).height = 20;
  styleCellRange(ws, 3, 1, 3, 4, {
    font: { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: COLORS.textMuted } },
    alignment: { horizontal: 'right', vertical: 'middle' },
  });

  ws.getRow(4).height = 10;

  // Header Row (Row 5)
  ws.getRow(5).height = 28;
  const headers = ['연번', '구독 이메일 주소', '신청 일시', '구독 상태'];
  headers.forEach((h, idx) => {
    ws.getCell(5, idx + 1).value = h;
  });

  styleCellRange(ws, 5, 1, 5, 4, {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldHeader } },
    font: { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  });

  // Data Rows
  if (subscribers.length === 0) {
    ws.getRow(6).height = 24;
    ws.getCell('A6').value = '-';
    ws.getCell('B6').value = '구독 내역 없음';
    ws.getCell('C6').value = '-';
    ws.getCell('D6').value = '-';
    styleCellRange(ws, 6, 1, 6, 4, {
      font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMuted } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: BORDERS.tableData,
    });
  } else {
    subscribers.forEach((sub, index) => {
      const rowNum = 6 + index;
      const row = ws.getRow(rowNum);
      row.height = 24;

      ws.getCell(`A${rowNum}`).value = index + 1;
      ws.getCell(`B${rowNum}`).value = sub.email || '-';
      ws.getCell(`C${rowNum}`).value = sub.subscribedAt || '-';
      ws.getCell(`D${rowNum}`).value = sub.status || '구독중';

      styleCellRange(ws, rowNum, 1, rowNum, 4, {
        font: { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMain } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: BORDERS.tableData,
      });

      ws.getCell(`B${rowNum}`).font = { name: 'Consolas', size: 10.5, bold: true, color: { argb: COLORS.textMain } };

      if (sub.status === '구독중') {
        ws.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenFill } };
        ws.getCell(`D${rowNum}`).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: COLORS.greenText } };
      } else {
        ws.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grayFill } };
        ws.getCell(`D${rowNum}`).font = { name: '맑은 고딕', size: 10, color: { argb: COLORS.textMuted } };
      }
    });
  }

  const fileNameDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `사단법인_너브내행복나눔재단_소식지구독자명단_${fileNameDate}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
