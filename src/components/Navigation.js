'use client';

import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Today', icon: '📋' },
    { path: '/habits', label: 'Habits', icon: '🎯' },
    { path: '/progress', label: 'Progress', icon: '📊' },
    { path: '/share', label: 'Share', icon: '📱' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="nav-tabs">
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`nav-tab ${isActive(item.path) ? 'active' : ''}`}
        >
          <span className="nav-tab-icon">{item.icon}</span>
          <span className="nav-tab-label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}