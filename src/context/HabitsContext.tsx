'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEFAULT_ICONS = [
  '🏋️', // Exercise
  '📖', // Reading
  '🧘', // Meditation
  '🛏️', // Sleep
  '💧', // Water
  '🥗', // Healthy Eating
  '🎯', // Goals
  '💻', // Coding
  '🎨', // Creativity
  '🎵', // Music
  '📝', // Journaling
  '🌱', // Growth
];

interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  skillLink?: string;
  taskLink?: string;
  streakDays: number;
  archived: boolean;
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: () => void;
  removeHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  DEFAULT_ICONS: string[];
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, isClient]);

  const addHabit = () => {
    const activeHabitsCount = habits.filter(habit => !habit.archived).length;
    if (activeHabitsCount >= 12) {
      alert('Maximum of 12 active habits allowed. Please archive a habit before adding a new one.');
      return;
    }
    
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New Habit',
      icon: DEFAULT_ICONS[0],
      completed: false,
      streakDays: 0,
      archived: false,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const completed = !habit.completed;
          return {
            ...habit,
            completed,
            streakDays: completed ? habit.streakDays + 1 : habit.streakDays,
          };
        }
        return habit;
      })
    );
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  };

  const archiveHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, archived: true } : habit
      )
    );
  };

  return (
    <HabitsContext.Provider
      value={{ 
        habits, 
        addHabit, 
        removeHabit, 
        toggleHabit, 
        updateHabit, 
        archiveHabit,
        DEFAULT_ICONS 
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
} 