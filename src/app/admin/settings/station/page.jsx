'use client'
import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiTrash2, FiPlusCircle, FiInfo, FiExternalLink, FiWifi, FiWifiOff } from 'react-icons/fi';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import StationService from '@/app/api/station_service';

export default function AnjunganPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnjunganMode, setNewAnjunganMode] = useState(false);
  const [newLocation, setNewLocation] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  
  // Initial map center (Indonesia)
  const center = {
    lat: -2.5489, 
    lng: 118.0149
  };
  
  const [mapCenter, setMapCenter] = useState(center);

  // Initialize Leaflet map
  useEffect(() => {
    // Import Leaflet dynamically to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix Leaflet default icon issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      
      // Initialize map if not already initialized
      if (!mapInstanceRef.current && mapRef.current) {
        // Create map instance
        const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], 5);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Create a layer for markers
        markersLayerRef.current = L.layerGroup().addTo(map);
        
        // Handle map click events for adding new anjungan
        map.on('click', (e) => {
          if (newAnjunganMode) {
            handleMapClick(e, L);
          }
        });
        
        // Store map instance in ref
        mapInstanceRef.current = map;
        
        // Fetch locations after map is loaded
        fetchLocations();
      }
    });
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update markers when locations change
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current && locations.length > 0) {
      import('leaflet').then((L) => {
        // Clear existing markers
        markersLayerRef.current.clearLayers();
        
        // Add markers for all locations
        locations.forEach(location => {
          // Create marker
          const marker = L.marker([location.stationLocation.latitude, location.stationLocation.longitude], {
            title: location.stationName
          }).addTo(markersLayerRef.current);
          
          // Add popup to marker
          marker.bindPopup(`
            <strong>${location.stationName}</strong><br>
            ID: ${location.stationId}<br>
            Radius: ${location.radiusThreshold} m<br>
            Status: ${location.stationStatus}
          `);
          
          // Add circle to show radius
          L.circle([location.stationLocation.latitude, location.stationLocation.longitude], {
            radius: location.radiusThreshold,
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.2
          }).addTo(markersLayerRef.current);
        });
        
        // If we have locations, center map on first location
        if (locations.length > 0 && mapInstanceRef.current) {
          mapInstanceRef.current.setView([
            locations[0].stationLocation.latitude, 
            locations[0].stationLocation.longitude
          ], 12);
        }
      });
    }
  }, [locations]);
  
  // Update new location marker
  useEffect(() => {
    if (mapInstanceRef.current && newLocation) {
      import('leaflet').then((L) => {
        // Remove existing temporary marker if exists
        if (mapInstanceRef.current._newMarker) {
          mapInstanceRef.current._newMarker.remove();
        }
        
        // Add temporary marker
        const tempMarker = L.marker([newLocation.lat, newLocation.lng], {
          title: 'New Location',
          bounceOnAdd: true
        }).addTo(mapInstanceRef.current);
        
        // Store reference to new marker
        mapInstanceRef.current._newMarker = tempMarker;
      });
    }
  }, [newLocation]);

  // Fetch locations from API
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await StationService.getAll();
      if (response && response.status === "success") {
        setLocations(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch stations");
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Terjadi kesalahan saat memuat data anjungan',
      });
    }
  };

  // Handle map click for adding new anjungan
  const handleMapClick = (event, L) => {
    if (newAnjunganMode) {
      const clickedLat = event.latlng.lat;
      const clickedLng = event.latlng.lng;
      
      setNewLocation({
        lat: clickedLat,
        lng: clickedLng,
      });
      
      // Prompt for new anjungan details
      Swal.fire({
        title: 'Tambah Anjungan Baru',
        html: `
          <div class="mb-3">
            <label class="block text-left text-sm font-medium text-gray-700 mb-1">Nama Anjungan</label>
            <input id="anjungan-name" class="swal2-input" placeholder="Nama Anjungan">
          </div>
          <div class="mb-3">
            <label class="block text-left text-sm font-medium text-gray-700 mb-1">ID Anjungan</label>
            <input id="anjungan-id" class="swal2-input" placeholder="STA-001-XXX">
          </div>
          <div class="mb-3">
            <label class="block text-left text-sm font-medium text-gray-700 mb-1">Koordinat</label>
            <input id="anjungan-coords" class="swal2-input" value="${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)}" disabled>
          </div>
          <div>
            <label class="block text-left text-sm font-medium text-gray-700 mb-1">Radius (meter)</label>
            <input id="anjungan-radius" class="swal2-input" type="number" placeholder="Radius dalam meter" value="100">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = document.getElementById('anjungan-name').value;
          const stationId = document.getElementById('anjungan-id').value;
          const radius = document.getElementById('anjungan-radius').value;
          
          if (!name.trim()) {
            Swal.showValidationMessage('Nama anjungan harus diisi');
            return false;
          }
          
          if (!stationId.trim()) {
            Swal.showValidationMessage('ID anjungan harus diisi');
            return false;
          }
          
          if (!radius || isNaN(radius) || radius <= 0) {
            Swal.showValidationMessage('Radius harus berupa angka positif');
            return false;
          }
          
          return {
            name: name,
            stationId: stationId,
            radius: parseFloat(radius)
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          addNewAnjungan({
            stationId: result.value.stationId,
            stationName: result.value.name,
            stationLocation: {
              latitude: clickedLat,
              longitude: clickedLng
            },
            radiusThreshold: result.value.radius,
            stationStatus: "offline"
          });
        } else {
          // Cancelled
          setNewLocation(null);
          
          // Remove temporary marker
          if (mapInstanceRef.current && mapInstanceRef.current._newMarker) {
            mapInstanceRef.current._newMarker.remove();
            mapInstanceRef.current._newMarker = null;
          }
        }
      });
    }
  };

  // Add new anjungan
  const addNewAnjungan = async (newStationData) => {
    try {
      const response = await StationService.addNewStation(newStationData);
      
      if (response && response.status === "success") {
        // Add the new station to the list
        setLocations([...locations, response.data]);
        setNewAnjunganMode(false);
        setNewLocation(null);
        
        // Remove temporary marker
        if (mapInstanceRef.current && mapInstanceRef.current._newMarker) {
          mapInstanceRef.current._newMarker.remove();
          mapInstanceRef.current._newMarker = null;
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Anjungan baru berhasil ditambahkan',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        throw new Error(response.message || "Failed to add station");
      }
    } catch (error) {
      console.error('Error adding station:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambahkan anjungan',
        text: error.message || 'Terjadi kesalahan saat menambahkan anjungan baru',
      });
    }
  };

  // Delete anjungan
  const handleDeleteAnjungan = async (id) => {
    console.log('Deleting station with ID:', id); // Debug the ID being passed
    
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'ID Tidak Valid',
        text: 'ID anjungan tidak ditemukan',
      });
      return;
    }
    
    Swal.fire({
      title: 'Hapus Anjungan?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call API to delete station
          const response = await StationService.deleteStation(id);
          
          if (response && response.status === "success") {
            // Filter out the deleted anjungan using stationId instead of _id
            const updatedLocations = locations.filter(loc => loc.stationId !== id);
            setLocations(updatedLocations);
            
            Swal.fire({
              icon: 'success',
              title: 'Terhapus!',
              text: 'Data anjungan telah dihapus.',
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            throw new Error(response.message || "Failed to delete station");
          }
        } catch (error) {
          console.error('Error deleting station:', error);
          
          Swal.fire({
            icon: 'error',
            title: 'Gagal menghapus anjungan',
            text: error.message || 'Terjadi kesalahan saat menghapus anjungan',
          });
        }
      }
    });
  };

  // Focus on a specific anjungan when clicked in the table
  const focusOnAnjungan = (lat, lng) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 17);
    }
  };

  // Toggle add new anjungan mode
  const toggleNewAnjunganMode = () => {
    setNewAnjunganMode(!newAnjunganMode);
    setNewLocation(null);
    
    // Remove temporary marker if exists
    if (mapInstanceRef.current && mapInstanceRef.current._newMarker) {
      mapInstanceRef.current._newMarker.remove();
      mapInstanceRef.current._newMarker = null;
    }
    
    if (!newAnjunganMode) {
      Swal.fire({
        icon: 'info',
        title: 'Mode Tambah Anjungan',
        text: 'Klik pada peta untuk menentukan lokasi anjungan baru',
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anjungan Absensi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola lokasi anjungan absensi dan radius deteksi kehadiran
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={toggleNewAnjunganMode}
            className={`inline-flex items-center px-4 py-2 border rounded-md font-semibold text-xs uppercase tracking-widest focus:outline-none transition ease-in-out duration-150 ${
              newAnjunganMode
                ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FiPlusCircle className="mr-2" />
            {newAnjunganMode ? 'Batal' : 'Tambah Anjungan'}
          </button>
          <Link href="/admin/settings/station/add" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md font-semibold text-xs uppercase tracking-widest bg-white text-blue-600 hover:bg-blue-50 focus:outline-none transition ease-in-out duration-150">
            <FiExternalLink className="mr-2" />
            Tambah di Halaman Baru
          </Link>
        </div>
      </div>

      {/* Info banner when in add mode */}
      {newAnjunganMode && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Mode tambah anjungan aktif. Klik pada peta untuk menentukan lokasi anjungan baru.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-[400px] relative">
          {loading && !mapInstanceRef.current && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-3 text-gray-600">Memuat peta...</p>
              </div>
            </div>
          )}
          <div id="map" ref={mapRef} className="w-full h-full" />
        </div>
      </div>

      {/* Locations table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID/Nama Anjungan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi (Latitude, Longitude)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold Radius (m)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && locations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada data anjungan
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location._id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer"
                      onClick={() => focusOnAnjungan(location.stationLocation.latitude, location.stationLocation.longitude)}
                    >
                      <div className="flex items-center">
                        <FiMapPin className="mr-2 text-blue-500" />
                        <div>
                          <div>{location.stationName}</div>
                          <div className="text-xs text-gray-500">{location.stationId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.stationLocation.latitude.toFixed(6)}, {location.stationLocation.longitude.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.radiusThreshold} m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {location.stationStatus === 'active' ? (
                          <>
                            <FiWifi className="h-4 w-4 text-green-500 mr-1.5" />
                            <span className="text-sm text-green-600 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <FiWifiOff className="h-4 w-4 text-red-500 mr-1.5" />
                            <span className="text-sm text-red-600 font-medium">Offline</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          console.log('Location data:', location); // Debug the location object
                          handleDeleteAnjungan(location.stationId);
                        }}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        <FiTrash2 className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}