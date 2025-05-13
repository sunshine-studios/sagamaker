'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Add color palette for habits
export const HABIT_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEEAD', // Cream Yellow
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#2ECC71', // Emerald
  '#F1C40F', // Yellow
  '#1ABC9C', // Teal
];

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

interface CompletionRecord {
  date: string;  // ISO date string (YYYY-MM-DD)
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  skillLink?: string;
  taskLink?: string;
  streakDays: number;
  archived: boolean;
  completionHistory: CompletionRecord[];
  color: string;  // Add color property
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

// Helper function to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to calculate streak
const calculateStreak = (history: CompletionRecord[]): number => {
  if (history.length === 0) return 0;

  // Sort history by date in descending order
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if the most recent record is from today
  const mostRecent = sortedHistory[0];
  if (mostRecent.date !== getTodayString()) {
    return 0; // Streak is broken if today's record is missing
  }

  // If today's record is not completed, streak is 0
  if (!mostRecent.completed) {
    return 0;
  }

  // Count consecutive completed days
  for (const record of sortedHistory) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (record.completed) {
      streak++;
    } else {
      break;
    }

    // Check if there's a gap in dates
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    if (recordDate.getTime() !== expectedDate.getTime()) {
      break;
    }

    currentDate = recordDate;
  }

  return streak;
};

// Helper function to check if yesterday was completed
const wasYesterdayCompleted = (history: CompletionRecord[]): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  const yesterdayRecord = history.find(record => record.date === yesterdayString);
  return yesterdayRecord?.completed || false;
};

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    const savedHabits = localStorage.getItem('habits');
    const savedLastResetDate = localStorage.getItem('lastResetDate');
    if (savedLastResetDate) {
      setLastResetDate(savedLastResetDate);
    }
    if (savedHabits) {
      try {
        // Migrate existing habits to include completionHistory and color
        const parsedHabits = JSON.parse(savedHabits);
        const migratedHabits = parsedHabits.map((habit: any, index: number) => ({
          ...habit,
          completionHistory: habit.completionHistory || [],
          color: habit.color || HABIT_COLORS[index % HABIT_COLORS.length],
        }));
        setHabits(migratedHabits);
      } catch (e) {
        console.warn('Failed to parse saved habits:', e);
        setHabits([]);
      }
    }
  }, []);

  // Add new effect to handle daily reset
  useEffect(() => {
    if (!isClient) return;

    const today = getTodayString();
    
    // Check if we need to reset (if last reset was not today)
    if (lastResetDate !== today) {
      setHabits(prevHabits => 
        prevHabits.map(habit => ({
          ...habit,
          completed: false, // Reset completed state
          // Keep all other properties including completionHistory
        }))
      );
      setLastResetDate(today);
      localStorage.setItem('lastResetDate', today);
    }
  }, [isClient, lastResetDate]);

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
      completionHistory: [],
      color: HABIT_COLORS[activeHabitsCount % HABIT_COLORS.length],
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
          const today = getTodayString();
          
          // Ensure completionHistory exists
          const currentHistory = habit.completionHistory || [];
          
          // Update completion history
          const updatedHistory = [
            { date: today, completed },
            ...currentHistory.filter(record => record.date !== today)
          ];

          // Calculate new streak based on the updated history
          const streakDays = calculateStreak(updatedHistory);

          return {
            ...habit,
            completed,
            streakDays,
            completionHistory: updatedHistory,
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