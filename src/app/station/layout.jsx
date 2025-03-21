"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function StationLayout({ children }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  // Format date
  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-3 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/app-icon.png" 
                alt="Logo" 
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">SIGAP Attendance Station</h1>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold sm:text-2xl">{formattedTime}</p>
            <p className="text-sm sm:text-base">{formattedDate}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-3 sm:px-6 flex-grow flex overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full overflow-auto">
          {children}
        </div>
      </main>

      {/* Footer - smaller and sticky */}
      <footer className="bg-gray-800 text-white py-1 mt-auto">
        <div className="container mx-auto text-center text-xs">
          <p>&copy; {currentTime.getFullYear()} SIGAP Attendance System</p>
        </div>
      </footer>
    </div>
  );
}
