'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaBell, FaSignOutAlt, FaSignInAlt, FaDoorOpen, FaClipboardList, FaHistory, FaClock, FaCalendarAlt, FaIdCard, FaCheckCircle } from 'react-icons/fa';
import AttendanceService from '../api/attendance_service';
import AuthWrapper from '@/components/AuthWrapper';

function HomePage() {
  // State for user data, loading, and error handling
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation states
  const [checkInActive, setCheckInActive] = useState(false);
  const [checkOutActive, setCheckOutActive] = useState(false);
  const router = useRouter();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user from localStorage and parse the JSON string
        const userString = localStorage.getItem('user');
        if (!userString) {
          setError('User not found in localStorage');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userString);
        const userId = user.userId;
        
        const response = await AttendanceService.getUserDashboard(userId);
        
        if (response.success) {
          setUserData(response.data);
        } else {
          setError('Failed to load data');
        }
      } catch (err) {
        setError('Error fetching data: ' + (err.message || 'Unknown error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format time from ISO string to HH:MM format
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    // Check if date is equal to the Unix epoch (Jan 1, 1970) or invalid
    if (date.getTime() === 0 || isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle check in function
  const handleCheckIn = () => {
    setCheckInActive(true);
    setTimeout(() => setCheckInActive(false), 300);
    console.log("Check in at:", new Date());
    // Add your check-in logic here
    router.push('/check-in');
  };

  // Handle check out function
  const handleCheckOut = () => {
    setCheckOutActive(true);
    setTimeout(() => setCheckOutActive(false), 300);
    console.log("Check out at:", new Date());
    // Add your check-out logic here
    router.push('/check-out');
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleMonthlyReport = () => {
    router.push('/report');
  }

  // Prepare display data based on API response
  const displayData = userData ? {
    name: `${userData.user.firstName} ${userData.user.lastName}`,
    employeeId: userData.user.nip,
    avatarUrl: null, // API doesn't provide avatar URL
    todayAttendance: {
      date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: formatTime(userData.attendanceData?.checkIn),
      checkOut: formatTime(userData.attendanceData?.checkOut)
    }
  } : {
    name: "Loading...",
    employeeId: "Loading...",
    avatarUrl: null,
    todayAttendance: {
      date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: "-",
      checkOut: "-"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 text-slate-700">
      {/* Header with notification and logout */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center">
          <FaCheckCircle className="mr-2" /> SIGAP
        </h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 relative min-w-[44px] min-h-[44px] flex items-center justify-center">
            <FaBell className="text-xl" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-400 rounded-full animate-pulse"></span>
          </button>
          <button onClick={handleLogout}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col gap-6 max-w-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-3 border-b-3 border-blue-500"></div>
            <p className="mt-3 text-slate-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center shadow-md">
            <div className="text-3xl mb-2">⚠️</div>
            {error}
          </div>
        ) : (
          <>
            {/* Greeting Card with user info */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-sky-100">
              <div className="flex items-center space-x-4">
                {displayData.avatarUrl ? (
                  <Image 
                    src={displayData.avatarUrl} 
                    alt="User avatar" 
                    className="w-18 h-18 rounded-full border-2 border-blue-500" 
                  />
                ) : (
                  <div className="bg-sky-100 p-3 rounded-full">
                    <FaUserCircle className="w-14 h-14 text-blue-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800">{displayData.name}</h2>
                  <div className="flex items-center text-sm text-slate-500 mt-2">
                    <FaIdCard className="mr-2 text-blue-500" />
                    <p>NIP: {displayData.employeeId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Attendance Card - Redesigned with repositioned date */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-sky-100">
              <div className="bg-gradient-to-r from-sky-100 to-sky-50 p-2.5">
                <div className="flex items-center">
                  <FaHistory className="text-blue-500 mr-2 text-base" />
                  <h3 className="text-base font-bold text-slate-700">Kehadiran Hari Ini</h3>
                </div>
              </div>
              
              <div className="px-3 pt-1.5 pb-0.5 border-b border-sky-50">
                <div className="flex items-center text-xs text-slate-600">
                  <FaCalendarAlt className="text-blue-500 mr-1.5" />
                  <span className="font-medium">{displayData.todayAttendance.date}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                <div className={`
                  bg-slate-50 p-2.5 rounded-xl border border-sky-100 relative overflow-hidden 
                  group hover:shadow-md transition-all duration-300 hover:bg-white
                  ${displayData.todayAttendance.checkIn !== "-" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-slate-300"}
                `}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`rounded-full ${displayData.todayAttendance.checkIn !== "-" ? "bg-green-100" : "bg-slate-100"} p-1.5`}>
                      <FaSignInAlt className={`text-base ${displayData.todayAttendance.checkIn !== "-" ? "text-green-600" : "text-slate-400"}`} />
                    </div>
                    <FaClock className="text-slate-400 text-sm group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Jam Masuk</p>
                  <p className={`text-base font-semibold ${displayData.todayAttendance.checkIn !== "-" ? "text-blue-600" : "text-slate-400"}`}>
                    {displayData.todayAttendance.checkIn}
                  </p>
                </div>
                
                <div className={`
                  bg-slate-50 p-2.5 rounded-xl border border-sky-100 relative overflow-hidden 
                  group hover:shadow-md transition-all duration-300 hover:bg-white
                  ${displayData.todayAttendance.checkOut !== "-" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-slate-300"}
                `}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`rounded-full ${displayData.todayAttendance.checkOut !== "-" ? "bg-blue-100" : "bg-slate-100"} p-1.5`}>
                      <FaDoorOpen className={`text-base ${displayData.todayAttendance.checkOut !== "-" ? "text-blue-600" : "text-slate-400"}`} />
                    </div>
                    <FaClock className="text-slate-400 text-sm group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Jam Keluar</p>
                  <p className={`text-base font-semibold ${displayData.todayAttendance.checkOut !== "-" ? "text-blue-600" : "text-slate-400"}`}>
                    {displayData.todayAttendance.checkOut}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Attendance Actions */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button 
            onClick={handleCheckIn}
            className={`
              flex flex-col items-center justify-center 
              bg-white
              hover:bg-blue-50
              p-4 rounded-xl shadow-md transition-all duration-300
              min-h-[110px] border-2 border-blue-300
              ${checkInActive ? 'transform scale-95 bg-blue-50' : 'hover:transform hover:scale-[1.02]'}
            `}
            aria-label="Check In Button"
          >
            <div className="bg-green-100 p-2.5 rounded-full shadow-sm mb-2 border border-green-200">
              <FaSignInAlt className="text-green-600 text-xl" />
            </div>
            <span className="font-bold text-base text-slate-800">Masuk</span>
            <span className="text-xs text-slate-600 mt-1">Rekam Kehadiran</span>
          </button>
          
          <button 
            onClick={handleCheckOut}
            className={`
              flex flex-col items-center justify-center 
              bg-white
              hover:bg-blue-50
              p-4 rounded-xl shadow-md transition-all duration-300
              min-h-[110px] border-2 border-blue-300
              ${checkOutActive ? 'transform scale-95 bg-blue-50' : 'hover:transform hover:scale-[1.02]'}
            `}
            aria-label="Check Out Button"
          >
            <div className="bg-blue-100 p-2.5 rounded-full shadow-sm mb-2 border border-blue-200">
              <FaDoorOpen className="text-blue-600 text-xl" />
            </div>
            <span className="font-bold text-base text-slate-800">Keluar</span>
            <span className="text-xs text-slate-600 mt-1">Rekam Pulang</span>
          </button>
        </div>

        {/* Monthly Report Button */}
        <button onClick={handleMonthlyReport}
          className="mt-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center transform hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 duration-300">
          <div className="bg-white/20 p-2.5 rounded-lg mr-3">
            <FaClipboardList className="text-white text-lg" />
          </div>
          <span className="font-medium">Laporan Kehadiran Bulanan</span>
        </button>

        {/* Leave Request Button */}
        <button 
          onClick={() => router.push('/leave-request')}
          className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center transform hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 duration-300">
          <div className="bg-white/20 p-2.5 rounded-lg mr-3">
            <FaCalendarAlt className="text-white text-lg" />
          </div>
          <span className="font-medium">Lakukan Pengajuan Izin</span>
        </button>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <HomePage />
    </AuthWrapper>
  );
}