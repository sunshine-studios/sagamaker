'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ATTRIBUTE_KEYS, AttributeKey, Attributes } from '@/components/LeftColumn';

const XP_LS_KEY = 'global-xp-v1';
const LEVEL_LS_KEY = 'global-levels-v1';

// XP and level state types
export type XPState = Record<AttributeKey, number>;
export type LevelState = Record<AttributeKey, number>;

const defaultXP: XPState = ATTRIBUTE_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as XPState);
const defaultLevels: LevelState = ATTRIBUTE_KEYS.reduce((acc, key) => ({ ...acc, [key]: 1 }), {} as LevelState);

// XP calculation for level
const getLevelXP = (level: number) => (2 * level * level) / 5;
const getLevelFromXP = (xpValue: number) => {
  let level = 0;
  while (xpValue >= getLevelXP(level + 1)) {
    level++;
  }
  return level;
};

interface XPContextType {
  xp: XPState;
  levels: LevelState;
  addXP: (key: AttributeKey, amount: number) => void;
  subtractXP: (key: AttributeKey, amount: number) => void;
  setXP: React.Dispatch<React.SetStateAction<XPState>>;
  setLevels: React.Dispatch<React.SetStateAction<LevelState>>;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider = ({ children }: { children: React.ReactNode }) => {
  const [xp, setXP] = useState<XPState>(defaultXP);
  const [levels, setLevels] = useState<LevelState>(defaultLevels);

  // Only update from localStorage after mount
  useEffect(() => {
    const storedXP = localStorage.getItem(XP_LS_KEY);
    if (storedXP) setXP(JSON.parse(storedXP));
    const storedLevels = localStorage.getItem(LEVEL_LS_KEY);
    if (storedLevels) setLevels(JSON.parse(storedLevels));
  }, []);

  useEffect(() => {
    localStorage.setItem(XP_LS_KEY, JSON.stringify(xp));
  }, [xp]);
  useEffect(() => {
    localStorage.setItem(LEVEL_LS_KEY, JSON.stringify(levels));
  }, [levels]);

  const addXP = (key: AttributeKey, amount: number) => {
    setXP(prev => {
      const newXP = Math.max(0, prev[key] + amount);
      setLevels(prevLevels => ({
        ...prevLevels,
        [key]: getLevelFromXP(newXP),
      }));
      return { ...prev, [key]: newXP };
    });
  };

  const subtractXP = (key: AttributeKey, amount: number) => {
    setXP(prev => {
      const newXP = Math.max(0, prev[key] - amount);
      setLevels(prevLevels => ({
        ...prevLevels,
        [key]: getLevelFromXP(newXP),
      }));
      return { ...prev, [key]: newXP };
    });
  };

  return (
    <XPContext.Provider value={{ xp, levels, addXP, subtractXP, setXP, setLevels }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error('useXP must be used within an XPProvider');
  return ctx;
}; 