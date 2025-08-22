'use client';

import React from 'react';
import { PlanetWithPersona } from '@/store/storeInfo';
import { PLANET_CONFIG } from '@/lib/planet-config';

interface PlanetParticipantsProps {
  planets: Record<string, PlanetWithPersona>;
  activePlanets?: string[];
  typingPlanets?: string[];
}

export default function PlanetParticipants({ 
  planets, 
  activePlanets = [], 
  typingPlanets = [] 
}: PlanetParticipantsProps) {
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  const getStatusIndicator = (planetName: string) => {
    if (typingPlanets.includes(planetName)) {
      return (
        <div className="flex space-x-0.5">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      );
    }
    
    if (activePlanets.includes(planetName)) {
      return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
    }
    
    return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
  };

  return (
    <div className="border-b border-white/20 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Your Planetary Council</h3>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {planetOrder.map((planetName) => {
          const planetData = planets[planetName];
          const config = PLANET_CONFIG[planetName];
          
          if (!planetData || !config) return null;
          
          return (
            <div
              key={planetName}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/5 border border-white/10"
              title={`${config.icon} ${planetName.charAt(0).toUpperCase() + planetName.slice(1)} in ${planetData.sign}`}
            >
              <div className="text-lg text-white">{config.icon}</div>
              <div className="text-xs text-center">
                <div className="text-white font-medium capitalize">{planetName}</div>
                <div className="text-gray-200 ">{planetData.sign}</div>
              </div>
              <div className="flex items-center justify-center">
                {getStatusIndicator(planetName)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
          </div>
          <span>Typing</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span>Listening</span>
        </div>
      </div>
    </div>
  );
}