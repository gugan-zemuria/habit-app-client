import { useState, useEffect } from 'react';

export default function PublicShareView({ userId }) {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicData();
  }, [userId]);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, generate sample data
      // In a real app, you'd fetch from your API with the userId
      const sampleData = generateSampleData();
      setShareData(sampleData);
      
    } catch (error) {
      setError('Failed to load shared progress');
      console.error('Error fetching public data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleHabits = [
      { id: 1, name: 'Read', emoji: '📚', streak: 15 },
      { id: 2, name: 'Workout', emoji: '💪', streak: 8 },
      { id: 3, name: 'Meditate', emoji: '🧘', streak: 22 },
      { id: 4, name: 'Code', emoji: '💻', streak: 12 },
      { id: 5, name: 'Hydrate', emoji: '💧', streak: 30 }
    ];

    const totalStreak = sampleHabits.reduce((sum, h) => sum + h.streak, 0);
    const bestStreak = Math.max(...sampleHabits.map(h => h.streak));

    return {
      username: 'habitmaster',
      currentStreak: totalStreak,
      bestStreak: bestStreak,
      habits: sampleHabits,
      totalHabits: sampleHabits.length
    };
  };

  if (loading) {
    return (
      <div className="public-share-loading">
        <div className="spinner"></div>
        <p>Loading shared progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-share-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/'}
        >
          Start Your Own Habit Journey
        </button>
      </div>
    );
  }

  return (
    <div className="public-share-view">
      <div className="share-card">
        <div className="card-header">
          <h1>🎯 Habit Streak</h1>
          {shareData.username && (
            <p className="username">@{shareData.username}</p>
          )}
        </div>

        <div className="main-stats">
          <div className="stat-display">
            <div className="stat-icon">🔥</div>
            <div className="stat-number">{shareData.currentStreak}</div>
            <div className="stat-label">Total Current Streak</div>
          </div>
          
          <div className="stat-display">
            <div className="stat-icon">🏆</div>
            <div className="stat-number">{shareData.bestStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>

        <div className="habits-showcase">
          <h3>Active Habits</h3>
          <div className="habits-list">
            {shareData.habits.map(habit => (
              <div key={habit.id} className="habit-item">
                <span className="habit-emoji">{habit.emoji}</span>
                <span className="habit-name">{habit.name}</span>
                <span className="habit-streak">{habit.streak} days</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-footer">
          <p>Keep building those habits! 💪</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Start Your Own Journey
          </button>
        </div>
      </div>

      <div className="app-promotion">
        <h2>Ready to build your own habits?</h2>
        <p>Join thousands of people building better habits every day.</p>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Track Progress</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔥</span>
            <span>Build Streaks</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>Share Success</span>
          </div>
        </div>
        <button 
          className="btn btn-success btn-large"
          onClick={() => window.location.href = '/'}
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
}