import React, { useState } from 'react';
import { getUniqueCategories } from '../lib/habitFilters';

const HabitFilters = ({ habits, onFiltersChange, currentFilters, filteredCount }) => {
  const [filters, setFilters] = useState({
    completion: 'all',
    category: 'all',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc',
    ...currentFilters
  });

  const categories = getUniqueCategories(habits);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      completion: 'all',
      category: 'all',
      status: 'active',
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.completion !== 'all') {
      const labels = {
        'completed': 'Completed Today',
        'not-completed': 'Not Completed Today'
      };
      active.push({ key: 'completion', label: labels[filters.completion] });
    }
    if (filters.category !== 'all') {
      active.push({ key: 'category', label: filters.category });
    }
    if (filters.status !== 'active') {
      const labels = {
        'archived': 'Archived',
        'all': 'All Status'
      };
      active.push({ key: 'status', label: labels[filters.status] });
    }
    return active;
  };

  const removeFilter = (key) => {
    const defaultValues = {
      completion: 'all',
      category: 'all',
      status: 'active'
    };
    handleFilterChange(key, defaultValues[key]);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="habit-filters-panel">
      <div className="filters-header">
        <div className="filters-title">
          <span>🔍</span>
          <span>Filters & Sorting</span>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="filter-chips">
          {activeFilters.map((filter) => (
            <div key={filter.key} className="filter-chip">
              <span>{filter.label}</span>
              <button
                className="filter-chip-remove"
                onClick={() => removeFilter(filter.key)}
                title={`Remove ${filter.label} filter`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="filters-grid">
        {/* Completion Status Filter */}
        <div className="filter-group">
          <label htmlFor="completion-filter">Completion</label>
          <select
            id="completion-filter"
            className="filter-select"
            value={filters.completion}
            onChange={(e) => handleFilterChange('completion', e.target.value)}
          >
            <option value="all">All Habits</option>
            <option value="completed">✅ Completed Today</option>
            <option value="not-completed">⏳ Not Completed Today</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                📁 {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="active">🟢 Active</option>
            <option value="archived">📦 Archived</option>
            <option value="all">🔄 All</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label htmlFor="sort-by">Sort By</label>
          <select
            id="sort-by"
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="name">📝 Name</option>
            <option value="streak">🔥 Current Streak</option>
            <option value="created">📅 Recently Created</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="filter-group">
          <label htmlFor="sort-order">Order</label>
          <select
            id="sort-order"
            className="filter-select"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            {filters.sortBy === 'name' && (
              <>
                <option value="asc">↗️ A → Z</option>
                <option value="desc">↘️ Z → A</option>
              </>
            )}
            {filters.sortBy === 'streak' && (
              <>
                <option value="desc">↘️ High → Low</option>
                <option value="asc">↗️ Low → High</option>
              </>
            )}
            {filters.sortBy === 'created' && (
              <>
                <option value="desc">↘️ Newest First</option>
                <option value="asc">↗️ Oldest First</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <div className="filter-count">
          Showing {filteredCount} habit{filteredCount !== 1 ? 's' : ''}
        </div>
        <button
          onClick={resetFilters}
          className={`filter-reset ${activeFilters.length === 0 ? 'disabled' : ''}`}
          disabled={activeFilters.length === 0}
        >
          🔄 Reset All
        </button>
      </div>
    </div>
  );
};

export default HabitFilters;