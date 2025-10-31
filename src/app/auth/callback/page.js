'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard');
          router.push('/');
        } else {
          console.log('No session found, redirecting to login');
          router.push('/');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => router.push('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Habit Tracker</span>
            </div>
            <h1 className="auth-title">Completing Sign In...</h1>
            <p className="auth-subtitle">Please wait while we sign you in</p>
          </div>
          
          <div className="loading">
            <div className="spinner"></div>
            <div className="loading-text">Authenticating...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Habit Tracker</span>
            </div>
            <h1 className="auth-title">Authentication Error</h1>
          </div>
          
          <div className="error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          
          <p className="auth-subtitle">Redirecting you back to the login page...</p>
        </div>
      </div>
    );
  }

  return null;
}