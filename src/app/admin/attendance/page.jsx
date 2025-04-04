'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiFilter, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AttendanceService from '@/app/api/attendance_service';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Month names mapping
  const monthNames = [
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 }
  ];
  
  // Status mapping
  const statusMapping = {
    'P': 'Hadir',
    'A': 'Tidak Hadir',
    'L': 'Izin',
    'S': 'Sakit'
  };
  
  // Generate an array of years (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);

  // Fetch attendance data from API
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const response = await AttendanceService.getAllAttendance();
        
        if (response.success) {
          // Process the attendance data from API
          const processedData = response.data.map((item) => {
            // Check if checkIn is epoch date (1970-01-01) or invalid
            const checkInDate = item.checkIn ? new Date(item.checkIn) : null;
            const isCheckInEpoch = checkInDate && 
              (checkInDate.getFullYear() === 1970 && 
               checkInDate.getMonth() === 0 && 
               checkInDate.getDate() === 1);
            
            // Check if checkOut is epoch date (1970-01-01) or invalid
            const checkOutDate = item.checkOut ? new Date(item.checkOut) : null;
            const isCheckOutEpoch = checkOutDate && 
              (checkOutDate.getFullYear() === 1970 && 
               checkOutDate.getMonth() === 0 && 
               checkOutDate.getDate() === 1);
            
            return {
              id: item.attendanceId,
              date: new Date(item.date),
              timeIn: item.checkIn && !isCheckInEpoch ? 
                new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
              timeOut: item.checkOut && !isCheckOutEpoch ? 
                new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
              status: statusMapping[item.attendanceStatus] || 'Unknown',
              staffName: item.fullName,
              // Create a unique staff ID from the name if needed for filtering
              staffId: item.fullName
            };
          });
          
          // Extract unique staff list from attendance data
          const uniqueStaffList = Array.from(
            new Set(processedData.map(item => item.staffName))
          ).map((name, index) => ({
            id: name,
            name: name
          }));
          
          setStaffList(uniqueStaffList);
          setAttendanceData(processedData);
          setFilteredData(processedData);
        } else {
          console.error("Failed to fetch attendance data");
          Swal.fire({
            icon: 'error',
            title: 'Gagal memuat data',
            text: 'Terjadi kesalahan saat memuat data kehadiran'
          });
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal memuat data',
          text: 'Terjadi kesalahan saat memuat data kehadiran'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle staff selection
  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  // Search data based on selected staff and period
  const handleSearch = () => {
    if (!attendanceData.length) return;
    
    let filtered = [...attendanceData];
    
    // Apply staff filter
    if (selectedStaff !== '') {
      filtered = filtered.filter(item => item.staffId === selectedStaff);
    }
    
    // Apply period filter (month and year)
    filtered = filtered.filter(item => {
      const itemMonth = item.date.getMonth() + 1; // JavaScript months are 0-based
      const itemYear = item.date.getFullYear();
      return itemMonth === parseInt(selectedMonth) && itemYear === parseInt(selectedYear);
    });
    
    setFilteredData(filtered);
    setPage(0);
  };

  // Reset filters
  const resetFilters = () => {
    const currentDate = new Date();
    setSelectedStaff('');
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
    setFilteredData(attendanceData);
    setPage(0);
  };

  // Check if attendance can be edited (only records from the last 7 days can be edited)
  const canEdit = (date) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return date >= sevenDaysAgo;
  };

  // Handle edit attendance
  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setNewStatus(attendance.status);
    
    // Convert from display status back to API status code
    const reverseStatusMapping = Object.entries(statusMapping).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});
    
    Swal.fire({
      title: 'Edit Status Kehadiran',
      html: `
        <div class="mb-4">
          <p class="text-sm text-gray-600">Tanggal: ${formatDate(attendance.date)}</p>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
          <select id="status" class="w-full text-sm border border-gray-300 rounded-md p-2">
            <option value="Hadir" ${attendance.status === 'Hadir' ? 'selected' : ''}>Hadir</option>
            <option value="Tidak Hadir" ${attendance.status === 'Tidak Hadir' ? 'selected' : ''}>Tidak Hadir</option>
            <option value="Izin" ${attendance.status === 'Izin' ? 'selected' : ''}>Izin</option>
            <option value="Sakit" ${attendance.status === 'Sakit' ? 'selected' : ''}>Sakit</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        return document.getElementById('status').value;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value;
        const newStatusCode = reverseStatusMapping[newStatus];
        
        // Here you would call the API to update the status
        // For now, we'll just update the local state
        const updatedData = attendanceData.map(item => {
          if (item.id === attendance.id) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        setAttendanceData(updatedData);
        
        const updatedFiltered = filteredData.map(item => {
          if (item.id === attendance.id) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        setFilteredData(updatedFiltered);
        
        Swal.fire(
          'Berhasil!',
          'Status kehadiran telah diperbarui.',
          'success'
        );
      }
    });
  };

  // Format date to display day and date in Indonesian without using date-fns
  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Calculate pagination
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kehadiran</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data kehadiran guru dan staff tata usaha
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Staff filter */}
          <div className="md:col-span-4">
            <div className="flex items-center">
              <FiFilter className="h-5 w-5 text-gray-700 mr-2" />
              <select
                value={selectedStaff}
                onChange={handleStaffChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
              >
                <option value="">Semua Staff</option>
                {staffList.length > 0 ? (
                  staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Tidak ada data staff</option>
                )}
              </select>
            </div>
          </div>
          
          {/* Period filter - container */}
          <div className="md:col-span-5">
            <div className="flex items-center">
              <FiCalendar className="h-5 w-5 text-gray-700 mr-2 flex-shrink-0" />
              <div className="flex w-full space-x-2">
                {/* Period filter - Month */}
                <div className="w-1/2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
                    aria-label="Pilih Bulan"
                  >
                    {monthNames.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Period filter - Year */}
                <div className="w-1/2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
                    aria-label="Pilih Tahun"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search button */}
          <div className="md:col-span-3 flex space-x-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-800 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150 justify-center flex-grow"
            >
              <FiSearch className="mr-2" />
              Cari Data
            </button>
            
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:border-gray-300 focus:ring ring-gray-200 disabled:opacity-25 transition ease-in-out duration-150"
            >
              <FiRefreshCw className="mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Staff
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Kehadiran
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {staffList.length === 0 ? 
                      "Tidak ada data staff tersedia" : 
                      "Tidak ada data kehadiran yang ditemukan"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.staffName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.timeIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.timeOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendance.status === 'Hadir' 
                          ? 'bg-green-100 text-green-800' 
                          : attendance.status === 'Tidak Hadir'
                          ? 'bg-red-100 text-red-800'
                          : attendance.status === 'Izin'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <div className="relative group">
                          <button
                            onClick={() => canEdit(attendance.date) && handleEditAttendance(attendance)}
                            disabled={!canEdit(attendance.date)}
                            className={`p-1 ${
                              canEdit(attendance.date) 
                                ? 'text-blue-600 hover:text-blue-900' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            aria-label={canEdit(attendance.date) ? "Edit" : "Tidak dapat diedit"}
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          {!canEdit(attendance.date) && (
                            <div className="absolute z-10 hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap">
                              Melewati masa edit
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{page * rowsPerPage + 1}</span> sampai <span className="font-medium">{Math.min((page + 1) * rowsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <div className="flex items-center space-x-2">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">Baris per halaman</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminAuthWrapper>
      <AttendancePage />
    </AdminAuthWrapper>
  );
}
