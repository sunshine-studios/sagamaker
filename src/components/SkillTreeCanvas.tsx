import React, { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface CategoryNode {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId?: string;
  rootCategory?: string;
  emoji?: string;
}

const CATEGORIES: Omit<CategoryNode, "x" | "y">[] = [
  { id: "category-body", name: "Body" },
  { id: "category-mind", name: "Mind" },
  { id: "category-spirit", name: "Spirit" },
  { id: "category-professionalism", name: "Professionalism" },
  { id: "category-creativity", name: "Creativity" },
];

const EMOJIS = [
  "⚔️", "🛡️", "🏃", "💪", "🧠", "📚", "🎨", "🎭", "🎮", "🎲",
  "🎯", "🎪", "🧘", "🏋️", "🤸", "🎭", "🎨", "🎼", "🎸", "🎺",
  "🎻", "🎹", "🎤", "📷", "🎥", "💻", "📱", "🔧", "⚡", "💡"
];

const SVG_WIDTH = 5000;
const SVG_HEIGHT = 5000;
const SVG_CENTER = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
const CIRCLE_RADIUS = 200;
const NODE_RADIUS = 60;
const MIN_DISTANCE = NODE_RADIUS * 2.5 + 20;
const MAX_TEXT_LENGTH = NODE_RADIUS * 1.6; // Reduced max text length
const BASE_FONT_SIZE = 14; // Reduced base font size
const SECTOR_ANGLE = (2 * Math.PI) / CATEGORIES.length;
const MAX_LINES = 3;

// Local storage key
const STORAGE_KEY = 'skillTreeData';

function getCirclePosition(index: number, total: number, center: { x: number; y: number }) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: center.x + CIRCLE_RADIUS * Math.cos(angle),
    y: center.y + CIRCLE_RADIUS * Math.sin(angle),
    angle,
  };
}

function calculateChildAngle(parentNode: CategoryNode, existingChildren: CategoryNode[], baseAngle: number, isRootCategory: boolean = false): number {
  if (!isRootCategory) {
    // For skill nodes, use simple incremental spacing
    const angleIncrement = Math.PI / 4; // 45 degrees apart
    return baseAngle + (existingChildren.length * angleIncrement);
  }

  // For root categories, constrain children to the category's sector
  const sectorHalfAngle = SECTOR_ANGLE / 2;
  const sectorStartAngle = baseAngle - sectorHalfAngle;
  const sectorEndAngle = baseAngle + sectorHalfAngle;
  
  if (existingChildren.length === 0) {
    return baseAngle; // First child goes straight out
  }

  // Distribute children evenly within the sector
  const numSlots = 5; // Number of possible positions within sector
  const slotAngle = SECTOR_ANGLE / numSlots;
  const childSlot = existingChildren.length % numSlots;
  
  return sectorStartAngle + (childSlot * slotAngle) + (slotAngle / 2);
}

// Generate a unique ID with timestamp and random number
function generateUniqueId(prefix: string = 'node'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

let nodeIdCounter = 1;

function getOutwardPosition(parent: CategoryNode, angle: number, nodes: CategoryNode[], isRootCategory: boolean = false, attempt = 1): { x: number; y: number } {
  // Base distance depends on whether it's from root or from a skill node
  const baseDistance = isRootCategory ? 150 : 120;
  const distance = baseDistance + (attempt * 40);
  
  const x = parent.x + distance * Math.cos(angle);
  const y = parent.y + distance * Math.sin(angle);
  
  // Check for overlap with all other nodes
  for (const n of nodes) {
    const dx = n.x - x;
    const dy = n.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MIN_DISTANCE) {
      // If collision detected, try further out or slightly adjust angle
      if (attempt < 5) {
        return getOutwardPosition(parent, angle, nodes, isRootCategory, attempt + 1);
      } else {
        // After 5 attempts, try adjusting the angle slightly
        const adjustedAngle = angle + (Math.random() - 0.5) * 0.5;
        return getOutwardPosition(parent, adjustedAngle, nodes, isRootCategory, 1);
      }
    }
  }
  
  return { x, y };
}

// Initialize default nodes
function getDefaultNodes(): CategoryNode[] {
  return CATEGORIES.map((cat) => {
    const pos = getCirclePosition(CATEGORIES.indexOf(cat), CATEGORIES.length, SVG_CENTER);
    return { ...cat, x: pos.x, y: pos.y };
  });
}

