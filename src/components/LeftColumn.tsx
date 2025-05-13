import React from 'react';

const LeftColumn = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Top Row: Profile + Title/Rank/Achievements */}
      <div className="flex flex-row gap-4 items-start w-full">
        {/* Small Profile Image */}
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        {/* Title & Rank and Achievements Log */}
        <div className="flex flex-col flex-1 gap-2 w-full">
          <div className="bg-white rounded-lg p-2 flex flex-col items-center w-full">
            <span className="text-black font-bold text-sm">Title & Rank</span>
            <div className="w-20 h-3 bg-gray-300 rounded mt-1" />
          </div>
          <button className="bg-[#444] rounded-lg p-2 text-white font-semibold w-full">Achievements Log</button>
        </div>
      </div>

      {/* Attributes Radar Chart Placeholder (larger) */}
      <div className="bg-[#818181] rounded-lg p-4 flex flex-col items-center flex-1 min-h-0 w-full justify-center">
        <span className="text-white font-semibold mb-2">Attributes</span>
        <div className="w-64 h-64 bg-white rounded-full opacity-80 flex items-center justify-center">
          <span className="text-gray-400">Radar Chart</span>
        </div>
      </div>
    </div>
  );
};

export default LeftColumn; 