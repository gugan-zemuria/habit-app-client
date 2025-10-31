'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProgressView from '../../components/ProgressView';
import AuthForm from '../../components/AuthForm';
import Header from '../../components/Header';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div className="main-content">
          <ProgressView />
        </div>
      </div>
    </div>
  );
}