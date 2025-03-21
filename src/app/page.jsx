import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center">
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-lg bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
          >
            <span>Client Apps</span>
          </Link>
          
          <Link 
            href="/admin/dashboard" 
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
