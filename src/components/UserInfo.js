'use client';

import { useAuth } from '../contexts/AuthContext';

export default function UserInfo() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading user...</div>;
  }

  if (!user) {
    return <div>No user logged in</div>;
  }

  return (
    <div style={{ 
      padding: '1rem', 
      background: 'var(--bg-tertiary)', 
      borderRadius: 'var(--radius-md)',
      margin: '1rem 0',
      fontSize: '0.875rem'
    }}>
      <h4>Current User Info:</h4>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Provider:</strong> {user.app_metadata?.provider}</p>
      <p><strong>Full Name:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
      <p><strong>Avatar URL:</strong> {user.user_metadata?.avatar_url || 'Not set'}</p>
      <p><strong>Picture:</strong> {user.user_metadata?.picture || 'Not set'}</p>
      <p><strong>Name:</strong> {user.user_metadata?.name || 'Not set'}</p>
      
      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer' }}>View Full User Object</summary>
        <pre style={{ 
          background: 'var(--bg-primary)', 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          overflow: 'auto',
          maxHeight: '200px',
          marginTop: '0.5rem'
        }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
}