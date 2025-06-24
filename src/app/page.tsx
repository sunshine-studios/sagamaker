'use client';

import React from 'react';
import MiddleColumn from '@/components/MiddleColumn';
import LeftColumn from '@/components/LeftColumn';
import RightColumn from '@/components/RightColumn';
import { useXP } from '@/context/XPContext';
import { ATTRIBUTE_KEYS, AttributeKey } from '@/components/LeftColumn';

export default function Home() {
  const { xp, levels, addXP, subtractXP } = useXP();
  // XP input state for debug panel
  const [xpInput, setXpInput] = React.useState<Record<AttributeKey, string>>({
    Body: '',
    Mind: '',
    Creativity: '',
    Professionalism: '',
    Spirit: '',
  });

  // Handle input change for XP
  const handleXpInputChange = (key: AttributeKey, value: string) => {
    setXpInput(prev => ({ ...prev, [key]: value }));
  };

  // Parse input and add/subtract XP
  const handleXpInputApply = (key: AttributeKey, sign: 1 | -1) => {
    const value = parseInt(xpInput[key], 10);
    if (!isNaN(value)) {
      if (sign === 1) addXP(key, value);
      else subtractXP(key, value);
      setXpInput(prev => ({ ...prev, [key]: '' }));
    }
  };

  // XP calculation function for next level
  const getNextLevelXP = (level: number) => {
    const x = level + 1;
    return ((2 * x * x) / 5).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header with geometric patterns */}
      <div className="relative bg-white border-b-4 border-black">
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric pattern lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <defs>
                <pattern id="stripes" patternUnits="userSpaceOnUse" width="40" height="40">
                  <rect width="40" height="40" fill="white"/>
                  <rect x="0" y="0" width="20" height="20" fill="black"/>
                  <rect x="20" y="20" width="20" height="20" fill="black"/>
                </pattern>
              </defs>
              <polygon points="0,0 200,0 300,100 0,100" fill="#FF6B35"/>
              <polygon points="300,0 500,0 600,100 200,100" fill="black"/>
              <polygon points="600,0 800,0 900,100 500,100" fill="white"/>
              <polygon points="900,0 1100,0 1200,100 800,100" fill="#FF6B35"/>
              <polygon points="1100,0 1200,0 1200,100 1000,100" fill="black"/>
            </svg>
          </div>
        </div>
        <div className="relative z-10 p-6">
          <h1 className="text-4xl font-bold text-black tracking-wider">SAGA MAKER</h1>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-8 bg-white">
        <div className="w-full relative">
          <div className="bg-white border-4 border-black w-full relative overflow-hidden" style={{
            clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
          }}>
            {/* Static Geometric Background */}
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
              <div className="w-full h-full relative bg-gray-100">
                {/* Base circuit grid */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}></div>

                {/* Angular tech lines - horizontal */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 0%, transparent 20%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.08) 22%, transparent 22%, transparent 78%, rgba(0,0,0,0.08) 78%, rgba(0,0,0,0.08) 80%, transparent 80%)
                  `,
                  backgroundSize: '120px 120px'
                }}></div>

                {/* Angular tech lines - vertical */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(0deg, transparent 0%, transparent 30%, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.06) 32%, transparent 32%, transparent 68%, rgba(0,0,0,0.06) 68%, rgba(0,0,0,0.06) 70%, transparent 70%)
                  `,
                  backgroundSize: '80px 160px'
                }}></div>

                {/* Diagonal circuit traces */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.05) 48%, rgba(0,0,0,0.05) 50%, transparent 50%),
                    linear-gradient(-45deg, transparent 85%, rgba(0,0,0,0.04) 85%, rgba(0,0,0,0.04) 87%, transparent 87%)
                  `,
                  backgroundSize: '200px 200px'
                }}></div>

                {/* Subtle chevron pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.03) 40%, rgba(0,0,0,0.03) 42%, transparent 42%, transparent 58%, rgba(0,0,0,0.03) 58%, rgba(0,0,0,0.03) 60%, transparent 60%)
                  `,
                  backgroundSize: '60px 60px'
                }}></div>

                {/* Orange accent corners - very subtle */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 10% 10%, rgba(242, 101, 34, 0.08) 0%, transparent 20%),
                    radial-gradient(circle at 90% 90%, rgba(242, 101, 34, 0.06) 0%, transparent 25%)
                  `,
                  backgroundSize: '800px 800px'
                }}></div>

                {/* Blue accent highlights - very subtle */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 90% 10%, rgba(0, 122, 204, 0.06) 0%, transparent 20%),
                    radial-gradient(circle at 10% 90%, rgba(0, 122, 204, 0.05) 0%, transparent 25%)
                  `,
                  backgroundSize: '600px 600px'
                }}></div>

                {/* Dashed detail lines */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 12px, transparent 12px, transparent 28px)
                  `,
                  backgroundSize: '280px 280px'
                }}></div>
              </div>
            </div>
            
            {/* Geometric corner accents */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-black" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
            }}></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-black" style={{
              clipPath: 'polygon(0 0, 100% 100%, 0 100%)'
            }}></div>
            
            {/* Diagonal border lines to complete the outline */}
            
            <div className="flex flex-row gap-[15px] w-full min-h-[80vh] items-stretch justify-center p-8">
              <div className="w-[400px] min-w-[300px] flex flex-col">
                <LeftColumn attributes={levels} setAttributes={() => {}} />
              </div>
              <div className="w-[440px] flex flex-col"><MiddleColumn /></div>
              <div className="flex-1 min-w-[300px] flex flex-col"><RightColumn /></div>
            </div>
          </div>
        </div>
        
        {/* Debug Panel */}
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg w-full max-w-2xl mx-auto">
          <h3 className="font-bold mb-2 text-black">Debug Attribute Panel</h3>
          <div className="flex flex-col gap-2">
            {(ATTRIBUTE_KEYS as AttributeKey[]).map((key) => (
              <div key={key} className="flex items-center gap-2 text-black">
                <span className="w-32 font-semibold">{key}</span>
                <button className="px-2 py-1 bg-yellow-300 rounded" onClick={() => subtractXP(key, 1)}>-</button>
                <span className="w-8 text-center">{levels[key]}</span>
                <button className="px-2 py-1 bg-yellow-300 rounded" onClick={() => addXP(key, 1)}>+</button>
                <span className="ml-4 text-sm text-black">Next Level XP: <span className="font-mono">{getNextLevelXP(levels[key])}</span></span>
                {/* Current XP */}
                <span className="ml-4 text-sm text-black">Current XP: <span className="font-mono">{xp[key]}</span></span>
                {/* XP input and buttons */}
                <input
                  type="number"
                  className="ml-2 w-16 px-1 py-0.5 border border-yellow-400 rounded"
                  value={xpInput[key]}
                  onChange={e => handleXpInputChange(key, e.target.value)}
                  placeholder="XP"
                />
                <button
                  className="px-2 py-1 bg-green-200 rounded"
                  onClick={() => handleXpInputApply(key, 1)}
                >+XP</button>
                <button
                  className="px-2 py-1 bg-red-200 rounded"
                  onClick={() => handleXpInputApply(key, -1)}
                >-XP</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
