'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ShareProgress from '../../components/ShareProgress';
import AuthForm from '../../components/AuthForm';
import Header from '../../components/Header';

export default function SharePage() {
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
          <ShareProgress />
        </div>
      </div>
    </div>
  );
}