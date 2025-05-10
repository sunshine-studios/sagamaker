'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface WeeklyGoal {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  month: string;
  week: number;
  skillLink?: string;
  project: string;
  dateAdded: string;
  dateCompleted?: string;
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
  dateAdded: string;
  dateCompleted?: string;
}

interface ProjectData {
  name: string;
  monthlyGoals: MonthlyGoal[];
}

const LS_KEY = 'missionlog-projects-v1';
const LS_THEME = 'missionlog-theme-v1';
const LS_PROJECT = 'missionlog-selected-project-v1';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const defaultWeeklyGoals: WeeklyGoal[] = [
  { id: generateUniqueId(), text: 'Weekly Goal 1', completed: false, month: '2025-05', week: 1, project: 'Project 1', dateAdded: new Date().toISOString().slice(0, 10) },
  { id: generateUniqueId(), text: 'Weekly Goal 2', completed: false, month: '2025-05', week: 2, project: 'Project 1', dateAdded: new Date().toISOString().slice(0, 10) },
];
const defaultMonthlyGoals: MonthlyGoal[] = [
  { id: generateUniqueId(), text: 'Monthly Goal 1', completed: false, month: '2025-05', project: 'Project 1', weeklyGoals: defaultWeeklyGoals, dateAdded: new Date().toISOString().slice(0, 10) },
  { id: generateUniqueId(), text: 'Monthly Goal 2', completed: false, month: '2025-05', project: 'Project 1', weeklyGoals: [], dateAdded: new Date().toISOString().slice(0, 10) },
];

const getInitialProjects = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored projects:', e);
      }
    }
  }
  // Return default projects if nothing in localStorage
  return {
    'Project 1': { name: 'Project 1', monthlyGoals: [] },
    'Project 2': { name: 'Project 2', monthlyGoals: [] },
  };
};
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LS_THEME);
    if (stored) return stored;
  }
  return '';
};
const getInitialProject = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LS_PROJECT);
    if (stored) return stored;
  }
  return 'Project 1';
};

const MAX_PREVIEW = 3;

type MiddleSection = 'weekly' | 'monthly';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getCurrentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Add these styles at the top of the file after imports
const SELECT_STYLES = "w-full border border-gray-600 rounded p-2 text-sm bg-[#22223b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const BUTTON_STYLES = "px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors";
const SECTION_HEADER_STYLES = "flex justify-between items-center mb-4";

