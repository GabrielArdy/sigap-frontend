'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQrcode, FaCamera, FaSpinner, FaDoorOpen, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import AttendanceService from '../api/attendance_service';

// Import QrCodeScanner with no SSR to avoid hydration issues
const QrCodeScanner = dynamic(() => import('../../components/QrCodeScanner'), { 
  ssr: false 
});

export default function CheckoutPage() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('Posisikan QR Code dalam bingkai');
  const [userLocation, setUserLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Show success alert - simplified similar to check-in page
  const showSuccessAlert = (result) => {
    const userFullName = getUserName();
    
    Swal.fire({
      icon: 'success',
      title: 'Absen Pulang Berhasil',
      html: `
        <div class="text-left">
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            setUserLocation(locationData);
            setIsLoadingLocation(false);
            resolve(locationData);
          },
          (error) => {
            setIsLoadingLocation(false);
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
    setScanMessage('Tidak dapat memindai QR Code. Silakan coba lagi.');
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header - using a slightly different color to visually differentiate from check-in */}
      <header className="bg-[#3549b1] text-white py-4 px-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-white p-2">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-semibold">Scan QR Absen Pulang</h1>
        </div>
        <FaDoorOpen size={24} />
      </header>
      
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
            <FaQrcode className="text-[#3549b1]" /> Petunjuk Absen Pulang
          </h2>
          <p className="text-gray-600 text-sm">
            Arahkan kamera ke QR Code pada anjungan absensi untuk menyelesaikan sesi kerja hari ini.
            {userLocation && (
              <span className="flex items-center mt-2 text-green-600">
                <FaMapMarkerAlt className="mr-1" /> Lokasi terdeteksi
              </span>
            )}
          </p>
        </div>
        
        {/* Camera View */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg flex-1 min-h-[60vh] flex flex-col items-center justify-center">
          {!isScanning && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#3549b1] bg-opacity-10 flex items-center justify-center mb-4">
                <FaCamera size={36} className="text-[#3549b1]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Kamera Tidak Aktif</h3>
              <p className="text-gray-300 mb-6 text-sm">
                Aktifkan kamera untuk memulai scan QR Code absen pulang
              </p>
              <button
                onClick={prepareScanning}
                disabled={isLoadingLocation}
                className="px-6 py-3 bg-[#3549b1] text-white rounded-lg font-medium shadow-lg hover:bg-[#2e3a7a] transition-colors disabled:bg-gray-400"
              >
                {isLoadingLocation ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" /> Mendapatkan Lokasi...
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
              
              {/* Single scanning overlay with 1:1 aspect ratio */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                {/* QR Frame with 1:1 aspect ratio and consistent styling */}
                <div className="w-64 h-64 relative border border-white border-opacity-30">
                  {/* Corner markers with orange color for checkout */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-400"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-400"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-400"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-400"></div>
                  
                  {/* Scanning animation */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-orange-400 animate-scan"></div>
                </div>
                
                {/* Status message */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <span className="bg-black bg-opacity-70 text-white px-5 py-3 rounded-full text-sm flex items-center font-medium shadow-lg">
                    <FaSpinner className="animate-spin mr-2" /> {scanMessage}
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
            className="mt-6 py-4 px-6 bg-white border border-gray-300 text-gray-700 rounded-full font-medium shadow-md flex items-center justify-center mx-auto hover:bg-gray-100 transition-colors z-30"
          >
            Batal
          </button>
        )}
      </main>
      
      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 1.5s linear infinite;
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