'use client'
import { useState } from 'react';
import { FiUsers, FiCalendar, FiClock, FiActivity, FiArrowUp, FiArrowDown, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  // Mock data - in a real app, this would come from your API
  const stats = {
    'today': {
      totalEmployees: 85,
      presentToday: 73,
      absentToday: 12,
    },
    'this-week': {
      totalEmployees: 85,
      presentToday: 78,
      absentToday: 7,
    },
    'this-month': {
      totalEmployees: 85,
      presentToday: 82,
      absentToday: 3,
    },
  };

  // Attendance chart data - Sunday removed
  const attendanceData = [
    { name: 'Senin', hadir: 75, tidakHadir: 10 },
    { name: 'Selasa', hadir: 76, tidakHadir: 9 },
    { name: 'Rabu', hadir: 77, tidakHadir: 8 },
    { name: 'Kamis', hadir: 78, tidakHadir: 7 },
    { name: 'Jumat', hadir: 79, tidakHadir: 6 },
    { name: 'Sabtu', hadir: 65, tidakHadir: 20 },
  ];

  // Recent activity data
  const recentActivity = [
    {
      id: 1,
      name: 'Budi Santoso',
      type: 'check-in',
      time: '07:58',
      timestamp: 'Hari ini',
    },
    {
      id: 2,
      name: 'Sarah Putri',
      type: 'check-in',
      time: '08:15',
      timestamp: 'Hari ini',
    },
    {
      id: 3,
      name: 'Ahmad Fauzi',
      type: 'check-out',
      time: '16:02',
      timestamp: 'Hari ini',
    },
    {
      id: 4,
      name: 'Rina Wijaya',
      type: 'check-in',
      time: '07:50',
      timestamp: 'Hari ini',
    },
    {
      id: 5,
      name: 'Denny Nugraha',
      type: 'absent',
      time: '-',
      timestamp: 'Hari ini',
    },
  ];

  // Use daily stats by default
  const currentStats = stats['today'];

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

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Employees */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Guru</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{currentStats.totalEmployees}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Hadir</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{currentStats.presentToday}</div>
              <div className="mt-1 text-sm text-green-600 flex items-center">
                <span>{Math.round(currentStats.presentToday / currentStats.totalEmployees * 100)}%</span>
                <FiArrowUp className="ml-1 w-4 h-4" />
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <FiCheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Tidak Hadir</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{currentStats.absentToday}</div>
              <div className="mt-1 text-sm text-red-600 flex items-center">
                <span>{Math.round(currentStats.absentToday / currentStats.totalEmployees * 100)}%</span>
                <FiArrowDown className="ml-1 w-4 h-4" />
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <FiXCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance trend chart */}
        <div className="bg-white rounded-lg shadow p-5 lg:col-span-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tren Kehadiran</h3>
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
                <Tooltip />
                <Legend />
                <Bar dataKey="hadir" name="Hadir" fill="#22c55e" />
                <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>
          
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-3">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === 'absent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'check-in' && <FiActivity />}
                      {activity.type === 'check-out' && <FiClock />}
                      {activity.type === 'absent' && <FiXCircle />}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                      <div className="text-xs text-gray-500">
                        {activity.type === 'check-in' 
                          ? 'Masuk' 
                          : activity.type === 'check-out' 
                            ? 'Pulang' 
                            : 'Tidak Hadir'} 
                        {activity.time !== '-' && ` • ${activity.time}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                  </div>
                </li>
              ))}
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Kehadiran Minggu Ini</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tidak Hadir</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day, i) => (
                <tr key={day}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{75 + i}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{10 - i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}