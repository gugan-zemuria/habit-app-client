'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { applyFiltersAndSort } from '../lib/habitFilters';
import HabitCard from './HabitCard';
import HabitFilters from './HabitFilters';
import HabitModal from './HabitModal';
import Header from './Header';
import StatsCards from './StatsCards';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarMap, setCalendarMap] = useState({}); // { 'YYYY-MM-DD': [habitId, ...] }
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'today'
  const [filters, setFilters] = useState({
    completion: 'all',
    category: 'all',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { getAccessToken } = useAuth();

  // Apply filters and sorting to habits
  const filteredAndSortedHabits = useMemo(() => {
    // Convert habits to the format expected by filter functions
    const habitsWithCompletions = habits.map(habit => ({
      ...habit,
      completionDates: habit.completions || [],
      isArchived: habit.is_active === false,
      createdAt: habit.created_at
    }));

    return applyFiltersAndSort(
      habitsWithCompletions,
      {
        completion: filters.completion,
        category: filters.category,
        status: filters.status
      },
      filters.sortBy,
      filters.sortOrder
    );
  }, [habits, filters]);



  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayHabits = useMemo(() => {
    return habits.map(h => ({
      ...h,
      completedToday: (h.completions || []).some(c => (typeof c === 'string' ? c : c.completion_date)?.split('T')[0] === todayStr)
    }));
  }, [habits, todayStr]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  // Calendar helpers/state
  const [monthOffset, setMonthOffset] = useState(0);

  const viewMonth = useMemo(() => {
    const d = new Date();
    const copy = new Date(d.getFullYear(), d.getMonth(), 1);
    copy.setMonth(copy.getMonth() + monthOffset);
    return copy;
  }, [monthOffset]);

  const activeHabitCount = useMemo(() => habits.filter(h => h.is_active !== false).length, [habits]);

  const getDateKey = (date) => date.toISOString().split('T')[0];
  const isPastDay = (date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < today;
  };
  const getStatusForDate = (date) => {
    const dateKey = typeof date === 'string' ? date : getDateKey(date);
    const ids = calendarMap[dateKey] || [];
    if (activeHabitCount === 0) return 'none';
    if (ids.length >= activeHabitCount) return 'complete';
    if (ids.length > 0) return 'partial';
    return isPastDay(typeof date === 'string' ? new Date(date) : date) ? 'missed' : 'none';
  };

  const monthMatrix = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

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

  const fetchCalendar = async () => {
    try {
      const token = await getAccessToken();
      const data = await api.getCalendarCompletions(token);
      setCalendarMap(data || {});
    } catch (e) {
      console.error('Error fetching calendar:', e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHabits(), fetchStats(), fetchCalendar()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleCreateHabit = () => {
    setEditingHabit(null);
    setShowModal(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  const handleSaveHabit = async (habitData) => {
    try {
      const token = await getAccessToken();
      console.log('Saving habit:', { habitData, token: token ? 'present' : 'missing' });
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      if (editingHabit) {
        await api.updateHabit(editingHabit.id, habitData, token);
      } else {
        await api.createHabit(habitData, token);
      }
      
      await fetchHabits();
      await fetchStats();
      setShowModal(false);
      setEditingHabit(null);
    } catch (error) {
      setError('Failed to save habit');
      console.error('Error saving habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      const token = await getAccessToken();
      await api.deleteHabit(habitId, token);
      await fetchHabits();
      await fetchStats();
    } catch (error) {
      setError('Failed to delete habit');
      console.error('Error deleting habit:', error);
    }
  };

  const handleToggleCompletion = async (habitId, date) => {
    try {
      const token = await getAccessToken();
      await api.toggleHabitCompletion(habitId, date, token);
      await fetchHabits();
      await fetchStats();
    } catch (error) {
      setError('Failed to toggle completion');
      console.error('Error toggling completion:', error);
    }
  };

  const handleToggleTodayCheckbox = async (habitId) => {
    const date = todayStr;
    // Toggle endpoint toggles: call once regardless of checked value
    await handleToggleCompletion(habitId, date);
  };

  const downloadCsv = (filename, csv) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    try {
      const token = await getAccessToken();
      const [calendar, habitsList] = await Promise.all([
        api.getCalendarCompletions(token),
        api.getHabits(token)
      ]);

      const habitIdToName = new Map(habitsList.map(h => [h.id, h.name]));
      const habitIdToCategory = new Map(habitsList.map(h => [h.id, h.category || '']));

      const dates = Object.keys(calendar).sort();
      const rows = [['date', 'habit_id', 'habit_name', 'category']];
      dates.forEach(date => {
        const ids = calendar[date] || [];
        if (ids.length === 0) {
          rows.push([date, '', '', '']);
        } else {
          ids.forEach(id => {
            rows.push([date, id, habitIdToName.get(id) || '', habitIdToCategory.get(id) || '']);
          });
        }
      });

      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadCsv(`habit_logs_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch (e) {
      console.error('CSV export failed:', e);
      setError('Failed to export CSV');
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
    <div>
      <Header onCreateHabit={handleCreateHabit} />
      
      <div className="container">
        <div className="main-content">
          {error && <div className="error">{error}</div>}
          
          {stats && <StatsCards stats={stats} />}
          
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">Your Habits</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {habits.length > 0 && (
                    <>
                      <button
                        className={`btn btn-small ${activeView === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveView(activeView === 'today' ? 'all' : 'today')}
                      >
                        {activeView === 'today' ? '📋 Show All' : '📋 Today View'}
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        {showFilters ? '🔍 Hide Filters' : '🔍 Filters'} ({filteredAndSortedHabits.length})
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={handleExportCsv}
                        title="Export last 3 months"
                      >
                        📊 Export
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar (Monthly) */}
            {habits.length > 0 && (
              <div className="calendar-view" style={{ marginBottom: '1rem' }}>
                <div className="calendar-header">
                  <button className="nav-button" onClick={() => setMonthOffset(m => m - 1)} aria-label="Previous month">‹</button>
                  <h2>{viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
                  <button className="nav-button" onClick={() => setMonthOffset(m => m + 1)} aria-label="Next month">›</button>
                </div>
                <div className="weekdays">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((wd) => (
                    <div key={wd} className="weekday">{wd}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {monthMatrix.map((d, idx) => {
                    if (!d) return <div key={idx} className="calendar-day empty" />;
                    const isToday = d.toDateString() === new Date().toDateString();
                    const status = getStatusForDate(d);
                    const dayCls = ['calendar-day'];
                    if (isToday) dayCls.push('today');
                    if (status === 'complete') dayCls.push('complete');
                    if (status === 'partial') dayCls.push('partial');
                    if (status === 'missed') dayCls.push('missed');
                    if (status === 'none') dayCls.push('none');
                    return (
                      <div key={idx} className={dayCls.join(' ')} title={d.toLocaleDateString()}>
                        <div className="day-number">{d.getDate()}</div>
                        <div className="status-indicator">•</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter Panel */}
            {showFilters && habits.length > 0 && (
              <HabitFilters
                habits={habits}
                onFiltersChange={setFilters}
                currentFilters={filters}
                filteredCount={filteredAndSortedHabits.length}
              />
            )}
            
            {habits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>No habits yet. Create your first habit to get started!</p>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateHabit}
                  style={{ marginTop: '1rem' }}
                >
                  Create Your First Habit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1">
                {filteredAndSortedHabits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <p>No habits match your current filters.</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setFilters({
                        completion: 'all',
                        category: 'all',
                        status: 'active',
                        sortBy: 'name',
                        sortOrder: 'asc'
                      })}
                      style={{ marginTop: '1rem' }}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {activeView === 'today' && (
                      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Today</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {todayHabits.map(h => (
                            <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <input
                                type="checkbox"
                                checked={!!h.completedToday}
                                onChange={() => handleToggleTodayCheckbox(h.id)}
                              />
                              <span style={{ fontSize: '1.25rem' }}>{h.emoji}</span>
                              <span>{h.name}</span>
                              <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.85rem' }}>
                                Streak: {h.current_streak} (max {h.longest_streak})
                              </span>
                            </label>
                          ))}
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>This Week's Overview</div>
                          <div className="weekly-preview">
                            <div className="weekly-grid-container">
                              <div className="weekly-grid">
                                {/* Header Row */}
                                <div className="grid-header">
                                  <div className="habit-header-cell">Habits</div>
                                  {last7Days.map((d, idx) => {
                                    const isToday = d.toDateString() === new Date().toDateString();
                                    return (
                                      <div key={`hdr-${idx}`} className={`date-header-cell ${isToday ? 'today' : ''}`}>
                                        <span className="day-name">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                        <span className="day-number">{d.getDate()}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Habit Rows */}
                                {todayHabits.map((h) => (
                                  <div key={`row-${h.id}`} className="habit-row">
                                    <div className="habit-cell">
                                      <span className="habit-emoji">{h.emoji}</span>
                                      <span className="habit-name" title={h.name}>{h.name}</span>
                                      <span className="habit-streak">
                                        <span className="streak-number">{h.current_streak}</span>
                                      </span>
                                    </div>
                                    {last7Days.map((d, idx) => {
                                      const ds = d.toISOString().split('T')[0];
                                      const done = (h.completions || []).some(c => (typeof c === 'string' ? c : c.completion_date)?.split('T')[0] === ds);
                                      const isToday = d.toDateString() === new Date().toDateString();
                                      const status = done ? 'completed' : getStatusForDate(d) === 'partial' ? 'partial' : getStatusForDate(d) === 'missed' ? 'missed' : 'none';
                                      return (
                                        <div
                                          key={`cell-${h.id}-${idx}`}
                                          className={`completion-cell ${isToday ? 'today' : ''} ${status}`}
                                          title={`${h.name} • ${d.toLocaleDateString()}`}
                                        >
                                          <span className="completion-icon">•</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {filteredAndSortedHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                        onToggleCompletion={handleToggleCompletion}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSaveHabit}
          onClose={() => {
            setShowModal(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}