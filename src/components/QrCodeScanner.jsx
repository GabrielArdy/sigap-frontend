import React, { useEffect, useRef, useState } from 'react';

const QrCodeScanner = ({ onScanSuccess, onScanFailure }) => {
  const [scannerInstance, setScannerInstance] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    let scanner = null;

    const initializeScanner = async () => {
      try {
        // Dynamically import html5-qrcode to avoid SSR issues
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Create a new scanner instance
        scanner = new Html5Qrcode("qr-reader");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };
        
        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
        
        setScannerInstance(scanner);
      } catch (error) {
        console.error("Error initializing scanner:", error);
        if (onScanFailure) onScanFailure(error);
      }
    };
    
    // Initialize scanner with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeScanner();
    }, 1000);
    
    // Clean up function
    return () => {
      clearTimeout(timer);
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => {
          console.error("Error stopping scanner:", err);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default QrCodeScanner;
