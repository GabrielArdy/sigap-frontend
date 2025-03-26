'use client';
import { useState, useEffect, useRef } from 'react';
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { exportAttendanceToExcel } from '@/utils/excelExport';

// Create PDF Document component
const AttendanceReportPDF = ({ employees, daysInMonth, currentMonth, currentYear }) => {
  // PDF styles with F4 Landscape dimensions
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 8,
      fontFamily: 'Helvetica',
      color: '#000000',
    },
    header: {
      marginBottom: 10,
      textAlign: 'center',
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 10,
      marginBottom: 10,
    },
    table: {
      display: 'table',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 10,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    tableRowNoBorder: {
      flexDirection: 'row',
    },
    tableCol: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#000',
    },
    tableCell: {
      padding: 3,
      fontSize: 8,
      textAlign: 'center',
    },
    tableHeaderCell: {
      backgroundColor: '#f0f0f0',
      padding: 3,
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    nameColumn: {
      width: 110, // Increased from 90 to 110
    },
    positionColumn: {
      width: 40, // Reduced from 50 to 40
    },
    numberColumn: {
      width: 20,
    },
    timeColumn: {
      width: 30, // Reduced width
    },
    dayColumn: {
      width: 30, // Increased from 25 to 30 to accommodate HH:MM format better
    },
    notesColumn: {
      width: 40, // Reduced from 50 to 40
    },
    nameText: {
      fontSize: 8,
      marginBottom: 2,
    },
    nipText: {
      fontSize: 6,
    },
    signature: {
      marginTop: 20,
      alignSelf: 'flex-end',
      textAlign: 'center',
      width: 150,
    },
    signatureText: {
      marginBottom: 30,
    }
  });

  // Generate date columns array
  const dateColumns = [];
  for (let i = 0; i < daysInMonth.length; i++) {
    dateColumns.push(
      <View style={[styles.tableCol, styles.dayColumn]} key={`col-${i}`}>
        <Text style={styles.tableHeaderCell}>{i + 1}</Text>
      </View>
    );
  }

  // Generate rows for each employee
  const employeeRows = [];
  
  employees.forEach((employee, empIndex) => {
    const timeLabels = ['Tiba', 'Paraf', 'Pulang', 'Paraf'];
    
    timeLabels.forEach((label, timeIndex) => {
      const dateCells = [];
      
      for (let i = 0; i < daysInMonth.length; i++) {
        dateCells.push(
          <View style={[styles.tableCol, styles.dayColumn]} key={`cell-${empIndex}-${timeIndex}-${i}`}>
            <Text style={styles.tableCell}></Text>
          </View>
        );
      }
      
      employeeRows.push(
        <View style={styles.tableRow} key={`row-${empIndex}-${timeIndex}`}>
          {timeIndex === 0 && (
            <>
              <View style={[styles.tableCol, styles.numberColumn]}>
                <Text style={[styles.tableCell, { paddingVertical: 18 }]}>{employee.id}</Text>
              </View>
              <View style={[styles.tableCol, styles.nameColumn]}>
                <Text style={[styles.tableCell, { paddingVertical: 18 }]}>
                  {employee.name}
                  {'\n'}
                  {employee.nip}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.positionColumn]}>
                <Text style={[styles.tableCell, { paddingVertical: 18 }]}>{employee.position}</Text>
              </View>
            </>
          )}
          
          {timeIndex !== 0 && (
            <View style={{ width: 190 }}></View>
          )}
          
          <View style={[styles.tableCol, styles.timeColumn]}>
            <Text style={[styles.tableCell, { fontSize: 7 }]}>{label}</Text>
          </View>
          
          {dateCells}
          
          {timeIndex === 0 && (
            <View style={[styles.tableCol, styles.notesColumn]}>
              <Text style={[styles.tableCell, { paddingVertical: 18 }]}></Text>
            </View>
          )}
        </View>
      );
    });
  });

  return (
    <Document>
      <Page size="F4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DAFTAR HADIR PEGAWAI</Text>
          <Text style={styles.subtitle}>Bulan: {currentMonth} {currentYear}</Text>
        </View>
        
        <View style={styles.table}>
          {/* Table Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.numberColumn]}>
              <Text style={styles.tableHeaderCell}>No</Text>
            </View>
            <View style={[styles.tableCol, styles.nameColumn]}>
              <Text style={styles.tableHeaderCell}>Nama dan NIP</Text>
            </View>
            <View style={[styles.tableCol, styles.positionColumn]}>
              <Text style={styles.tableHeaderCell}>Jabatan</Text>
            </View>
            <View style={[styles.tableCol, styles.timeColumn]}>
              <Text style={styles.tableHeaderCell}>Waktu</Text>
            </View>
            {dateColumns}
            <View style={[styles.tableCol, styles.notesColumn]}>
              <Text style={styles.tableHeaderCell}>Ket.</Text>
            </View>
          </View>
          
          {/* Table Body Rows */}
          {employeeRows}
        </View>
        
        <View style={styles.signature}>
          <Text>..................., {currentDate()}</Text>
          <Text>Kepala Sekolah</Text>
          <Text style={styles.signatureText}></Text>
          <Text style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Nama Kepala Sekolah</Text>
          <Text>NIP. 196012121980031001</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function AttendanceReportTemplate() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [isPdfReady, setIsPdfReady] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    // Get current date info
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get days in current month
    const daysCount = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);
    
    // Format month name in Indonesian
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    setDaysInMonth(daysArray);
    setCurrentMonth(monthNames[month]);
    setCurrentYear(year);
  }, []);

  // Sample data for demonstration
  const employees = [
    { id: 1, name: 'Budi Santoso', nip: '19850612 200901 1 001', position: 'Guru' },
    { id: 2, name: 'Siti Rahayu', nip: '19880824 201001 2 003', position: 'Guru' },
    { id: 3, name: 'Ahmad Fahri', nip: '19770315 199803 1 002', position: 'TU' },
  ];

  // Function to download the PDF directly
  const downloadPdf = async () => {
    try {
      const blob = await pdf(
        <AttendanceReportPDF 
          employees={employees} 
          daysInMonth={daysInMonth} 
          currentMonth={currentMonth} 
          currentYear={currentYear} 
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Daftar_Hadir_${currentMonth}_${currentYear}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Function to export to Excel
  const handleExcelExport = () => {
    exportAttendanceToExcel(employees, daysInMonth, currentMonth, currentYear);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Download buttons */}
      <div className="max-w-7xl mx-auto mb-4 flex gap-4">
        <button
          onClick={downloadPdf}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Download PDF (F4 Landscape)
        </button>
        
        <button
          onClick={handleExcelExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Download Excel (.xlsx)
        </button>
      </div>

      {/* F4 Landscape paper size container */}
      <div 
        ref={reportRef} 
        className="max-w-7xl mx-auto bg-white shadow-md p-8 text-black" 
        style={{ width: '330mm', minHeight: '210mm', margin: '0 auto' }}
      >
        {/* Header/Kop */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 mr-4">
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-black">Logo</span>
              </div>
            </div>
            <div className="text-black">
              <h1 className="text-xl font-bold uppercase text-black">Pemerintah Kabupaten/Kota ...</h1>
              <h2 className="text-lg font-bold text-black">DINAS PENDIDIKAN</h2>
              <h1 className="text-2xl font-bold mt-1 text-black">SMA/SMK/SMP NEGERI ...</h1>
              <p className="text-sm text-black">NPSN: 12345678 | NSS: 12345678910</p>
              <p className="text-sm text-black">Alamat: Jl. Pendidikan No. 123, Telepon: (021) 12345678</p>
              <p className="text-sm text-black">Email: sekolah@example.com | Website: www.sekolah.sch.id</p>
              <p className="text-sm text-black">Terakreditasi "A"</p>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase text-black">DAFTAR HADIR PEGAWAI</h2>
          <p className="text-lg text-black">Bulan: {currentMonth} {currentYear}</p>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-800 text-black">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-200">
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-8 text-black">No</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-44 text-black">Nama dan NIP</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-20 text-black">Jabatan</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-xs text-black">Waktu</th>
                {daysInMonth.map((day) => (
                  <th key={day} rowSpan="2" className="border border-gray-800 px-1 py-1 text-xs w-14 align-middle text-black">{day}</th>
                ))}
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-12 text-black">Ket.</th>
              </tr>
              <tr className="bg-gray-200">
                {/* Empty row for alignment */}
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="text-black">
              {employees.map((employee) => {
                // Create 4 rows for each employee
                const timeLabels = ['Tiba', 'Paraf', 'Pulang', 'Paraf'];
                
                return timeLabels.map((label, index) => (
                  <tr key={`${employee.id}-${index}`} className="text-black">
                    {/* Only show employee info in the first row */}
                    {index === 0 ? (
                      <>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 text-center align-middle text-black">{employee.id}</td>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle text-black">
                          <div className="text-black">{employee.name}</div>
                          <div className="text-xs text-black">{employee.nip}</div>
                        </td>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle text-black">{employee.position}</td>
                      </>
                    ) : null}
                    
                    {/* Show appropriate time label for each row */}
                    <td className="border border-gray-800 px-2 py-1 text-center text-black text-xs">{label}</td>
                    
                    {/* Date columns - one cell for each day of the month */}
                    {daysInMonth.map((day) => (
                      <td key={day} className="border border-gray-800 px-1 py-1 text-center text-xs text-black"></td>
                    ))}
                    
                    {/* Only show keterangan in the first row */}
                    {index === 0 ? (
                      <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle text-black"></td>
                    ) : null}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="flex justify-end mt-8 pr-8">
          <div className="text-center text-black">
            <p className="text-black">..................., {currentDate()}</p>
            <p className="mt-1 text-black">Kepala Sekolah</p>
            <div className="h-20"></div> {/* Space for signature */}
            <p className="font-bold underline text-black">Nama Kepala Sekolah</p>
            <p className="text-black">NIP. 196012121980031001</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get formatted current date
function currentDate() {
  const now = new Date();
  const day = now.getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  
  return `${day} ${month} ${year}`;
}
