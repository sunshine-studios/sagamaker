'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHabits } from '@/context/HabitsContext';

export default function DailyHabitsPage() {
  const router = useRouter();
  const { habits, toggleHabit, addHabit, removeHabit, updateHabit, archiveHabit, DEFAULT_ICONS } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<typeof habits[0] | null>(null);
  const [mounted, setMounted] = useState(false);

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
        <div className="w-2/4 bg-[#818181] rounded-lg p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold">
                {day}
              </div>
            ))}
            {/* Calendar days will go here */}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="aspect-square bg-[#1a1a1a] rounded p-1"
              >
                <div className="text-sm mb-1">{i + 1}</div>
                <div className="h-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 