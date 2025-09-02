"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { authManager } from '@/lib/auth';

export default function RegisterPage() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const authState = authManager.getAuthState();
    if (authState.isAuthenticated) {
      router.push('/');
    }
  }, [router]);

  const handleAuthSuccess = () => {
    router.push('/');
  };

  return (
    <div className="space-y-6">
      {/* App Logo/Title */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">N</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Productivity Hub</h1>
        <p className="text-gray-600 mt-2">
          Create your personal workspace
        </p>
      </div>

      {/* Auth Forms */}
      {showLogin ? (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setShowLogin(false)}
        />
      ) : (
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setShowLogin(true)}
        />
      )}

      {/* Features Preview */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>✨ Rich text editing with AI assistance</p>
        <p>📊 Databases and multiple views</p>
        <p>🌐 Real-time collaboration</p>
        <p>📱 Works on all devices</p>
      </div>
    </div>
  );
}