"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import { AuthState } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>(authManager.getAuthState());
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setAuthState(state);
      
      if (!state.isAuthenticated) {
        router.push('/login');
      }
    });

    // Initial check
    if (!authState.isAuthenticated) {
      router.push('/login');
    }

    return unsubscribe;
  }, [authState.isAuthenticated, router]);

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {children}
    </div>
  );
}