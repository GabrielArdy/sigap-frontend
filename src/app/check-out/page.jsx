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
  
  // Show success alert
  const showSuccessAlert = (result) => {
    Swal.fire({
      title: 'Absen Pulang Berhasil!',
      text: `Terima kasih atas kerja keras Anda hari ini. Durasi kerja: ${result.duration}`,
      icon: 'success',
      confirmButtonColor: '#3549b1',
      confirmButtonText: 'OK'
    });
  };
  
  // Show error alert with detailed error info
  const showErrorAlert = (message, rawError = null) => {
    let errorText = message || 'Terjadi kesalahan saat memproses absensi pulang Anda.';
    let errorDetails = '';
    
    // Add raw error details if available
    if (rawError) {
      if (typeof rawError === 'string') {
        errorDetails = rawError;
      } else if (typeof rawError === 'object') {
        try {
          errorDetails = JSON.stringify(rawError, null, 2);
        } catch (e) {
          errorDetails = 'Error: ' + Object.prototype.toString.call(rawError);
        }
      }
    }
    
    Swal.fire({
      title: 'Gagal Absen Pulang',
      html: `
        <div class="text-left">
          <p>${errorText}</p>
          ${errorDetails ? `<div class="mt-3 pt-3 border-t">
            <p class="font-semibold text-sm text-red-600 mb-1">Detail Error:</p>
            <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto" style="max-height: 150px;">${errorDetails}</pre>
          </div>` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonColor: '#3549b1',
      confirmButtonText: 'Coba Lagi'
    });
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          showErrorAlert('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan berikan izin.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      showErrorAlert('Geolocation tidak didukung di perangkat ini.');
    }
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
      
      // Get user ID from localStorage (you may want to use a more secure approach)
      const userId = localStorage.getItem('userId');
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
          timestamp: response.data.checkOutTime || new Date().toISOString(),
          duration: response.data.duration || "N/A"
        };
        
        setScanResult(result);
        setIsScanning(false);
        showSuccessAlert(result);
      } else {
        throw new Error(response.message || 'Gagal melakukan absen pulang');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      
      // Show detailed error including raw response data
      showErrorAlert(
        error.message || 'Terjadi kesalahan saat memproses absensi', 
        error.response ? error.response.data : error
      );
      
      setIsScanning(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle QR scan failure with detailed error
  const handleScanFailure = (error) => {
    console.error('QR Scan error:', error);
    setScanMessage('Tidak dapat memindai QR Code. Silakan coba lagi.');
  };
  
  // Start camera and scanning process
  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanMessage('Meminta akses kamera...');
      
      // Get user location first
      getUserLocation();
      
      // Camera access is now handled by the QrCodeScanner component
      setHasPermission(true);
      setScanMessage('Posisikan QR Code dalam bingkai');
    } catch (err) {
      console.error('Error preparing scan:', err);
      setHasPermission(false);
      setScanMessage('Tidak dapat mengakses kamera. Berikan izin kamera untuk melanjutkan.');
      setIsScanning(false);
      
      showErrorAlert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.', err);
    }
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
          {!isScanning && !scanResult && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#3549b1] bg-opacity-10 flex items-center justify-center mb-4">
                <FaCamera size={36} className="text-[#3549b1]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Kamera Tidak Aktif</h3>
              <p className="text-gray-300 mb-6 text-sm">
                Aktifkan kamera untuk memulai scan QR Code absen pulang
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-[#3549b1] text-white rounded-lg font-medium shadow-lg hover:bg-[#2e3a7a] transition-colors"
              >
                Mulai Scan
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
          
          {scanResult && (
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto flex items-center justify-center mb-4">
                <FaDoorOpen className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Absen Pulang Berhasil</h2>
              <p className="text-gray-300 mb-6">Terima kasih atas kerja keras Anda hari ini</p>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Lokasi:</span>
                  <span className="text-white font-medium">{scanResult.location}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Terminal:</span>
                  <span className="text-white font-medium">{scanResult.terminal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Waktu Pulang:</span>
                  <span className="text-white font-medium">
                    {new Date(scanResult.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-white border-opacity-10">
                  <span className="text-gray-300">Durasi Kerja:</span>
                  <span className="text-white font-medium">{scanResult.duration}</span>
                </div>
              </div>
              <Link href="/home">
                <button className="w-full py-3 bg-[#3549b1] text-white rounded-lg font-medium">
                  Kembali ke Beranda
                </button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Cancel button - only show when scanning */}
        {isScanning && (
          <button 
            onClick={() => {
              stopCamera();
              showErrorAlert('Proses scan dibatalkan', 'Proses dibatalkan oleh pengguna');
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