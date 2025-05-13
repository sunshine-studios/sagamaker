import React from 'react';

const RightColumn = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <span className="text-white font-semibold mb-2">Skill Tree</span>
      <div className="flex-1 min-h-0 w-full bg-[#818181] rounded-lg p-4 flex flex-col items-center justify-center">
        <div className="w-48 h-96 bg-white rounded-lg opacity-80 flex items-center justify-center w-full">
          <span className="text-gray-400">Skill Tree Placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default RightColumn; 