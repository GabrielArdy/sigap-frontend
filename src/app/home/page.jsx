'use client'
import Image from 'next/image';
import React from 'react';
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

  // Handle check in function
  const handleCheckIn = () => {
    console.log("Check in at:", new Date());
    // Add your check-in logic here
  };

  // Handle check out function
  const handleCheckOut = () => {
    console.log("Check out at:", new Date());
    // Add your check-out logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header with notification and logout */}
      <header className="bg-[#3549b1] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">SIGAP</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-[#3549b1] rounded-full transition-colors">
            <FaBell className="text-xl" />
          </button>
          <button className="p-2 hover:bg-[#3549b1] rounded-full transition-colors">
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Greeting Card with user info */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center space-x-4">
            {userData.avatarUrl ? (
              <Image 
                src={userData.avatarUrl} 
                alt="User avatar" 
                className="w-16 h-16 rounded-full border-2 border-[#3549b1]" 
              />
            ) : (
              <FaUserCircle className="w-16 h-16 text-gray-400" />
            )}
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-sm text-gray-600">NIP: {userData.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCheckIn}
            className="flex flex-col items-center justify-center bg-[#e0e8f9] hover:bg-[#c8d7f5] p-6 rounded-xl shadow transition-colors"
          >
            <FaSignInAlt className="text-[#3549b1] text-3xl mb-2" />
            <span className="font-medium text-[#20264b]">Masuk</span>
          </button>
          
          <button 
            onClick={handleCheckOut}
            className="flex flex-col items-center justify-center bg-[#e0e8f9] hover:bg-[#c8d7f5] p-6 rounded-xl shadow transition-colors"
          >
            <FaDoorOpen className="text-[#3549b1] text-3xl mb-2" />
            <span className="font-medium text-[#20264b]">Keluar</span>
          </button>
        </div>

        {/* Today's Attendance Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center mb-3">
            <FaHistory className="text-[#3549b1] mr-2" />
            <h3 className="text-lg font-bold">Kehadiran Hari Ini</h3>
          </div>
          <div className="border-b border-gray-200 pb-2 mb-2">
            <p className="text-sm text-gray-600">{userData.todayAttendance.date}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-500">Jam Masuk</p>
              <p className="text-lg font-semibold">{userData.todayAttendance.checkIn || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jam Keluar</p>
              <p className="text-lg font-semibold">{userData.todayAttendance.checkOut || "-"}</p>
            </div>
          </div>
        </div>

        {/* Monthly Report Button */}
        <button className="mt-4 bg-[#3549b1] hover:bg-[#3549b1] text-white py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center">
          <FaClipboardList className="mr-2" />
          Laporan Kehadiran Bulanan
        </button>
      </main>
    </div>
  );
}