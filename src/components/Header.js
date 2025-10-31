'use client';

import { useTheme } from '../contexts/ThemeContext';
import Navigation from './Navigation';

export default function Header({ onCreateHabit }) {
  const { theme, toggleTheme } = useTheme();



  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span>🎯</span>
            <span>Habits</span>
          </div>
          
          <Navigation />

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span className="material-symbols-outlined">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            
            {onCreateHabit && (
              <button
                className="btn btn-primary btn-small"
                onClick={onCreateHabit}
              >
                <span>+</span>
                <span className="btn-text">New</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}