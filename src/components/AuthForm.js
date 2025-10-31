'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthForm() {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage('🎉 Check your email for the confirmation link!');
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('📧 Password reset link sent to your email!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // The redirect will happen automatically
    } catch (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Habit Tracker</span>
          </div>
          <h1 className="auth-title">
            {mode === 'login' && 'Welcome Back!'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' && 'Sign in to continue your habit journey'}
            {mode === 'signup' && 'Start building better habits today'}
            {mode === 'reset' && 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Messages */}
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

        {/* Google OAuth Button */}
        {mode !== 'reset' && (
          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            <span className="google-icon">🔍</span>
            <span>{googleLoading ? 'Connecting...' : `Continue with Google`}</span>
          </button>
        )}

        {/* Divider */}
        {mode !== 'reset' && (
          <div className="auth-divider">
            <span>or</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <span>📧</span>
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label className="form-label">
                <span>🔒</span>
                <span>Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                <span>🔒</span>
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="auth-forgot">
              <button
                type="button"
                className="forgot-link"
                onClick={() => switchMode('reset')}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                <span>
                  {mode === 'login' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'reset' && 'Sending Reset Link...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && '🚀 Sign In'}
                  {mode === 'signup' && '🎯 Create Account'}
                  {mode === 'reset' && '📧 Send Reset Link'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="auth-switcher">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="switch-link"
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="switch-link"
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="switch-link"
                onClick={() => switchMode('login')}
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="footer-link">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="footer-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}