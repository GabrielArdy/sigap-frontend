'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsAppInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsAppInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsAppInstalled(true));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center px-4 py-16 text-center max-w-3xl">
        <div className="mb-10">
          <Image
            src="/app-icon.png"
            alt="SIGAP Application Logo"
            width={180}
            height={180}
            priority
            className="rounded-xl shadow-md"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to SIGAP</h1>
        <p className="text-xl mb-10 text-gray-600 dark:text-gray-300">Choose your application platform</p>
        
        {/* PWA Installation Banner */}
        {deferredPrompt && !isAppInstalled && (
          <div className="w-full max-w-md mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-800 dark:text-blue-300">Install SIGAP App</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Add to your home screen for quick access</p>
                </div>
              </div>
              <button 
                onClick={handleInstallClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Install Now
              </button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center">
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-lg bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
          >
            <span>Client Apps</span>
          </Link>
          
          <Link 
            href="auth/admin/login" 
            className="px-8 py-4 rounded-lg bg-gray-700 dark:bg-gray-600 text-white text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-lg flex items-center justify-center"
          >
            <span>Admin Apps</span>
          </Link>
        </div>
      </main>
      
      <footer className="py-6 text-sm text-center text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} SIGAP Application. All rights reserved.
      </footer>
    </div>
  );
}
