'use client'
import Image from 'next/image';
import React, { useState } from 'react';
import { FaUserCircle, FaBell, FaSignOutAlt, FaSignInAlt, FaDoorOpen, FaClipboardList, FaHistory } from 'react-icons/fa';

export default function HomePage() {
  // Mock data - replace with actual user data and attendance logic
  const userData = {
    name: "John Doe",
    employeeId: "NIP123456",
    avatarUrl: null, // Replace with actual image URL
    todayAttendance: {
      date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: "08:05",
      checkOut: "17:30"
    }
  };

  // Animation states
  const [checkInActive, setCheckInActive] = useState(false);
  const [checkOutActive, setCheckOutActive] = useState(false);

  // Handle check in function
  const handleCheckIn = () => {
    setCheckInActive(true);
    setTimeout(() => setCheckInActive(false), 300);
    console.log("Check in at:", new Date());
    // Add your check-in logic here
  };

  // Handle check out function
  const handleCheckOut = () => {
    setCheckOutActive(true);
    setTimeout(() => setCheckOutActive(false), 300);
    console.log("Check out at:", new Date());
    // Add your check-out logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      {/* Header with notification and logout */}
      <header className="bg-gradient-to-r from-[#2a3b8f] to-[#3549b1] text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">SIGAP</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-[#3549b1]/70 rounded-full transition-colors duration-200">
            <FaBell className="text-xl" />
          </button>
          <button className="p-2 hover:bg-[#3549b1]/70 rounded-full transition-colors duration-200">
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 flex flex-col gap-5 max-w-md">
        {/* Greeting Card with user info */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center space-x-4">
            {userData.avatarUrl ? (
              <Image 
                src={userData.avatarUrl} 
                alt="User avatar" 
                className="w-16 h-16 rounded-full border-2 border-[#3549b1]" 
              />
            ) : (
              <div className="bg-[#e0e8f9] p-2 rounded-full">
                <FaUserCircle className="w-12 h-12 text-[#3549b1]" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-sm text-gray-600">NIP: {userData.employeeId}</p>
              <p className="text-xs text-[#3549b1] mt-1">{userData.todayAttendance.date}</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center mb-3">
            <FaHistory className="text-[#3549b1] mr-2" />
            <h3 className="text-lg font-bold">Kehadiran Hari Ini</h3>
          </div>
          <div className="border-b border-gray-200 pb-2 mb-3">
            <p className="text-sm text-gray-600">{userData.todayAttendance.date}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-[#f8fafc] p-3 rounded-lg">
              <p className="text-xs text-gray-500">Jam Masuk</p>
              <p className="text-lg font-semibold text-[#3549b1]">{userData.todayAttendance.checkIn || "-"}</p>
            </div>
            <div className="bg-[#f8fafc] p-3 rounded-lg">
              <p className="text-xs text-gray-500">Jam Keluar</p>
              <p className="text-lg font-semibold text-[#3549b1]">{userData.todayAttendance.checkOut || "-"}</p>
            </div>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCheckIn}
            className={`flex flex-col items-center justify-center bg-[#e0e8f9] hover:bg-[#c8d7f5] p-5 rounded-xl shadow transition-all duration-200 ${checkInActive ? 'transform scale-95' : ''}`}
          >
            <FaSignInAlt className="text-[#3549b1] text-3xl mb-2" />
            <span className="font-medium text-[#20264b]">Masuk</span>
          </button>
          
          <button 
            onClick={handleCheckOut}
            className={`flex flex-col items-center justify-center bg-[#e0e8f9] hover:bg-[#c8d7f5] p-5 rounded-xl shadow transition-all duration-200 ${checkOutActive ? 'transform scale-95' : ''}`}
          >
            <FaDoorOpen className="text-[#3549b1] text-3xl mb-2" />
            <span className="font-medium text-[#20264b]">Keluar</span>
          </button>
        </div>

        {/* Monthly Report Button */}
        <button className="mt-2 bg-gradient-to-r from-[#2a3b8f] to-[#3549b1] hover:from-[#243780] hover:to-[#2d3e9d] text-white py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center transform hover:translate-y-[-2px] duration-200">
          <FaClipboardList className="mr-2" />
          Laporan Kehadiran Bulanan
        </button>
      </main>
    </div>
  );
}