import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to ensure the library only loads on the client side
const Html5QrcodeScanner = dynamic(() => import('html5-qrcode').then(mod => mod.Html5QrcodeScanner), {
  ssr: false,
});

const QrCodeScanner = ({ onScanSuccess, onScanFailure, ...props }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    // Only initialize scanner on client side
    if (typeof window === 'undefined') return;

    // Clear any existing scanner instances
    if (scannerRef.current) {
      if (scannerInstance) {
        try {
          scannerInstance.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    }

    // Delay the initialization to ensure all libraries are loaded properly
    const timer = setTimeout(() => {
      try {
        // We need to make sure Html5QrcodeScanner is loaded before using it
        import('html5-qrcode').then((html5QrCode) => {
          const scanner = new html5QrCode.Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10,
              qrbox: 250,
              disableFlip: false,
              showTorchButtonIfSupported: true
            },
            /* verbose= */ false
          );
          
          scanner.render((decodedText, decodedResult) => {
            if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
          }, (errorMessage) => {
            if (onScanFailure) onScanFailure(errorMessage);
          });
          
          setScannerInstance(scanner);
          setIsScanning(true);
        });
      } catch (error) {
        console.error("Error initializing scanner:", error);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Clean up scanner when component unmounts
      if (scannerInstance) {
        try {
          scannerInstance.clear();
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, []);

  return (
    <div>
      <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>
      {!isScanning && <p>Loading scanner...</p>}
    </div>
  );
};

export default QrCodeScanner;
