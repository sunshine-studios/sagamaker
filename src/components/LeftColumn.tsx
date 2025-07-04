import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ATTRIBUTE_KEYS = [
  'Body',
  'Mind',
  'Creativity',
  'Professionalism',
  'Spirit',
];

const DEFAULT_ATTRIBUTES = {
  Body: 1,
  Mind: 1,
  Spirit: 1,
  Professionalism: 1,
  Creativity: 1,
};

const ATTRIBUTES_LS_KEY = 'user-attributes-v1';

export type AttributeKey = keyof typeof DEFAULT_ATTRIBUTES;
export type Attributes = typeof DEFAULT_ATTRIBUTES;

const PentagonFrame = ({ size = 420, color = '#e0e7ef', children }: { size?: number, color?: string, children?: React.ReactNode }) => {
  // Pentagon points calculation (90% of radius for better fit)
  const points = Array.from({ length: 5 }).map((_, i) => {
    const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
    const r = size / 2 * 0.9;
    return [
      size / 2 + r * Math.cos(angle),
      size / 2 + r * Math.sin(angle),
      angle
    ];
  });
  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <div style={{ width: size, height: size }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
      <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
        <polygon points={pointsStr} fill={color} stroke="#000" strokeWidth="4" />
      </svg>
      {children}
    </div>
  );
};

const LeftColumn = ({ attributes, setAttributes }: { attributes: Attributes, setAttributes: React.Dispatch<React.SetStateAction<Attributes>> }) => {
  // Prepare data for radar chart
  const radarData = {
    labels: ATTRIBUTE_KEYS,
    datasets: [
      {
        label: 'Attributes',
        data: ATTRIBUTE_KEYS.map(key => attributes[key as AttributeKey]),
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    layout: {
      padding: 40, // Padding for chart
    },
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: Math.max(...ATTRIBUTE_KEYS.map(key => attributes[key as AttributeKey]), 5),
        pointLabels: {
          display: false,
        },
        grid: { color: 'rgba(0,0,0,0.08)' },
        ticks: {
          color: '#333',
          stepSize: 1,
          backdropColor: 'transparent',
        },
      },
    },
  };

  // Custom label positions (outside pentagon)
  const labelRadius = 0.98; // slightly outside the pentagon
  const pentagonSize = 420;
  const labelPositions = [
    { label: 'Body' },
    { label: 'Mind' },
    { label: 'Creativity' },
    { label: 'Professionalism' },
    { label: 'Spirit' },
  ].map(({ label }, i) => {
    // For Mind (i === 1) and Spirit (i === 4), move up and inwards
    const inwardRadius = label === 'Mind' || label === 'Spirit' ? labelRadius - 0.10 : labelRadius;
    const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
    const r = pentagonSize / 2 * inwardRadius;
    let x = pentagonSize / 2 + r * Math.cos(angle);
    let y = pentagonSize / 2 + r * Math.sin(angle);
    // Move up a bit more for Mind and Spirit
    if (label === 'Mind' || label === 'Spirit') {
      y -= 32;
    }
    return { label, x, y };
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Top Row: Profile Section with geometric design */}
      <div className="bg-black border-4 border-black relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
      }}>
        <div className="absolute top-0 right-0 w-8 h-8 bg-white" style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
        }}></div>
        <div className="p-6 flex flex-col items-center justify-center">
          {/* Large Profile Avatar */}
          <div className="w-24 h-24 bg-white rounded-full border-4 border-orange-500 flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Rank Section */}
      <button className="bg-white border-4 border-black text-black font-bold py-4 px-6 relative overflow-hidden hover:bg-gray-50 transition-colors" style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)'
      }}>
        <div className="absolute top-0 left-0 right-0 h-[15px] bg-orange-500" style={{
          clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 100px)'
        }}></div>
        <div className="absolute top-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }}></div>
        
        <span className="relative z-10">TITLE & RANK</span>
      </button>

      {/* Achievements Log Button */}
      <button className="bg-orange-500 border-4 border-black text-white font-bold py-4 px-6 relative overflow-hidden hover:bg-orange-600 transition-colors" style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
      }}>
        <div className="absolute top-0 right-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 125%)'
        }}></div>
        <span className="relative z-10">ACHIEVEMENTS LOG</span>
      </button>

      {/* Attributes Section */}
      <div className="bg-white border-4 border-black flex-1 min-h-0 w-full flex flex-col relative overflow-hidden" style={{
        clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
      }}>
        <div className="absolute top-0 right-0 w-12 h-12 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-black" style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 115%)'
        }}></div>
        
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-black font-bold text-lg mb-4 text-center">ATTRIBUTES</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[300px] h-[300px]">
              {/* Pentagon with orange fill and black border */}
              <PentagonFrame size={300} color="#FF6B35">
                {/* Custom labels with black text */}
                {labelPositions.map(({ label, x, y }, idx) => (
                  <span
                    key={label}
                    style={{
                      position: 'absolute',
                      left: (x * 300) / 420,
                      top: (y * 300) / 420,
                      transform: 'translate(-50%, -50%)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: 14,
                      pointerEvents: 'none',
                      zIndex: 20,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </PentagonFrame>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] z-10 flex items-center justify-center">
                <Radar data={{
                  ...radarData,
                  datasets: [{
                    ...radarData.datasets[0],
                    backgroundColor: 'rgba(255, 107, 53, 0.3)',
                    borderColor: '#000',
                    borderWidth: 3,
                    pointBackgroundColor: '#000',
                    pointBorderColor: '#FF6B35',
                    pointHoverBackgroundColor: '#FF6B35',
                    pointHoverBorderColor: '#000',
                  }]
                }} options={{
                  ...radarOptions,
                  scales: {
                    r: {
                      ...radarOptions.scales.r,
                      grid: { color: 'rgba(0,0,0,0.2)' },
                      ticks: {
                        color: '#000',
                        stepSize: 1,
                        backdropColor: 'transparent',
                      },
                    },
                  },
                }} style={{ width: '100%', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftColumn;

export const usePersistentAttributes = () => {
  const [attributes, setAttributes] = React.useState<Attributes>(DEFAULT_ATTRIBUTES);

  React.useEffect(() => {
    const stored = localStorage.getItem(ATTRIBUTES_LS_KEY);
    if (stored) {
      try {
        setAttributes(JSON.parse(stored));
      } catch {
        setAttributes(DEFAULT_ATTRIBUTES);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(ATTRIBUTES_LS_KEY, JSON.stringify(attributes));
  }, [attributes]);

  return [attributes, setAttributes] as const;
};

export { ATTRIBUTE_KEYS }; 