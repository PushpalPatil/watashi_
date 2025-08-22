"use client";

import { useStore } from '@/store/storeInfo';
import { useEffect, useState } from 'react';

interface BirthChartPopupProps {
  onClose?: () => void;
  className?: string;
}

export function BirthChartPopup({ onClose, className = "" }: BirthChartPopupProps) {
  const { planets } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Auto-hide after 2 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
      // Wait for animation to complete before calling onClose
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 500); // Animation duration
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  return (
    <div 
      className={`fixed top-[90px] left-1/2 bottom-[150px] z-40 transition-all duration-500 ease-in-out ${
        isAnimating ? 'transform translate-x-[150%]' : 'transform -translate-x-1/2'
      } ${className}`}
    >
      <div className="bg-black border border-white/25 rounded-lg h-full w-fit max-w-md min-w-[320px] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/25">
          <h3 className="text-white text-sm font-normal">Your Birth Chart</h3>
        </div>
        
        {/* Birth chart table */}
        <div className="p-4 h-full overflow-y-auto">
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-white/25">
                <th className="text-left py-2 font-normal">Planet</th>
                <th className="text-left py-2 font-normal">Sign</th>
              </tr>
            </thead>
            <tbody>
              {planetOrder.map((planetName) => {
                const planetData = planets[planetName];
                if (!planetData) return null;
                
                return (
                  <tr key={planetName} className="border-b border-white/25 last:border-b-0">
                    <td className="py-2 capitalize">
                      {planetName}
                      {planetData.retrograde && <span className="ml-1 text-white/70">R</span>}
                    </td>
                    <td className="py-2">{planetData.sign}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}