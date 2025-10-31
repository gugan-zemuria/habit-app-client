'use client';

import Navigation from './Navigation';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🎯 Habits</div>
      </div>
      <Navigation />
      <div className="sidebar-footer">
        <div className="sidebar-hint">v1.0</div>
      </div>
    </aside>
  );
}


