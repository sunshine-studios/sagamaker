'use client';
import React from 'react';
import SkillTreeCanvas from '@/components/SkillTreeCanvas';

const SkillTree = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      <SkillTreeCanvas />
    </div>
  );
};

export default SkillTree; 