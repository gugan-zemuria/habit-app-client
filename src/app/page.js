'use client';

import { useAuth } from '../contexts/AuthContext';
import TodayView from '../components/TodayView';
import AuthForm from '../components/AuthForm';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <TodayView />;
}