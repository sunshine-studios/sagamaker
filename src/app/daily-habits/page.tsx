'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHabits } from '@/context/HabitsContext';

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get first day of month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export default function DailyHabitsPage() {
  const router = useRouter();
  const { habits, toggleHabit, addHabit, removeHabit, updateHabit, archiveHabit, DEFAULT_ICONS } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<typeof habits[0] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleArchiveHabit = (habitId: string) => {
    archiveHabit(habitId);
    setSelectedHabit(null);
  };

  const handleUpdateHabit = (updates: Partial<typeof habits[0]>) => {
    if (selectedHabit) {
      updateHabit(selectedHabit.id, updates);
      setSelectedHabit({ ...selectedHabit, ...updates });
    }
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all habits data? This cannot be undone.')) {
      localStorage.removeItem('habits');
      window.location.reload();
    }
  };

  const activeHabits = habits.filter(habit => !habit.archived);
  const archivedHabits = habits.filter(habit => habit.archived);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const totalDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Get habits completed for a specific date
  const getHabitsForDate = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeHabits.filter(habit => 
      habit.completionHistory.some(record => 
        record.date === dateString && record.completed
      )
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="max-w-[1440px] mx-auto h-[1024px] flex gap-4">
        {/* Left Column - Habits List */}
        <div className="w-1/4 bg-[#818181] rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Habits</h2>
            <button
              onClick={addHabit}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <span className="text-xl">+</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-6">
            {activeHabits.map(habit => (
              <div
                key={habit.id}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedHabit?.id === habit.id ? 'bg-blue-500' : 'bg-[#1a1a1a]'
                }`}
                onClick={() => setSelectedHabit(habit)}
              >
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                  className="mr-2"
                />
                <span className="text-2xl mr-2">{habit.icon}</span>
                <span>{habit.name}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col h-48">
            <h3 className="text-lg font-semibold mb-2">Archived Habits</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {archivedHabits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center p-2 bg-[#1a1a1a] rounded"
                >
                  <span className="text-2xl mr-2">{habit.icon}</span>
                  <span>{habit.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleClearStorage}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Clear All Habits Data
          </button>
        </div>

        {/* Center Column - Properties Panel */}
        <div className="w-1/4 bg-[#818181] rounded-lg p-4">
          {selectedHabit ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Habit Name</label>
                <input
                  type="text"
                  value={selectedHabit.name}
                  onChange={(e) => handleUpdateHabit({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <div className="bg-[#1a1a1a] p-3 rounded border border-gray-600">
                  <div className="text-2xl mb-2">{selectedHabit.icon}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_ICONS.map((icon, index) => (
                      <button
                        key={index}
                        className={`text-2xl p-2 rounded hover:bg-blue-500 transition-colors ${
                          selectedHabit.icon === icon ? 'bg-blue-500' : ''
                        }`}
                        onClick={() => handleUpdateHabit({ icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skill Link</label>
                <select 
                  className="w-full px-3 py-2 bg-[#1a1a1a] rounded border border-gray-600"
                  value={selectedHabit.skillLink || ''}
                  onChange={(e) => handleUpdateHabit({ skillLink: e.target.value })}
                >
                  <option value="">Select a skill...</option>
                  {/* Add skill options */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Task Link</label>
                <select 
                  className="w-full px-3 py-2 bg-[#1a1a1a] rounded border border-gray-600"
                  value={selectedHabit.taskLink || ''}
                  onChange={(e) => handleUpdateHabit({ taskLink: e.target.value })}
                >
                  <option value="">Select a task...</option>
                  {/* Add task options */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Streak Days</label>
                <div className="text-2xl font-bold">{selectedHabit.streakDays}</div>
              </div>

              <button
                onClick={() => handleArchiveHabit(selectedHabit.id)}
                className="w-full py-2 bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                Archive Habit
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              Select a habit to view its properties
            </div>
          )}
        </div>

        {/* Right Column - Calendar */}
        <div className="w-1/3 bg-[#818181] rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="px-2 py-1 bg-[#1a1a1a] rounded hover:bg-blue-600"
              >
                ←
              </button>
              <span className="px-2 py-1">
                {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="px-2 py-1 bg-[#1a1a1a] rounded hover:bg-blue-600"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold">
                {day}
              </div>
            ))}
            
            {/* Empty days at start */}
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="aspect-square bg-[#1a1a1a] rounded" />
            ))}
            
            {/* Calendar days */}
            {totalDays.map(day => {
              const habitsForDay = getHabitsForDate(day);
              return (
                <div
                  key={day}
                  className="aspect-square bg-[#1a1a1a] rounded p-1 relative"
                >
                  <div className="text-sm mb-1">{day}</div>
                  <div className="flex flex-wrap gap-1">
                    {habitsForDay.map(habit => (
                      <div
                        key={habit.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: habit.color }}
                        title={`${habit.name} - ${habit.streakDays} day streak`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 