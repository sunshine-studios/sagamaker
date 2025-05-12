import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHabits } from "@/context/HabitsContext";

type Habit = {
  id: string;
  icon: string;
  completed: boolean;
};

// Types from mission log
interface WeeklyGoal {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  month: string;
  week: number;
  skillLink?: string;
  project: string;
}

interface MonthlyGoal {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  month: string;
  skillLink?: string;
  project: string;
  weeklyGoals: WeeklyGoal[];
}

interface ProjectData {
  name: string;
  monthlyGoals: MonthlyGoal[];
}

const LS_KEY = 'missionlog-projects-v1';

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentWeek = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth = now.getDate();
  return Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
};

const MiddleColumn = () => {
  const router = useRouter();
  const { habits, toggleHabit } = useHabits();
  const [currentMonthGoals, setCurrentMonthGoals] = useState<MonthlyGoal[]>([]);
  const [currentWeekTasks, setCurrentWeekTasks] = useState<WeeklyGoal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadMissionLogData = () => {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        try {
          const projects = JSON.parse(stored);
          const currentMonth = getCurrentMonthString();
          const currentWeek = getCurrentWeek();

          // Get all monthly goals from all projects for current month
          const allMonthlyGoals = Object.values(projects as { [key: string]: ProjectData })
            .flatMap((project: ProjectData) => project.monthlyGoals)
            .filter((goal: MonthlyGoal) => goal.month === currentMonth);

          // Get all weekly tasks from all projects for current month and week
          const allWeeklyTasks = Object.values(projects as { [key: string]: ProjectData })
            .flatMap((project: ProjectData) => project.monthlyGoals)
            .flatMap((goal: MonthlyGoal) => goal.weeklyGoals)
            .filter((task: WeeklyGoal) => task.month === currentMonth && task.week === currentWeek);

          setCurrentMonthGoals(allMonthlyGoals.slice(0, 3)); // Show only first 3 goals
          setCurrentWeekTasks(allWeeklyTasks.slice(0, 3)); // Show only first 3 tasks
        } catch (e) {
          console.warn('Failed to parse stored projects:', e);
        }
      }
    };

    loadMissionLogData();
    // Refresh data every minute
    const interval = setInterval(loadMissionLogData, 60000);
    return () => clearInterval(interval);
  }, [mounted]);

  const navigateToMissions = () => {
    router.push("/mission-log");
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="bg-[#818181] rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-white">Daily Habits</h2>
          <button
            onClick={() => router.push('/daily-habits')}
            className="text-white hover:text-blue-400 transition-colors"
            title="Manage Daily Habits"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {habits.filter(habit => !habit.archived).map(habit => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-2 border rounded ${
                habit.completed ? "bg-blue-500 text-white" : "bg-[#818181] text-white border-gray-600"
              }`}
            >
              {habit.icon}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={navigateToMissions}
        className="w-full py-3 bg-black text-white rounded text-center"
      >
        Mission Log 📋
      </button>

      <div className="bg-[#818181] rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-white">Current Month Goals</h2>
        {currentMonthGoals.length > 0 ? (
          currentMonthGoals.map(goal => (
            <div
              key={goal.id}
              className="flex items-center space-x-2 mb-2"
            >
              <div
                className={`h-4 w-4 rounded-full border ${
                  goal.completed ? "bg-blue-600" : "bg-[#818181] border-gray-600"
                }`}
              />
              <span className={`${goal.completed ? "line-through" : ""} text-white`}>
                {goal.text}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-300 text-sm">No goals set for this month</p>
        )}
      </div>

      <div className="bg-[#818181] rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-white">Current Week Tasks</h2>
        {currentWeekTasks.length > 0 ? (
          currentWeekTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center space-x-2 mb-2"
            >
              <div
                className={`h-4 w-4 rounded-full border ${
                  task.completed ? "bg-blue-600" : "bg-[#818181] border-gray-600"
                }`}
              />
              <span className={`${task.completed ? "line-through" : ""} text-white`}>
                {task.text}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-300 text-sm">No tasks set for this week</p>
        )}
      </div>
    </div>
  );
};

export default MiddleColumn; 