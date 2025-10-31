// utils/habitFilters.js

/**
 * Filter habits by completion status for today
 * @param {Array} habits - Array of habit objects
 * @param {string} filter - 'completed' | 'not-completed' | 'all'
 * @returns {Array} Filtered habits
 */
export const filterByCompletionToday = (habits, filter) => {
  if (filter === 'all') return habits;
  
  const today = new Date().toISOString().split('T')[0];
  
  return habits.filter(habit => {
    const completionDates = habit.completionDates || habit.completions || [];
    const completedToday = completionDates.some(date => {
      const dateStr = typeof date === 'string' ? date : date.completion_date;
      return dateStr && dateStr.split('T')[0] === today;
    });
    return filter === 'completed' ? completedToday : !completedToday;
  });
};

/**
 * Filter habits by category/tag
 * @param {Array} habits - Array of habit objects
 * @param {string} category - Category name to filter by
 * @returns {Array} Filtered habits
 */
export const filterByCategory = (habits, category) => {
  if (!category || category === 'all') return habits;
  
  return habits.filter(habit => 
    habit.category === category || habit.tags?.includes(category)
  );
};

/**
 * Filter habits by active/archived status
 * @param {Array} habits - Array of habit objects
 * @param {string} status - 'active' | 'archived' | 'all'
 * @returns {Array} Filtered habits
 */
export const filterByStatus = (habits, status) => {
  if (status === 'all') return habits;
  
  return habits.filter(habit => 
    status === 'archived' ? habit.isArchived : !habit.isArchived
  );
};

/**
 * Sort habits by name (A-Z)
 * @param {Array} habits - Array of habit objects
 * @param {string} order - 'asc' | 'desc'
 * @returns {Array} Sorted habits
 */
export const sortByName = (habits, order = 'asc') => {
  return [...habits].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (order === 'asc') {
      return nameA.localeCompare(nameB);
    }
    return nameB.localeCompare(nameA);
  });
};

/**
 * Calculate current streak for a habit
 * @param {Array} completionDates - Array of completion date strings or objects
 * @returns {number} Current streak count
 */
const calculateStreak = (completionDates) => {
  if (!completionDates || completionDates.length === 0) return 0;
  
  const dates = completionDates.map(d => {
    const dateStr = typeof d === 'string' ? d : d.completion_date;
    return dateStr ? dateStr.split('T')[0] : null;
  }).filter(Boolean);
  
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === checkDateStr) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};/**
 * Sor
t habits by current streak (high to low)
 * @param {Array} habits - Array of habit objects
 * @param {string} order - 'desc' | 'asc'
 * @returns {Array} Sorted habits
 */
export const sortByStreak = (habits, order = 'desc') => {
  return [...habits].sort((a, b) => {
    const streakA = calculateStreak(a.completionDates);
    const streakB = calculateStreak(b.completionDates);
    
    if (order === 'desc') {
      return streakB - streakA;
    }
    return streakA - streakB;
  });
};

/**
 * Sort habits by creation date (recently created first)
 * @param {Array} habits - Array of habit objects
 * @param {string} order - 'desc' | 'asc'
 * @returns {Array} Sorted habits
 */
export const sortByCreatedDate = (habits, order = 'desc') => {
  return [...habits].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    if (order === 'desc') {
      return dateB - dateA;
    }
    return dateA - dateB;
  });
};

/**
 * Apply multiple filters and sort to habits
 * @param {Array} habits - Array of habit objects
 * @param {Object} filters - Filter options
 * @param {string} filters.completion - 'completed' | 'not-completed' | 'all'
 * @param {string} filters.category - Category name or 'all'
 * @param {string} filters.status - 'active' | 'archived' | 'all'
 * @param {string} sortBy - 'name' | 'streak' | 'created'
 * @param {string} sortOrder - 'asc' | 'desc'
 * @returns {Array} Filtered and sorted habits
 */
export const applyFiltersAndSort = (
  habits,
  filters = {},
  sortBy = 'name',
  sortOrder = 'asc'
) => {
  let result = [...habits];
  
  // Apply filters
  if (filters.completion) {
    result = filterByCompletionToday(result, filters.completion);
  }
  
  if (filters.category) {
    result = filterByCategory(result, filters.category);
  }
  
  if (filters.status) {
    result = filterByStatus(result, filters.status);
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'name':
      result = sortByName(result, sortOrder);
      break;
    case 'streak':
      result = sortByStreak(result, sortOrder);
      break;
    case 'created':
      result = sortByCreatedDate(result, sortOrder);
      break;
    default:
      break;
  }
  
  return result;
};

/**
 * Get unique categories from habits array
 * @param {Array} habits - Array of habit objects
 * @returns {Array} Array of unique category names
 */
export const getUniqueCategories = (habits) => {
  const categories = new Set();
  
  habits.forEach(habit => {
    if (habit.category) {
      categories.add(habit.category);
    }
    
    if (habit.tags && Array.isArray(habit.tags)) {
      habit.tags.forEach(tag => categories.add(tag));
    }
  });
  
  return Array.from(categories).sort();
};