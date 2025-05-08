import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Habit = {
  id: string;
  icon: string;
  completed: boolean;
};

type Goal = {
  id: string;
  title: string;
  completed: boolean;
};

const MiddleColumn = () => {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", icon: "🏋️", completed: false },
    { id: "2", icon: "📖", completed: false },
    { id: "3", icon: "🧘", completed: false },
    { id: "4", icon: "🛏️", completed: false },
    { id: "5", icon: "❓", completed: false },
    { id: "6", icon: "❤️", completed: false },
    { id: "7", icon: "💻", completed: false },
    { id: "8", icon: "🎨", completed: false },
    { id: "9", icon: "✏️", completed: false },
    { id: "10", icon: "🎵", completed: false },
    { id: "11", icon: "📅", completed: false },
    { id: "12", icon: "🌙", completed: false },
  ]);

  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([
    { id: "m1", title: "Complete Python Course", completed: true },
    { id: "m2", title: "Read 4 Books", completed: false },
    { id: "m3", title: "Run 50km Total", completed: false },
  ]);

  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([
    { id: "w1", title: "Gym 3x", completed: true },
    { id: "w2", title: "Meditate Daily", completed: false },
    { id: "w3", title: "Code Practice", completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const toggleGoal = (
    id: string,
    goalList: Goal[],
    setGoalList: React.Dispatch<React.SetStateAction<Goal[]>>
  ) => {
    setGoalList(prev =>
      prev.map(g => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const navigateToMissions = () => {
    router.push("/mission-log");
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="bg-[#818181] rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-white">Daily Habits</h2>
        <div className="grid grid-cols-6 gap-2">
          {habits.map(habit => (
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
        <h2 className="text-lg font-semibold mb-2 text-white">Monthly Goals</h2>
        {monthlyGoals.map(goal => (
          <div
            key={goal.id}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => toggleGoal(goal.id, monthlyGoals, setMonthlyGoals)}
          >
            <div
              className={`h-4 w-4 rounded-full border ${
                goal.completed ? "bg-blue-600" : "bg-[#818181] border-gray-600"
              }`}
            />
            <span className={`${goal.completed ? "line-through" : ""} text-white`}>
              {goal.title}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[#818181] rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-white">Weekly Goals</h2>
        {weeklyGoals.map(goal => (
          <div
            key={goal.id}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => toggleGoal(goal.id, weeklyGoals, setWeeklyGoals)}
          >
            <div
              className={`h-4 w-4 rounded-full border ${
                goal.completed ? "bg-blue-600" : "bg-[#818181] border-gray-600"
              }`}
            />
            <span className={`${goal.completed ? "line-through" : ""} text-white`}>
              {goal.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiddleColumn; 