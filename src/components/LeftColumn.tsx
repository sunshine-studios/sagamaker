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
        <polygon points={pointsStr} fill={color} stroke="#b6c2d1" strokeWidth="4" />
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

      {/* Attributes Radar Chart */}
      <div className="bg-transparent rounded-lg flex-1 min-h-0 w-full flex flex-col justify-center items-center relative p-4">
        <span className="text-white font-semibold mb-2">Attributes</span>
        <div className="relative flex items-center justify-center w-[420px] h-[420px]">
          <PentagonFrame size={420} color="#e0e7ef">
            {/* Custom labels */}
            {labelPositions.map(({ label, x, y }, idx) => (
              <span
                key={label}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  color: '#222',
                  fontWeight: 600,
                  fontSize: 18,
                  pointerEvents: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            ))}
          </PentagonFrame>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[475px] h-[475px] z-10 flex items-center justify-center">
            <Radar data={radarData} options={radarOptions} style={{ width: '100%', height: '100%' }} />
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