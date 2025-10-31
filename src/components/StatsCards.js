export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card-value">{stats.totalHabits}</div>
        <div className="stat-card-label">Total Habits</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-value">{stats.completedToday}</div>
        <div className="stat-card-label">Completed Today</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-value">{stats.completionRate}%</div>
        <div className="stat-card-label">Completion Rate</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-value">{stats.longestStreak}</div>
        <div className="stat-card-label">Longest Streak</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-value">{stats.activeStreaks}</div>
        <div className="stat-card-label">Active Streaks</div>
      </div>
    </div>
  );
}