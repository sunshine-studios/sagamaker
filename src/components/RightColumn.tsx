import React from 'react';

const RightColumn = () => {
  // Sample skill tree nodes
  const skillNodes = [
    { id: 1, x: 50, y: 20, completed: true, level: 1 },
    { id: 2, x: 30, y: 40, completed: true, level: 1 },
    { id: 3, x: 70, y: 40, completed: false, level: 2 },
    { id: 4, x: 20, y: 60, completed: false, level: 2 },
    { id: 5, x: 50, y: 60, completed: false, level: 2 },
    { id: 6, x: 80, y: 60, completed: false, level: 3 },
    { id: 7, x: 40, y: 80, completed: false, level: 3 },
    { id: 8, x: 60, y: 80, completed: false, level: 3 },
  ];

  const connections = [
    { from: 1, to: 2 }, { from: 1, to: 3 },
    { from: 2, to: 4 }, { from: 2, to: 5 },
    { from: 3, to: 5 }, { from: 3, to: 6 },
    { from: 5, to: 7 }, { from: 5, to: 8 },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="bg-white border-4 border-black mb-4 relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
      }}>
        <div className="absolute top-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        <div className="p-4">
          <h2 className="text-lg font-bold text-black">SKILL TREE</h2>
        </div>
      </div>

      {/* Skill Tree Container */}
      <div className="flex-1 min-h-0 w-full bg-white border-4 border-black relative overflow-hidden" style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
      }}>
        <div className="absolute top-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(20px 0, 100% 0, 0 100%, 0 100%, 0 0px)'
        }}></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
        }}></div>
        
        <div className="p-6 w-full h-full relative">
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Connection lines */}
            {connections.map((conn, idx) => {
              const fromNode = skillNodes.find(n => n.id === conn.from);
              const toNode = skillNodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#000"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Skill nodes */}
            {skillNodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={node.completed ? "#FF6B35" : "white"}
                  stroke="#000"
                  strokeWidth="2"
                  className="cursor-pointer hover:stroke-orange-500"
                />
                {node.completed && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="3"
                    fill="white"
                  />
                )}
              </g>
            ))}
          </svg>
          
          {/* Skill tree legend/info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 border border-black rounded-full"></div>
                  <span className="text-black font-medium">Unlocked</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-white border border-black rounded-full"></div>
                  <span className="text-black font-medium">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightColumn; 