'use client';

import React, { useState } from 'react';
import MiddleColumn from '@/components/MiddleColumn';
import LeftColumn, { usePersistentAttributes, ATTRIBUTE_KEYS, AttributeKey, Attributes } from '@/components/LeftColumn';
import RightColumn from '@/components/RightColumn';

export default function Home() {
  const [attributes, setAttributes] = usePersistentAttributes();
  // XP state for each category
  const [xp, setXp] = useState<Record<AttributeKey, number>>({
    Body: 0,
    Mind: 0,
    Creativity: 0,
    Professionalism: 0,
    Spirit: 0,
  });
  // input state for each category
  const [xpInput, setXpInput] = useState<Record<AttributeKey, string>>({
    Body: '',
    Mind: '',
    Creativity: '',
    Professionalism: '',
    Spirit: '',
  });

  // Calculate XP required for a given level
  const getLevelXP = (level: number) => {
    const x = level;
    return (2 * x * x) / 5;
  };

  // Calculate level from XP
  const getLevelFromXP = (xpValue: number) => {
    let level = 0;
    while (xpValue >= getLevelXP(level + 1)) {
      level++;
    }
    return level;
  };

  // When XP changes, update both XP and level
  const handleXpChange = (key: AttributeKey, delta: number) => {
    setXp(prev => {
      const newXP = Math.max(0, prev[key] + delta);
      const newLevel = getLevelFromXP(newXP);
      setAttributes(prevAttr => ({
        ...prevAttr,
        [key]: newLevel,
      }));
      return {
        ...prev,
        [key]: newXP,
      };
    });
  };

  // Handle input change for XP
  const handleXpInputChange = (key: AttributeKey, value: string) => {
    setXpInput(prev => ({ ...prev, [key]: value }));
  };

  // Parse input and add/subtract XP
  const handleXpInputApply = (key: AttributeKey, sign: 1 | -1) => {
    const value = parseInt(xpInput[key], 10);
    if (!isNaN(value)) {
      handleXpChange(key, value * sign);
      setXpInput(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Debug panel for attribute adjustment (manual level adjustment)
  const handleChange = (key: AttributeKey, delta: number) => {
    setAttributes((prev: Attributes) => {
      const newLevel = Math.max(0, prev[key] + delta);
      // When manually changing level, also update XP to minimum for that level
      setXp(prevXp => ({
        ...prevXp,
        [key]: getLevelXP(newLevel),
      }));
      return {
        ...prev,
        [key]: newLevel,
      };
    });
  };

  // XP calculation function for next level
  const getNextLevelXP = (level: number) => {
    const x = level + 1;
    return ((2 * x * x) / 5).toFixed(2);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="w-full">
        <div className="bg-[#083676] backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 w-full">
          <div className="flex flex-row gap-[15px] w-full min-h-[80vh] items-stretch justify-center">
            <div className="w-[400px] min-w-[300px] flex flex-col">
              <LeftColumn attributes={attributes} setAttributes={setAttributes} />
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
                <button className="px-2 py-1 bg-yellow-300 rounded" onClick={() => handleChange(key, -1)}>-</button>
                <span className="w-8 text-center">{attributes[key]}</span>
                <button className="px-2 py-1 bg-yellow-300 rounded" onClick={() => handleChange(key, 1)}>+</button>
                <span className="ml-4 text-sm text-black">Next Level XP: <span className="font-mono">{getNextLevelXP(attributes[key])}</span></span>
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
