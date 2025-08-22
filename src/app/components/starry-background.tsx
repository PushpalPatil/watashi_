"use client";

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const starCount = 200; // Realistic density for a clear night sky
      const newStars: Star[] = [];

      // Star size distribution based on real night sky:
      // 70% small dim stars, 25% medium stars, 5% bright stars
      const starTypes = [
        { weight: 0.7, sizeRange: [0.5, 1], brightnessRange: [0.3, 0.6] }, // Dim stars
        { weight: 0.25, sizeRange: [1, 2], brightnessRange: [0.6, 0.8] }, // Medium stars  
        { weight: 0.05, sizeRange: [2, 3], brightnessRange: [0.8, 1] }    // Bright stars
      ];

      // Star colors based on temperature (most are white/blue-white)
      const starColors = [
        { weight: 0.6, color: '#ffffff' },   // White
        { weight: 0.25, color: '#e6f3ff' },  // Blue-white
        { weight: 0.1, color: '#fff8e6' },   // Warm white
        { weight: 0.05, color: '#ffe6cc' }   // Orange-white (rare)
      ];

      for (let i = 0; i < starCount; i++) {
        // Choose star type based on weight distribution
        let cumulativeWeight = 0;
        let chosenType = starTypes[0];
        const typeRandom = Math.random();
        
        for (const type of starTypes) {
          cumulativeWeight += type.weight;
          if (typeRandom <= cumulativeWeight) {
            chosenType = type;
            break;
          }
        }

        // Choose star color based on weight distribution
        cumulativeWeight = 0;
        let chosenColor = starColors[0];
        const colorRandom = Math.random();
        
        for (const color of starColors) {
          cumulativeWeight += color.weight;
          if (colorRandom <= cumulativeWeight) {
            chosenColor = color;
            break;
          }
        }

        // Create realistic star distribution (some clustering, avoid edges)
        let x, y;
        if (Math.random() < 0.3) {
          // 30% clustered around other stars (realistic star field behavior)
          const existingStar = newStars[Math.floor(Math.random() * newStars.length)];
          if (existingStar) {
            x = Math.max(5, Math.min(95, existingStar.x + (Math.random() - 0.5) * 20));
            y = Math.max(5, Math.min(95, existingStar.y + (Math.random() - 0.5) * 20));
          } else {
            x = 5 + Math.random() * 90;
            y = 5 + Math.random() * 90;
          }
        } else {
          // 70% random distribution (avoiding screen edges)
          x = 5 + Math.random() * 90;
          y = 5 + Math.random() * 90;
        }

        const star: Star = {
          id: i,
          x,
          y,
          size: chosenType.sizeRange[0] + Math.random() * (chosenType.sizeRange[1] - chosenType.sizeRange[0]),
          brightness: chosenType.brightnessRange[0] + Math.random() * (chosenType.brightnessRange[1] - chosenType.brightnessRange[0]),
          color: chosenColor.color,
          twinkleSpeed: 0.5 + Math.random() * 2, // Varied twinkling speeds
          twinklePhase: Math.random() * Math.PI * 2 // Random starting phase
        };

        newStars.push(star);
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            animation: `twinkle-${star.id} ${star.twinkleSpeed + 2}s ease-in-out infinite`,
            opacity: star.brightness,
            animationDelay: `${star.twinklePhase}s`
          }}
        />
      ))}
      
      {/* CSS animations for each star */}
      <style jsx>{`
        ${stars.map(star => `
          @keyframes twinkle-${star.id} {
            0%, 100% { 
              opacity: ${star.brightness * 0.3}; 
              transform: scale(1);
            }
            50% { 
              opacity: ${star.brightness}; 
              transform: scale(${1 + star.size * 0.1});
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
}