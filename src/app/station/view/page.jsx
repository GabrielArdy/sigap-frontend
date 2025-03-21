"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Spin, notification, Button } from "antd";
import { useRouter } from "next/navigation";

const QRCodePage = () => {
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [qrSize, setQrSize] = useState(300); // Increased default size
  const containerRef = useRef(null);
  // Add station information state
  const [stationInfo, setStationInfo] = useState(null);
  const router = useRouter();

  // Function to fetch new QR code data
  const fetchQRCodeData = async () => {
    setLoading(true);
    try {
      if (!stationInfo) {
        throw new Error("No station is activated");
      }

      // This is a dummy implementation
      // Replace with actual API call when ready
      const dummyResponse = {
        success: true,
        data: {
          // Include stationId in the QR data
          qrValue: JSON.stringify({
            token: `attendance-${new Date().getTime()}`,
            stationId: stationInfo.id,
            timestamp: new Date().toISOString()
          }),
          timestamp: new Date().toISOString()
        }
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (dummyResponse.success) {
        setQrCodeValue(dummyResponse.data.qrValue);
        setTimeLeft(300); // Reset timer to 5 minutes
      } else {
        notification.error({
          message: "Error",
          description: "Failed to fetch QR code data"
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to connect to server"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    // Function to fetch station information
    const fetchStationInfo = async () => {
      try {
        // Get station ID from localStorage
        const stationId = localStorage.getItem('sid');
        
        if (!stationId) {
          notification.warning({
            message: "No Station Activated",
            description: "Please activate a station first"
          });
          router.push('/station/activated');
          return;
        }
        
        // Fetch station information using the station ID
        // This is a dummy implementation - replace with actual API call
        // For now using dummy data that simulates fetching the station info
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dummy station data mapping
        const stationData = {
          "ST001": { id: "ST001", name: "Main Entrance", location: "Building A" },
          "ST002": { id: "ST002", name: "Side Entrance", location: "Building B" },
          "ST003": { id: "ST003", name: "Staff Entry", location: "Building C" },
          "ST004": { id: "ST004", name: "VIP Entrance", location: "Main Hall" },
        }[stationId] || null;
        
        if (!stationData) {
          throw new Error("Station information not found");
        }
        
        // Set station info
        setStationInfo(stationData);
      } catch (error) {
        notification.error({
          message: "Error",
          description: error.message || "Failed to fetch station information"
        });
        router.push('/station/activated');
      }
    };

    fetchStationInfo();
  }, [router]);

  // Fetch QR code after station info is loaded
  useEffect(() => {
    if (stationInfo) {
      fetchQRCodeData();
    }
  }, [stationInfo]);

  // Timer countdown effect
  useEffect(() => {
    if (!stationInfo || timeLeft <= 0) {
      if (timeLeft <= 0 && stationInfo) {
        fetchQRCodeData();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stationInfo]);

  // Format time remaining as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update QR size based on container size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = window.innerHeight * 0.5; // Use 50% of viewport height as a guide
        
        // Calculate size using both width and height constraints
        // Use 90% of container width for better visibility
        const widthConstraint = containerWidth * 0.9;
        // Ensure there's enough space for the timer (leaving ~120px)
        const heightConstraint = containerHeight - 120;
        
        // Use the smaller dimension to ensure QR fits
        const newSize = Math.min(350, widthConstraint, heightConstraint);
        setQrSize(newSize);
      }
    };

    // Set initial size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to handle changing the station
  const handleChangeStation = () => {
    router.push('/station/activated');
  };

  if (!stationInfo && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">No Station Activated</h2>
          <p className="text-gray-600 mb-4">Please activate a station first.</p>
          <Button type="primary" onClick={() => router.push('/station/activated')}>
            Activate Station
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between items-center py-1">
      {/* Station information display */}
      {stationInfo && (
        <div className="text-center mb-1">
          <div className="flex items-center justify-center mb-1">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Station ID: {stationInfo.id}
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">{stationInfo.name}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {stationInfo.location} • Attendance Station
          </p>
          <button 
            onClick={handleChangeStation}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Change Station
          </button>
        </div>
      )}

      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col justify-center" ref={containerRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">Loading QR Code...</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-4 px-2">
            {/* QR Code Container with increased size and better centering */}
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-100 flex items-center justify-center">
              <QRCode 
                value={qrCodeValue} 
                size={qrSize} 
                level="H"
                className="shadow-sm" 
              />
            </div>

            {/* Timer Section - now separate from QR for better space management */}
            <div className="w-full bg-blue-50 py-2 sm:py-3 px-3 border-t border-blue-100">
              <div className="flex flex-col items-center">
                <p className="text-blue-700 mb-1 font-medium text-xs">TIME UNTIL REFRESH</p>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 py-1 px-4 bg-white rounded-lg shadow-sm border border-blue-200 tracking-wider">
                  {formatTimeLeft()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        This QR code refreshes every 5 minutes
      </p>
    </div>
  );
};

export default QRCodePage;
