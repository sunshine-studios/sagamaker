import React, { useState, useEffect } from 'react';

interface CategoryNode {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId?: string;
  rootCategory?: string;
  emoji?: string;
}

const CATEGORIES = [
  { id: "category-body", name: "Body" },
  { id: "category-mind", name: "Mind" },
  { id: "category-spirit", name: "Spirit" },
  { id: "category-professionalism", name: "Professionalism" },
  { id: "category-creativity", name: "Creativity" },
];

const STORAGE_KEY = 'skillTreeData';

const RightColumn = () => {
  const [nodes, setNodes] = useState<CategoryNode[]>([]);

  useEffect(() => {
    const loadSkillTreeData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const { nodes: savedNodes } = JSON.parse(savedData);
          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            setNodes(savedNodes);
          }
        }
      } catch (error) {
        console.error('Error loading skill tree preview data:', error);
      }
    };

    loadSkillTreeData();
    
    // Listen for storage changes to update preview when skill tree is modified
    const handleStorageChange = () => {
      loadSkillTreeData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events when localStorage is updated from the same tab
    window.addEventListener('skillTreeUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('skillTreeUpdated', handleStorageChange);
    };
  }, []);

  // Calculate bounds for centering the preview
  const getBounds = (nodes: CategoryNode[]) => {
    if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0, centerY: 0 };
    
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    
    return {
      minX, maxX, minY, maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  };

  const bounds = getBounds(nodes);
  // Fixed preview dimensions - adjusted to fit within the container
  const previewWidth = 500;
  const previewHeight = 350;

  return (
    <div className="flex flex-col w-full h-full">
      <span className="text-white font-semibold mb-2">Skill Tree</span>
      <div className="flex-1 min-h-0 w-full bg-transparent rounded-lg p-4">
        {nodes.length > 0 ? (
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-900/50 to-gray-900/50 rounded-lg overflow-hidden relative"
          >
            <svg 
              className="w-full h-full" 
              viewBox={`${bounds.centerX - previewWidth/2} ${bounds.centerY - previewHeight/2} ${previewWidth} ${previewHeight}`}
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Connection lines */}
              {nodes
                .filter(node => node.parentId)
                .map(node => {
                  const parent = nodes.find(n => n.id === node.parentId);
                  if (!parent) return null;
                  return (
                    <line
                      key={`${parent.id}-${node.id}-line`}
                      x1={parent.x}
                      y1={parent.y}
                      x2={node.x}
                      y2={node.y}
                      stroke="rgba(96, 165, 250, 0.7)"
                      strokeWidth="2"
                    />
                  );
                })}
              
              {/* Skill nodes */}
              {nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="25"
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke={node.parentId ? "rgba(59, 130, 246, 0.8)" : "rgba(76, 29, 149, 0.8)"}
                    strokeWidth="2"
                  />
                  {/* Emoji */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="14"
                  >
                    {node.emoji || "⭐"}
                  </text>
                  {/* Node name */}
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    fontSize="8"
                    fill="rgba(255, 255, 255, 0.9)"
                    className="font-semibold"
                  >
                    {node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name}
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Overlay text */}
            <div className="absolute bottom-2 right-2 text-white text-xs opacity-70 bg-black bg-opacity-40 px-2 py-1 rounded">
              Preview
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-gray-300 text-lg mb-2 block">No Skill Tree Yet</span>
              <span className="text-gray-400 text-sm">Visit the Skill Tree page to get started</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightColumn; 