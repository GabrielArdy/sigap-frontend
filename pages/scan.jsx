import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import the scanner component with no SSR
const QrCodeScanner = dynamic(() => import('../components/QrCodeScanner'), {
  ssr: false,
});

export default function ScanPage() {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');

  const handleScanSuccess = (decodedText) => {
    setScanResult(decodedText);
  };

  const handleScanFailure = (errorMessage) => {
    setError(`Scan error: ${errorMessage}`);
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>QR Code Scanner</title>
        <meta name="description" content="Scan QR codes" />
      </Head>

      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
      
      {/* Only load the scanner on the client side */}
      {typeof window !== 'undefined' && (
        <QrCodeScanner 
          onScanSuccess={handleScanSuccess} 
          onScanFailure={handleScanFailure} 
        />
      )}
      
      {scanResult && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <h2 className="font-semibold">Scan Result:</h2>
          <p>{scanResult}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
