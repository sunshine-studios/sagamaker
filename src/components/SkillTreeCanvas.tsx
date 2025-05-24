import React, { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface CategoryNode {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId?: string;
}

const CATEGORIES: Omit<CategoryNode, "x" | "y">[] = [
  { id: "body", name: "Body" },
  { id: "mind", name: "Mind" },
  { id: "spirit", name: "Spirit" },
  { id: "professionalism", name: "Professionalism" },
  { id: "creativity", name: "Creativity" },
];

const SVG_WIDTH = 5000;
const SVG_HEIGHT = 5000;
const SVG_CENTER = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
const CIRCLE_RADIUS = 200;
const NODE_RADIUS = 40;
const MIN_DISTANCE = NODE_RADIUS * 2 + 10; // Minimum distance between nodes

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

let nodeIdCounter = 1;

function getOutwardPosition(parent: CategoryNode, angle: number, nodes: CategoryNode[], attempt = 1): { x: number; y: number } {
  // Place new node further out from parent, away from center
  const distance = 120 + attempt * 30;
  const x = parent.x + distance * Math.cos(angle);
  const y = parent.y + distance * Math.sin(angle);
  // Check for overlap
  for (const n of nodes) {
    const dx = n.x - x;
    const dy = n.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) {
      // Overlaps, try further out
      return getOutwardPosition(parent, angle, nodes, attempt + 1);
    }
  }
  return { x, y };
}

// Initialize default nodes
function getDefaultNodes(): CategoryNode[] {
  return CATEGORIES.map((cat, i) => {
    const pos = getCirclePosition(i, CATEGORIES.length, SVG_CENTER);
    return { ...cat, x: pos.x, y: pos.y };
  });
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
          const { nodes: savedNodes, nodeIdCounter: savedCounter } = JSON.parse(savedData);
          if (Array.isArray(savedNodes) && savedNodes.length > 0) {
            setNodes(savedNodes);
            nodeIdCounter = savedCounter;
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
          nodes,
          nodeIdCounter
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

  // Reset skill tree
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the skill tree? This will delete all custom skills.')) {
      localStorage.removeItem(STORAGE_KEY);
      setNodes(getDefaultNodes());
      nodeIdCounter = 1;
      setSelectedNodeId(null);
    }
  };

  // Add child node
  const handleAddChild = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    let angle = categoryAngles[parentId];
    if (parent.parentId) {
      const grandParent = nodes.find(n => n.id === parent.parentId);
      if (grandParent) {
        angle = Math.atan2(parent.y - grandParent.y, parent.x - grandParent.x);
      }
    }
    const { x, y } = getOutwardPosition(parent, angle, nodes);
    const newNode: CategoryNode = {
      id: `node-${nodeIdCounter++}`,
      name: "New Skill",
      x,
      y,
      parentId,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    // Pan to the new node after a short delay (to ensure it's rendered)
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

  // Update node name
  const handleNodeNameChange = (id: string, newName: string) => {
    setNodes((prev) => prev.map(n => n.id === id ? { ...n, name: newName } : n));
  };

  // Draw lines from each child to its parent
  const lines = nodes
    .filter((node) => node.parentId)
    .map((node) => {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return null;
      return (
        <line
          key={`${node.id}-line`}
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

  return (
    <>
      <div className="fixed inset-0 w-screen h-screen z-0 bg-gradient-to-br from-blue-900 to-gray-900">
        <button
          onClick={handleReset}
          className="fixed top-4 left-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Reset Skill Tree
        </button>
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
                {nodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS}
                      fill="#fff"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      style={{ filter: "drop-shadow(0 2px 8px #0003)" }}
                      pointerEvents="none"
                      onClick={() => {
                        if (node.parentId) setSelectedNodeId(node.id);
                      }}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="font-bold text-lg"
                      fill="#1e3a8a"
                      style={{ pointerEvents: "none", fontSize: 18 }}
                    >
                      {node.name}
                    </text>
                    {/* Show + button for root nodes only */}
                    {!node.parentId && (
                      <foreignObject
                        x={node.x - 14}
                        y={node.y + NODE_RADIUS}
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
                    )}
                  </g>
                ))}
              </svg>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
      {/* Side panel for editing node name */}
      {selectedNode && (
        <div className="fixed top-10 right-10 w-96 bg-[#22223b] rounded-lg shadow-lg border border-gray-700 p-6 z-50">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setSelectedNodeId(null)}>✕</button>
          <h2 className="text-xl font-semibold mb-4 text-white">Edit Skill</h2>
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-300 mb-1">Name</label>
            <input
              className="w-full border border-gray-600 bg-[#2a2a40] text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedNode.name}
              onChange={e => handleNodeNameChange(selectedNode.id, e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
} 