'use client'
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaUser } from 'react-icons/fa';

export default function AttendanceReportPage() {
  const [selectedMonth, setSelectedMonth] = useState('2023-05');
  
  // Dummy data for 3 months
  const months = [
    { value: '2023-05', label: 'Mei 2023' },
    { value: '2023-04', label: 'April 2023' },
    { value: '2023-03', label: 'Maret 2023' }
  ];
  
  // Dummy attendance data - simplified to focus on essential fields
  const attendanceData = {
    '2023-05': [
      { date: '2023-05-01', day: 'Senin', checkIn: '08:02', checkOut: '17:05', status: 'Hadir' },
      { date: '2023-05-02', day: 'Selasa', checkIn: '08:05', checkOut: '17:10', status: 'Hadir' },
      { date: '2023-05-03', day: 'Rabu', checkIn: '07:55', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-05-04', day: 'Kamis', checkIn: '08:10', checkOut: '17:05', status: 'Hadir' },
      { date: '2023-05-05', day: 'Jumat', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-05-08', day: 'Senin', checkIn: '08:15', checkOut: '17:20', status: 'Hadir' },
      { date: '2023-05-09', day: 'Selasa', checkIn: '-', checkOut: '-', status: 'Izin' },
      { date: '2023-05-10', day: 'Rabu', checkIn: '-', checkOut: '-', status: 'Izin' },
      { date: '2023-05-11', day: 'Kamis', checkIn: '08:05', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-05-12', day: 'Jumat', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-05-15', day: 'Senin', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
    ],
    '2023-04': [
      { date: '2023-04-03', day: 'Senin', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-04-04', day: 'Selasa', checkIn: '08:05', checkOut: '17:10', status: 'Hadir' },
      { date: '2023-04-05', day: 'Rabu', checkIn: '07:55', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-04-06', day: 'Kamis', checkIn: '-', checkOut: '-', status: 'Sakit' },
      { date: '2023-04-07', day: 'Jumat', checkIn: '-', checkOut: '-', status: 'Sakit' },
    ],
    '2023-03': [
      { date: '2023-03-27', day: 'Senin', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-03-28', day: 'Selasa', checkIn: '08:05', checkOut: '17:10', status: 'Hadir' },
      { date: '2023-03-29', day: 'Rabu', checkIn: '07:55', checkOut: '17:00', status: 'Hadir' },
      { date: '2023-03-30', day: 'Kamis', checkIn: '08:10', checkOut: '17:05', status: 'Hadir' },
      { date: '2023-03-31', day: 'Jumat', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
    ]
  };
  
  // User data
  const userData = {
    name: "Budi Santoso",
    employeeId: "NIP-202301456"
  };
  
  // Function to handle report download
  const handleDownloadReport = () => {
    alert('Download laporan untuk bulan ' + selectedMonth);
    // In a real app, this would trigger a PDF or Excel download
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      weekday: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      {/* Header */}
      <header className="bg-[#3549b1] text-white py-4 px-5 flex items-center shadow-md">
        <Link href="/home" className="text-white p-2 mr-3">
          <FaArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold">Laporan Kehadiran</h1>
      </header>
      
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center mb-2">
            <FaUser className="text-[#3549b1] mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Informasi Pegawai</h2>
          </div>
          <div className="pl-6 border-l-2 border-[#3549b1] mt-3">
            <p className="text-gray-700 font-medium">{userData.name}</p>
            <p className="text-gray-500 text-sm mt-1">{userData.employeeId}</p>
          </div>
        </div>
        
        {/* Month Selection */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center mb-3">
            <FaCalendarAlt className="text-[#3549b1] mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Pilih Bulan</h2>
          </div>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3549b1] text-gray-800"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Data Kehadiran</h2>
          
          {/* Fixed height table container with vertical scrolling */}
          <div className="h-[320px] overflow-y-auto" style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin'
          }}>
            <table className="w-full table-auto">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Tanggal
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Jam Masuk
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Jam Keluar
                  </th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceData[selectedMonth].map((record, index) => (
                  <tr key={record.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-3 text-sm text-gray-900 border-b border-gray-200">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-900 border-b border-gray-200">
                      {record.checkIn}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-900 border-b border-gray-200">
                      {record.checkOut}
                    </td>
                    <td className="py-3 px-3 text-sm border-b border-gray-200 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                        record.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {attendanceData[selectedMonth].length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Tidak ada data kehadiran untuk bulan ini
                    </td>
                  </tr>
                )}
                
                {/* Empty rows to maintain fixed height when not enough data */}
                {attendanceData[selectedMonth].length < 10 && Array(10 - attendanceData[selectedMonth].length).fill(0).map((_, index) => (
                  <tr key={`empty-${index}`} className="h-10">
                    <td colSpan="4" className="border-b border-gray-100"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-green-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Hadir</p>
              <p className="text-lg font-semibold text-green-700">
                {attendanceData[selectedMonth].filter(r => r.status === 'Hadir').length}
              </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Izin</p>
              <p className="text-lg font-semibold text-blue-700">
                {attendanceData[selectedMonth].filter(r => r.status === 'Izin').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Sakit</p>
              <p className="text-lg font-semibold text-yellow-700">
                {attendanceData[selectedMonth].filter(r => r.status === 'Sakit').length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Download Button */}
        <button
          onClick={handleDownloadReport}
          className="w-full py-3 px-4 bg-[#3549b1] hover:bg-[#2e3a7a] text-white font-medium rounded-lg shadow-md flex items-center justify-center"
        >
          <FaDownload className="mr-2" /> Unduh Laporan
        </button>
      </main>
    </div>
  );
}