"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure client-side hydration
    const timeoutId = setTimeout(() => {
      const checkAuth = () => {
        const authState = authManager.getAuthState();
        
        if (authState.isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
        setIsChecking(false);
      };

      checkAuth();

      // Subscribe to auth state changes
      const unsubscribe = authManager.subscribe((authState) => {
        if (authState.isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      });

      return () => {
        unsubscribe();
        clearTimeout(timeoutId);
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router]);

  if (!isChecking) {
    return null; // Don't render anything after redirect
  }

  // Loading screen while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {/* App Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-3xl font-bold">N</span>
        </div>
        
        {/* Loading Animation */}
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Productivity Hub</h1>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}