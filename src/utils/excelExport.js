import ExcelJS from 'exceljs';
import ReportInfo from '../app/api/report_info';

/**
 * Exports attendance data to an Excel file (.xlsx)
 * @param {Array} employees - Array of employee data
 * @param {Array} daysInMonth - Array of days in the month
 * @param {string} currentMonth - Current month name
 * @param {string} currentYear - Current year
 * @param {Object} attendanceData - Attendance data from API (optional)
 */
export const exportAttendanceToExcel = async (employees, daysInMonth, currentMonth, currentYear, attendanceData = null) => {
  // Fetch report information first
  const reportInfo = await ReportInfo.getReportInfo();
  
  // If no attendance data is provided, try to fetch it
  if (!attendanceData) {
    try {
      const reportData = await ReportInfo.getReportData();
      if (reportData.success && reportData.data) {
        attendanceData = reportData.data;
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  }
  
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
  
  // Add logo images if available
  if (reportInfo.ministryEmblem) {
    try {
      const ministryLogo = workbook.addImage({
        base64: reportInfo.ministryEmblem,
        extension: 'png',
      });
      
      // Position to the left of the kop
      worksheet.addImage(ministryLogo, {
        tl: { col: Math.max(1, centerStartCol - 3), row: 1 },
        br: { col: centerStartCol - 0.5, row: 7 }
      });
    } catch (error) {
      console.error('Error adding ministry logo:', error);
    }
  }
  
  if (reportInfo.schoolEmblem) {
    try {
      const schoolLogo = workbook.addImage({
        base64: reportInfo.schoolEmblem,
        extension: 'png',
      });
      
      // Position to the right of the kop
      worksheet.addImage(schoolLogo, {
        tl: { col: centerEndCol + 0.5, row: 1 },
        br: { col: Math.min(totalColumns, centerEndCol + 3), row: 7 }
      });
    } catch (error) {
      console.error('Error adding school logo:', error);
    }
  }
  
  // First row - Kabupaten/Kota
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}1:${getExcelColumnLetter(centerEndCol)}1`);
  const kabupatenCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}1`);
  kabupatenCell.value = `PEMERINTAH KABUPATEN/KOTA ${reportInfo.schoolDistrict || '...'}`;
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
  schoolNameCell.value = reportInfo.schoolName || 'SMA/SMK/SMP NEGERI ...';
  schoolNameCell.font = { bold: true, size: 16 };
  schoolNameCell.alignment = { horizontal: 'center' };
  
  // Fourth row - NPSN & NSS
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}4:${getExcelColumnLetter(centerEndCol)}4`);
  const npsnCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}4`);
  npsnCell.value = `NPSN: ${reportInfo.npsn || '12345678'} | NSS: ${reportInfo.nss || '12345678910'}`;
  npsnCell.font = { size: 10 };
  npsnCell.alignment = { horizontal: 'center' };
  
  // Fifth row - Address
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}5:${getExcelColumnLetter(centerEndCol)}5`);
  const addressCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}5`);
  addressCell.value = `Alamat: ${reportInfo.schoolAddress || 'Jl. Pendidikan No. 123'}, Telepon: ${reportInfo.schoolPhone || '(021) 12345678'}`;
  addressCell.font = { size: 10 };
  addressCell.alignment = { horizontal: 'center' };
  
  // Sixth row - Accreditation (moved up since email/website row is removed)
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}6:${getExcelColumnLetter(centerEndCol)}6`);
  const accreditationCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}6`);
  accreditationCell.value = 'Terakreditasi "A"';
  accreditationCell.font = { size: 10 };
  accreditationCell.alignment = { horizontal: 'center' };
  
  // Add horizontal line below header
  for (let i = centerStartCol; i <= centerEndCol; i++) {
    worksheet.getCell(`${getExcelColumnLetter(i)}7`).border = {
      bottom: { style: 'medium' }
    };
  }
  
  // Space after header
  worksheet.getRow(8).height = 10;

  // Add title - also centered based on the total width
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}9:${getExcelColumnLetter(centerEndCol)}9`);
  const titleCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}9`);
  titleCell.value = 'DAFTAR HADIR PEGAWAI';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  // Add month/year subtitle
  worksheet.mergeCells(`${getExcelColumnLetter(centerStartCol)}10:${getExcelColumnLetter(centerEndCol)}10`);
  const subtitleCell = worksheet.getCell(`${getExcelColumnLetter(centerStartCol)}10`);
  subtitleCell.value = `Bulan: ${currentMonth} ${currentYear}`;
  subtitleCell.font = { size: 12 };
  subtitleCell.alignment = { horizontal: 'center' };
  
  // Space after title
  worksheet.getRow(11).height = 10;

  // Column definitions for the header row
  const headerRow = ['No', 'Nama dan NIP', 'Jabatan', 'Waktu'];
  
  // Add date columns to the header
  for (let i = 0; i < daysInMonth.length; i++) {
    headerRow.push((i + 1).toString());
  }
  
  // Add the Keterangan column
  headerRow.push('Ket.');
  
  // Add header row (now at row 12 after the kop - adjusted down from 13 due to removal of one row)
  worksheet.addRow(headerRow);
  
  // Style header row
  const headerRowNum = 12; // Adjusted from 13 due to removed row
  const firstRow = worksheet.getRow(headerRowNum);
  firstRow.font = { bold: true };
  firstRow.alignment = { horizontal: 'center', vertical: 'middle' };
  firstRow.height = 20;
  
  // Map attendance data if available
  const attendanceMap = new Map();
  let employeesList = [...employees]; // Create a copy of the original employees list
  
  if (attendanceData && attendanceData.attendancesData) {
    console.log('Excel export - Total employees from API:', attendanceData.attendancesData.length);
    
    // Transform API data to a more usable format
    attendanceData.attendancesData.forEach(employee => {
      const attendanceByDate = new Map();
      
      if (employee.attendanceData && employee.attendanceData.length > 0) {
        employee.attendanceData.forEach(record => {
          const date = new Date(record.date);
          const day = date.getDate();
          
          attendanceByDate.set(day, {
            checkIn: record.checkIn && record.checkIn !== '1970-01-01T00:00:00.000Z' ? new Date(record.checkIn) : null,
            checkOut: record.checkOut && record.checkOut !== '1970-01-01T00:00:00.000Z' ? new Date(record.checkOut) : null,
            status: record.status
          });
        });
      }
      
      // Use any property that's unique to identify employees
      // Here we use a combination of name and position if NIP is N/A
      const key = employee.nip !== 'N/A' ? employee.nip : `${employee.fullName}-${employee.position}`;
      
      attendanceMap.set(key, {
        name: employee.fullName,
        position: employee.position,
        attendance: attendanceByDate
      });
    });
    
    // Use the data directly from the API instead of the passed employees
    // This ensures we're using all available employee data
    employeesList = [];
    let employeeId = 1;
    
    attendanceData.attendancesData.forEach(employee => {
      // Include all employees, even those with NIP "N/A"
      employeesList.push({
        id: employeeId++,
        name: employee.fullName,
        // Only show NIP if it's not "N/A"
        nip: employee.nip !== 'N/A' ? employee.nip : '',
        position: employee.position,
        // Store the lookup key for attendance data
        lookupKey: employee.nip !== 'N/A' ? employee.nip : `${employee.fullName}-${employee.position}`
      });
    });
  }
  
  console.log('Excel export - Total employees to display:', employeesList.length);
  
  // Sort employees by ID to ensure consistent order
  employeesList.sort((a, b) => a.id - b.id);
  
  // Populate data
  let rowIndex = headerRowNum + 1; // Starting row index after the header
  
  employeesList.forEach((employee, empIndex) => {
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
      
      // Add cells for each day of the month with attendance data if available
      for (let i = 0; i < daysInMonth.length; i++) {
        const day = i + 1;
        let cellValue = '';
        
        // Check if we have attendance data for this employee
        const employeeData = attendanceMap.get(employee.lookupKey || employee.nip);
        if (employeeData && employeeData.attendance.has(day)) {
          const dayData = employeeData.attendance.get(day);
          
          // Handle different time labels
          if (label === 'Tiba' && dayData.checkIn) {
            cellValue = formatTime(dayData.checkIn);
          } else if (label === 'Pulang' && dayData.checkOut) {
            cellValue = formatTime(dayData.checkOut);
          } else if (label === 'Paraf') {
            // Add checkmark for paraf if corresponding time exists
            if (timeIndex === 1 && dayData.checkIn) { // Paraf for arrival
              cellValue = '✓';
            } else if (timeIndex === 3 && dayData.checkOut) { // Paraf for departure
              cellValue = '✓';
            }
          }
          
          // Display status in both Tiba and Pulang rows (timeIndex 0 and 2)
          if ((timeIndex === 0 || timeIndex === 2) && ['Sick', 'Leave'].includes(dayData.status)) {
            // Set status indicator for Sick or Leave
            cellValue = dayData.status === 'Sick' ? 'S' : 'C';
          }
        }
        
        row.push(cellValue);
      }
      
      // Add empty cell for Keterangan
      row.push('');
      
      worksheet.addRow(row);
      rowIndex++;
    });
    
    // Merge cells for employee info across 4 rows
    if (employees.length > 0) {
      // Merge No column
      worksheet.mergeCells(`A${rowIndex - 4}:A${rowIndex - 1}`);
      
      // Merge Name and NIP column - this remains the same
      worksheet.mergeCells(`B${rowIndex - 4}:B${rowIndex - 1}`);
      
      // Merge Position column
      worksheet.mergeCells(`C${rowIndex - 4}:C${rowIndex - 1}`);
      
      // Merge Keterangan column
      const lastCol = 4 + daysInMonth.length + 1;
      const colLetter = getExcelColumnLetter(lastCol);
      worksheet.mergeCells(`${colLetter}${rowIndex - 4}:${colLetter}${rowIndex - 1}`);
      
      // Apply specific formatting to Name and NIP cell
      const nameCell = worksheet.getCell(`B${rowIndex - 4}`);
      
      // Use a single cell with properly formatted name and NIP
      nameCell.value = {
        richText: [
          { text: employee.name, font: { size: 10 } },
          { text: '\n', font: { size: 10 } },
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
  
  // Add legend for status codes at the bottom of the report
  const legendRow = rowIndex + 2;
  worksheet.getCell(`A${legendRow}`).value = 'Keterangan:';
  worksheet.getCell(`A${legendRow}`).font = { bold: true };
  
  worksheet.getCell(`A${legendRow+1}`).value = 'S: Sakit';
  worksheet.getCell(`A${legendRow+2}`).value = 'C: Cuti';
  
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
  placeDate.value = `${reportInfo.schoolDistrict || '.....................'}, ${getCurrentDate()}`;
  placeDate.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 1}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 1}`);
  const title = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 1}`);
  title.value = 'Kepala Sekolah';
  title.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 5}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 5}`);
  const name = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 5}`);
  name.value = reportInfo.pricipalName || 'Nama Kepala Sekolah';
  name.font = { bold: true, underline: true };
  name.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 6}:${getExcelColumnLetter(daysInMonth.length + 5)}${signatureRow + 6}`);
  const nip = worksheet.getCell(`${getExcelColumnLetter(daysInMonth.length + 3)}${signatureRow + 6}`);
  nip.value = `NIP. ${reportInfo.principalNip || '196012121980031001'}`;
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

// Helper function to format time as HH:MM
const formatTime = (dateTime) => {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  if (date.getTime() === 0) return '';
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
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
