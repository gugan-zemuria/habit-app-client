'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword, user } = useAuth();

  useEffect(() => {
    // Check if user is authenticated (came from reset link)
    if (user) {
      setIsValidSession(true);
    } else {
      // Check for error in URL params (invalid/expired link)
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        setError(errorDescription || 'Invalid or expired reset link');
      } else {
        setError('Invalid reset session. Please request a new password reset link.');
      }
    }
  }, [user, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { error } = await updatePassword(password);
      if (error) throw error;

      setMessage('🎉 Password updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Habit Tracker</span>
          </div>
          <h1 className="auth-title">
            {isValidSession ? 'Set New Password' : 'Reset Link Invalid'}
          </h1>
          <p className="auth-subtitle">
            {isValidSession 
              ? 'Enter your new password below' 
              : 'This reset link is invalid or has expired'
            }
          </p>
        </div>

        {error && (
          <div className="error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="success">
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}

        {isValidSession ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <span>🔒</span>
                <span>New Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>🔒</span>
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>🔐 Update Password</span>
              )}
            </button>
          </form>
        ) : (
          <div className="reset-error-actions">
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={handleBackToLogin}
            >
              🔙 Back to Login
            </button>
            <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
              You can request a new password reset link from the login page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Habit Tracker</span>
            </div>
            <h1 className="auth-title">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}