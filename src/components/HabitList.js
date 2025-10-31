import React, { useState, useMemo } from 'react';
import HabitFilters from './HabitFilters';
import { applyFiltersAndSort } from '../lib/habitFilters';

const HabitList = ({ habits, onHabitUpdate }) => {
  const [filters, setFilters] = useState({
    completion: 'all',
    category: 'all',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Apply filters and sorting to habits
  const filteredAndSortedHabits = useMemo(() => {
    return applyFiltersAndSort(
      habits,
      {
        completion: filters.completion,
        category: filters.category,
        status: filters.status
      },
      filters.sortBy,
      filters.sortOrder
    );
  }, [habits, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleHabitCompletion = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const isCompletedToday = habit.completionDates?.includes(today);
    let updatedCompletionDates;

    if (isCompletedToday) {
      // Remove today's date
      updatedCompletionDates = habit.completionDates.filter(date => date !== today);
    } else {
      // Add today's date
      updatedCompletionDates = [...(habit.completionDates || []), today];
    }

    onHabitUpdate(habitId, { completionDates: updatedCompletionDates });
  };

  const calculateStreak = (completionDates) => {
    if (!completionDates || completionDates.length === 0) return 0;
    
    const sortedDates = completionDates
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const completionDate = new Date(sortedDates[i]);
      completionDate.setHours(0, 0, 0, 0);
      
      if (completionDate.getTime() === checkDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <div className="habit-list-container">
      {/* Filter Toggle Button */}
      <div className="filter-header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="toggle-filters-btn"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'} ({filteredAndSortedHabits.length} habits)
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <HabitFilters
          habits={habits}
          onFiltersChange={handleFiltersChange}
          currentFilters={filters}
        />
      )}

      {/* Habits List */}
      <div className="habits-grid">
        {filteredAndSortedHabits.length === 0 ? (
          <div className="no-habits">
            <p>No habits match your current filters.</p>
          </div>
        ) : (
          filteredAndSortedHabits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.completionDates?.includes(today);
            const currentStreak = calculateStreak(habit.completionDates);

            return (
              <div key={habit.id} className={`habit-card ${isCompletedToday ? 'completed' : ''}`}>
                <div className="habit-header">
                  <h3>{habit.name}</h3>
                  {habit.category && (
                    <span className="habit-category">{habit.category}</span>
                  )}
                </div>
                
                {habit.description && (
                  <p className="habit-description">{habit.description}</p>
                )}

                <div className="habit-stats">
                  <div className="stat">
                    <span className="stat-label">Current Streak:</span>
                    <span className="stat-value">{currentStreak} days</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Completions:</span>
                    <span className="stat-value">{habit.completionDates?.length || 0}</span>
                  </div>
                </div>

                {habit.tags && habit.tags.length > 0 && (
                  <div className="habit-tags">
                    {habit.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="habit-actions">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`completion-btn ${isCompletedToday ? 'completed' : ''}`}
                  >
                    {isCompletedToday ? '✓ Completed Today' : 'Mark Complete'}
                  </button>
                </div>

                {habit.isArchived && (
                  <div className="archived-badge">Archived</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitList;