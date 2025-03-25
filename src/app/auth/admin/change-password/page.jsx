"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import zxcvbn from 'zxcvbn';
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newPassword") {
      const result = zxcvbn(value);
      setPasswordStrength({
        score: result.score, // 0-4 (0 weakest, 4 strongest)
        feedback: result.feedback.suggestions.join(". "),
      });
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordStrength.score < 2) {
      toast.error("Password is too weak. Please choose a stronger password");
      return;
    }

    setLoading(true);
    
    try {
      // Here you would make an API call to change the password
      // const response = await fetch('/api/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // if (!response.ok) throw new Error('Failed to change password');
      
      // Mock success for now
      setTimeout(() => {
        toast.success("Password changed successfully");
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSkip = () => {
    // You might want to show a warning or confirmation dialog here
    toast.info("You chose to keep the default password. You can change it later in settings.");
    router.push("/auth/login"); // Or wherever you want to redirect users
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">SIGAP</h1>
        <h2 className="mt-2 text-center text-sm text-gray-600">
          Sistem Informasi Guru dan Absensi Pegawai
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-5xl">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 flex flex-col md:flex-row">
          {/* Illustration Column */}
          <div className="md:w-2/5 flex justify-center items-center p-4 md:p-8">
            <Image
              src="/reset-password-illustration.svg"
              alt="Change Password Illustration"
              width={300}
              height={300}
              priority
              className="max-w-full h-auto"
            />
          </div>
          
          {/* Form Column */}
          <div className="md:w-3/5 md:pl-8 mt-6 md:mt-0">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Change Default Password</h3>
              <p className="mt-1 text-sm text-gray-500">Create a new secure password for your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      aria-label={showPassword.newPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword.newPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Password strength meter */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{getStrengthLabel() || "Password strength"}</span>
                      <span className="text-xs text-gray-500">{passwordStrength.score}/4</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback && (
                      <p className="text-xs text-gray-700 mt-1">{passwordStrength.feedback}</p>
                    )}
                    <p className="text-xs text-gray-700 mt-1">
                      Tip: Use a mix of letters, numbers, and symbols for a strong password.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      aria-label={showPassword.confirmPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword.confirmPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
              
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
                
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
