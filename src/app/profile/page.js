'use client';

import { useAuth } from '../../contexts/AuthContext';
import UserProfile from '../../components/UserProfile';
import AuthForm from '../../components/AuthForm';
import Header from '../../components/Header';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading profile...</div>
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
          <div className="page-header">
            <h1>👤 Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </div>
  );
}