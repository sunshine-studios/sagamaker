'use client';

import MiddleColumn from '@/components/MiddleColumn';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-[#083676] backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
          <MiddleColumn />
        </div>
      </div>
    </main>
  );
}
