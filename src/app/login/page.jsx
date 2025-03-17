'use client'
import Image from 'next/image';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { username, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background with different styles for mobile vs desktop */}
      <div className="fixed inset-0 bg-white md:bg-gradient-to-br md:from-[#e8eefb] md:to-[#d5e0f5] -z-10"></div>
      
      {/* Mobile header - only visible on small screens */}
      <div className="fixed top-0 left-0 right-0 bg-[#3549b1] py-6 flex justify-center md:hidden z-10">
        <div className="w-20 h-20 rounded-full bg-[#a3bfed] flex items-center justify-center shadow-lg">
          <span className="text-white text-xl font-bold">LOGO</span>
        </div>
      </div>
      
      <div className="w-full h-full md:h-auto md:max-w-md bg-white md:rounded-xl md:shadow-xl overflow-hidden flex flex-col">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:flex bg-[#3549b1] py-6 px-4 justify-center">
          <div className="w-24 h-24 rounded-full bg-[#a3bfed] flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">LOGO</span>
          </div>
        </div>
        
        <div className="pt-28 pb-16 px-6 sm:px-10 md:pt-8 md:pb-10 flex-grow flex flex-col justify-center">
          <h2 className="text-center text-2xl font-bold text-[#20264b] mb-8 md:mb-6">
            Selamat Datang
          </h2>
          
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:block">
            <div className="space-y-6 md:space-y-5 flex-grow flex flex-col">
              <div className="rounded-lg md:p-0">
                <label htmlFor="username" className="block text-sm font-medium text-[#2e3a7a] mb-2 md:mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#c8d7f5] bg-white text-[#333] focus:ring-2 focus:ring-[#3549b1] focus:border-transparent transition duration-200"
                  placeholder="Masukkan username"
                />
              </div>
              
              <div className="rounded-lg md:p-0">
                <label htmlFor="password" className="block text-sm font-medium text-[#2e3a7a] mb-2 md:mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#c8d7f5] bg-white text-[#333] focus:ring-2 focus:ring-[#3549b1] focus:border-transparent transition duration-200"
                    placeholder="Masukkan password"
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#3549b1] hover:bg-[#3549b1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200 focus:ring-2 focus:ring-[#c8d7f5] focus:ring-opacity-50"
                >
                  Login
                </button>
              </div>
              
              <div className="text-center text-sm text-[#33419a] mt-4">
                <a href="#" className="hover:text-[#3549b1] transition duration-200">
                  Lupa Password?
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}