const MissionLogPage = () => {
  // All hooks at the top
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [project, setProject] = useState(getInitialProject);
  const [projects, setProjects] = useState(getInitialProjects);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [middleSection, setMiddleSection] = useState<MiddleSection>('weekly');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(LS_KEY, JSON.stringify(projects));
    }
  }, [projects, mounted]);

  // Save theme to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(LS_THEME, theme);
    }
  }, [theme, mounted]);

  // Save selected project to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(LS_PROJECT, project);
    }
  }, [project, mounted]);

  // Clear selected IDs when project changes
  useEffect(() => {
    setSelectedTaskId(null);
    setSelectedGoalId(null);
  }, [project]);

  // Reset showAllTasks when month changes
  useEffect(() => {
    setShowAllTasks(false);
  }, [selectedMonth]);

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_THEME);
      localStorage.removeItem(LS_PROJECT);
      window.location.reload();
    }
  };

  if (!mounted) return null;

  // Handlers
  const handleGoalChange = (id: string, value: string) => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project] || !prev[project].monthlyGoals) {
        console.warn(`Project ${project} or its monthly goals not found`);
        return prev;
      }

      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => 
            g.id === id ? { ...g, text: value } : g
          ),
        },
      };
    });
  };
  const handleGoalToggle = (id: string) => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project]) {
        console.warn(`Project ${project} not found`);
        return prev;
      }

      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => {
            if (g.id === id) {
              const newCompleted = !g.completed;
              return {
                ...g,
                completed: newCompleted,
                dateCompleted: newCompleted ? new Date().toISOString().slice(0, 10) : undefined,
                modified: new Date().toISOString().slice(0, 10)
              };
            }
            return g;
          })
        },
      };
    });
  };
  const handleTaskChange = (id: string, field: 'text' | 'description', value: string) => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project] || !prev[project].monthlyGoals) {
        console.warn(`Project ${project} or its monthly goals not found`);
        return prev;
      }

      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => ({
            ...g,
            weeklyGoals: g.weeklyGoals.map((t: WeeklyGoal) => 
              t.id === id ? { ...t, [field]: value, modified: new Date().toISOString().slice(0, 10) } : t
            )
          }) as MonthlyGoal)
        },
      };
    });
  };
  const handleTaskToggle = (id: string) => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project] || !prev[project].monthlyGoals) {
        console.warn(`Project ${project} or its monthly goals not found`);
        return prev;
      }

      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => ({
            ...g,
            weeklyGoals: g.weeklyGoals.map((t: WeeklyGoal) => {
              if (t.id === id) {
                const newCompleted = !t.completed;
                return {
                  ...t,
                  completed: newCompleted,
                  dateCompleted: newCompleted ? new Date().toISOString().slice(0, 10) : undefined,
                  modified: new Date().toISOString().slice(0, 10)
                };
              }
              return t;
            })
          }) as MonthlyGoal)
        },
      };
    });
  };
  const handleAddProject = () => {
    if (!newProjectName.trim() || projects[newProjectName]) return;
    setProjects((prev: { [name: string]: ProjectData }) => ({
      ...prev,
      [newProjectName]: { name: newProjectName, monthlyGoals: [] },
    }));
    setProject(newProjectName);
    setNewProjectName('');
  };
  const handleAddGoal = () => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project]) {
        console.warn(`Project ${project} not found`);
        return prev;
      }

      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: [
            ...(prev[project].monthlyGoals || []),
            {
              id: generateUniqueId(),
              text: '',
              completed: false,
              month: selectedMonth,
              project: project,
              weeklyGoals: [],
              dateAdded: new Date().toISOString().slice(0, 10)
            }
          ]
        }
      };
    });
  };
  const handleAddTask = () => {
    setProjects((prev: { [name: string]: ProjectData }) => {
      if (!prev[project] || !prev[project].monthlyGoals) {
        console.warn(`Project ${project} or its monthly goals not found`);
        return prev;
      }

      const newTask = {
        id: generateUniqueId(),
        text: '',
        completed: false,
        month: selectedMonth,
        week: selectedWeek,
        project: project,
        skillLink: `monthly:${generateUniqueId()}`,
        dateAdded: new Date().toISOString().slice(0, 10)
      };

      // Get the first monthly goal
      const firstMonthlyGoal = prev[project].monthlyGoals[0];
      
      if (!firstMonthlyGoal) {
        // If no monthly goals exist, create one
        return {
          ...prev,
          [project]: {
            ...prev[project],
            monthlyGoals: [
              {
                id: generateUniqueId(),
                text: '',
                completed: false,
                month: selectedMonth,
                project: project,
                weeklyGoals: [newTask],
                dateAdded: new Date().toISOString().slice(0, 10)
              }
            ]
          }
        };
      }

      // Add the new task to the first monthly goal
      return {
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal, index: number) => {
            if (index === 0) {
              return {
                ...g,
                weeklyGoals: [...(g.weeklyGoals || []), newTask]
              };
            }
            return g;
          })
        }
      };
    });
  };
  // Properties panel handlers
  const selectedTask = middleSection === 'weekly' 
    ? projects[project]?.monthlyGoals
        ?.flatMap((g: MonthlyGoal) => g.weeklyGoals)
        .find((t: WeeklyGoal) => t.id === selectedTaskId) || null
    : null;

  const selectedGoal = middleSection === 'monthly'
    ? projects[project]?.monthlyGoals
        ?.find((g: MonthlyGoal) => g.id === selectedGoalId) || null
    : null;

  const handlePropertiesChange = (field: keyof WeeklyGoal, value: string | number | boolean | null) => {
    if (!selectedTask || !projects[project]) return;
    
    setProjects((prev: { [name: string]: ProjectData }) => ({
      ...prev,
      [project]: {
        ...prev[project],
        monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => ({
          ...g,
          weeklyGoals: g.weeklyGoals.map((t: WeeklyGoal) => {
            if (t.id === selectedTaskId) {
              const updates: Partial<WeeklyGoal> = {
                [field]: value
              };
              
              // If changing completion status, update completion date
              if (field === 'completed') {
                updates.dateCompleted = value ? new Date().toISOString().slice(0, 10) : undefined;
              }
              
              return { ...t, ...updates };
            }
            return t;
          })
        }) as MonthlyGoal)
      },
    }));
  };

  const handleDeleteTask = () => {
    if (!selectedTask || !projects[project]) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      setProjects((prev: { [name: string]: ProjectData }) => ({
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => ({
            ...g,
            weeklyGoals: g.weeklyGoals.filter((t: WeeklyGoal) => t.id !== selectedTaskId)
          }))
        },
      }));
      setSelectedTaskId(null);
    }
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal || !projects[project]) return;
    
    if (window.confirm('Are you sure you want to delete this goal and all its linked tasks?')) {
      setProjects((prev: { [name: string]: ProjectData }) => ({
        ...prev,
        [project]: {
          ...prev[project],
          monthlyGoals: prev[project].monthlyGoals.filter((g: MonthlyGoal) => g.id !== selectedGoalId)
        },
      }));
      setSelectedGoalId(null);
    }
  };

  const handleGoalPropertiesChange = (field: keyof MonthlyGoal, value: string | boolean) => {
    if (!selectedGoal || !projects[project]) return;
    
    setProjects((prev: { [name: string]: ProjectData }) => ({
      ...prev,
      [project]: {
        ...prev[project],
        monthlyGoals: prev[project].monthlyGoals.map((g: MonthlyGoal) => {
          if (g.id === selectedGoalId) {
            const updates: Partial<MonthlyGoal> = {
              [field]: value
            };
            
            // If changing completion status, update completion date
            if (field === 'completed') {
              updates.dateCompleted = value ? new Date().toISOString().slice(0, 10) : undefined;
            }
            
            return { ...g, ...updates };
          }
          return g;
        })
      },
    }));
  };

  // Render
  const projectNames = Object.keys(projects);
  const currentGoals = (projects[project]?.monthlyGoals || []).filter((g: MonthlyGoal) => (g.month ?? getCurrentMonthString()) === selectedMonth);
  const allGoals = projects[project]?.monthlyGoals || [];
  const currentTasks = projects[project]?.monthlyGoals.flatMap((g: MonthlyGoal) => g.weeklyGoals) || [];

  // Month selector options
  const year = new Date().getFullYear();
  const monthOptions = MONTHS.map((m, idx) => {
    const value = `${year}-${String(idx + 1).padStart(2, '0')}`;
    return { label: `${m} ${year}`, value };
  });

  // For left column previews, filter by both month and week
  const leftColumnTasks = (() => {
    // Get all tasks for the current month
    const monthTasks = currentTasks.filter((t: WeeklyGoal | undefined): t is WeeklyGoal => {
      if (!t) return false;
      const skillLink = t.skillLink;
      if (!skillLink || typeof skillLink !== 'string') return false;
      const linkedGoal = allGoals.find((g: MonthlyGoal) => String(g.id) === skillLink.split(':')[1]);
      return Boolean(linkedGoal && (linkedGoal.month ?? getCurrentMonthString()) === selectedMonth);
    });

    // Sort tasks by week and return first 3
    return monthTasks
      .sort((a: WeeklyGoal, b: WeeklyGoal) => a.week - b.week)
      .slice(0, 3);
  })();

  // For center column, filter weekly tasks by selected week
  const centerColumnTasks = project === 'ALL_PROJECTS'
    ? (Object.values(projects) as ProjectData[])
        .flatMap((p) => p.monthlyGoals.flatMap((g: MonthlyGoal) => g.weeklyGoals))
        .filter((task: WeeklyGoal | undefined): task is WeeklyGoal => 
          task !== undefined && 
          task.month === selectedMonth &&
          (showAllTasks || task.week === selectedWeek)
        )
    : (currentTasks || [])
        .filter((task: WeeklyGoal | undefined): task is WeeklyGoal => 
          task !== undefined && 
          task.month === selectedMonth &&
          (showAllTasks || task.week === selectedWeek)
        );

  // Center column: if 'All Projects' is selected and in monthly mode, build an array of { goal, projectName }
  let centerColumnGoals: { goal: MonthlyGoal; projectName: string }[] = [];
  if (project === 'ALL_PROJECTS') {
    centerColumnGoals = (Object.entries(projects) as [string, ProjectData][])
      .flatMap(([projectName, p]) =>
        p.monthlyGoals
          .filter((g: MonthlyGoal) => g.month === selectedMonth)
          .map((goal: MonthlyGoal) => ({ goal, projectName }))
      );
  } else {
    centerColumnGoals = allGoals
      .filter((goal: MonthlyGoal) => goal.month === selectedMonth)
      .map((goal: MonthlyGoal) => ({ goal, projectName: project }));
  }

  return (
    <div className="flex flex-row w-full min-h-screen p-6 gap-6 bg-[#083676]">
      {/* Left Column */}
      <div className="flex flex-col gap-4 w-1/4 min-w-[260px]">
        {/* Monthly Goals Preview */}
        <div className="bg-[#818181] rounded-lg p-4">
          <div className={SECTION_HEADER_STYLES}>
            <span className="font-semibold text-white">Monthly Goals</span>
            <select
              className={SELECT_STYLES}
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {currentGoals.slice(0, MAX_PREVIEW).map((goal: MonthlyGoal) => (
            <div key={goal.id} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={goal.completed === true}
                onChange={() => handleGoalToggle(goal.id)}
                className="accent-blue-600"
              />
              <span className={`truncate text-white text-sm ${goal.completed ? 'line-through' : ''}`}>{goal.text}</span>
            </div>
          ))}
          {currentGoals.length > MAX_PREVIEW && (
            <div className="text-xs text-gray-200 mt-2">+{currentGoals.length - MAX_PREVIEW} more...</div>
          )}
        </div>
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="font-semibold mb-2 text-white">Project</div>
          <select
            className="w-full border border-gray-600 rounded p-2 text-sm bg-[#22223b] text-white focus:outline-none mb-2"
            value={project}
            onChange={e => setProject(e.target.value)}
          >
            <option value="ALL_PROJECTS">All Projects</option>
            {projectNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border border-gray-600 rounded p-2 text-sm bg-[#22223b] text-white placeholder-gray-300 focus:outline-none"
              placeholder="New project name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddProject}>+</button>
          </div>
        </div>
        {/* Weekly Tasks Preview */}
        <div className="bg-[#818181] rounded-lg p-4">
          <div className={SECTION_HEADER_STYLES}>
            <span className="font-semibold text-white">Weekly Tasks</span>
            <select
              className={SELECT_STYLES}
              value={showAllTasks ? 'all' : String(selectedWeek)}
              onChange={e => {
                if (e.target.value === 'all') {
                  setShowAllTasks(true);
                } else {
                  setShowAllTasks(false);
                  setSelectedWeek(Number(e.target.value));
                }
              }}
            >
              <option value="all">All Tasks</option>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Week {i + 1}</option>
              ))}
            </select>
          </div>
          {leftColumnTasks.slice(0, MAX_PREVIEW).map((task: WeeklyGoal) => (
            <div key={task.id} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={task.completed === true}
                onChange={() => handleTaskToggle(task.id)}
                className="accent-blue-600"
              />
              <span className={`truncate text-white text-sm ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
            </div>
          ))}
          {leftColumnTasks.length > MAX_PREVIEW && (
            <div className="text-xs text-gray-200 mt-2">+{leftColumnTasks.length - MAX_PREVIEW} more...</div>
          )}
        </div>
        {/* Debug Button */}
        <button
          onClick={handleClearStorage}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          Clear All Data (Debug)
        </button>
      </div>
      {/* Middle Column */}
      <div className="flex flex-col gap-4 w-2/4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              className={`px-4 py-2 rounded ${middleSection === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}`}
              onClick={() => setMiddleSection('weekly')}
            >
              Weekly Tasks
            </button>
            <button
              className={`px-4 py-2 rounded ${middleSection === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}`}
              onClick={() => setMiddleSection('monthly')}
            >
              Monthly Goals
            </button>
          </div>
          {middleSection === 'weekly' && (
            <button className={BUTTON_STYLES} onClick={handleAddTask}>Add Task</button>
          )}
          {middleSection === 'monthly' && (
            <button className={BUTTON_STYLES} onClick={handleAddGoal}>Add Goal</button>
          )}
        </div>
        {middleSection === 'weekly' && centerColumnTasks.map((task: WeeklyGoal) => (
          task && (
            <div
              key={`${task.project}-${task.id}-${task.month}-${task.week}`}
              className={`bg-[#818181] rounded-lg p-4 mb-2 flex flex-col gap-2 border border-gray-600 cursor-pointer ${selectedTaskId === task.id ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed === true}
                  onChange={e => { e.stopPropagation(); handleTaskToggle(task.id); }}
                  className="accent-blue-600"
                />
                <input
                  className="font-semibold text-base border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
                  value={task.text}
                  onChange={e => handleTaskChange(task.id, 'text', e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                <button className="ml-auto text-white" onClick={e => { e.stopPropagation(); setSelectedTaskId(task.id); }}>...</button>
              </div>
              <input
                className="text-sm border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
                placeholder="Task description goes here"
                value={task.description || ''}
                onChange={e => handleTaskChange(task.id, 'description', e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )
        ))}
        {middleSection === 'monthly' && project === 'ALL_PROJECTS' && centerColumnGoals.map(({ goal, projectName }: { goal: MonthlyGoal; projectName: string }) => (
          <div
            key={`${projectName}-${goal.id}`}
            className={`bg-[#818181] rounded-lg p-4 mb-2 flex flex-row items-center gap-2 border border-gray-600 cursor-pointer ${selectedGoalId === goal.id ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => { setSelectedGoalId(goal.id); setSelectedTaskId(null); }}
          >
            <input
              type="checkbox"
              checked={goal.completed === true}
              onChange={() => handleGoalToggle(goal.id)}
              className="accent-blue-600"
            />
            <input
              className="font-semibold text-base border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
              value={goal.text}
              onChange={e => handleGoalChange(goal.id, e.target.value)}
            />
            {project === 'ALL_PROJECTS' && <span className="text-xs text-gray-300 ml-2">[{projectName}]</span>}
          </div>
        ))}
        {middleSection === 'monthly' && project !== 'ALL_PROJECTS' && centerColumnGoals.map(({ goal, projectName }) => (
          <div
            key={`${projectName}-${goal.id}`}
            className={`bg-[#818181] rounded-lg p-4 mb-2 flex flex-row items-center gap-2 border border-gray-600 cursor-pointer ${selectedGoalId === goal.id ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => { setSelectedGoalId(goal.id); setSelectedTaskId(null); }}
          >
            <input
              type="checkbox"
              checked={goal.completed === true}
              onChange={() => handleGoalToggle(goal.id)}
              className="accent-blue-600"
            />
            <input
              className="font-semibold text-base border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
              value={goal.text}
              onChange={e => handleGoalChange(goal.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      {/* Right Column */}
      <div className="flex flex-col gap-4 w-1/4 min-w-[300px]">
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="font-semibold mb-4 text-white">Properties</div>
          {middleSection === 'weekly' && selectedTask ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200 mb-1">Title</label>
                <input
                  className={SELECT_STYLES}
                  placeholder="Enter task title"
                  value={selectedTask.text}
                  onChange={e => handlePropertiesChange('text', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Description</label>
                <textarea
                  className={SELECT_STYLES}
                  placeholder="Enter task description"
                  value={selectedTask.description || ''}
                  onChange={e => handlePropertiesChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Week</label>
                <select
                  className={SELECT_STYLES}
                  value={String(selectedTask.week)}
                  onChange={e => handlePropertiesChange('week', e.target.value ? Number(e.target.value) : null)}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Status</label>
                <select
                  className={SELECT_STYLES}
                  value={selectedTask.completed ? 'Completed' : 'Active'}
                  onChange={e => handlePropertiesChange('completed', e.target.value === 'Completed')}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Linked Monthly Goal</label>
                <select
                  className={SELECT_STYLES}
                  value={selectedTask?.skillLink?.split(':')[1] || ''}
                  onChange={e => handlePropertiesChange('skillLink', e.target.value ? `monthly:${e.target.value}` : '')}
                >
                  <option value="">No Link</option>
                  {projects[project]?.monthlyGoals?.map((goal: MonthlyGoal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.text || 'Untitled Goal'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Date Added</label>
                <input
                  type="date"
                  className={SELECT_STYLES}
                  value={selectedTask.dateAdded}
                  onChange={e => handlePropertiesChange('dateAdded', e.target.value)}
                />
              </div>
              {selectedTask.completed && (
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Date Completed</label>
                  <input
                    type="date"
                    className={SELECT_STYLES}
                    value={selectedTask.dateCompleted || new Date().toISOString().slice(0, 10)}
                    onChange={e => handlePropertiesChange('dateCompleted', e.target.value)}
                  />
                </div>
              )}
              <div className="pt-4 border-t border-gray-600">
                <button
                  onClick={handleDeleteTask}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  Delete Task
                </button>
              </div>
            </div>
          ) : middleSection === 'monthly' && selectedGoal ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200 mb-1">Title</label>
                <input
                  className={SELECT_STYLES}
                  placeholder="Enter goal title"
                  value={selectedGoal.text}
                  onChange={e => handleGoalPropertiesChange('text', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Description</label>
                <textarea
                  className={SELECT_STYLES}
                  placeholder="Enter goal description"
                  value={selectedGoal.description || ''}
                  onChange={e => handleGoalPropertiesChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Month</label>
                <select
                  className={SELECT_STYLES}
                  value={selectedGoal.month || selectedMonth}
                  onChange={e => handleGoalPropertiesChange('month', e.target.value)}
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Status</label>
                <select
                  className={SELECT_STYLES}
                  value={selectedGoal.completed ? 'Completed' : 'Active'}
                  onChange={e => handleGoalPropertiesChange('completed', e.target.value === 'Completed')}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Skill Link</label>
                <input
                  className={SELECT_STYLES}
                  placeholder="Enter skill link"
                  value={selectedGoal.skillLink || ''}
                  onChange={e => handleGoalPropertiesChange('skillLink', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Date Added</label>
                <input
                  type="date"
                  className={SELECT_STYLES}
                  value={selectedGoal.dateAdded}
                  onChange={e => handleGoalPropertiesChange('dateAdded', e.target.value)}
                />
              </div>
              {selectedGoal.completed && (
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Date Completed</label>
                  <input
                    type="date"
                    className={SELECT_STYLES}
                    value={selectedGoal.dateCompleted || new Date().toISOString().slice(0, 10)}
                    onChange={e => handleGoalPropertiesChange('dateCompleted', e.target.value)}
                  />
                </div>
              )}
              <div className="pt-4 border-t border-gray-600">
                <button
                  onClick={handleDeleteGoal}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  Delete Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="text-white text-sm">
              {middleSection === 'weekly' 
                ? "Select a weekly task to edit its properties."
                : "Select a monthly goal to edit its properties."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionLogPage; 