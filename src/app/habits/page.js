'use client';

import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../../components/Dashboard';
import AuthForm from '../../components/AuthForm';

export default function HabitsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading habits...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
}