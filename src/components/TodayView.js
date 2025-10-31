'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import Header from './Header';
import StatsCards from './StatsCards';

export default function TodayView() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAccessToken } = useAuth();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const todayHabits = useMemo(() => {
    return habits.map(h => ({
      ...h,
      completedToday: (h.completions || []).some(c => 
        (typeof c === 'string' ? c : c.completion_date)?.split('T')[0] === todayStr
      )
    }));
  }, [habits, todayStr]);

  const todayStats = useMemo(() => {
    const completed = todayHabits.filter(h => h.completedToday).length;
    const total = todayHabits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [todayHabits]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  const fetchHabits = async () => {
    try {
      const token = await getAccessToken();
      const habitsData = await api.getHabits(token);
      setHabits(habitsData);
    } catch (error) {
      setError('Failed to fetch habits');
      console.error('Error fetching habits:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await getAccessToken();
      const statsData = await api.getDashboardStats(token);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHabits(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleToggleCompletion = async (habitId) => {
    try {
      const token = await getAccessToken();
      await api.toggleHabitCompletion(habitId, todayStr, token);
      await fetchHabits();
      await fetchStats();
    } catch (error) {
      setError('Failed to toggle completion');
      console.error('Error toggling completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading today's habits...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="container">
        <div className="main-content">
          {error && <div className="error">⚠️ {error}</div>}
          
          {/* Today's Header */}
          <div className="today-header">
            <h1>📋 Today's Focus</h1>
            <p className="today-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Today's Progress */}
          <div className="today-progress-card">
            <div className="progress-header">
              <h2>Today's Progress</h2>
              <div className="progress-stats">
                <span className="progress-fraction">{todayStats.completed}/{todayStats.total}</span>
                <span className="progress-percentage">{todayStats.percentage}%</span>
              </div>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${todayStats.percentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="progress-message">
              {todayStats.percentage === 100 ? (
                <span className="success-message">🎉 Perfect day! All habits completed!</span>
              ) : todayStats.percentage >= 75 ? (
                <span className="good-message">🔥 Great progress! Keep it up!</span>
              ) : todayStats.percentage >= 50 ? (
                <span className="okay-message">💪 Good start! You're halfway there!</span>
              ) : (
                <span className="encourage-message">🌱 Every step counts! Let's build momentum!</span>
              )}
            </div>
          </div>

          {/* Overall Stats */}
          {stats && <StatsCards stats={stats} />}

          {/* Today's Habits Checklist */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Today's Habits</h2>
              {habits.length > 0 && (
                <a href="/habits" className="btn btn-secondary btn-small">
                  🎯 Manage All Habits
                </a>
              )}
            </div>

            {habits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>No habits yet!</h3>
                <p>Create your first habit to start building positive routines.</p>
                <a href="/habits" className="btn btn-primary">
                  Create Your First Habit
                </a>
              </div>
            ) : (
              <div className="today-habits-list">
                {todayHabits.map(habit => (
                  <div 
                    key={habit.id} 
                    className={`habit-checklist-item ${habit.completedToday ? 'completed' : ''}`}
                  >
                    <div className="habit-checkbox">
                      <input
                        type="checkbox"
                        checked={habit.completedToday}
                        onChange={() => handleToggleCompletion(habit.id)}
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
                        {habit.category && (
                          <span className="habit-category-tag">📁 {habit.category}</span>
                        )}
                      </div>
                      {habit.description && (
                        <div className="habit-description">{habit.description}</div>
                      )}
                    </div>
                    
                    <div className="habit-streak">
                      <span className="streak-number">{habit.current_streak || 0}</span>
                      <span className="streak-label">day streak</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Overview */}
          {habits.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">This Week's Overview</h2>
              </div>
              
              <div className="weekly-overview">
                {/* Days Header */}
                <div className="weekly-days-header">
                  <div className="habit-column-header">Habits</div>
                  {last7Days.map((d, idx) => {
                    const isToday = d.toISOString().split('T')[0] === todayStr;
                    return (
                      <div key={idx} className={`day-column-header ${isToday ? 'today' : ''}`}>
                        <div className="day-name">
                          {d.toLocaleDateString(undefined, { weekday: 'short' })}
                        </div>
                        <div className="day-number">
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Habits Rows */}
                <div className="weekly-habits">
                  {todayHabits.slice(0, 5).map(habit => (
                    <div key={habit.id} className="weekly-habit-row">
                      <div className="habit-info-cell">
                        <span className="habit-emoji">{habit.emoji}</span>
                        <span className="habit-name">{habit.name}</span>
                      </div>
                      
                      <div className="habit-days">
                        {last7Days.map((d, idx) => {
                          const dateStr = d.toISOString().split('T')[0];
                          const completed = (habit.completions || []).some(c => 
                            (typeof c === 'string' ? c : c.completion_date)?.split('T')[0] === dateStr
                          );
                          const isToday = dateStr === todayStr;
                          
                          return (
                            <div key={idx} className={`day-status ${completed ? 'completed' : 'incomplete'} ${isToday ? 'today' : ''}`}>
                              <div className="status-indicator">
                                {completed ? '✅' : '⭕'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {habits.length > 5 && (
                <div className="weekly-footer">
                  <p className="showing-text">Showing {Math.min(5, habits.length)} of {habits.length} habits</p>
                  <a href="/calendar" className="btn btn-secondary btn-small">
                    📅 View Full Calendar
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}