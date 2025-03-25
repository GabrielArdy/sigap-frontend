'use client';
import { useState, useEffect } from 'react';

export default function AttendanceReportTemplate() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');

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
    { id: 1, name: 'Budi Santoso', nip: '19850612 200901 1 001', position: 'Guru Matematika' },
    { id: 2, name: 'Siti Rahayu', nip: '19880824 201001 2 003', position: 'Guru Bahasa Indonesia' },
    { id: 3, name: 'Ahmad Fahri', nip: '19770315 199803 1 002', position: 'Guru IPA' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md p-8">
        {/* Header/Kop */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 mr-4">
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600">Logo</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase">Pemerintah Kabupaten/Kota ...</h1>
              <h2 className="text-lg font-bold">DINAS PENDIDIKAN</h2>
              <h1 className="text-2xl font-bold mt-1">SMA/SMK/SMP NEGERI ...</h1>
              <p className="text-sm">Alamat: Jl. Pendidikan No. 123, Telepon: (021) 12345678</p>
              <p className="text-sm">Email: sekolah@example.com | Website: www.sekolah.sch.id</p>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">DAFTAR HADIR PEGAWAI</h2>
          <p className="text-lg">Bulan: {currentMonth} {currentYear}</p>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-800">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-200">
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-8">No</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-36">Nama dan NIP</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-36">Jabatan</th>
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm">Waktu</th>
                {daysInMonth.map((day) => (
                  <th key={day} rowSpan="2" className="border border-gray-800 px-1 py-1 text-xs w-6 align-middle">{day}</th>
                ))}
                <th rowSpan="2" className="border border-gray-800 px-2 py-1 text-sm align-middle w-24">Keterangan</th>
              </tr>
              <tr className="bg-gray-200">
                {/* Empty row for alignment */}
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {employees.map((employee) => {
                // Create 4 rows for each employee
                const timeLabels = ['Tiba', 'Paraf', 'Pulang', 'Paraf'];
                
                return timeLabels.map((label, index) => (
                  <tr key={`${employee.id}-${index}`}>
                    {/* Only show employee info in the first row */}
                    {index === 0 ? (
                      <>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 text-center align-middle">{employee.id}</td>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle">
                          <div>{employee.name}</div>
                          <div className="text-xs">{employee.nip}</div>
                        </td>
                        <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle">{employee.position}</td>
                      </>
                    ) : null}
                    
                    {/* Show appropriate time label for each row */}
                    <td className="border border-gray-800 px-2 py-1 text-center">{label}</td>
                    
                    {/* Date columns - one cell for each day of the month */}
                    {daysInMonth.map((day) => (
                      <td key={day} className="border border-gray-800 px-1 py-1 text-center text-xs"></td>
                    ))}
                    
                    {/* Only show keterangan in the first row */}
                    {index === 0 ? (
                      <td rowSpan="4" className="border border-gray-800 px-2 py-1 align-middle"></td>
                    ) : null}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="flex justify-end mt-8 pr-8">
          <div className="text-center">
            <p>..................., {currentDate()}</p>
            <p className="mt-1">Kepala Sekolah</p>
            <div className="h-20"></div> {/* Space for signature */}
            <p className="font-bold underline">Nama Kepala Sekolah</p>
            <p>NIP. 196012121980031001</p>
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
