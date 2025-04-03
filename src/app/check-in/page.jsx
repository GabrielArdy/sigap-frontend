'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQrcode, FaCamera, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import AttendanceService from '../api/attendance_service';
import AuthWrapper from '@/components/AuthWrapper';

// Dynamically import the QrCodeScanner component with no SSR
const QrCodeScanner = dynamic(
  () => import('../../components/QrCodeScanner'),
  { ssr: false }
);

function ScanPage() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('Posisikan QR Code dalam bingkai');
  const [userId, setUserId] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  
  // Get user ID from local storage on component mount
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        if (userData && userData.userId) {
          setUserId(userData.userId);
        } else {
          // Fallback userId if user data doesn't contain userId
          console.warn('User data found in localStorage but missing userId');
          setUserId("0181871e-c34c-4b7b-8467-96b7108b1429");
        }
      } else {
        // Fallback userId if not found in localStorage
        console.warn('No user data found in localStorage');
        setUserId("0181871e-c34c-4b7b-8467-96b7108b1429");
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUserId("0181871e-c34c-4b7b-8467-96b7108b1429");
    }
  }, []);
  
  // Check geolocation permissions
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setLocationPermission('unsupported');
          return;
        }
        
        // Check if we can query permissions via Permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(permissionStatus.state);
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            setLocationPermission(permissionStatus.state);
            if (permissionStatus.state === 'granted') {
              setLocationError(null);
            }
          };
        }
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    };
    
    checkLocationPermission();
  }, []);
  
  // Get current location with enhanced error handling
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported by your browser');
        setLocationError('Geolokasi tidak didukung oleh browser Anda');
        setIsLoadingLocation(false);
        reject(error);
        return;
      }
      
      // Create a timeout for geolocation request
      const timeoutId = setTimeout(() => {
        setLocationError('Permintaan lokasi timeout. Coba lagi.');
        setIsLoadingLocation(false);
        reject(new Error('Geolocation timeout'));
      }, 15000); // 15 seconds timeout
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocationData(location);
          setLocationError(null);
          setLocationPermission('granted');
          setIsLoadingLocation(false);
          resolve(location);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
          
          // Handle different error codes
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Akses lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser Anda.');
              setLocationPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Informasi lokasi tidak tersedia. Pastikan GPS Anda aktif.');
              break;
            case error.TIMEOUT:
              setLocationError('Permintaan lokasi timeout. Coba lagi.');
              break;
            default:
              setLocationError('Terjadi kesalahan saat mendapatkan lokasi.');
          }
          
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    });
  };
  
  // Request location permission explicitly with UI feedback
  const requestLocationPermission = async () => {
    try {
      setScanMessage('Meminta izin lokasi...');
      
      // Show a custom dialog first to prepare the user
      const result = await Swal.fire({
        title: 'Izin Lokasi Diperlukan',
        html: `
          <div class="text-left">
            <p>Untuk melakukan absensi, aplikasi memerlukan akses lokasi Anda.</p>
            <p class="mt-2">Pastikan:</p>
            <ul class="list-disc pl-5 mt-1">
              <li>GPS perangkat Anda aktif</li>
              <li>Anda mengizinkan akses lokasi untuk aplikasi ini</li>
            </ul>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Izinkan Akses Lokasi',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#3549b1',
      });
      
      if (result.isConfirmed) {
        await getCurrentLocation();
        return true;
      } else {
        setScanMessage('Akses lokasi diperlukan untuk melanjutkan');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  // Handle successful QR scan
  const handleScanSuccess = (decodedText) => {
    if (!isScanning) return;
    
    setScanMessage('QR Code terdeteksi!');
    setIsScanning(false);
    processAttendance(decodedText);
  };
  
  // Handle QR scan failure
  const handleScanFailure = (error) => {
    // Don't show errors for normal scanning attempts
    console.debug("QR scan attempt failed", error);
  };

  // Process QR code data and send to API
  const processAttendance = async (qrData) => {
    try {
      setScanMessage('Memproses absensi...');
      
      // Parse QR code data
      const parsedQrData = JSON.parse(qrData);
      
      // Use location data we already have
      let location = locationData;
      
      // If location wasn't obtained earlier, try again as fallback
      if (!location) {
        try {
          location = await getCurrentLocation();
        } catch (error) {
          console.error('Error getting location during processing:', error);
          // Use default location as last resort
          location = { latitude: -6.208800, longitude: 106.845600 };
        }
      }
      
      // Get user information from localStorage
      let userFullName = "Pengguna";
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          if (userData.firstName) {
            userFullName = `${userData.firstName} ${userData.lastName || ''}`.trim();
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
      
      // Prepare data for API
      const attendanceData = {
        userId: userId,
        scannedAt: new Date().toISOString(),
        location: {
          longitude: location.longitude,
          latitude: location.latitude
        },
        qrData: parsedQrData
      };
      
      // Send to API
      const response = await AttendanceService.recordCheckInTime(attendanceData);
      
      if (response.success) {
        // Show success message with SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Absensi Berhasil',
          html: `
            <div class="text-left">
              <p><strong>Nama:</strong> ${userFullName}</p>
              <p><strong>Lokasi:</strong> ${response.data?.location || 'Terdeteksi'}</p>
              <p><strong>Terminal:</strong> ${parsedQrData.stationId}</p>
              <p><strong>Waktu:</strong> ${new Date().toLocaleTimeString('id-ID')}</p>
            </div>
          `,
          confirmButtonText: 'Kembali ke Beranda',
          confirmButtonColor: '#3549b1',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/home';
          }
        });
        
        setScanResult(response.data);
      } else {
        // Show error message
        handleScanFailed(response.message || 'Gagal melakukan absensi');
      }
    } catch (error) {
      console.error('Error processing attendance:', error);
      handleScanFailed('Format QR Code tidak valid atau terjadi kesalahan saat memproses');
    }
  };
  
  // Prepare and start scanning with enhanced location handling
  const prepareScanning = async () => {
    try {
      // First check/request location permission
      setScanMessage('Memeriksa izin lokasi...');
      
      if (locationPermission === 'denied') {
        // If permission already denied, show instructions to enable
        Swal.fire({
          icon: 'warning',
          title: 'Akses Lokasi Diblokir',
          html: `
            <div class="text-left">
              <p>Akses lokasi diblokir oleh browser Anda.</p>
              <p class="mt-2">Cara mengaktifkan:</p>
              <ol class="list-decimal pl-5 mt-1">
                <li>Klik ikon kunci/info di address bar</li>
                <li>Pilih "Izin Situs" atau "Pengaturan Situs"</li>
                <li>Aktifkan izin lokasi</li>
                <li>Muat ulang halaman</li>
              </ol>
            </div>
          `,
          confirmButtonText: 'Muat Ulang Halaman',
          confirmButtonColor: '#3549b1',
          showCancelButton: true,
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        return;
      }
      
      // Request location permission if not already granted
      if (locationPermission !== 'granted') {
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) return;
      } else {
        // Get location if permission is already granted
        setScanMessage('Mendapatkan lokasi...');
        await getCurrentLocation();
      }
      
      // Then start camera if location was successfully retrieved
      if (locationData) {
        setIsScanning(true);
        setHasPermission(true);
        setScanMessage('Posisikan QR Code dalam bingkai');
      } else {
        // If still no location data, show error
        throw new Error('Tidak dapat mendapatkan lokasi');
      }
    } catch (error) {
      console.error('Error preparing scan:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Akses Lokasi Gagal',
        text: locationError || 'Tidak dapat mengakses lokasi. Pastikan GPS aktif dan Anda memberikan izin lokasi.',
        confirmButtonColor: '#3549b1',
      });
      
      setScanMessage('Gagal mendapatkan lokasi');
      setIsScanning(false);
    }
  };
  
  // Handle scan failure
  const handleScanFailed = (message) => {
    setIsScanning(false);
    Swal.fire({
      icon: 'error',
      title: 'Scan Gagal',
      text: message || 'QR Code tidak valid atau terjadi kesalahan saat memproses.',
      confirmButtonColor: '#3549b1',
      confirmButtonText: 'Coba Lagi',
    }).then((result) => {
      if (result.isConfirmed) {
        prepareScanning();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 flex flex-col text-slate-700">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-5 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-white p-2 hover:bg-white/20 rounded-full transition-colors duration-200">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">Scan QR Code</h1>
        </div>
        <FaQrcode size={24} />
      </header>
      
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-5 border border-sky-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <FaQrcode className="text-blue-500" /> Petunjuk Scan
          </h2>
          <p className="text-slate-600 text-sm mb-3">
            Arahkan kamera ke QR Code pada anjungan absensi untuk melakukan absen masuk/keluar.
          </p>
          
          {/* Location Status Indicator */}
          <div className={`flex items-center mt-3 ${locationData ? 'text-green-600' : locationError ? 'text-red-600' : 'text-amber-600'} text-sm rounded-lg p-2 ${locationData ? 'bg-green-50' : locationError ? 'bg-red-50' : 'bg-amber-50'}`}>
            {locationData ? (
              <>
                <FaMapMarkerAlt className="mr-2" />
                <span>Lokasi terdeteksi {locationData.accuracy && `(akurasi ~${Math.round(locationData.accuracy)}m)`}</span>
              </>
            ) : locationError ? (
              <>
                <FaMapMarkerAlt className="mr-2" />
                <span>{locationError}</span>
              </>
            ) : isLoadingLocation ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                <span>Mendapatkan lokasi...</span>
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="mr-2" />
                <span>Lokasi diperlukan untuk absensi</span>
              </>
            )}
          </div>
        </div>
        
        {/* Camera View */}
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg flex-1 min-h-[60vh] flex flex-col items-center justify-center border border-slate-700">
          {!isScanning && !scanResult && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center mb-5 border border-blue-400 border-opacity-30">
                <FaCamera size={36} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Kamera Tidak Aktif</h3>
              <p className="text-gray-300 mb-6 text-sm max-w-xs">
                Aktifkan kamera untuk memulai scan QR Code pada anjungan
              </p>
              <button
                onClick={prepareScanning}
                disabled={isLoadingLocation}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg transition-all transform hover:translate-y-[-2px] disabled:bg-gray-400 disabled:transform-none disabled:from-gray-400 disabled:to-gray-400 flex items-center"
              >
                {isLoadingLocation ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Mendapatkan Lokasi...
                  </>
                ) : (
                  'Mulai Scan'
                )}
              </button>
            </div>
          )}
          
          {isScanning && (
            <>
              {/* Use the QrCodeScanner component */}
              <div className="w-full h-full absolute inset-0 z-10">
                <QrCodeScanner
                  onScanSuccess={handleScanSuccess}
                  onScanFailure={handleScanFailure}
                />
              </div>
              
              {/* Custom scanning overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                {/* QR Frame */}
                <div className="w-64 h-64 relative border-2 border-white border-opacity-50 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  
                  {/* Scanning animation */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-400 animate-scan"></div>
                </div>
                
                {/* Status message */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <span className="bg-slate-800 bg-opacity-80 text-white px-6 py-3 rounded-full text-sm flex items-center font-medium shadow-lg border border-slate-700">
                    <FaSpinner className="animate-spin mr-2 text-blue-400" /> {scanMessage}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Cancel button - only show when scanning */}
        {isScanning && (
          <button 
            onClick={() => setIsScanning(false)} 
            className="mt-6 py-4 px-8 bg-white border border-sky-200 text-slate-700 rounded-full font-medium shadow-md flex items-center justify-center mx-auto hover:bg-sky-50 transition-all duration-300 transform hover:translate-y-[-2px]"
          >
            Batal
          </button>
        )}
        
        {/* Retry location button - only show when there's a location error */}
        {!isScanning && locationError && (
          <button 
            onClick={() => getCurrentLocation()} 
            disabled={isLoadingLocation}
            className="mt-6 py-4 px-8 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium shadow-md flex items-center justify-center mx-auto hover:bg-blue-200 transition-all duration-300"
          >
            {isLoadingLocation ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Mencoba Ulang...
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="mr-2" /> Coba Dapatkan Lokasi Lagi
              </>
            )}
          </button>
        )}
      </main>
      
      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 1.5s linear infinite;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
        }
        
        /* Styling for QR scanner container */
        #qr-reader {
          border: none !important;
          padding: 0 !important;
          background: transparent !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border: none !important;
        }
        #qr-reader__dashboard_section_csr button {
          visibility: hidden;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <AuthWrapper>
      <ScanPage />
    </AuthWrapper>
  );
}