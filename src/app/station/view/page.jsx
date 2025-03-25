"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StationService from "../../api/station_service";
import Image from "next/image";

const QRCodePage = () => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [qrSize, setQrSize] = useState(300);
  const containerRef = useRef(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [errorState, setErrorState] = useState(false);
  const [retryTimer, setRetryTimer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);
  const router = useRouter();

  // Custom notification function to replace antd notifications
  const showNotification = (type, title, message) => {
    const id = notificationIdRef.current++;
    const newNotification = {
      id,
      type,
      title,
      message,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

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
      showNotification("error", "Error", error.message || "Failed to fetch station information");
      return null;
    }
  };

  // Function to setup retry mechanism
  const setupRetryTimer = () => {
    clearTimeout(retryTimer);
    const timer = setTimeout(() => {
      fetchQRCodeData();
    }, 3000); // Retry every 3 seconds instead of 60 seconds
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
      showNotification("error", "Error", error.message || "Failed to connect to server");
      
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
      showNotification("warning", "No Station Activated", "Please activate a station first");
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
        // Calculate available height for QR code based on viewport
        const viewportHeight = window.innerHeight;
        // Reduce the height allocation to fit everything without scrolling
        const availableHeight = viewportHeight * 0.55; // Reduced from 0.65
        
        const widthConstraint = containerWidth * 0.85; // Reduced from 0.9
        // Adjust height constraint to avoid overflow
        const heightConstraint = availableHeight - 100; // Increased padding from 80 to 100
        
        // Make QR code smaller - reduced max size from 550 to 450
        const newSize = Math.min(450, widthConstraint, heightConstraint);
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
  const handleChangeStation = async () => {
    try {
      if (stationInfo) {
        setLoading(true);
        // Call backend to update station status to offline
        const response = await StationService.updateStatusStation(stationInfo.stationId, "offline");
        
        if (response.status === "success") {
          localStorage.removeItem('sid');
          showNotification("success", "Station Status Updated", "Station has been set to offline");
        } else {
          throw new Error(response.message || "Failed to update station status");
        }
      }
    } catch (error) {
      showNotification("error", "Error", error.message || "Failed to update station status");
    } finally {
      setLoading(false);
      // Navigate to station activation page regardless of success/failure
      // to allow user to activate a different station
      router.push('/station/activated');
    }
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
          <button 
            onClick={() => router.push('/station/activated')}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Activate Station
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen justify-between items-center py-1 overflow-hidden">
      {/* Custom Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-3 rounded-lg shadow-md max-w-xs animate-fade-in ${
              notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' : 
              notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 
              notification.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' : 
              'bg-blue-50 border-l-4 border-blue-500'
            }`}
          >
            <h4 className={`font-medium ${
              notification.type === 'error' ? 'text-red-800' : 
              notification.type === 'success' ? 'text-green-800' : 
              notification.type === 'warning' ? 'text-yellow-800' : 
              'text-blue-800'
            }`}>
              {notification.title}
            </h4>
            <p className="text-sm text-black">{notification.message}</p>
          </div>
        ))}
      </div>

      {/* Station information display */}
      {stationInfo && (
        <div className="text-center mb-1 flex-shrink-0">
          <div className="flex items-center justify-center mb-1">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Station ID: {stationInfo.stationId}
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">{stationInfo.stationName}</h1>
          <p className="text-xs sm:text-sm text-black font-medium">
            Status: {stationInfo.stationStatus}
          </p>
          <button 
            onClick={handleChangeStation}
            className="text-xs text-blue-600 hover:underline mt-1 font-medium"
          >
            Change Station
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg flex flex-col justify-center items-center my-1 overflow-hidden" ref={containerRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            {/* Custom spinner using Tailwind */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div className="mt-4 text-black font-medium">Loading QR Code...</div>
          </div>
        ) : errorState ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-red-600 mb-2">Failed to load QR Code</h3>
            <p className="text-black mb-4">The system will automatically try again in a few seconds.</p>
            <div className="text-lg font-medium text-blue-600">
              Connecting to server...
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-2 px-2">
            {/* QR Code display using the base64 image from API */}
            <div className="mb-2 p-2 bg-white rounded-lg border-2 border-blue-100 flex items-center justify-center">
              {qrCodeData && (
                <img
                  src={qrCodeData.qrCode}
                  alt="QR Code"
                  width={qrSize}
                  height={qrSize}
                  className="max-w-full max-h-full"
                />
              )}
            </div>

            {/* Timer Section - now separate from QR for better space management */}
            <div className="w-full bg-blue-50 py-2 px-3 border-t border-blue-100">
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
      
      <p className="text-xs text-black font-medium mt-1 flex-shrink-0">
        {errorState ? "Automatic reconnection in progress..." : "This QR code refreshes every 5 minutes"}
      </p>
    </div>
  );
};

export default QRCodePage;
