'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaUser, FaHistory, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import AttendanceService from '../api/attendance_service';
import ReportInfo from '../api/report_info';
import { exportAttendanceToExcel } from '@/utils/excelExport';
import AuthWrapper from '@/components/AuthWrapper';

function AttendanceReportPage() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [userData, setUserData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [attendanceReportData, setAttendanceReportData] = useState(null);
  
  // Load user data from local storage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserId(userData.userId);
      } else {
        setError("User data not found. Please login again.");
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user data");
    }
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedMonth) return;
      
      try {
        const [year, month] = selectedMonth.split('-');
        const response = await ReportInfo.getReportData(parseInt(month), parseInt(year));
        if (response.success && response.data) {
          setAttendanceReportData(response.data);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };
    
    fetchAttendanceData();
  }, [selectedMonth]);

  // Generate last 6 months for selection
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const value = `${year}-${month.toString().padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return { value, label };
  });
  
  // Set initial month on component mount
  useEffect(() => {
    if (months.length > 0) {
      setSelectedMonth(months[0].value);
    }
  }, []);
  
  // Fetch attendance data when selected month changes
  useEffect(() => {
    if (!selectedMonth || !userId) return;
    
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [year, month] = selectedMonth.split('-');
        const response = await AttendanceService.getUserReport(userId, parseInt(month), parseInt(year));
        
        if (response.success) {
          setUserData(response.userData);
          setAttendanceData(formatAttendanceData(response.attendanceData));
        } else {
          setError("Failed to load attendance data");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [selectedMonth, userId]);
  
  // Format attendance data from API to display format
  const formatAttendanceData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const date = new Date(item.date);
      
      // Format check-in time
      const checkInTime = item.checkIn ? new Date(item.checkIn) : null;
      // Check if checkIn is Unix epoch (1970-01-01) or null
      const isCheckInUnixEpoch = checkInTime && checkInTime.getTime() <= 86400000; // One day in milliseconds
      const formattedCheckIn = checkInTime && !isCheckInUnixEpoch ? 
        checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
      
      // Format check-out time
      const checkOutTime = item.checkOut ? new Date(item.checkOut) : null;
      // Check if checkOut is Unix epoch (1970-01-01) or null
      const isUnixEpoch = checkOutTime && checkOutTime.getTime() <= 86400000; // One day in milliseconds
      const formattedCheckOut = checkOutTime && !isUnixEpoch ? 
        checkOutTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
      
      // Map attendance status codes to display text
      const statusMap = {
        'P': 'Hadir',
        'S': 'Sakit',
        'L': 'Izin',
        'A': 'Tidak Hadir'
      };
      
      return {
        date: item.date,
        day: date.toLocaleDateString('id-ID', { weekday: 'long' }),
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        status: statusMap[item.attendanceStatus] || 'Tidak Hadir'
      };
    });
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
  
  // Count attendance by status
  const countAttendanceByStatus = (status) => {
    return attendanceData.filter(record => record.status === status).length;
  };
  
  // Function to handle report download
  const handleDownloadReport = () => {
    if (!selectedMonth) return;
    
    // Parse month and year from selectedMonth (format: YYYY-MM)
    const [year, month] = selectedMonth.split('-');
    const monthIndex = parseInt(month) - 1; // Convert to 0-indexed month
    
    // Get month name in Indonesian
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = monthNames[monthIndex];
    
    // Get days in the selected month
    const daysInMonth = Array.from(
      { length: new Date(parseInt(year), parseInt(month), 0).getDate() }, 
      (_, i) => i + 1
    );
    
    // Generate employee data for Excel export
    const employees = [];
    
    if (attendanceReportData && attendanceReportData.attendancesData) {
      // Use the data from attendanceReportData
      let employeeId = 1;
      attendanceReportData.attendancesData.forEach(employee => {
        employees.push({
          id: employeeId++,
          name: employee.fullName,
          nip: employee.nip !== 'N/A' ? employee.nip : '',
          position: employee.position
        });
      });
    } else if (userData) {
      // Fallback to using just the current user's data
      employees.push({
        id: 1,
        name: userData.fullName,
        nip: userData.nip || '',
        position: userData.position || ''
      });
    }
    
    // Call the Excel export function
    exportAttendanceToExcel(
      employees,
      daysInMonth,
      monthName,
      year,
      attendanceReportData
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 flex flex-col pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-5 flex items-center shadow-md sticky top-0 z-10">
        <Link href="/home" className="text-white p-2 mr-3 hover:bg-white/20 rounded-full transition-colors">
          <FaArrowLeft size={18} />
        </Link>
        <div className="flex items-center">
          <FaHistory className="mr-2" />
          <h1 className="text-xl font-semibold">Laporan Kehadiran</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-all duration-300 border border-sky-100">
          <div className="flex items-center mb-3">
            <div className="bg-sky-100 p-2 rounded-full mr-3">
              <FaUser className="text-blue-500" />
            </div>
            <h2 className="text-lg font-medium text-slate-800">Informasi Pegawai</h2>
          </div>
          {isLoading ? (
            <div className="pl-6 border-l-2 border-blue-500 mt-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ) : userData ? (
            <div className="pl-6 border-l-2 border-blue-500 mt-3">
              <p className="text-slate-700 font-medium">{userData.fullName}</p>
              <p className="text-slate-500 text-sm mt-1">{userData.nip}</p>
            </div>
          ) : (
            <div className="pl-6 border-l-2 border-blue-500 mt-3 text-gray-500">
              Data tidak tersedia
            </div>
          )}
        </div>
        
        {/* Month Selection */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-all duration-300 border border-sky-100">
          <div className="flex items-center mb-3">
            <div className="bg-sky-100 p-2 rounded-full mr-3">
              <FaCalendarAlt className="text-blue-500" />
            </div>
            <h2 className="text-lg font-medium text-slate-800">Pilih Bulan</h2>
          </div>
          <select 
            className="w-full p-3 border border-sky-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-all"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={isLoading}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-all duration-300 border border-sky-100">
          <div className="flex items-center mb-3">
            <div className="bg-sky-100 p-2 rounded-full mr-3">
              <FaCheckCircle className="text-blue-500" />
            </div>
            <h2 className="text-lg font-medium text-slate-800">Data Kehadiran</h2>
          </div>
          
          {/* Loading and error states */}
          {isLoading && (
            <div className="flex justify-center items-center h-[320px]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="flex flex-col justify-center items-center h-[320px]">
              <div className="bg-red-100 p-3 rounded-full mb-3">
                <FaExclamationCircle className="text-red-500 text-xl" />
              </div>
              <div className="text-red-500 text-center">
                <p>{error}</p>
                <button 
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                  onClick={() => {
                    const [year, month] = selectedMonth.split('-');
                    AttendanceService.getUserReport(userId, parseInt(month), parseInt(year));
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && !error && attendanceData.length === 0 && (
            <div className="flex flex-col justify-center items-center h-[320px] text-center">
              <div className="bg-sky-100 p-6 rounded-full mb-4">
                <FaCalendarAlt className="text-blue-500" size={28} />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Tidak ada data</h3>
              <p className="text-slate-500 mt-1">Data kehadiran tidak tersedia untuk bulan ini</p>
            </div>
          )}
          
          {/* Fixed height table container with vertical scrolling */}
          {!isLoading && !error && attendanceData.length > 0 && (
            <div className="h-[320px] overflow-y-auto rounded-lg border border-sky-100" style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin'
            }}>
              <table className="w-full table-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-sky-100 to-sky-50">
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-sky-200">
                      Tanggal
                    </th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-sky-200">
                      Jam Masuk
                    </th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-sky-200">
                      Jam Keluar
                    </th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-sky-200">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={record.date} className={`${index % 2 === 0 ? 'bg-white' : 'bg-sky-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="py-3 px-3 text-sm text-slate-700 border-b border-sky-100">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-700 border-b border-sky-100">
                        {record.checkIn}
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-700 border-b border-sky-100">
                        {record.checkOut}
                      </td>
                      <td className="py-3 px-3 text-sm border-b border-sky-100 text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                          record.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty rows to maintain fixed height when not enough data */}
                  {attendanceData.length < 10 && Array(10 - attendanceData.length).fill(0).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-10">
                      <td colSpan="4" className="border-b border-sky-50"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Summary stats */}
          {!isLoading && !error && attendanceData.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-green-50 p-2 rounded-lg border border-green-100 hover:bg-green-100 transition-colors shadow-sm">
                <p className="text-xs text-green-600 font-medium">Hadir</p>
                <p className="text-lg font-semibold text-green-700">
                  {countAttendanceByStatus('Hadir')}
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm">
                <p className="text-xs text-blue-600 font-medium">Izin</p>
                <p className="text-lg font-semibold text-blue-700">
                  {countAttendanceByStatus('Izin')}
                </p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors shadow-sm">
                <p className="text-xs text-yellow-600 font-medium">Sakit</p>
                <p className="text-lg font-semibold text-yellow-700">
                  {countAttendanceByStatus('Sakit')}
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg border border-red-100 hover:bg-red-100 transition-colors shadow-sm">
                <p className="text-xs text-red-600 font-medium">Tidak Hadir</p>
                <p className="text-lg font-semibold text-red-700">
                  {countAttendanceByStatus('Tidak Hadir')}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Download Button */}
        <button
          onClick={handleDownloadReport}
          className={`
            w-full py-3.5 px-4 flex items-center justify-center rounded-xl shadow-md transition-all
            ${attendanceData.length === 0 || isLoading ? 
              'bg-gray-300 text-gray-500 cursor-not-allowed' : 
              'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transform hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0'
            }
          `}
          disabled={isLoading || attendanceData.length === 0}
        >
          <FaDownload className="mr-2" /> Unduh Laporan
        </button>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthWrapper>
      <AttendanceReportPage />
    </AuthWrapper>
  );
}