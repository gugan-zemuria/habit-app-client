'use client';

import { useState, useEffect } from 'react';

const EMOJI_OPTIONS = [
  '📝', '💪', '🏃', '📚', '💧', '🧘', '🎯', '🌱',
  '🎨', '🎵', '🍎', '💤', '🧠', '❤️', '🔥', '⭐',
  '🌟', '✨', '🎪', '🎭', '🏆', '🎉', '⚡', '🚀'
];

export default function HabitModal({ habit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    emoji: '📝'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || '',
        emoji: habit.emoji || '📝'
      });
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Data being sent:', formData); // Debug line
    
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    if (!formData || Object.keys(formData).length === 0) {
      console.error('No data to send!');
      setError('No data to send');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('About to send:', formData); // Debug line
      await onSave(formData);
    } catch (error) {
      setError('Failed to save habit');
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Emoji</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('emoji', emoji)}
                  style={{
                    padding: '0.5rem',
                    border: formData.emoji === emoji ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '4px',
                    background: formData.emoji === emoji ? '#eff6ff' : 'white',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Habit Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description or notes about this habit"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Health, Productivity, Learning"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (habit ? 'Update Habit' : 'Create Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}