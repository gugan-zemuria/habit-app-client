'use client';

import { useAuth } from '../../contexts/AuthContext';
import Calendar from '../../components/Calendar';
import AuthForm from '../../components/AuthForm';
import Header from '../../components/Header';

export default function CalendarPage() {
  const { user, loading } = useAuth();

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
          <div className="page-header">
            <h1>📅 Calendar View</h1>
            <p>Track your habit completion history and update past dates</p>
          </div>
          <Calendar />
        </div>
      </div>
    </div>
  );
}