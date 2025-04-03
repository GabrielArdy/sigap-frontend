"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/app/api/auth_service';

export default function AuthWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          // No token found, redirect to login
          router.replace('/login');
          return;
        }
        
        // Verify token validity with backend
        const response = await AuthService.verifyToken(token);
        
        if (response.isValid) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-transparent"></div>
          <div className="absolute top-0 left-0 h-16 w-16 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-sky-400 opacity-70"></div>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}