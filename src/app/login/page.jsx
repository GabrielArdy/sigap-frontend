'use client'
import Image from 'next/image';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import AuthService from '../api/auth_service';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success) {
        // Store user data or token in localStorage/sessionStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard or home page
        router.push('/home');
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
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
        <Image 
          src="/app-icon.png" 
          alt="App Logo" 
          width={80} 
          height={80}
          className="object-contain"
        />
      </div>
      
      <div className="w-full h-full md:h-auto md:max-w-md bg-white md:rounded-xl md:shadow-xl overflow-hidden flex flex-col">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:flex bg-[#3549b1] py-6 px-4 justify-center">
          <Image 
            src="/app-icon.png" 
            alt="App Logo" 
            width={100} 
            height={100}
            className="object-contain"
          />
        </div>
        
        <div className="pt-28 pb-16 px-6 sm:px-10 md:pt-8 md:pb-10 flex-grow flex flex-col justify-center">
          <h2 className="text-center text-2xl font-bold text-[#20264b] mb-8 md:mb-6">
            Selamat Datang
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:block">
            <div className="space-y-6 md:space-y-5 flex-grow flex flex-col">
              <div className="rounded-lg md:p-0">
                <label htmlFor="email" className="block text-sm font-medium text-[#2e3a7a] mb-2 md:mb-1">
                  email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#c8d7f5] bg-white text-[#333] focus:ring-2 focus:ring-[#3549b1] focus:border-transparent transition duration-200"
                  placeholder="Masukkan Email"
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#3549b1] hover:bg-[#3549b1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200 focus:ring-2 focus:ring-[#c8d7f5] focus:ring-opacity-50 disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
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