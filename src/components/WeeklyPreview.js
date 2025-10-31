import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function WeeklyPreview() {
  const [habits, setHabits] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAccessToken } = useAuth();

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Generate 7 days from start of week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const habitsData = await api.getHabits(token);
      const dates = generateWeekDates();
      
      // Process habits with weekly completion data
      const habitsWithWeekly = habitsData.map(habit => {
        const completions = habit.completions || [];
        const weeklyCompletions = {};
        
        dates.forEach(date => {
          weeklyCompletions[date] = completions.some(c => 
            c.completion_date && c.completion_date.split('T')[0] === date
          );
        });
        
        return {
          ...habit,
          weeklyCompletions
        };
      });
      
      setHabits(habitsWithWeekly);
      setWeekDates(dates);
    } catch (error) {
      setError('Failed to fetch weekly data');
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const getWeekStats = () => {
    const totalPossible = habits.length * weekDates.length;
    const totalCompleted = habits.reduce((sum, habit) => {
      return sum + weekDates.filter(date => habit.weeklyCompletions[date]).length;
    }, 0);
    
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    return { totalCompleted, totalPossible, percentage };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const weekStats = getWeekStats();

  return (
    <div className="weekly-preview">
      <div className="weekly-header">
        <h2>Weekly Preview</h2>
        <div className="week-stats">
          <span className="week-completion">
            {weekStats.totalCompleted}/{weekStats.totalPossible} completed ({weekStats.percentage}%)
          </span>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {habits.length === 0 ? (
        <div className="no-habits">
          <p>No habits found. Create some habits to see your weekly progress!</p>
        </div>
      ) : (
        <div className="weekly-grid-container">
          <div className="weekly-grid">
            {/* Header row */}
            <div className="grid-header">
              <div className="habit-header-cell">Habit</div>
              {weekDates.map(date => (
                <div key={date} className={`date-header-cell ${isToday(date) ? 'today' : ''}`}>
                  <div className="day-name">{getDayName(date)}</div>
                  <div className="day-number">{getDayNumber(date)}</div>
                </div>
              ))}
            </div>

            {/* Habit rows */}
            {habits.map(habit => (
              <div key={habit.id} className="habit-row">
                <div className="habit-cell">
                  <span className="habit-emoji">{habit.emoji}</span>
                  <span className="habit-name">{habit.name}</span>
                </div>
                {weekDates.map(date => (
                  <div 
                    key={date} 
                    className={`completion-cell ${habit.weeklyCompletions[date] ? 'completed' : 'not-completed'} ${isToday(date) ? 'today' : ''}`}
                  >
                    <span className="completion-icon">
                      {habit.weeklyCompletions[date] ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}