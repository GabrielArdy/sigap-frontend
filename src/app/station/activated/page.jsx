"use client";

import React, { useState, useEffect } from "react";
import { Select, Button, Card, notification, Spin } from "antd";
import { useRouter } from "next/navigation";

const StationActivation = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if there's already an activated station
  useEffect(() => {
    const currentStationId = localStorage.getItem('sid');
    if (currentStationId) {
      notification.info({
        message: "Station Already Activated",
        description: `There is already an activated station (ID: ${currentStationId}). You can still select a different one.`,
      });
    }

    // Fetch stations data
    fetchStations();
  }, []);

  // Function to fetch stations
  const fetchStations = async () => {
    setLoading(true);
    try {
      // This is a dummy implementation - replace with actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dummyStations = [
        { id: "ST001", name: "Main Entrance", location: "Building A" },
        { id: "ST002", name: "Side Entrance", location: "Building B" },
        { id: "ST003", name: "Staff Entry", location: "Building C" },
        { id: "ST004", name: "VIP Entrance", location: "Main Hall" },
      ];
      
      setStations(dummyStations);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch stations data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle station selection
  const handleStationChange = (value) => {
    const selected = stations.find(station => station.id === value);
    setSelectedStation(selected);
  };

  // Handle station activation
  const activateStation = () => {
    if (!selectedStation) {
      notification.warning({
        message: "Selection Required",
        description: "Please select a station first",
      });
      return;
    }

    try {
      // Save station ID to localStorage
      localStorage.setItem('sid', selectedStation.id);
      
      notification.success({
        message: "Station Activated",
        description: `Station "${selectedStation.name}" has been activated successfully!`,
      });

      // Navigate to the station view page after a short delay
      setTimeout(() => {
        router.push('/station/view');
      }, 1000);
    } catch (error) {
      notification.error({
        message: "Activation Failed",
        description: "Could not activate the station. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-3 overflow-hidden">
      <Card 
        title="Station Activation" 
        className="w-full max-w-md shadow-md overflow-auto"
        bodyStyle={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}
        headStyle={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}
        extra={<div className="text-xs text-blue-500">SIGAP Attendance</div>}
      >
        {loading ? (
          <div className="flex flex-col items-center py-6">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">Loading stations...</div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-gray-600 mb-3">
                Select the attendance station you want to activate. This device will display QR codes for that station.
              </p>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Station
                </label>
                <Select
                  placeholder="Choose a station"
                  style={{ width: '100%' }}
                  onChange={handleStationChange}
                  options={stations.map(station => ({
                    value: station.id,
                    label: `${station.name} (${station.location})`,
                  }))}
                />
              </div>
              
              {selectedStation && (
                <div className="p-3 bg-blue-50 rounded-md mb-3">
                  <p className="font-medium text-blue-700">Selected Station:</p>
                  <p className="text-sm">ID: {selectedStation.id}</p>
                  <p className="text-sm">Name: {selectedStation.name}</p>
                  <p className="text-sm">Location: {selectedStation.location}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="primary" 
                size="large"
                onClick={activateStation}
                disabled={!selectedStation}
                className={!selectedStation ? "opacity-50" : ""}
              >
                Activate Station
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default StationActivation;
