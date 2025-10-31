import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function TodayScreen() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAccessToken } = useAuth();

  useEffect(() => {
    fetchTodayHabits();
  }, []);

  const fetchTodayHabits = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const habitsData = await api.getHabits(token);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Process habits with today's completion status
      const habitsWithToday = habitsData.map(habit => {
        const completions = habit.completions || [];
        const completedToday = completions.some(c => 
          c.completion_date && c.completion_date.split('T')[0] === today
        );
        
        return {
          ...habit,
          completedToday,
          streak: habit.current_streak || 0
        };
      });
      
      setHabits(habitsWithToday);
    } catch (error) {
      setError('Failed to fetch today\'s habits');
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId) => {
    try {
      const token = await getAccessToken();
      const today = new Date().toISOString().split('T')[0];
      
      await api.toggleHabitCompletion(habitId, today, token);
      
      // Update local state
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, completedToday: !habit.completedToday }
          : habit
      ));
    } catch (error) {
      setError('Failed to toggle habit completion');
      console.error('Error toggling habit:', error);
    }
  };

  const getTodayStats = () => {
    const completed = habits.filter(h => h.completedToday).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = getTodayStats();

  return (
    <div className="today-screen">
      <div className="today-header">
        <h2>Today's Habits</h2>
        <div className="today-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="today-stats">
        <div className="progress-circle">
          <div className="progress-text">
            <span className="progress-number">{stats.completed}/{stats.total}</span>
            <span className="progress-label">Completed</span>
          </div>
        </div>
        <div className="progress-percentage">
          <div className="percentage-bar">
            <div 
              className="percentage-fill" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <span className="percentage-text">{stats.percentage}% Complete</span>
        </div>
      </div>

      <div className="habits-checklist">
        {habits.length === 0 ? (
          <div className="no-habits">
            <p>No habits found. Create some habits to get started!</p>
          </div>
        ) : (
          habits.map(habit => (
            <div 
              key={habit.id} 
              className={`habit-checklist-item ${habit.completedToday ? 'completed' : ''}`}
            >
              <div className="habit-checkbox">
                <input
                  type="checkbox"
                  checked={habit.completedToday}
                  onChange={() => toggleHabit(habit.id)}
                  id={`habit-${habit.id}`}
                />
                <label htmlFor={`habit-${habit.id}`} className="checkbox-label">
                  <span className="checkmark">✓</span>
                </label>
              </div>
              
              <div className="habit-info">
                <div className="habit-main">
                  <span className="habit-emoji">{habit.emoji}</span>
                  <span className="habit-name">{habit.name}</span>
                </div>
                {habit.description && (
                  <div className="habit-description">{habit.description}</div>
                )}
              </div>
              
              <div className="habit-streak">
                <span className="streak-number">{habit.streak}</span>
                <span className="streak-label">day streak</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}