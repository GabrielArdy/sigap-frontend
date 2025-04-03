'use client'
import { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiClock, FiActivity, FiArrowUp, FiArrowDown, FiCheckCircle, FiXCircle, FiLogIn, FiLogOut } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AttendanceService from '../../api/attendance_service';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    checkIn: { count: 0, percentage: 0 },
    checkOut: { count: 0, percentage: 0 },
    recentActivities: [],
    attendanceTrend: []
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await AttendanceService.getAdminDashboard();
        if (response.success) {
          setDashboardData(response.data);
          
          // Process attendance trend data for the chart
          if (response.data.attendanceTrend && response.data.attendanceTrend.length > 0) {
            const formattedData = response.data.attendanceTrend.map(item => {
              const date = parseISO(item.date);
              return {
                name: format(date, 'EEEE', { locale: id }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: id }).slice(1),
                masuk: item.checkIn,
                keluar: item.checkOut,
                fullDate: format(date, 'dd/MM')
              };
            });
            setAttendanceData(formattedData);
            
            // Extract last week data for the table
            const lastWeekData = formattedData.slice(-7);
            setWeeklyData(lastWeekData);
          }
        } else {
          console.error("Failed to fetch dashboard data:", response);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return `Hari ini, ${format(date, 'HH:mm')}`;
    }
    
    return format(date, 'dd MMM, HH:mm');
  };

  // Format time only from timestamp
  const getTimeFromTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  // Check if timestamp is today
  const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{label} {payload[0]?.payload?.fullDate}</p>
          <p className="text-sm text-green-600">Masuk: {payload[0]?.value || 0}</p>
          <p className="text-sm text-blue-600">Keluar: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dasbor Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan data kehadiran dan aktivitas terbaru
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <a 
            href="/station/activated" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            Aktifkan Anjungan
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Employees */}
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Guru</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{dashboardData.totalUsers}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiUsers className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Checked In Today */}
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Masuk Hari Ini</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{dashboardData.checkIn.count}</div>
                  <div className="mt-1 text-sm text-green-600 flex items-center">
                    <span>{dashboardData.checkIn.percentage}%</span>
                    <FiArrowUp className="ml-1 w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <FiLogIn className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Checked Out */}
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Keluar Hari Ini</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{dashboardData.checkOut.count}</div>
                  <div className="mt-1 text-sm text-blue-600 flex items-center">
                    <span>{dashboardData.checkOut.percentage}%</span>
                    <FiClock className="ml-1 w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiLogOut className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Check-in/Check-out trend chart */}
            <div className="bg-white rounded-lg shadow p-5 lg:col-span-2 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tren Aktivitas Harian</h3>
              </div>
              
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="masuk" name="Masuk" fill="#22c55e" />
                    <Bar dataKey="keluar" name="Keluar" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>
              
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'CheckIn' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.type === 'CheckIn' ? <FiLogIn /> : <FiLogOut />}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{activity.fullName}</div>
                            <div className="text-xs text-gray-500">
                              {activity.type === 'CheckIn' ? 'Masuk' : 'Pulang'} 
                              {' • ' + getTimeFromTimestamp(activity.timestamp)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {isToday(activity.timestamp) ? 'Hari ini' : format(new Date(activity.timestamp), 'dd MMM')}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4 text-center text-gray-500">Tidak ada aktivitas terbaru</li>
                  )}
                </ul>

                <div className="mt-4 text-center">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Lihat Semua Aktivitas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Aktivitas Minggu Ini</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masuk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keluar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weeklyData.length > 0 ? (
                    weeklyData.map((day, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.fullDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.masuk}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.keluar}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada data untuk minggu ini</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminAuthWrapper>
      <DashboardPage />
    </AdminAuthWrapper>
  );
}