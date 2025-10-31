import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ShareProgress() {
  const [habits, setHabits] = useState([]);
  const [shareData, setShareData] = useState(null);
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);
  const { getAccessToken, user } = useAuth();

  useEffect(() => {
    fetchShareData();
  }, []);

  const fetchShareData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const habitsData = await api.getHabits(token);
      
      // Calculate stats
      const activeHabits = habitsData.filter(h => !h.is_archived);
      const currentStreaks = activeHabits.map(h => h.current_streak || 0);
      const longestStreaks = activeHabits.map(h => h.longest_streak || 0);
      
      const totalCurrentStreak = currentStreaks.reduce((sum, streak) => sum + streak, 0);
      const bestStreak = Math.max(...longestStreaks, 0);
      const avgStreak = currentStreaks.length > 0 ? Math.round(totalCurrentStreak / currentStreaks.length) : 0;
      
      // Get top habits by streak
      const topHabits = activeHabits
        .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
        .slice(0, 5);

      setHabits(activeHabits);
      setShareData({
        currentStreak: totalCurrentStreak,
        bestStreak,
        avgStreak,
        totalHabits: activeHabits.length,
        topHabits
      });
      
      // Set default username from email
      if (user?.email) {
        setUsername(user.email.split('@')[0]);
      }
    } catch (error) {
      console.error('Error fetching share data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareCard = async () => {
    if (!shareData || !canvasRef.current) return;

    setGenerating(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (Instagram story size)
    canvas.width = 1080;
    canvas.height = 1920;

    // Theme colors
    const themes = {
      light: {
        bg: '#ffffff',
        primary: '#3b82f6',
        secondary: '#6b7280',
        text: '#1f2937',
        accent: '#f8fafc'
      },
      dark: {
        bg: '#1f2937',
        primary: '#60a5fa',
        secondary: '#9ca3af',
        text: '#f9fafb',
        accent: '#374151'
      }
    };

    const colors = themes[theme];

    // Clear canvas and set background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(1, colors.accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Habit Streak', canvas.width / 2, 200);

    // Username
    if (username) {
      ctx.fillStyle = colors.secondary;
      ctx.font = '50px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`@${username}`, canvas.width / 2, 280);
    }

    // Main stats container
    const statsY = 400;
    const statWidth = 450;
    const statHeight = 200;
    const statSpacing = 50;

    // Current streak stat
    ctx.fillStyle = colors.accent;
    ctx.fillRect((canvas.width - statWidth) / 2, statsY, statWidth, statHeight);
    
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥', canvas.width / 2, statsY + 100);
    
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(shareData.currentStreak.toString(), canvas.width / 2, statsY + 160);
    
    ctx.fillStyle = colors.secondary;
    ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Total Current Streak', canvas.width / 2, statsY + 190);

    // Best streak stat
    const bestStreakY = statsY + statHeight + statSpacing;
    ctx.fillStyle = colors.accent;
    ctx.fillRect((canvas.width - statWidth) / 2, bestStreakY, statWidth, statHeight);
    
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('🏆', canvas.width / 2, bestStreakY + 100);
    
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(shareData.bestStreak.toString(), canvas.width / 2, bestStreakY + 160);
    
    ctx.fillStyle = colors.secondary;
    ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Best Streak', canvas.width / 2, bestStreakY + 190);

    // Habits section
    const habitsY = bestStreakY + statHeight + 100;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Top Habits', canvas.width / 2, habitsY);

    // Display top habits
    const habitStartY = habitsY + 80;
    shareData.topHabits.slice(0, 5).forEach((habit, index) => {
      const y = habitStartY + (index * 120);
      
      // Habit emoji and name
      ctx.fillStyle = colors.text;
      ctx.font = '70px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      const habitText = `${habit.emoji || '📝'} ${habit.name}`;
      ctx.fillText(habitText, 150, y);
      
      // Streak badge
      const streakText = `${habit.current_streak || 0} days`;
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(streakText, canvas.width - 150, y);
    });

    // Footer
    const footerY = canvas.height - 200;
    ctx.fillStyle = colors.secondary;
    ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Keep building those habits! 💪', canvas.width / 2, footerY);
    
    ctx.font = '35px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Generated with Habit Tracker', canvas.width / 2, footerY + 50);

    setGenerating(false);
  };

  const downloadShareCard = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `habit-streak-${username || 'share'}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/share/${user?.id || 'demo'}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="share-progress">
      <div className="share-header">
        <h2>Share Your Progress</h2>
        <p>Create a shareable card to show off your habit streaks!</p>
      </div>

      {shareData && (
        <div className="share-content">
          {/* Stats Preview */}
          <div className="stats-preview">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{shareData.currentStreak}</div>
              <div className="stat-label">Total Current Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{shareData.bestStreak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{shareData.avgStreak}</div>
              <div className="stat-label">Average Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{shareData.totalHabits}</div>
              <div className="stat-label">Active Habits</div>
            </div>
          </div>

          {/* Customization Options */}
          <div className="share-options">
            <div className="option-group">
              <label htmlFor="username">Username/Handle (optional):</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@yourhandle"
                className="form-input"
              />
            </div>

            <div className="option-group">
              <label htmlFor="theme">Theme:</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="form-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="generate-section">
            <button
              className="btn btn-primary"
              onClick={generateShareCard}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Share Card'}
            </button>
          </div>

          {/* Canvas (hidden) */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {/* Preview and Actions */}
          {canvasRef.current && (
            <div className="share-actions">
              <div className="card-preview">
                <h3>Preview</h3>
                <canvas
                  width="216"
                  height="384"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    maxWidth: '100%'
                  }}
                  ref={(previewCanvas) => {
                    if (previewCanvas && canvasRef.current) {
                      const ctx = previewCanvas.getContext('2d');
                      ctx.drawImage(canvasRef.current, 0, 0, 216, 384);
                    }
                  }}
                />
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-success"
                  onClick={downloadShareCard}
                >
                  📱 Download Image
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={copyShareLink}
                >
                  🔗 Copy Share Link
                </button>
              </div>
            </div>
          )}

          {/* Top Habits Display */}
          <div className="top-habits">
            <h3>Your Top Habits</h3>
            <div className="habits-grid">
              {shareData.topHabits.map(habit => (
                <div key={habit.id} className="habit-badge">
                  <span className="habit-emoji">{habit.emoji || '📝'}</span>
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-streak">{habit.current_streak || 0} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}