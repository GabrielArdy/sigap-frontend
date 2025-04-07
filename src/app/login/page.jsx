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
      {/* Enhanced gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-100 via-sky-200 to-blue-200 md:from-sky-100 md:via-blue-100 md:to-indigo-100 -z-10"></div>
      
      {/* Mobile header with enhanced styling */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 py-7 flex justify-center md:hidden z-10 shadow-lg">
        <Image 
          src="/app-icon.png" 
          alt="App Logo" 
          width={90} 
          height={90}
          className="object-contain filter drop-shadow-md transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="w-full h-full md:h-auto md:max-w-md bg-white md:rounded-2xl md:shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border md:border-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.18)]">
        {/* Desktop header with enhanced styling */}
        <div className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-500 py-8 px-4 justify-center">
          <Image 
            src="/app-icon.png" 
            alt="App Logo" 
            width={110} 
            height={110}
            className="object-contain filter drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="pt-32 pb-16 px-8 sm:px-12 md:pt-10 md:pb-12 flex-grow flex flex-col justify-center">
          <h2 className="text-center text-3xl font-bold text-slate-800 mb-10 md:mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Selamat Datang</span>
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:block">
            <div className="space-y-7 md:space-y-6 flex-grow flex flex-col">
              <div className="rounded-lg md:p-0 transition-all duration-200">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-sky-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Masukkan Email"
                  disabled={loading}
                />
              </div>
              
              <div className="rounded-lg md:p-0 transition-all duration-200">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-sky-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm group-hover:shadow-md"
                    placeholder="Masukkan password"
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-7 mt-auto">
                <button
                  type="submit"
                  className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
              
              <div className="text-center text-sm mt-5">
                <a href="#" className="text-blue-500 hover:text-blue-700 font-medium transition-all duration-200 hover:underline">
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