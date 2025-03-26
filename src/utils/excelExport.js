import ExcelJS from 'exceljs';

/**
 * Exports attendance data to an Excel file (.xlsx)
 * @param {Array} employees - Array of employee data
 * @param {Array} daysInMonth - Array of days in the month
 * @param {string} currentMonth - Current month name
 * @param {string} currentYear - Current year
 */
export const exportAttendanceToExcel = async (employees, daysInMonth, currentMonth, currentYear) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Daftar Hadir', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
    },
  });

  // Add header/kop section
  // Calculate center columns based on the total width of the report
  const totalColumns = 4 + daysInMonth.length + 1; // Base columns + days + Keterangan
  const centerStartCol = Math.max(1, Math.floor((totalColumns - 6) / 2));
  const centerEndCol = Math.min(totalColumns, centerStartCol + 6);
  
  // First row - Kabupaten/Kota
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}1:${getExcelColumnLetter(centerEndCol)}1`);
  const kabupatenCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}1`);
  kabupatenCell.value = 'PEMERINTAH KABUPATEN/KOTA ...';
  kabupatenCell.font = { bold: true, size: 14 };
  kabupatenCell.alignment = { horizontal: 'center' };
  
  // Second row - Dinas Pendidikan
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}2:${getExcelColumnLetter(centerEndCol)}2`);
  const dinasCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}2`);
  dinasCell.value = 'DINAS PENDIDIKAN DAN KEBUDAYAAN';
  dinasCell.font = { bold: true, size: 12 };
  dinasCell.alignment = { horizontal: 'center' };
  
  // Third row - School name
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}3:${getExcelColumnLetter(centerEndCol)}3`);
  const schoolNameCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}3`);
  schoolNameCell.value = 'SMA/SMK/SMP NEGERI ...';
  schoolNameCell.font = { bold: true, size: 16 };
  schoolNameCell.alignment = { horizontal: 'center' };
  
  // Fourth row - NPSN & NSS
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}4:${getExcelColumnLetter(centerEndCol)}4`);
  const npsnCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}4`);
  npsnCell.value = 'NPSN: 12345678 | NSS: 12345678910';
  npsnCell.font = { size: 10 };
  npsnCell.alignment = { horizontal: 'center' };
  
  // Fifth row - Address
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}5:${getExcelColumnLetter(centerEndCol)}5`);
  const addressCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}5`);
  addressCell.value = 'Alamat: Jl. Pendidikan No. 123, Telepon: (021) 12345678';
  addressCell.font = { size: 10 };
  addressCell.alignment = { horizontal: 'center' };
  
  // Sixth row - Email & Website
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}6:${getExcelColumnLetter(centerEndCol)}6`);
  const contactCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}6`);
  contactCell.value = 'Email: sekolah@example.com | Website: www.sekolah.sch.id';
  contactCell.font = { size: 10 };
  contactCell.alignment = { horizontal: 'center' };
  
  // Seventh row - Accreditation
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}7:${getExcelColumnLetter(centerEndCol)}7`);
  const accreditationCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}7`);
  accreditationCell.value = 'Terakreditasi "A"';
  accreditationCell.font = { size: 10 };
  accreditationCell.alignment = { horizontal: 'center' };
  
  // Add horizontal line below header
  for (let i = centerStartCol; i <= centerEndCol; i++) {
    worksheet.getCell(`${getExcelColumnLetter(i)}8`).border = {
      bottom: { style: 'medium' }
    };
  }
  
  // Space after header
  worksheet.getRow(9).height = 10;

  // Add title - also centered based on the total width
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}10:${getExcelColumnLetter(centerEndCol)}10`);
  const titleCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}10`);
  titleCell.value = 'DAFTAR HADIR PEGAWAI';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  // Add month/year subtitle
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}11:${getExcelColumnLetter(centerEndCol)}11`);
  const subtitleCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}11`);
  subtitleCell.value = `Bulan: ${currentMonth} ${currentYear}`;
  subtitleCell.font = { size: 12 };
  subtitleCell.alignment = { horizontal: 'center' };
  
  // Space after title
  worksheet.getRow(12).height = 10;

  // Column definitions for the header row
  const headerRow = ['No', 'Nama dan NIP', 'Jabatan', 'Waktu'];
  
  // Add date columns to the header
  for (let i = 0; i < daysInMonth.length; i++) {
    headerRow.push((i + 1).toString());
  }
  
  // Add the Keterangan column
  headerRow.push('Ket.');
  
  // Add header row (now at row 13 after the kop)
  worksheet.addRow(headerRow);
  
  // Style header row
  const headerRowNum = 13;
  const firstRow = worksheet.getRow(headerRowNum);
  firstRow.font = { bold: true };
  firstRow.alignment = { horizontal: 'center', vertical: 'middle' };
  firstRow.height = 20;
  
  // Populate data
  let rowIndex = headerRowNum + 1; // Starting row index after the header
  
  employees.forEach((employee, empIndex) => {
    const timeLabels = ['Tiba', 'Paraf', 'Pulang', 'Paraf'];
    
    timeLabels.forEach((label, timeIndex) => {
      const row = [];
      
      if (timeIndex === 0) {
        // Only add employee info in the first row
        row.push(employee.id.toString());
        
        // Add name and NIP in the same cell but format them in the cell later
        row.push(`${employee.name}\n${employee.nip}`);
        
        row.push(employee.position);
      } else {
        // Add empty cells for columns already merged
        row.push('');
        row.push('');
        row.push('');
      }
      
      // Add time label
      row.push(label);
      
      // Add empty cells for each day of the month
      for (let i = 0; i < daysInMonth.length; i++) {
        row.push('');
      }
      
      // Add empty cell for Keterangan (only in first row)
      if (timeIndex === 0) {
        row.push('');
      } else {
        row.push('');
      }
      
      worksheet.addRow(row);
      rowIndex++;
    });
    
    // Merge cells for employee info across 4 rows
    if (employees.length > 0) {
      // Merge No column
      worksheet.mergeCells(`A${rowIndex - 4}:A${rowIndex - 1}`);
      
      // Merge Name and NIP column
      worksheet.mergeCells(`B${rowIndex - 4}:B${rowIndex - 1}`);
      
      // Merge Position column
      worksheet.mergeCells(`C${rowIndex - 4}:C${rowIndex - 1}`);
      
      // Merge Keterangan column
      const lastCol = 4 + daysInMonth.length + 1;
      const colLetter = getExcelColumnLetter(lastCol);
      worksheet.mergeCells(`${colLetter}${rowIndex - 4}:${colLetter}${rowIndex - 1}`);
      
      // Apply specific formatting to Name and NIP cell
      const nameCell = worksheet.getCell(`B${rowIndex - 4}`);
      // Format content with rich text to keep name and NIP on separate lines
      nameCell.value = {
        richText: [
          { text: employee.name + '\n', font: { size: 10 } },
          { text: employee.nip, font: { size: 9 } }
        ]
      };
      nameCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'left',
        wrapText: true 
      };
    }
  });
  
  // Apply borders to all cells in the table (starting from the header row)
  const borderStyle = { style: 'thin', color: { argb: 'FF000000' } };
  const border = {
    top: borderStyle,
    left: borderStyle,
    bottom: borderStyle,
    right: borderStyle
  };
  
  for (let i = headerRowNum; i < rowIndex; i++) {
    worksheet.getRow(i).eachCell((cell) => {
      cell.border = border;
      if (!cell.alignment) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
    });
  }
  
  // Set column widths
  worksheet.getColumn(1).width = 5; // No
  worksheet.getColumn(2).width = 25; // Nama dan NIP
  worksheet.getColumn(3).width = 15; // Jabatan
  worksheet.getColumn(4).width = 8; // Waktu
  
  // Set day columns width
  for (let i = 0; i < daysInMonth.length; i++) {
    worksheet.getColumn(i + 5).width = 8;
  }
  
  // Set Keterangan column width
  worksheet.getColumn(daysInMonth.length + 5).width = 12;
  
  // Add signature section
  const signatureRow = rowIndex + 2;
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow}`);
  const placeDate = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow}`);
  placeDate.value = `..................., ${getCurrentDate()}`;
  placeDate.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 1}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 1}`);
  const title = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 1}`);
  title.value = 'Kepala Sekolah';
  title.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 5}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 5}`);
  const name = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 5}`);
  name.value = 'Nama Kepala Sekolah';
  name.font = { bold: true, underline: true };
  name.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 6}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 6}`);
  const nip = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 6}`);
  nip.value = 'NIP. 196012121980031001';
  nip.alignment = { horizontal: 'center' };
  
  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create Blob and trigger download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Daftar_Hadir_${currentMonth}_${currentYear}.xlsx`;
  link.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
};

// Helper function to get current date in Indonesian format
const getCurrentDate = () => {
  const now = new Date();
  const day = now.getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Helper function to convert column index to Excel column letter
const getExcelColumnLetter = (columnIndex) => {
  let temp = '';
  let letter = '';
  
  while (columnIndex > 0) {
    temp = (columnIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    columnIndex = (columnIndex - temp - 1) / 26;
  }
  
  return letter;
};
