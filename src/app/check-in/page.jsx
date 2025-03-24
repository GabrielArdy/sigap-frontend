'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQrcode, FaCamera, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import jsQR from 'jsqr';
import AttendanceService from '../api/attendance_service';

export default function ScanPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('Posisikan QR Code dalam bingkai');
  const [userId, setUserId] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const scanIntervalRef = useRef(null);
  
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
  
  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setIsLoadingLocation(true);
      if (!navigator.geolocation) {
        setIsLoadingLocation(false);
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setLocationData(location);
            setIsLoadingLocation(false);
            resolve(location);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setIsLoadingLocation(false);
            reject(error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
      }
    });
  };

  // Process QR code data and send to API
  const processAttendance = async (qrData) => {
    try {
      stopCamera();
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
  
  // Prepare and start scanning
  const prepareScanning = async () => {
    try {
      // First get location
      setScanMessage('Mendapatkan lokasi...');
      await getCurrentLocation();
      
      // Then start camera
      await startCamera();
    } catch (error) {
      console.error('Error preparing scan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Akses Lokasi Gagal',
        text: 'Tidak dapat mengakses lokasi. Pastikan Anda memberikan izin lokasi untuk aplikasi ini.',
        confirmButtonColor: '#3549b1',
      });
      setScanMessage('Gagal mendapatkan lokasi');
      setIsScanning(false);
    }
  };
  
  // Start camera and QR scanning
  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanMessage('Meminta akses kamera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera if available
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setScanMessage('Posisikan QR Code dalam bingkai');
        
        // Start QR code scanning
        videoRef.current.addEventListener('loadedmetadata', () => {
          // Create canvas for QR code detection if it doesn't exist
          if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
          }
          
          // Start scanning for QR codes
          scanIntervalRef.current = setInterval(() => {
            scanQRCode();
          }, 200); // Scan every 200ms
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setScanMessage('Tidak dapat mengakses kamera. Berikan izin kamera untuk melanjutkan.');
      setIsScanning(false);
      
      // Show error message with SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Akses Kamera Gagal',
        text: 'Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera untuk aplikasi ini.',
        confirmButtonColor: '#3549b1',
      });
    }
  };
  
  // Scan QR code from video feed
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Scan for QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    // If QR code is found
    if (code) {
      // Clear the scanning interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Process the QR code data
      processAttendance(code.data);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle scan failure
  const handleScanFailed = (message) => {
    stopCamera();
    Swal.fire({
      icon: 'error',
      title: 'Scan Gagal',
      text: message || 'QR Code tidak valid atau terjadi kesalahan saat memproses.',
      confirmButtonColor: '#3549b1',
      confirmButtonText: 'Coba Lagi',
    }).then((result) => {
      if (result.isConfirmed) {
        startCamera();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#3549b1] text-white py-4 px-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-white p-2">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-semibold">Scan QR Code</h1>
        </div>
        <FaQrcode size={24} />
      </header>
      
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
            <FaQrcode className="text-[#3549b1]" /> Petunjuk Scan
          </h2>
          <p className="text-gray-600 text-sm">
            Arahkan kamera ke QR Code pada anjungan absensi untuk melakukan absen masuk/keluar.
            {locationData && (
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
                Aktifkan kamera untuk memulai scan QR Code
              </p>
              <button
                onClick={prepareScanning}
                disabled={isLoadingLocation}
                className="px-6 py-3 bg-[#3549b1] text-white rounded-lg font-medium shadow-lg hover:bg-[#3549b1] transition-colors disabled:bg-gray-400"
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
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="absolute inset-0 min-w-full min-h-full object-cover"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* QR Frame */}
                <div className="w-64 h-64 relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white"></div>
                  
                  {/* Scanning animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#3549b1] animate-scan"></div>
                </div>
                
                {/* Status message */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                  <span className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm flex items-center">
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
            onClick={stopCamera} 
            className="mt-6 py-4 px-6 bg-white border border-gray-300 text-gray-700 rounded-full font-medium shadow-md flex items-center justify-center mx-auto hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
        )}
      </main>
      
      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}