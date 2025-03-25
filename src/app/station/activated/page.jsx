"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StationService from "../../api/station_service";

const StationActivation = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Check if there's already an activated station
  useEffect(() => {
    const currentStationId = localStorage.getItem('sid');
    if (currentStationId) {
      showNotification("info", "Station Already Activated", 
        `There is already an activated station (ID: ${currentStationId}). You can still select a different one.`);
    }

    // Fetch stations data
    fetchStations();
  }, []);

  // Function to fetch stations
  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await StationService.getAll();
      
      if (response.status === "success") {
        setStations(response.data);
      } else {
        showNotification("error", "Error", response.message || "Failed to fetch stations data");
      }
    } catch (error) {
      showNotification("error", "Error", "Failed to fetch stations data");
    } finally {
      setLoading(false);
    }
  };

  // Handle station selection
  const handleStationChange = (e) => {
    const stationId = e.target.value;
    const selected = stations.find(station => station.stationId === stationId);
    setSelectedStation(selected);
  };

  // Handle station activation
  const activateStation = async () => {
    if (!selectedStation) {
      showNotification("warning", "Selection Required", "Please select a station first");
      return;
    }

    try {
      // First check the station status
      const statusResponse = await StationService.getStationStatus(selectedStation.stationId);
      
      if (statusResponse.status === "success" && 
          statusResponse.data && 
          statusResponse.data.stationStatus === "active") {
        showNotification("warning", "Station Already Active", 
          `Station "${selectedStation.stationName}" is already active. Please select a different station.`);
        return;
      }
      
      // Proceed with activation if station is not already active
      // Save station ID to localStorage
      localStorage.setItem('sid', selectedStation.stationId);
      
      // Update station status to active (assuming StationService has an updateStatus method)
      await StationService.updateStatus(selectedStation.stationId, "active");
      
      showNotification("success", "Station Activated", 
        `Station "${selectedStation.stationName}" has been activated successfully!`);

      // Navigate to the station view page after a short delay
      setTimeout(() => {
        router.push('/station/view');
      }, 1000);
    } catch (error) {
      showNotification("error", "Activation Failed", "Could not activate the station. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-3 overflow-hidden">
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

      {/* Card component using Tailwind */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md">
        {/* Card Header */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Station Activation</h2>
          <div className="text-xs text-blue-500 font-medium">SIGAP Attendance</div>
        </div>
        
        {/* Card Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center py-6">
              {/* Custom spinner using Tailwind */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <div className="mt-4 text-black font-medium">Loading stations...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-black mb-2">
                  Select the attendance station you want to activate. This device will display QR codes for that station.
                </p>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-black mb-1">
                    Select Station
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    onChange={handleStationChange}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-gray-700">Choose a station</option>
                    {stations.map(station => (
                      <option key={station.stationId} value={station.stationId} className="text-gray-700">
                        {station.stationName} ({station.stationStatus})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedStation && (
                  <div className="p-3 bg-blue-50 rounded-md mb-3">
                    <p className="font-medium text-blue-700">Selected Station:</p>
                    <p className="text-sm text-black">ID: {selectedStation.stationId}</p>
                    <p className="text-sm text-black">Name: {selectedStation.stationName}</p>
                    <p className="text-sm text-black">Status: {selectedStation.stationStatus}</p>
                    <p className="text-sm text-black">Coordinates: {selectedStation.stationLocation.latitude}, {selectedStation.stationLocation.longitude}</p>
                    <p className="text-sm text-black">Radius: {selectedStation.radiusThreshold}m</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={activateStation}
                  disabled={!selectedStation}
                  className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${
                    !selectedStation 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Activate Station
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationActivation;
