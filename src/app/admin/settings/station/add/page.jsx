'use client'
import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiArrowLeft, FiSave, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddAnjunganPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    radius: 100,
    lat: null,
    lng: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const router = useRouter();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [mapStylesLoaded, setMapStylesLoaded] = useState(false);
  
  // Initial map center (Indonesia)
  const center = {
    lat: -2.5489, 
    lng: 118.0149
  };
  
  // Initialize Leaflet map
  useEffect(() => {
    // Import Leaflet dynamically to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet-control-geocoder')
    ]).then(([L, LeafletControlGeocoder]) => {
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
        const map = L.map(mapRef.current, {
          zoomControl: false // Remove default zoom control to reposition it
        }).setView([center.lat, center.lng], 5);
        
        // Reposition zoom control to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Handle map click events
        map.on('click', (e) => {
          handleMapClick(e, L);
        });
        
        // Store map instance in ref
        mapInstanceRef.current = map;

        // Store the geocoder for external use
        window.geocoder = L.Control.Geocoder.nominatim({
          geocodingQueryParams: { 
            countrycodes: 'id', // Prioritize Indonesia
            limit: 5
          }
        });

        // Enable free drag and zoom
        map.scrollWheelZoom.enable();
        map.dragging.enable();
        map.keyboard.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.tap && map.tap.enable();
      }
    }).catch(error => {
      console.error("Error loading map libraries:", error);
    });
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Handle map click to set location
  const handleMapClick = (event, L) => {
    const clickedLat = event.latlng.lat;
    const clickedLng = event.latlng.lng;
    
    setFormData({
      ...formData,
      lat: clickedLat,
      lng: clickedLng
    });
    
    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([clickedLat, clickedLng]);
    } else {
      markerRef.current = L.marker([clickedLat, clickedLng]).addTo(mapInstanceRef.current);
    }
    
    // Update or create radius circle
    if (circleRef.current) {
      circleRef.current.setLatLng([clickedLat, clickedLng]);
    } else {
      circleRef.current = L.circle([clickedLat, clickedLng], {
        radius: formData.radius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.2
      }).addTo(mapInstanceRef.current);
    }
    
    // Zoom to location
    mapInstanceRef.current.setView([clickedLat, clickedLng], 15);
  };
  
  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current && formData.lat && formData.lng) {
      circleRef.current.setRadius(formData.radius);
    }
  }, [formData.radius]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'radius' ? parseInt(value) || 0 : value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Nama anjungan harus diisi'
      });
      return;
    }
    
    if (!formData.lat || !formData.lng) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Silakan pilih lokasi pada peta'
      });
      return;
    }
    
    if (!formData.radius || formData.radius <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Radius harus berupa angka positif'
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to save data
    setTimeout(() => {
      // In a real app, you would make an API call here
      console.log('Saving anjungan:', formData);
      
      setLoading(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Anjungan baru berhasil ditambahkan',
        showConfirmButton: true,
      }).then(() => {
        router.push('/admin/settings/station');
      });
    }, 800);
  };

  // Handle search box input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !window.geocoder) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      window.geocoder.geocode(searchQuery, (results) => {
        setIsSearching(false);
        setSearchResults(results);
      });
    } catch (error) {
      console.error("Search error:", error);
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSelectLocation = (result) => {
    if (!mapInstanceRef.current) return;
    
    const L = window.L; // Access Leaflet from the window object
    const center = result.center;
    
    setFormData({
      ...formData,
      lat: center.lat,
      lng: center.lng,
    });

    // Update marker and circle
    if (markerRef.current) {
      markerRef.current.setLatLng(center);
    } else if (L) {
      markerRef.current = L.marker(center).addTo(mapInstanceRef.current);
    }

    if (circleRef.current) {
      circleRef.current.setLatLng(center);
    } else if (L) {
      circleRef.current = L.circle(center, {
        radius: formData.radius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
      }).addTo(mapInstanceRef.current);
    }

    // Zoom to location
    mapInstanceRef.current.setView(center, 15);
    
    // Clear search results
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/settings/station"
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Anjungan Baru</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan lokasi anjungan absensi dan konfigurasi radiusnya
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiInfo className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Klik pada peta untuk menentukan lokasi anjungan baru atau isi koordinat secara manual.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-8">
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-800 mb-2">
                Nama Anjungan
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 text-gray-700 text-base border border-gray-300 rounded-md shadow"
                  placeholder="Masukkan nama anjungan"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">Nama lokasi yang mudah diingat</p>
            </div>
            
            <div>
              <label htmlFor="radius" className="block text-base font-medium text-gray-800 mb-2">
                Radius (meter)
              </label>
              <div className="relative rounded-md">
                <input
                  type="number"
                  name="radius"
                  id="radius"
                  value={formData.radius}
                  onChange={handleInputChange}
                  min="1"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-16 py-3 text-gray-700 text-base border border-gray-300 rounded-md shadow"
                  placeholder="100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-base">meter</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Jarak maksimal untuk melakukan presensi</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 mt-2">
              <div>
                <label htmlFor="lat" className="block text-base font-medium text-gray-800 mb-2">
                  Latitude
                </label>
                <div className="relative rounded-md">
                  <input
                    type="text"
                    name="lat"
                    id="lat"
                    value={formData.lat !== null ? formData.lat.toFixed(6) : ''}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 px-3 text-gray-700 text-base border border-gray-300 rounded-md bg-gray-50 font-mono shadow"
                    placeholder="Latitude"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lng" className="block text-base font-medium text-gray-800 mb-2">
                  Longitude
                </label>
                <div className="relative rounded-md">
                  <input
                    type="text"
                    name="lng"
                    id="lng"
                    value={formData.lng !== null ? formData.lng.toFixed(6) : ''}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 px-3 text-gray-700 text-base border border-gray-300 rounded-md bg-gray-50 font-mono shadow"
                    placeholder="Longitude"
                    readOnly
                  />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 text-center mt-1">Koordinat akan terisi otomatis saat menentukan lokasi pada peta</p>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-5 w-5" />
                    Simpan Anjungan
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Petunjuk Penggunaan</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Klik pada peta untuk menentukan lokasi anjungan</li>
              <li>Radius menentukan jangkauan absensi di sekitar anjungan</li>
              <li>Nama anjungan akan ditampilkan pada aplikasi absensi</li>
            </ul>
          </div>
        </div>
        
        {/* Map */}
        <div className="lg:col-span-3">
          {/* Search box above map */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Cari lokasi atau alamat..."
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 text-gray-700 text-base border border-gray-300 rounded-md shadow"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md text-base font-medium shadow-sm transition duration-150 ease-in-out"
              >
                Cari
              </button>
            </form>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((result, index) => (
                    <li key={index} className="cursor-pointer hover:bg-gray-50">
                      <button
                        onClick={() => handleSelectLocation(result)}
                        className="w-full text-left px-4 py-3"
                      >
                        <div className="font-medium text-gray-800">{result.name}</div>
                        {result.html && (
                          <div 
                            className="text-sm text-gray-600 mt-1"
                            dangerouslySetInnerHTML={{ __html: result.html }}
                          />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Map container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-[550px] relative">
              {!mapInstanceRef.current && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-3 text-gray-600">Memuat peta...</p>
                  </div>
                </div>
              )}
              <div id="add-map" ref={mapRef} className="w-full h-full" />
            </div>
          </div>
          
          {/* Help text about search */}
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Gunakan kotak pencarian di atas peta untuk mencari alamat atau lokasi. Klik pada hasil pencarian untuk menetapkan lokasi anjungan.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiMapPin className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Pastikan lokasi yang dipilih sudah tepat. Setelah anjungan dibuat, lokasi hanya dapat diubah oleh admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
