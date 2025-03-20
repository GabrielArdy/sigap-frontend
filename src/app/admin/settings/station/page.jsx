'use client'
import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiTrash2, FiPlusCircle, FiInfo, FiExternalLink } from 'react-icons/fi';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

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
          const marker = L.marker([location.lat, location.lng], {
            title: location.name
          }).addTo(markersLayerRef.current);
          
          // Add popup to marker
          marker.bindPopup(`
            <strong>${location.name}</strong><br>
            Radius: ${location.radius} m
          `);
          
          // Add circle to show radius
          L.circle([location.lat, location.lng], {
            radius: location.radius,
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.2
          }).addTo(markersLayerRef.current);
        });
        
        // If we have locations, center map on first location
        if (locations.length > 0 && mapInstanceRef.current) {
          mapInstanceRef.current.setView([locations[0].lat, locations[0].lng], 12);
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

  // Fetch locations (simulated)
  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockLocations = [
        { 
          id: 1, 
          name: 'Anjungan Utama', 
          lat: -6.2088, 
          lng: 106.8456, 
          radius: 100 
        },
        { 
          id: 2, 
          name: 'Anjungan Timur', 
          lat: -6.2100, 
          lng: 106.8500, 
          radius: 75 
        },
        { 
          id: 3, 
          name: 'Anjungan Barat', 
          lat: -6.2080, 
          lng: 106.8400, 
          radius: 50 
        },
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setLocations(mockLocations);
        setLoading(false);
      }, 800);
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
          const radius = document.getElementById('anjungan-radius').value;
          
          if (!name.trim()) {
            Swal.showValidationMessage('Nama anjungan harus diisi');
            return false;
          }
          
          if (!radius || isNaN(radius) || radius <= 0) {
            Swal.showValidationMessage('Radius harus berupa angka positif');
            return false;
          }
          
          return {
            name: name,
            radius: parseFloat(radius)
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Add new anjungan to list
          const newAnjungan = {
            id: Date.now(), // temporary id for demo
            name: result.value.name,
            lat: clickedLat,
            lng: clickedLng,
            radius: result.value.radius
          };
          
          setLocations([...locations, newAnjungan]);
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

  // Delete anjungan
  const handleDeleteAnjungan = (id) => {
    Swal.fire({
      title: 'Hapus Anjungan?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Filter out the deleted anjungan
        const updatedLocations = locations.filter(loc => loc.id !== id);
        setLocations(updatedLocations);
        
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Data anjungan telah dihapus.',
          showConfirmButton: false,
          timer: 1500
        });
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

      {/* Locations table - same table as before */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Anjungan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi (Latitude, Longitude)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold Radius (m)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && locations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada data anjungan
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer"
                      onClick={() => focusOnAnjungan(location.lat, location.lng)}
                    >
                      <div className="flex items-center">
                        <FiMapPin className="mr-2 text-blue-500" />
                        {location.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.radius} m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteAnjungan(location.id)}
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