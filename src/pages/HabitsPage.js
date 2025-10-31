import React, { useState } from 'react';
import HabitList from '../components/HabitList';
import '../styles/HabitFilters.css';

// Sample data for demonstration
const sampleHabits = [
  {
    id: 1,
    name: 'Morning Exercise',
    description: 'Do 30 minutes of cardio or strength training',
    category: 'Health',
    tags: ['fitness', 'morning'],
    completionDates: ['2024-10-29', '2024-10-30', '2024-10-31'],
    createdAt: '2024-10-01',
    isArchived: false
  },
  {
    id: 2,
    name: 'Read for 30 minutes',
    description: 'Read books, articles, or educational content',
    category: 'Learning',
    tags: ['books', 'education'],
    completionDates: ['2024-10-28', '2024-10-30'],
    createdAt: '2024-10-05',
    isArchived: false
  },
  {
    id: 3,
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    category: 'Health',
    tags: ['hydration', 'wellness'],
    completionDates: ['2024-10-31'],
    createdAt: '2024-10-10',
    isArchived: false
  },
  {
    id: 4,
    name: 'Meditate',
    description: 'Practice mindfulness for 10 minutes',
    category: 'Wellness',
    tags: ['mindfulness', 'mental-health'],
    completionDates: ['2024-10-29', '2024-10-31'],
    createdAt: '2024-09-15',
    isArchived: false
  },
  {
    id: 5,
    name: 'Old Habit',
    description: 'This is an archived habit',
    category: 'Misc',
    tags: ['old'],
    completionDates: ['2024-09-15', '2024-09-16'],
    createdAt: '2024-08-01',
    isArchived: true
  }
];

const HabitsPage = () => {
  const [habits, setHabits] = useState(sampleHabits);

  const handleHabitUpdate = (habitId, updates) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId ? { ...habit, ...updates } : habit
      )
    );
  };

  return (
    <div className="habits-page">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>My Habits</h1>
        <p>Track and filter your daily habits</p>
      </header>
      
      <HabitList 
        habits={habits} 
        onHabitUpdate={handleHabitUpdate}
      />
    </div>
  );
};

export default HabitsPage;