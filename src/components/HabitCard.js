'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function HabitCard({ habit, onEdit, onDelete, onToggleCompletion }) {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    fetchCompletions();
  }, [habit.id]);

  const fetchCompletions = async () => {
    try {
      const token = await getAccessToken();
      const completionsData = await api.getHabitCompletions(habit.id, token);
      setCompletions(completionsData.map(c => c.completion_date));
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const handleToggleToday = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    await onToggleCompletion(habit.id, today);
    await fetchCompletions();
    setLoading(false);
  };

  const generateLast14Days = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const isCompleted = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return completions.includes(dateStr);
  };

  const isToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    const dateStr = date.toISOString().split('T')[0];
    return today === dateStr;
  };

  const todayCompleted = isCompleted(new Date());

  return (
    <div className="habit-card">
      <div className="habit-header">
        <div className="habit-info">
          <div className="habit-title">
            <span style={{ fontSize: '1.5rem' }}>{habit.emoji}</span>
            <span>{habit.name}</span>
          </div>
          {habit.description && (
            <div className="habit-description">{habit.description}</div>
          )}
        </div>
        
        <div className="habit-actions">
          <button
            className={`btn ${todayCompleted ? 'btn-success' : 'btn-secondary'}`}
            onClick={handleToggleToday}
            disabled={loading}
          >
            {loading ? '...' : (todayCompleted ? '✓ Done' : 'Mark Done')}
          </button>
          <button
            className="btn btn-secondary btn-small"
            onClick={() => onEdit(habit)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-small"
            onClick={() => onDelete(habit.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="habit-stats">
        <div className="stat-item">
          <div className="stat-value">{habit.current_streak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{habit.longest_streak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Last 14 Days
        </div>
        <div className="completion-history">
          {generateLast14Days().map((date, index) => (
            <div
              key={index}
              className={`completion-day ${isCompleted(date) ? 'completed' : ''} ${isToday(date) ? 'today' : ''}`}
              title={date.toLocaleDateString()}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}