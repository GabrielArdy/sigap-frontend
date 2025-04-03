'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQrcode, FaCamera, FaSpinner, FaDoorOpen, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import AttendanceService from '../api/attendance_service';
import AuthWrapper from '@/components/AuthWrapper';

// Import QrCodeScanner with no SSR to avoid hydration issues
const QrCodeScanner = dynamic(() => import('../../components/QrCodeScanner'), { 
  ssr: false 
});

function CheckoutPage() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('Posisikan QR Code dalam bingkai');
  const [userLocation, setUserLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Show success alert - simplified similar to check-in page
  const showSuccessAlert = (result) => {
    const userFullName = getUserName();
    
    Swal.fire({
      icon: 'success',
      title: 'Absen Pulang Berhasil',
      html: `
        <div class="text-left">
          <p><strong>Nama:</strong> ${userFullName}</p>
          <p><strong>Lokasi:</strong> ${result.location || 'Terdeteksi'}</p>
          <p><strong>Terminal:</strong> ${result.terminal}</p>
          <p><strong>Waktu:</strong> ${new Date(result.timestamp).toLocaleTimeString('id-ID')}</p>
        </div>
      `,
      confirmButtonText: 'Kembali ke Beranda',
      confirmButtonColor: '#3549b1',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/home';
      }
    });
  };
  
  // Show error alert without raw error details
  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Gagal Absen Pulang',
      text: message || 'Terjadi kesalahan saat memproses absensi pulang Anda.',
      icon: 'error',
      confirmButtonColor: '#3549b1',
      confirmButtonText: 'Coba Lagi'
    });
  };
  
  // Helper function to get user name
  const getUserName = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        if (userData.firstName) {
          return `${userData.firstName} ${userData.lastName || ''}`.trim();
        }
      }
      return "Pengguna";
    } catch (error) {
      return "Pengguna";
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const locationData = { latitude, longitude, accuracy };
            setUserLocation(locationData);
            setIsLoadingLocation(false);
            resolve(locationData);
          },
          (error) => {
            setIsLoadingLocation(false);
            console.error('Geolocation error:', error);
            
            // Handle different error codes
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocationError('Akses lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser Anda.');
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
            
            showErrorAlert('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan berikan izin.');
            reject(error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
      } else {
        setIsLoadingLocation(false);
        setLocationError('Geolokasi tidak didukung di perangkat ini.');
        showErrorAlert('Geolocation tidak didukung di perangkat ini.');
        reject(new Error('Geolocation is not supported by this browser'));
      }
    });
  };
  
  // Handle successful QR scan
  const handleScanSuccess = async (decodedText) => {
    try {
      setIsProcessing(true);
      setScanMessage('Memproses data absensi...');
      
      // Parse the QR code data
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (err) {
        throw new Error('Format QR Code tidak valid');
      }
      
      // Validate QR data structure
      if (!qrData.stationId || !qrData.expiredAt || !qrData.signature) {
        throw new Error('QR Code tidak lengkap');
      }
      
      // Check if QR code is expired
      const expiredAt = new Date(qrData.expiredAt);
      if (expiredAt < new Date()) {
        throw new Error('QR Code sudah kedaluwarsa');
      }
      
      // Get user ID from localStorage
      let userId;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const parsedUser = JSON.parse(userString);
          userId = parsedUser.userId;
        }
      } catch (e) {
        // Silently handle error
      }
      
      // If still no userId, throw error
      if (!userId) {
        throw new Error('User tidak terautentikasi');
      }
      
      // Get current location if not already available
      if (!userLocation) {
        throw new Error('Lokasi tidak tersedia. Aktifkan GPS dan berikan izin.');
      }
      
      // Prepare data for API call
      const attendanceData = {
        userId,
        scannedAt: new Date().toISOString(),
        location: {
          longitude: userLocation.longitude,
          latitude: userLocation.latitude
        },
        qrData
      };
      
      // Send checkout data to API
      const response = await AttendanceService.recordCheckOutTime(attendanceData);
      
      if (response.success) {
        const result = {
          success: true,
          location: response.data.location || "Tidak tersedia",
          terminal: qrData.stationId || "Unknown",
          timestamp: response.data.checkOutTime || new Date().toISOString()
        };
        
        setIsScanning(false);
        showSuccessAlert(result);
      } else {
        throw new Error(response.message || 'Gagal melakukan absen pulang');
      }
    } catch (error) {
      showErrorAlert(error.message || 'Terjadi kesalahan saat memproses absensi');
      setIsScanning(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle QR scan failure
  const handleScanFailure = (error) => {
    // Don't show errors for normal scanning attempts
    console.debug("QR scan attempt failed", error);
  };
  
  // Prepare and start scanning - getting location first
  const prepareScanning = async () => {
    try {
      setScanMessage('Mendapatkan lokasi...');
      await getUserLocation();
      startCamera();
    } catch (error) {
      showErrorAlert('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan berikan izin.');
    }
  };
  
  // Start camera after location is obtained
  const startCamera = () => {
    setIsScanning(true);
    setHasPermission(true);
    setScanMessage('Posisikan QR Code dalam bingkai');
  };
  
  // Stop camera
  const stopCamera = () => {
    setIsScanning(false);
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex flex-col text-slate-700">
      {/* Header - using a slightly different color to visually differentiate from check-in */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 px-5 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-white p-2 hover:bg-white/20 rounded-full transition-colors duration-200">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">Scan QR Absen Pulang</h1>
        </div>
        <FaDoorOpen size={24} />
      </header>
      
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-5 border border-orange-100 hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <FaQrcode className="text-orange-500" /> Petunjuk Absen Pulang
          </h2>
          <p className="text-slate-600 text-sm mb-3">
            Arahkan kamera ke QR Code pada anjungan absensi untuk menyelesaikan sesi kerja hari ini.
          </p>
          
          {/* Location Status Indicator */}
          <div className={`flex items-center mt-3 ${userLocation ? 'text-green-600' : locationError ? 'text-red-600' : 'text-amber-600'} text-sm rounded-lg p-2 ${userLocation ? 'bg-green-50' : locationError ? 'bg-red-50' : 'bg-amber-50'}`}>
            {userLocation ? (
              <>
                <FaMapMarkerAlt className="mr-2" />
                <span>Lokasi terdeteksi {userLocation.accuracy && `(akurasi ~${Math.round(userLocation.accuracy)}m)`}</span>
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
          {!isScanning && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-orange-500 bg-opacity-15 flex items-center justify-center mb-5 border border-orange-400 border-opacity-30">
                <FaCamera size={36} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Kamera Tidak Aktif</h3>
              <p className="text-gray-300 mb-6 text-sm max-w-xs">
                Aktifkan kamera untuk memulai scan QR Code absen pulang
              </p>
              <button
                onClick={prepareScanning}
                disabled={isLoadingLocation}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-medium shadow-lg transition-all transform hover:translate-y-[-2px] disabled:bg-gray-400 disabled:transform-none disabled:from-gray-400 disabled:to-gray-400 flex items-center"
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
              {/* QrCodeScanner component with fixed z-index */}
              <div className="w-full h-full absolute inset-0 z-10">
                <QrCodeScanner 
                  onScanSuccess={handleScanSuccess} 
                  onScanFailure={handleScanFailure}
                />
              </div>
              
              {/* Custom scanning overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                {/* QR Frame with rounded corners */}
                <div className="w-64 h-64 relative border-2 border-white border-opacity-50 rounded-lg">
                  {/* Corner markers with orange color for checkout */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-400 rounded-br-lg"></div>
                  
                  {/* Scanning animation */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-orange-400 animate-scan"></div>
                </div>
                
                {/* Status message */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <span className="bg-slate-800 bg-opacity-80 text-white px-6 py-3 rounded-full text-sm flex items-center font-medium shadow-lg border border-slate-700">
                    <FaSpinner className="animate-spin mr-2 text-orange-400" /> {scanMessage}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Cancel button - only show when scanning */}
        {isScanning && (
          <button 
            onClick={() => {
              stopCamera();
              showErrorAlert('Proses scan dibatalkan');
            }} 
            className="mt-6 py-4 px-8 bg-white border border-orange-200 text-slate-700 rounded-full font-medium shadow-md flex items-center justify-center mx-auto hover:bg-orange-50 transition-all duration-300 transform hover:translate-y-[-2px]"
          >
            Batal
          </button>
        )}
        
        {/* Retry location button - only show when there's a location error */}
        {!isScanning && locationError && (
          <button 
            onClick={() => getUserLocation()} 
            disabled={isLoadingLocation}
            className="mt-6 py-4 px-8 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-medium shadow-md flex items-center justify-center mx-auto hover:bg-orange-200 transition-all duration-300"
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
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.7);
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
      <CheckoutPage />
    </AuthWrapper>
  );
}