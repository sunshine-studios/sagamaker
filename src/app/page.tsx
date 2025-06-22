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
    <main className="min-h-screen p-8">
      <div className="w-full">
        <div className="backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 w-full relative" style={{
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          {/* Video Background - only for main content */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
            style={{ zIndex: -1 }}
          >
            <source src="/main_background_v01_1.webm" type="video/webm" />
          </video>
          
          <div className="flex flex-row gap-[15px] w-full min-h-[80vh] items-stretch justify-center">
            <div className="w-[400px] min-w-[300px] flex flex-col">
              <LeftColumn attributes={levels} setAttributes={() => {}} />
            </div>
            <div className="w-[440px] flex flex-col"><MiddleColumn /></div>
            <div className="flex-1 min-w-[300px] flex flex-col"><RightColumn /></div>
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
