'use client'
import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiArrowLeft, FiSave, FiInfo } from 'react-icons/fi';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StationService from '@/app/api/station_service';

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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [geocoderError, setGeocoderError] = useState(null);
  
  const router = useRouter();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [mapStylesLoaded, setMapStylesLoaded] = useState(false);
  const geocoderRef = useRef(null);
  
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

        // Store the Leaflet instance globally for access in event handlers
        window.L = L;
        
        // Create and store geocoder for external use
        try {
          // Fix: Use L.Control.Geocoder.nominatim() instead of trying to use it as a constructor
          geocoderRef.current = L.Control.Geocoder.nominatim({
            geocodingQueryParams: { 
              countrycodes: 'id', // Prioritize Indonesia
              limit: 10,
              format: 'json',
              addressdetails: 1
            }
          });
          console.log("Geocoder initialized:", geocoderRef.current);
        } catch (error) {
          console.error("Failed to initialize geocoder:", error);
          setGeocoderError("Gagal mengaktifkan pencarian lokasi");
        }

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
      setGeocoderError("Gagal memuat pustaka peta");
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
  const handleSubmit = async (e) => {
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
    
    // Generate a simple station ID (in real app, this might be generated by the backend)
    const stationPrefix = 'STA';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const nameAbbr = formData.name.slice(0, 2).toUpperCase();
    const stationId = `${stationPrefix}-${randomId}-${nameAbbr}`;
    
    // Format data for API request
    const stationData = {
      stationId: stationId,
      stationName: formData.name,
      stationLocation: {
        latitude: formData.lat,
        longitude: formData.lng
      },
      radiusThreshold: formData.radius,
      stationStatus: "offline",
      lastActive: new Date().toISOString() // Current time as lastActive
    };
    
    try {
      // Call the API to add new station
      const response = await StationService.addNewStation(stationData);
      
      if (response.error) {
        throw new Error(response.error || 'Gagal menambahkan anjungan');
      }
      
      setLoading(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Anjungan baru berhasil ditambahkan',
        showConfirmButton: true,
      }).then(() => {
        router.push('/admin/settings/station');
      });
    } catch (error) {
      setLoading(false);
      console.error('Error adding station:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message || 'Terjadi kesalahan saat menambahkan anjungan',
      });
    }
  };

  // Handle search box input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.trim().length >= 3) {
        performSearch(value);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce delay - more responsive like Google Maps
  };
  
  // Perform the search - modify to default to direct API call which is more reliable
  const performSearch = (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setGeocoderError(null);
    
    // Use direct API call which is more reliable
    fetchNominatimResults(query);
  };
  
  // Fetch results directly from Nominatim API
  const fetchNominatimResults = async (query) => {
    try {
      setIsSearching(true);
      
      // Use fetch to get data directly from Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=id&limit=10`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SIGAP Attendance System (https://example.com)'  // Add a proper User-Agent to avoid request rejection
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Direct API results:", data);
      
      // Convert Nominatim API results to the format expected by our component
      const results = data.map(item => ({
        name: item.display_name.split(',')[0],
        html: item.display_name,
        center: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
        properties: {
          address: item.address
        }
      }));
      
      processSearchResults(results);
    } catch (error) {
      console.error("Nominatim API error:", error);
      setIsSearching(false);
      setGeocoderError("Gagal melakukan pencarian. Silakan coba lagi.");
      setSearchResults([]);
    }
  };
  
  // Process search results
  const processSearchResults = (results) => {
    setIsSearching(false);
    
    if (results && results.length > 0) {
      console.log("Search results:", results);
      // Format and process results for better display
      const processedResults = results.map(result => {
        // Extract city, region, country from the result if possible
        let details = {
          name: result.name || '',
          address: '',
          city: '',
          region: '',
          country: '',
          lat: result.center.lat,
          lng: result.center.lng
        };
        
        // Try to extract structured address info if available
        if (result.properties && result.properties.address) {
          const addr = result.properties.address;
          details.city = addr.city || addr.town || addr.village || '';
          details.region = addr.state || addr.county || '';
          details.country = addr.country || '';
          
          // Build formatted address
          let addressParts = [];
          if (addr.road) addressParts.push(addr.road);
          if (addr.suburb) addressParts.push(addr.suburb);
          if (details.city) addressParts.push(details.city);
          if (details.region) addressParts.push(details.region);
          if (details.country) addressParts.push(details.country);
          
          details.address = addressParts.join(', ');
        } else if (result.html) {
          // Extract from HTML if structured data not available
          details.address = result.html.replace(/<[^>]*>/g, ', ')
            .replace(/^[,\s]+|[,\s]+$/g, '')
            .replace(/,\s*,/g, ',');
        }
        
        return {
          ...result,
          details
        };
      });
      
      setSearchResults(processedResults);
    } else {
      setSearchResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle search result selection
  const handleSelectLocation = (result) => {
    if (!mapInstanceRef.current) return;
    
    const center = result.center;
    
    setFormData({
      ...formData,
      lat: center.lat,
      lng: center.lng,
    });

    // Update marker and circle
    if (markerRef.current) {
      markerRef.current.setLatLng(center);
    } else if (window.L) {
      markerRef.current = window.L.marker(center).addTo(mapInstanceRef.current);
    }

    if (circleRef.current) {
      circleRef.current.setLatLng(center);
    } else if (window.L) {
      circleRef.current = window.L.circle(center, {
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

  // Handle click outside search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && 
          !searchResultsRef.current.contains(event.target) &&
          searchInputRef.current && 
          !searchInputRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          {/* Google Maps style search box */}
          <div className="relative z-10 w-full mb-4">
            <div className={`bg-white rounded-lg shadow-lg transition-all duration-200 text-gray-700 ${searchFocused || searchResults.length > 0 ? 'shadow-xl' : ''}`}>
              {/* Search input with icon */}
              <div className="flex items-center p-3">
                <div className="flex-none mx-2">
                  <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Cari lokasi di peta..."
                  className="flex-grow text-base border-none outline-none focus:ring-0 py-2 px-1"
                />
                {isSearching ? (
                  <div className="flex-none mx-2">
                    <svg className="animate-spin w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : searchQuery ? (
                  <button 
                    onClick={clearSearch}
                    className="flex-none mx-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    type="button"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>
              
              {/* Search results */}
              {searchResults.length > 0 && (
                <div ref={searchResultsRef} className="border-t border-gray-100">
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSelectLocation(result)}
                      >
                        <div className="px-4 py-3 flex">
                          <div className="flex-none mr-3 pt-1">
                            <FiMapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {result.details?.name || result.name || 'Lokasi yang ditemukan'}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {result.details?.address || 
                               (result.html ? result.html.replace(/<[^>]*>/g, '') : 
                               `${result.center.lat.toFixed(6)}, ${result.center.lng.toFixed(6)}`)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {geocoderError && (
                <div className="border-t border-gray-100 py-3 px-4 text-center text-red-500">
                  {geocoderError}
                </div>
              )}
              
              {/* Empty state message */}
              {searchQuery && !isSearching && !geocoderError && searchResults.length === 0 && debouncedQuery.length >= 3 && (
                <div className="border-t border-gray-100 py-3 px-4 text-center text-gray-500">
                  Tidak ada lokasi ditemukan untuk "{searchQuery}"
                </div>
              )}
              
              {/* Minimum characters hint */}
              {debouncedQuery && debouncedQuery.length < 3 && !geocoderError && (
                <div className="border-t border-gray-100 py-3 px-4 text-center text-gray-500">
                  Masukkan minimal 3 karakter untuk mencari
                </div>
              )}
            </div>
          </div>
          
          {/* Debug info */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mb-2 text-xs bg-white p-2 rounded shadow-sm text-gray-700">
              <div>Results count: {searchResults.length}</div>
              <div>Geocoder initialized: {geocoderRef.current ? 'Yes' : 'No'}</div>
              <div>Search status: {isSearching ? 'Searching...' : 'Idle'}</div>
            </div>
          )}
          
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
                  Gunakan kolom pencarian untuk menemukan lokasi atau klik langsung pada peta untuk menentukan lokasi anjungan.
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
