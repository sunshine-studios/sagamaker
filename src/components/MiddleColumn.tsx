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
    <div className="flex-1 p-4 space-y-6">
      {/* Mission Log Section */}
      <div className="bg-black border-4 border-black text-white font-bold py-4 px-6 relative overflow-hidden" style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)'
      }}>
        <div className="absolute top-0 left-0 right-0 h-[15px] bg-orange-500" style={{
          clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 100px)'
        }}></div>
        <div className="absolute top-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }}></div>
        <div className="text-center">
          <span className="relative z-10 text-xl">MISSION LOG 📋</span>
        </div>
      </div>

      {/* Daily Habits Section */}
      <div className="bg-white border-4 border-black relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
      }}>
        <div className="absolute top-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)'
        }}></div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">DAILY HABITS</h2>
            <button
              onClick={() => router.push('/daily-habits')}
              className="text-orange-500 hover:text-orange-600 transition-colors"
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
                className={`p-3 border-2 text-2xl font-bold transition-colors ${
                  habit.completed 
                    ? "bg-orange-500 text-white border-black" 
                    : "bg-white text-black border-black hover:bg-gray-100"
                }`}
              >
                {habit.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Month Goals */}
      <div className="bg-white border-4 border-black relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
      }}>
        <div className="absolute top-0 left-0 right-0 h-[15px] bg-orange-500" style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
        }}></div>
        <div className="absolute top-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 125% 125%, 0 100%)'
        }}></div>
        
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-black">CURRENT MONTH GOALS</h2>
          {currentMonthGoals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {currentMonthGoals.map(goal => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <div
                    className={`h-6 w-6 border-2 border-black ${
                      goal.completed ? "bg-orange-500" : "bg-white"
                    }`}
                  />
                  <span className={`text-sm font-medium ${goal.completed ? "line-through text-gray-500" : "text-black"}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No goals set for this month</p>
          )}
        </div>
      </div>

      {/* Current Week Tasks */}
      <div className="bg-white border-4 border-black relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
      }}>
        <div className="absolute top-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-black">CURRENT WEEK TASKS</h2>
          {currentWeekTasks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {currentWeekTasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2">
                  <div
                    className={`h-6 w-6 border-2 border-black ${
                      task.completed ? "bg-orange-500" : "bg-white"
                    }`}
                  />
                  <span className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-black"}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tasks set for this week</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiddleColumn; 