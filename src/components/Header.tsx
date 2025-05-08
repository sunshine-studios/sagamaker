'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative z-20">
      <div className="flex items-center bg-[#22223b] px-4 py-3 shadow-md">
        <button
          className="text-white text-2xl mr-4 focus:outline-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          &#9776;
        </button>
        <span className="text-white text-lg font-bold tracking-wide">Saga Maker</span>
      </div>
      {/* Side Menu Overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-[#22223b] shadow-lg z-40 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
              <span className="text-white text-lg font-bold">Menu</span>
              <button
                className="text-white text-2xl focus:outline-none"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>
            <nav className="flex flex-col mt-2">
              <button
                className="text-left px-6 py-3 text-white hover:bg-blue-700 font-semibold"
                onClick={() => { router.push('/'); setMenuOpen(false); }}
              >
                Dashboard
              </button>
              <div className="pl-4">
                <button
                  className="text-left px-6 py-3 text-white hover:bg-blue-700"
                  onClick={() => { router.push('/mission-log'); setMenuOpen(false); }}
                >
                  Mission Log
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default Header; 