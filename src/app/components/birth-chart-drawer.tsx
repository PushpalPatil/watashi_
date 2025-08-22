"use client";

import { useStore } from '@/store/storeInfo';
import { useEffect, useState, useRef } from 'react';

interface BirthChartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BirthChartDrawer({ isOpen, onClose }: BirthChartDrawerProps) {
  const { planets } = useStore();
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    
    // If swiped right more than 100px, close the drawer
    if (deltaX > 100) {
      onClose();
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Handle mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    
    // If swiped right more than 100px, close the drawer
    if (deltaX > 100) {
      onClose();
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, currentX, startX]);

  // Calculate transform for drag effect
  const dragOffset = isDragging ? Math.max(0, currentX - startX) : 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-[90px] right-0 bottom-[150px] w-80 bg-black border-l border-white/35 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
        style={{
          transform: `translateX(${dragOffset}px)`,
          borderTopLeftRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem',
          borderTopRightRadius: '0',
          borderBottomRightRadius: '0'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/25">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-normal">Your Birth Chart</h3>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
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
    </>
  );
}