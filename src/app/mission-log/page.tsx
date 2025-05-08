'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface Goal {
  id: number;
  text: string;
  completed: boolean;
}
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  skill?: string;
  created?: string;
  modified?: string;
  status?: string;
}
interface ProjectData {
  monthlyGoals: Goal[];
  weeklyTasks: Task[];
}

const LS_KEY = 'missionlog-projects-v1';
const LS_THEME = 'missionlog-theme-v1';
const LS_PROJECT = 'missionlog-selected-project-v1';

const defaultGoals: Goal[] = [
  { id: 1, text: 'Goal 1', completed: true },
  { id: 2, text: 'Goal 2', completed: false },
];
const defaultTasks: Task[] = [
  { id: 1, title: 'Task 1', description: '', completed: true, created: '2025-05-05', modified: '2025-05-05', status: 'Active' },
  { id: 2, title: 'Task 2', description: '', completed: false, created: '2025-05-05', modified: '2025-05-05', status: 'Active' },
];

const MissionLogPage = () => {
  // State
  const [theme, setTheme] = useState('');
  const [project, setProject] = useState('Project 1');
  const [projects, setProjects] = useState<{ [name: string]: ProjectData }>({
    'Project 1': { monthlyGoals: defaultGoals, weeklyTasks: defaultTasks },
    'Project 2': { monthlyGoals: defaultGoals, weeklyTasks: defaultTasks },
  });
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setProjects(JSON.parse(stored));
    const storedTheme = localStorage.getItem(LS_THEME);
    if (storedTheme) setTheme(storedTheme);
    const storedProject = localStorage.getItem(LS_PROJECT);
    if (storedProject) setProject(storedProject);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem(LS_PROJECT, project);
  }, [project]);

  // Handlers
  const handleGoalChange = (id: number, value: string) => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        monthlyGoals: prev[project].monthlyGoals.map(g => g.id === id ? { ...g, text: value } : g),
      },
    }));
  };
  const handleGoalToggle = (id: number) => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        monthlyGoals: prev[project].monthlyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g),
      },
    }));
  };
  const handleTaskChange = (id: number, field: 'title' | 'description', value: string) => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        weeklyTasks: prev[project].weeklyTasks.map(t => t.id === id ? { ...t, [field]: value, modified: new Date().toISOString().slice(0, 10) } : t),
      },
    }));
  };
  const handleTaskToggle = (id: number) => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        weeklyTasks: prev[project].weeklyTasks.map(t => t.id === id ? { ...t, completed: !t.completed, modified: new Date().toISOString().slice(0, 10) } : t),
      },
    }));
  };
  const handleAddProject = () => {
    if (!newProjectName.trim() || projects[newProjectName]) return;
    setProjects(prev => ({
      ...prev,
      [newProjectName]: { monthlyGoals: [], weeklyTasks: [] },
    }));
    setProject(newProjectName);
    setNewProjectName('');
  };
  const handleAddGoal = () => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        monthlyGoals: [
          ...prev[project].monthlyGoals,
          { id: Date.now(), text: '', completed: false },
        ],
      },
    }));
  };
  const handleAddTask = () => {
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        weeklyTasks: [
          ...prev[project].weeklyTasks,
          { id: Date.now(), title: '', description: '', completed: false, created: new Date().toISOString().slice(0, 10), modified: new Date().toISOString().slice(0, 10), status: 'Active' },
        ],
      },
    }));
  };
  // Properties panel handlers
  const selectedTask = projects[project]?.weeklyTasks.find(t => t.id === selectedTaskId) || null;
  const handlePropertiesChange = (field: keyof Task, value: string) => {
    if (!selectedTask) return;
    setProjects(prev => ({
      ...prev,
      [project]: {
        ...prev[project],
        weeklyTasks: prev[project].weeklyTasks.map(t =>
          t.id === selectedTaskId ? { ...t, [field]: value, modified: new Date().toISOString().slice(0, 10) } : t
        ),
      },
    }));
  };

  // Render
  const projectNames = Object.keys(projects);
  const currentGoals = projects[project]?.monthlyGoals || [];
  const currentTasks = projects[project]?.weeklyTasks || [];

  return (
    <div className="flex flex-row w-full min-h-screen p-6 gap-6 bg-[#083676]">
      {/* Left Column */}
      <div className="flex flex-col gap-4 w-1/4 min-w-[260px]">
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="font-semibold mb-2 text-white">Theme</div>
          <input
            className="w-full border border-gray-600 rounded p-2 text-sm bg-[#22223b] text-white placeholder-gray-300 focus:outline-none"
            placeholder="Current theme text will display here"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          />
        </div>
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="font-semibold mb-2 text-white">Project</div>
          <select
            className="w-full border border-gray-600 rounded p-2 text-sm bg-[#22223b] text-white focus:outline-none mb-2"
            value={project}
            onChange={e => setProject(e.target.value)}
          >
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
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white">Monthly Goals</span>
            <button className="text-xl text-white" onClick={handleAddGoal}>+</button>
          </div>
          {currentGoals.map(goal => (
            <div key={goal.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => handleGoalToggle(goal.id)}
                className="accent-blue-600"
              />
              <input
                className="border-b border-gray-400 bg-transparent focus:outline-none w-full text-sm text-white placeholder-gray-300"
                value={goal.text}
                onChange={e => handleGoalChange(goal.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Middle Column */}
      <div className="flex flex-col gap-4 w-2/4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-lg text-white">Weekly Tasks</span>
          <button className="text-xl text-white" onClick={handleAddTask}>+</button>
        </div>
        {currentTasks.map(task => (
          <div
            key={task.id}
            className={`bg-[#818181] rounded-lg p-4 mb-2 flex flex-col gap-2 border border-gray-600 cursor-pointer ${selectedTaskId === task.id ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setSelectedTaskId(task.id)}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={e => { e.stopPropagation(); handleTaskToggle(task.id); }}
                className="accent-blue-600"
              />
              <input
                className="font-semibold text-base border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
                value={task.title}
                onChange={e => handleTaskChange(task.id, 'title', e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              <button className="ml-auto text-white" onClick={e => { e.stopPropagation(); setSelectedTaskId(task.id); }}>...</button>
            </div>
            <input
              className="text-sm border-b border-gray-400 bg-transparent focus:outline-none w-full text-white placeholder-gray-300"
              placeholder="Task description goes here"
              value={task.description}
              onChange={e => handleTaskChange(task.id, 'description', e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
        ))}
      </div>
      {/* Right Column */}
      <div className="flex flex-col gap-4 w-1/4 min-w-[300px]">
        <div className="bg-[#818181] rounded-lg p-4">
          <div className="font-semibold mb-2 text-white">Properties</div>
          {selectedTask ? (
            <>
              <input
                className="w-full border border-gray-600 rounded p-2 mb-2 text-sm bg-[#22223b] text-white placeholder-gray-300 focus:outline-none"
                placeholder="Enter task title"
                value={selectedTask.title}
                onChange={e => handlePropertiesChange('title', e.target.value)}
              />
              <textarea
                className="w-full border border-gray-600 rounded p-2 mb-2 text-sm bg-[#22223b] text-white placeholder-gray-300 focus:outline-none"
                placeholder="Enter task description"
                value={selectedTask.description}
                onChange={e => handlePropertiesChange('description', e.target.value)}
              />
              <input
                className="w-full border border-gray-600 rounded p-2 mb-2 text-sm bg-[#22223b] text-white placeholder-gray-300 focus:outline-none"
                placeholder="Skill"
                value={selectedTask.skill || ''}
                onChange={e => handlePropertiesChange('skill', e.target.value)}
              />
              <select
                className="w-full border border-gray-600 rounded p-2 mb-2 text-sm bg-[#22223b] text-white focus:outline-none"
                value={selectedTask.status || 'Active'}
                onChange={e => handlePropertiesChange('status', e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              <div className="text-xs mt-2 text-white">
                <div>Created: {selectedTask.created}</div>
                <div>Modified: {selectedTask.modified}</div>
                <div>Status: {selectedTask.status}</div>
              </div>
            </>
          ) : (
            <div className="text-white text-sm">Select a weekly task to edit its properties.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionLogPage; 