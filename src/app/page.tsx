'use client';

import MiddleColumn from '@/components/MiddleColumn';
import LeftColumn from '@/components/LeftColumn';
import RightColumn from '@/components/RightColumn';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="w-full">
        <div className="bg-[#083676] backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 w-full">
          <div className="flex flex-row gap-[15px] w-full min-h-[80vh] items-stretch justify-center">
            <div className="w-[400px] min-w-[300px] flex flex-col"><LeftColumn /></div>
            <div className="w-[440px] flex flex-col"><MiddleColumn /></div>
            <div className="flex-1 min-w-[300px] flex flex-col"><RightColumn /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
