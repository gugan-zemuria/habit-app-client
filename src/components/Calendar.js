'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [selectedDateCompletions, setSelectedDateCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { getAccessToken } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchCompletionsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const token = await getAccessToken();
      const [habitsData, completionsData] = await Promise.all([
        api.getHabits(token),
        api.getCalendarCompletions(token)
      ]);
      
      setHabits(habitsData);
      setCompletions(completionsData);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching calendar data:', error);
      setLoading(false);
    }
  };

  const fetchCompletionsForDate = async (date) => {
    try {
      const token = await getAccessToken();
      const data = await api.getCompletionsForDate(date, token);
      setSelectedDateCompletions(data.completions || []);
    } catch (error) {
      console.error('Error fetching completions for date:', error);
    }
  };

  const toggleHabitCompletion = async (date, habitId) => {
    // Prevent completing habits for future dates
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      setError('Cannot complete habits for future dates');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = await getAccessToken();
      
      // Get current completions for the date
      const currentCompletions = completions[date] || [];
      let newCompletions;
      
      if (currentCompletions.includes(habitId)) {
        // Remove completion
        newCompletions = currentCompletions.filter(id => id !== habitId);
      } else {
        // Add completion
        newCompletions = [...currentCompletions, habitId];
      }
      
      // Update on server
      await api.updateCompletionsForDate(date, newCompletions, token);
      
      // Update local state
      setCompletions(prev => ({
        ...prev,
        [date]: newCompletions
      }));
      
      // Refresh selected date completions if it's the same date
      if (selectedDate === date) {
        fetchCompletionsForDate(date);
      }
    } catch (error) {
      setError('Failed to update completion');
      console.error('Error toggling completion:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDayStatus = (dateStr) => {
    // Don't show completion status for future dates
    const today = new Date().toISOString().split('T')[0];
    if (dateStr > today) return 'none';
    
    const completed = completions[dateStr] || [];
    if (completed.length === 0) return 'none';
    if (completed.length === habits.length) return 'complete';
    return 'partial';
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDate(null); // Clear selection when changing months
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const dateStr = isValidDay ? formatDate(year, month, dayNumber) : '';
      const isFutureDate = dateStr > today;
      // Force future dates to have 'none' status regardless of data
      const status = isValidDay ? (isFutureDate ? 'none' : getDayStatus(dateStr)) : 'empty';
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      
      days.push(
        <div
          key={i}
          className={`calendar-day ${status} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isFutureDate ? 'future' : ''}`}
          onClick={() => isValidDay && setSelectedDate(dateStr)}
        >
          {isValidDay && (
            <>
              <span className="day-number">{dayNumber}</span>
              {!isFutureDate && status === 'complete' && <span className="status-indicator">✓</span>}
              {!isFutureDate && status === 'partial' && <span className="status-indicator">●</span>}
            </>
          )}
        </div>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {error && <div className="error">{error}</div>}
      
      <div className="calendar-view">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)} className="nav-button">
            ←
          </button>
          <h2>{monthName}</h2>
          <button onClick={() => changeMonth(1)} className="nav-button">
            →
          </button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      {selectedDate && (
        <div className="day-detail">
          <div className="detail-header">
            <h3>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="close-button">
              ✕
            </button>
          </div>

          <div className="habits-list">
            {habits.map(habit => {
              const isCompleted = (completions[selectedDate] || []).includes(habit.id);
              const isFutureDate = selectedDate > today;
              return (
                <div
                  key={habit.id}
                  className={`habit-item ${isCompleted ? 'completed' : ''} ${isFutureDate ? 'future-date' : ''}`}
                  onClick={() => !isFutureDate && toggleHabitCompletion(selectedDate, habit.id)}
                  style={{ cursor: isFutureDate ? 'not-allowed' : 'pointer', opacity: isFutureDate ? 0.6 : 1 }}
                >
                  <span className="habit-icon">{habit.emoji}</span>
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-check">{isCompleted ? '✓' : ''}</span>
                  {isFutureDate && <span className="future-indicator">🔒</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}