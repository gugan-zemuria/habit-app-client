import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getAccessToken } = useAuth();

  const exportToCSV = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await getAccessToken();
      const habits = await api.getHabits(token);
      
      // Generate CSV content
      const csvContent = generateCSV(habits);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `habits_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setError('Failed to export data');
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (habits) => {
    const headers = [
      'Habit Name',
      'Description', 
      'Emoji',
      'Category',
      'Created Date',
      'Current Streak',
      'Longest Streak',
      'Total Completions',
      'Completion Date',
      'Is Archived'
    ];

    let csvContent = headers.join(',') + '\n';

    habits.forEach(habit => {
      const baseRow = [
        `"${habit.name || ''}"`,
        `"${habit.description || ''}"`,
        `"${habit.emoji || ''}"`,
        `"${habit.category || ''}"`,
        `"${habit.created_at ? new Date(habit.created_at).toLocaleDateString() : ''}"`,
        habit.current_streak || 0,
        habit.longest_streak || 0,
        (habit.completions || []).length,
        '', // Completion Date - will be filled per completion
        habit.is_archived ? 'Yes' : 'No'
      ];

      if (habit.completions && habit.completions.length > 0) {
        // Add a row for each completion
        habit.completions.forEach(completion => {
          const row = [...baseRow];
          row[8] = `"${completion.completion_date ? new Date(completion.completion_date).toLocaleDateString() : ''}"`;
          csvContent += row.join(',') + '\n';
        });
      } else {
        // Add one row even if no completions
        csvContent += baseRow.join(',') + '\n';
      }
    });

    return csvContent;
  };

  const exportHabitSummary = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await getAccessToken();
      const habits = await api.getHabits(token);
      
      // Generate summary CSV
      const csvContent = generateSummaryCSV(habits);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `habits_summary_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setError('Failed to export summary');
      console.error('Error exporting summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummaryCSV = (habits) => {
    const headers = [
      'Habit Name',
      'Description',
      'Category',
      'Created Date',
      'Current Streak',
      'Longest Streak',
      'Total Completions',
      'Success Rate (%)',
      'Days Since Created',
      'Status'
    ];

    let csvContent = headers.join(',') + '\n';

    habits.forEach(habit => {
      const createdDate = habit.created_at ? new Date(habit.created_at) : new Date();
      const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
      const totalCompletions = (habit.completions || []).length;
      const successRate = daysSinceCreated > 0 ? Math.round((totalCompletions / daysSinceCreated) * 100) : 0;

      const row = [
        `"${habit.name || ''}"`,
        `"${habit.description || ''}"`,
        `"${habit.category || ''}"`,
        `"${createdDate.toLocaleDateString()}"`,
        habit.current_streak || 0,
        habit.longest_streak || 0,
        totalCompletions,
        successRate,
        daysSinceCreated,
        habit.is_archived ? 'Archived' : 'Active'
      ];

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  };

  return (
    <div className="export-section">
      <h3>Export Data</h3>
      <div className="export-buttons">
        <button 
          className="btn btn-secondary"
          onClick={exportToCSV}
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export Detailed Log'}
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={exportHabitSummary}
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export Summary'}
        </button>
      </div>
      
      {error && <div className="error" style={{ marginTop: '0.5rem' }}>{error}</div>}
      
      <div className="export-info">
        <p><strong>Detailed Log:</strong> Includes all completion dates and full habit details</p>
        <p><strong>Summary:</strong> Overview with statistics and success rates</p>
      </div>
    </div>
  );
}