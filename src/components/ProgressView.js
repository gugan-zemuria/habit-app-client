import { useState } from 'react';
import TodayScreen from './TodayScreen';
import WeeklyPreview from './WeeklyPreview';
import ExportButton from './ExportButton';
import ShareProgress from './ShareProgress';

export default function ProgressView() {
  const [activeTab, setActiveTab] = useState('today');

  const tabs = [
    { id: 'today', label: 'Today', component: TodayScreen },
    { id: 'weekly', label: 'Weekly', component: WeeklyPreview },
    { id: 'share', label: 'Share', component: ShareProgress },
    { id: 'export', label: 'Export', component: ExportButton }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TodayScreen;

  return (
    <div className="progress-view">
      <div className="progress-header">
        <h1>Progress & History</h1>
        <p>Track your daily progress and view your habit history</p>
      </div>

      <div className="progress-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="progress-content">
        <ActiveComponent />
      </div>
    </div>
  );
}