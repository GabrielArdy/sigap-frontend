'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQrcode, FaCamera, FaSpinner } from 'react-icons/fa';

export default function ScanPage() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState('Posisikan QR Code dalam bingkai');
  
  // Start camera when component mounts
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
        
        // Simulate successful scan after 5 seconds (replace with real QR scanning)
        setTimeout(() => {
          const mockResult = {
            success: true,
            location: "Kantor Pusat Lt. 3",
            terminal: "Terminal-AB12",
            timestamp: new Date().toISOString()
          };
          setScanResult(mockResult);
          stopCamera();
        }, 5000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setScanMessage('Tidak dapat mengakses kamera. Berikan izin kamera untuk melanjutkan.');
      setIsScanning(false);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
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
                onClick={startCamera}
                className="px-6 py-3 bg-[#3549b1] text-white rounded-lg font-medium shadow-lg hover:bg-[#3549b1] transition-colors"
              >
                Mulai Scan
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
          
          {scanResult && (
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Absensi Berhasil</h2>
              <p className="text-gray-300 mb-6">QR Code berhasil dipindai</p>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Lokasi:</span>
                  <span className="text-white font-medium">{scanResult.location}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Terminal:</span>
                  <span className="text-white font-medium">{scanResult.terminal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Waktu:</span>
                  <span className="text-white font-medium">
                    {new Date(scanResult.timestamp).toLocaleTimeString('id-ID')}
                  </span>
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