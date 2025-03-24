"use client";

import React, { useState, useEffect, useRef } from "react";
import { Spin, notification, Button, Image } from "antd";
import { useRouter } from "next/navigation";
import StationService from "../../api/station_service";

const QRCodePage = () => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [qrSize, setQrSize] = useState(300);
  const containerRef = useRef(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [errorState, setErrorState] = useState(false);
  const [retryTimer, setRetryTimer] = useState(null);
  const router = useRouter();

  // Function to fetch station information
  const fetchStationInfo = async (stationId) => {
    try {
      const response = await StationService.getAll();
      
      if (response.status === "success") {
        const station = response.data.find(s => s.stationId === stationId);
        if (station) {
          setStationInfo(station);
          return station;
        } else {
          throw new Error("Station not found");
        }
      } else {
        throw new Error(response.message || "Failed to fetch station information");
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to fetch station information"
      });
      return null;
    }
  };

  // Function to setup retry mechanism
  const setupRetryTimer = () => {
    clearTimeout(retryTimer);
    const timer = setTimeout(() => {
      fetchQRCodeData();
    }, 60000); // Retry after 1 minute
    setRetryTimer(timer);
    return timer;
  };

  // Function to fetch new QR code data
  const fetchQRCodeData = async () => {
    setLoading(true);
    try {
      const stationId = localStorage.getItem('sid');
      
      if (!stationId) {
        throw new Error("No station is activated");
      }

      // Fetch QR code from API
      const response = await StationService.fetchQRCode({ stationId });
      
      // Check if response is successful
      if (response.success) {
        setErrorState(false);
        setQrCodeData(response.data);
        setTimeLeft(response.data.expiresIn || 300);
        
        // If we don't have station info yet, fetch it
        if (!stationInfo) {
          await fetchStationInfo(stationId);
        }
        
        // Clear any existing retry timer
        clearTimeout(retryTimer);
      } else {
        throw new Error(response.message || "Failed to fetch QR code data");
      }
    } catch (error) {
      setErrorState(true);
      notification.error({
        message: "Error",
        description: error.message || "Failed to connect to server"
      });
      
      // Setup retry timer
      setupRetryTimer();
    } finally {
      setLoading(false);
    }
  };

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  // Initial fetch when component mounts
  useEffect(() => {
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

    // First fetch station info, then QR code
    const initializeData = async () => {
      const station = await fetchStationInfo(stationId);
      if (station) {
        fetchQRCodeData();
      } else {
        router.push('/station/activated');
      }
    };
    
    initializeData();
  }, [router]);

  // Timer countdown effect
  useEffect(() => {
    if (!stationInfo || timeLeft <= 0 || errorState) {
      if (timeLeft <= 0 && stationInfo && !errorState) {
        fetchQRCodeData();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stationInfo, errorState]);

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

  // Function to manually retry fetching QR code
  const handleRetry = () => {
    fetchQRCodeData();
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
              Station ID: {stationInfo.stationId}
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">{stationInfo.stationName}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Status: {stationInfo.stationStatus}
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
        ) : errorState ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-red-600 mb-2">Failed to load QR Code</h3>
            <p className="text-gray-600 mb-6">The system will automatically try again in 1 minute.</p>
            <div className="text-lg font-medium text-blue-600">
              Connecting to server...
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-4 px-2">
            {/* QR Code display using the base64 image from API */}
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-100 flex items-center justify-center">
              {qrCodeData && (
                <Image
                  src={qrCodeData.qrCode}
                  alt="QR Code"
                  width={qrSize}
                  height={qrSize}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                  preview={false}
                />
              )}
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
        {errorState ? "Automatic reconnection in progress..." : "This QR code refreshes every 5 minutes"}
      </p>
    </div>
  );
};

export default QRCodePage;