// Calculate the appropriate font size based on text length and line count
function calculateFontSize(text: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return BASE_FONT_SIZE;

  context.font = `${BASE_FONT_SIZE}px Inter`;
  
  // Split text into lines (handle both manual line breaks and word wrapping)
  const lines = text.split('\n');
  const lineCount = Math.max(1, lines.length);
  
  // Find the longest line
  const maxLineWidth = Math.max(...lines.map(line => context.measureText(line).width));
  
  if (maxLineWidth <= MAX_TEXT_LENGTH) {
    // If text fits within max width, adjust based on line count
    return Math.min(BASE_FONT_SIZE, BASE_FONT_SIZE * (1 / lineCount));
  }
  
  // Scale down the font size to fit the longest line
  const scaledSize = Math.floor(BASE_FONT_SIZE * (MAX_TEXT_LENGTH / maxLineWidth));
  // Further reduce size if we have multiple lines
  return Math.min(scaledSize, BASE_FONT_SIZE * (1 / lineCount));
}

export default function SkillTreeCanvas() {
  const [nodes, setNodes] = useState<CategoryNode[]>([]);
  const [categoryAngles, setCategoryAngles] = useState<{ [id: string]: number }>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Load data from local storage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const { nodes: savedNodes } = JSON.parse(savedData);
          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            setNodes(savedNodes);
          } else {
            setNodes(getDefaultNodes());
          }
        } else {
          setNodes(getDefaultNodes());
        }
      } catch (error) {
        console.error('Error loading skill tree data:', error);
        setNodes(getDefaultNodes());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to local storage whenever nodes change
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes
        }));
      } catch (error) {
        console.error('Error saving skill tree data:', error);
      }
    }
  }, [nodes, isLoading]);

  // Initialize category angles
  useEffect(() => {
    const angles: { [id: string]: number } = {};
    CATEGORIES.forEach((cat, i) => {
      angles[cat.id] = getCirclePosition(i, CATEGORIES.length, SVG_CENTER).angle;
    });
    setCategoryAngles(angles);
  }, []);

  // Center the SVG on initial load
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (transformRef.current) {
          const { innerWidth, innerHeight } = window;
          transformRef.current.setTransform(
            innerWidth / 2 - SVG_CENTER.x,
            innerHeight / 2 - SVG_CENTER.y,
            1,
            0
          );
        }
      }, 100);
    }
  }, [isLoading]);

  // Reset skill tree (complete reset)
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the skill tree? This will delete all custom skills.')) {
      localStorage.removeItem(STORAGE_KEY);
      setNodes(getDefaultNodes());
      setSelectedNodeId(null);
    }
  };

  // Add event listener for clear skills
  useEffect(() => {
    const handleClearSkillTree = () => {
      if (window.confirm('Are you sure you want to clear all skills? This will reset the tree to just the main categories.')) {
        const defaultNodes = getDefaultNodes();
        setNodes(defaultNodes);
        setSelectedNodeId(null);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes: defaultNodes
        }));
      }
    };

    window.addEventListener('clearSkillTree', handleClearSkillTree);
    return () => window.removeEventListener('clearSkillTree', handleClearSkillTree);
  }, []);

  // Add child node to any node
  const handleAddChild = (parentId: string) => {
    console.log('Adding child to parent:', parentId);
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) {
      console.log('Parent not found:', parentId);
      return;
    }

    // Find existing children of this specific parent
    const existingChildren = nodes.filter(node => node.parentId === parentId);
    console.log('Existing children count:', existingChildren.length);

    let angle;
    const isRootCategory = !parent.parentId;
    
    if (isRootCategory) {
      // For root category nodes
      console.log('Adding to root category:', parent.name);
      const categoryIndex = CATEGORIES.findIndex(cat => cat.id === parent.id);
      const baseAngle = (2 * Math.PI * categoryIndex) / CATEGORIES.length - Math.PI / 2;
      angle = calculateChildAngle(parent, existingChildren, baseAngle, true);
    } else {
      // For skill nodes, find the root category to stay within its sector
      const rootCategory = nodes.find(n => n.id === parent.rootCategory);
      if (rootCategory) {
        const categoryIndex = CATEGORIES.findIndex(cat => cat.id === rootCategory.id);
        const baseCategoryAngle = (2 * Math.PI * categoryIndex) / CATEGORIES.length - Math.PI / 2;
        
        // Calculate angle based on parent-child relationship but constrain to sector
        const parentToGrandparentAngle = Math.atan2(parent.y - rootCategory.y, parent.x - rootCategory.x);
        angle = calculateChildAngle(parent, existingChildren, parentToGrandparentAngle, false);
        
        // Ensure angle stays within the category's sector
        const sectorHalfAngle = SECTOR_ANGLE / 2;
        const sectorStart = baseCategoryAngle - sectorHalfAngle;
        const sectorEnd = baseCategoryAngle + sectorHalfAngle;
        
        // Normalize angle to sector bounds
        if (angle < sectorStart) angle = sectorStart + 0.1;
        if (angle > sectorEnd) angle = sectorEnd - 0.1;
      } else {
        angle = Math.random() * 2 * Math.PI;
      }
    }

    const { x, y } = getOutwardPosition(parent, angle, nodes, isRootCategory);
    
    const newNode: CategoryNode = {
      id: generateUniqueId('skill'),
      name: "New Skill",
      x,
      y,
      parentId: parentId,
      rootCategory: parent.parentId ? parent.rootCategory : parent.id
    };

    console.log('Creating new node:', newNode);

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);

    // Pan to the new node
    setTimeout(() => {
      if (transformRef.current) {
        const { innerWidth, innerHeight } = window;
        transformRef.current.setTransform(
          innerWidth / 2 - x,
          innerHeight / 2 - y,
          1,
          200
        );
      }
    }, 100);
  };

  // Update node name with support for line breaks
  const handleNodeNameChange = (id: string, newName: string) => {
    // Limit to MAX_LINES number of lines
    const lines = newName.split('\n');
    if (lines.length > MAX_LINES) {
      newName = lines.slice(0, MAX_LINES).join('\n');
    }
    setNodes((prev) => prev.map(n => n.id === id ? { ...n, name: newName } : n));
  };

  // Update node emoji
  const handleEmojiChange = (nodeId: string, emoji: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, emoji } : n));
  };

  // Draw lines from each child to its parent
  const lines = nodes
    .filter((node) => node.parentId)
    .map((node) => {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return null;
      return (
        <line
          key={`${parent.id}-${node.id}-line`}
          x1={parent.x}
          y1={parent.y}
          x2={node.x}
          y2={node.y}
          stroke="#60a5fa"
          strokeWidth={3}
        />
      );
    });

  // Side panel for editing node name
  const selectedNode = nodes.find(n => n.id === selectedNodeId && n.parentId);

  // Add resetView function
  const resetView = () => {
    if (transformRef.current) {
      const { innerWidth, innerHeight } = window;
      transformRef.current.setTransform(
        innerWidth / 2 - SVG_CENTER.x,
        innerHeight / 2 - SVG_CENTER.y,
        1,
        200  // Added smooth animation duration
      );
    }
  };

  // Add event listener for reset view
  useEffect(() => {
    const handleResetView = () => resetView();
    window.addEventListener('resetSkillTreeView', handleResetView);
    return () => window.removeEventListener('resetSkillTreeView', handleResetView);
  }, []);

  // Delete node and all its children recursively
  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    // Don't allow deleting root category nodes
    if (!nodeToDelete.parentId) {
      alert("Cannot delete root category nodes");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${nodeToDelete.name}" and all its child skills?`)) {
      // Recursive function to get all child node IDs
      const getChildNodeIds = (parentId: string): string[] => {
        const childNodes = nodes.filter(n => n.parentId === parentId);
        return childNodes.reduce((acc, child) => {
          return [...acc, child.id, ...getChildNodeIds(child.id)];
        }, [] as string[]);
      };

      // Get all child nodes that need to be deleted
      const childNodeIds = getChildNodeIds(nodeId);
      
      // Delete the node and all its children
      setNodes(prev => prev.filter(node => 
        node.id !== nodeId && !childNodeIds.includes(node.id)
      ));
      
      setSelectedNodeId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 w-screen h-screen z-0 bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Reset Skill Tree
          </button>
        </div>
        {!isLoading && (
          <TransformWrapper
            ref={transformRef}
            minScale={0.05}
            maxScale={2}
            initialScale={1}
            initialPositionX={0}
            initialPositionY={0}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            panning={{ velocityDisabled: true }}
            limitToBounds={false}
          >
            <TransformComponent>
              <svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                style={{ background: 'rgba(8,54,118,0.1)' }}
              >
                {lines}
                {nodes.map((node) => {
                  const fontSize = calculateFontSize(node.name);
                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_RADIUS}
                        fill="#fff"
                        stroke={node.parentId ? "#3b82f6" : "#4c1d95"}
                        strokeWidth={4}
                        style={{ filter: "drop-shadow(0 2px 8px #0003)", cursor: 'pointer' }}
                        onClick={() => setSelectedNodeId(node.id)}
                        className="hover:brightness-90 transition-all"
                      />
                      {/* Background circle for emoji */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_RADIUS * 0.5}
                        fill="rgba(255,255,255,0.6)"
                        onClick={() => setSelectedNodeId(node.id)}
                      />
                      {/* Emoji */}
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="select-none"
                        style={{ fontSize: 32, cursor: 'pointer' }}
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        {node.emoji || "⭐"}
                      </text>
                      {/* Node Name with dynamic font size */}
                      <foreignObject
                        x={node.x - NODE_RADIUS * 0.8}
                        y={node.y + NODE_RADIUS * 0.2}
                        width={NODE_RADIUS * 1.6}
                        height={NODE_RADIUS * 0.8}
                      >
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <p
                            className={`font-bold select-none text-center leading-tight ${
                              node.parentId ? 'text-[#1e3a8a]' : 'text-[#4c1d95]'
                            }`}
                            style={{
                              fontSize: `${fontSize}px`,
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: '3',
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.2',
                              maxHeight: `${NODE_RADIUS * 0.75}px`,
                            }}
                          >
                            {node.name}
                          </p>
                        </div>
                      </foreignObject>
                      {/* Add skill button */}
                      <foreignObject
                        x={node.x - 14}
                        y={node.y + NODE_RADIUS - 5}
                        width={28}
                        height={28}
                      >
                        <button
                          className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow border-2 border-white hover:bg-blue-600"
                          style={{ fontSize: 20, zIndex: 3 }}
                          onClick={e => {
                            e.stopPropagation();
                            handleAddChild(node.id);
                          }}
                          title="Add child skill"
                        >
                          +
                        </button>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
      {/* Properties panel */}
      {selectedNodeId && (
        <div className="fixed top-10 right-10 w-96 bg-[#22223b] rounded-lg shadow-lg border border-gray-700 p-6 z-50">
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-white" 
            onClick={() => setSelectedNodeId(null)}
          >
            ✕
          </button>
          <h2 className="text-xl font-semibold mb-4 text-white">
            {nodes.find(n => n.id === selectedNodeId)?.parentId ? 'Edit Skill' : 'Category Settings'}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1">Name</label>
            <textarea
              className="w-full border border-gray-600 bg-[#2a2a40] text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              value={nodes.find(n => n.id === selectedNodeId)?.name || ''}
              onChange={e => handleNodeNameChange(selectedNodeId, e.target.value)}
              rows={3}
              placeholder="Enter skill name (up to 3 lines)"
              style={{ minHeight: '4.5rem' }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1">Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-[#2a2a40] rounded border border-gray-600">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiChange(selectedNodeId, emoji)}
                  className={`text-2xl p-2 rounded hover:bg-gray-600 transition-colors ${
                    nodes.find(n => n.id === selectedNodeId)?.emoji === emoji ? 'bg-gray-600' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Category: {nodes.find(n => n.id === selectedNodeId)?.rootCategory ? 
              CATEGORIES.find(c => c.id === nodes.find(n => n.id === selectedNodeId)?.rootCategory)?.name : 
              'Root Category'
            }
          </div>
          {nodes.find(n => n.id === selectedNodeId)?.parentId && (
            <button
              onClick={() => handleDeleteNode(selectedNodeId)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg mt-2"
            >
              Delete Skill
            </button>
          )}
        </div>
      )}
    </>
  );
} 