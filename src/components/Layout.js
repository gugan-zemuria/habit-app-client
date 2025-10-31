'use client';

import { ThemeProvider } from '../contexts/ThemeContext';
import Header from './Header';

export default function Layout({ children, onCreateHabit }) {
  return (
    <ThemeProvider>
      <div className="app">
        <Header onCreateHabit={onCreateHabit} />
        <main className="main-content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}