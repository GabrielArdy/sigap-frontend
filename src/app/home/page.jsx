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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      {/* Header with notification and logout */}
      <header className="bg-gradient-to-r from-[#2a3b8f] to-[#3549b1] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center">
          <FaCheckCircle className="mr-2" /> SIGAP
        </h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-[#3549b1]/70 rounded-full transition-colors duration-200 relative">
            <FaBell className="text-xl" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={handleLogout}
            className="p-2 hover:bg-[#3549b1]/70 rounded-full transition-colors duration-200">
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 flex flex-col gap-5 max-w-md">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3549b1]"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Greeting Card with user info */}
            <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center space-x-4">
                {displayData.avatarUrl ? (
                  <Image 
                    src={displayData.avatarUrl} 
                    alt="User avatar" 
                    className="w-16 h-16 rounded-full border-2 border-[#3549b1]" 
                  />
                ) : (
                  <div className="bg-[#e0e8f9] p-3 rounded-full">
                    <FaUserCircle className="w-12 h-12 text-[#3549b1]" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{displayData.name}</h2>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <FaIdCard className="mr-1 text-[#3549b1]" />
                    <p>NIP: {displayData.employeeId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Attendance Card - Redesigned with repositioned date */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
              <div className="bg-gradient-to-r from-[#e0e8f9] to-[#f0f4fd] p-4">
                <div className="flex items-center">
                  <FaHistory className="text-[#3549b1] mr-2 text-lg" />
                  <h3 className="text-lg font-bold text-[#20264b]">Kehadiran Hari Ini</h3>
                </div>
              </div>
              
              <div className="px-5 pt-3 pb-2 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="text-[#3549b1] mr-2" />
                  <span>{displayData.todayAttendance.date}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-5">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="rounded-full bg-green-100 p-2">
                      <FaSignInAlt className="text-green-600" />
                    </div>
                    <FaClock className="text-gray-400 group-hover:text-[#3549b1] transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Jam Masuk</p>
                  <p className="text-xl font-semibold text-[#3549b1]">{displayData.todayAttendance.checkIn}</p>
                </div>
                
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="rounded-full bg-blue-100 p-2">
                      <FaDoorOpen className="text-blue-600" />
                    </div>
                    <FaClock className="text-gray-400 group-hover:text-[#3549b1] transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Jam Keluar</p>
                  <p className="text-xl font-semibold text-[#3549b1]">{displayData.todayAttendance.checkOut}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Attendance Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCheckIn}
            className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e8f9] to-[#d0dff9] hover:from-[#c8d7f5] hover:to-[#b8cbf1] p-5 rounded-xl shadow transition-all duration-200 ${checkInActive ? 'transform scale-95' : ''}`}
          >
            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
              <FaSignInAlt className="text-[#3549b1] text-2xl" />
            </div>
            <span className="font-medium text-[#20264b]">Masuk</span>
            <span className="text-xs text-[#3549b1]/70 mt-1">Rekam Kehadiran</span>
          </button>
          
          <button 
            onClick={handleCheckOut}
            className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e8f9] to-[#d0dff9] hover:from-[#c8d7f5] hover:to-[#b8cbf1] p-5 rounded-xl shadow transition-all duration-200 ${checkOutActive ? 'transform scale-95' : ''}`}
          >
            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
              <FaDoorOpen className="text-[#3549b1] text-2xl" />
            </div>
            <span className="font-medium text-[#20264b]">Keluar</span>
            <span className="text-xs text-[#3549b1]/70 mt-1">Rekam Pulang</span>
          </button>
        </div>

        {/* Monthly Report Button */}
        <button onClick={handleMonthlyReport}
          className="mt-2 bg-gradient-to-r from-[#2a3b8f] to-[#3549b1] hover:from-[#243780] hover:to-[#2d3e9d] text-white py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center transform hover:translate-y-[-2px] hover:shadow-lg duration-200">
          <div className="bg-white/20 p-2 rounded-lg mr-3">
            <FaClipboardList className="text-white" />
          </div>
          <span>Laporan Kehadiran Bulanan</span>
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