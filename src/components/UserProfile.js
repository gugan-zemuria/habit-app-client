'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function UserProfile() {
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    joinedDate: '',
    photoURL: '',
    provider: ''
  });

  // Update profile data whenever user changes
  useEffect(() => {
    console.log('UserProfile useEffect - user changed:', user);
    
    if (user) {
      // Extract user information from different auth providers
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.display_name ||
                         user.email?.split('@')[0] || 
                         'User';
      
      const photoURL = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      user.user_metadata?.photo_url || 
                      '';
      
      const provider = user.app_metadata?.provider || 'email';
      
      const newProfileData = {
        displayName,
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        joinedDate: user.created_at || new Date().toISOString(),
        photoURL,
        provider
      };
      
      console.log('Updating profile with:', newProfileData);
      setProfileData(newProfileData);
    }
    
    setProfileLoading(false);
  }, [user]);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically save to a backend
    setIsEditing(false);
    // For now, just update local state
  };

  const formatJoinDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'U';
    
    const cleanName = name.trim();
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0][0].toUpperCase();
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Compute current display name directly from user object
  const currentDisplayName = user?.user_metadata?.full_name || 
                            user?.user_metadata?.name || 
                            user?.user_metadata?.display_name ||
                            user?.email?.split('@')[0] || 
                            profileData.displayName || 
                            'User';

  const currentPhotoURL = user?.user_metadata?.avatar_url || 
                         user?.user_metadata?.picture || 
                         user?.user_metadata?.photo_url || 
                         profileData.photoURL;

  if (profileLoading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
          <div className="loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" key={`${user?.id}-${user?.email}-${user?.updated_at}`}>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {currentPhotoURL ? (
              <img src={currentPhotoURL} alt="Profile" className="avatar-image" />
            ) : (
              <span className="avatar-initials">
                {getInitials(currentDisplayName)}
              </span>
            )}
          </div>
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              className="form-input profile-name-input"
              placeholder="Display Name"
            />
          ) : (
            <h1 className="profile-name">{currentDisplayName}</h1>
          )}
          
          <p className="profile-email">{user?.email || profileData.email}</p>
          <p className="profile-joined">Joined {formatJoinDate(profileData.joinedDate)}</p>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn btn-primary btn-small" onClick={handleSaveProfile}>
                💾 Save
              </button>
              <button className="btn btn-secondary btn-small" onClick={() => setIsEditing(false)}>
                ❌ Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-small" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Bio Section */}
        <div className="profile-section">
          <h3 className="section-title">
            <span>📝</span>
            <span>About</span>
          </h3>
          <div className="section-content">
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="form-textarea"
                placeholder="Tell us about yourself and your habit goals..."
                rows={4}
              />
            ) : (
              <p className="profile-bio">
                {profileData.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
              </p>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="profile-section">
          <h3 className="section-title">
            <span>⚙️</span>
            <span>Preferences</span>
          </h3>
          <div className="section-content">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Theme</h4>
                <p>Choose your preferred color scheme</p>
              </div>
              <div className="theme-selector">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Light
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="profile-section">
          <h3 className="section-title">
            <span>🔐</span>
            <span>Account</span>
          </h3>
          <div className="section-content">
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || profileData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sign-in Method:</span>
                <span className="info-value">
                  {profileData.provider === 'google' && '🔍 Google'}
                  {profileData.provider === 'email' && '📧 Email'}
                  {profileData.provider === 'github' && '🐙 GitHub'}
                  {!profileData.provider && '📧 Email'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value">Free Account</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">{formatJoinDate(profileData.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>

        

        {/* Danger Zone */}
        <div className="profile-section danger-section">
          <h3 className="section-title">
            <span>⚠️</span>
            <span>Account Actions</span>
          </h3>
          <div className="section-content">
            <div className="danger-actions">
              <button className="btn btn-danger" onClick={handleSignOut}>
                🚪 Sign Out
              </button>
              <p className="danger-text">
                You will be signed out of your account and redirected to the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}