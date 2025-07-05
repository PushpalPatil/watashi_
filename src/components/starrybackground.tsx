import React, { useEffect, useMemo, useRef } from 'react';

interface StarryBackgroundProps {
      starCount?: number;
      shootingStarFrequency?: number;
      className?: string;
      children?: React.ReactNode;
}

interface Star {
      id: number;
      x: number;
      y: number;
      size: 'small' | 'medium' | 'large' | 'bright';
      delay: number;
      duration: number;
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({
      starCount = 150,
      shootingStarFrequency = 2000,
      className = '',
      children
}) => {
      const shootingStarsRef = useRef<HTMLDivElement>(null);

      // Memoize stars to prevent regeneration on re-renders
      const stars: Star[] = useMemo(() => {
            return Array.from({ length: starCount }, (_, i) => {
                  const rand = Math.random();
                  let size: Star['size'];
                  let duration: number;

                  if (rand > 0.85) {
                        size = 'bright';
                        duration = 1.5;
                  } else if (rand > 0.65) {
                        size = 'large';
                        duration = 2;
                  } else if (rand > 0.35) {
                        size = 'medium';
                        duration = 2.5;
                  } else {
                        size = 'small';
                        duration = 3;
                  }

                  return {
                        id: i,
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        size,
                        delay: Math.random() * 3,
                        duration
                  };
            });
      }, [starCount]);

      useEffect(() => {
            const createShootingStar = () => {
                  if (!shootingStarsRef.current) return;

                  const shootingStar = document.createElement('div');
                  shootingStar.className = 'absolute w-0.5 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-[shoot_3s_linear_forwards]';
                  shootingStar.style.left = Math.random() * 100 + '%';
                  shootingStar.style.top = Math.random() * 100 + '%';
                  shootingStar.style.opacity = '0';

                  shootingStarsRef.current.appendChild(shootingStar);

                  // Remove after animation completes
                  setTimeout(() => {
                        if (shootingStar.parentNode) {
                              shootingStar.parentNode.removeChild(shootingStar);
                        }
                  }, 3000);
            };

            const interval = setInterval(() => {
                  if (Math.random() > 0.7) {
                        createShootingStar();
                  }
            }, shootingStarFrequency);

            return () => clearInterval(interval);
      }, [shootingStarFrequency]);

      const getStarClasses = (star: Star): string => {
            const baseClasses = 'absolute bg-white rounded-full opacity-0';

            switch (star.size) {
                  case 'small':
                        return `${baseClasses} w-px h-px`;
                  case 'medium':
                        return `${baseClasses} w-0.5 h-0.5 shadow-[0_0_6px_rgba(255,255,255,0.6)]`;
                  case 'large':
                        return `${baseClasses} w-0.5 h-0.5 shadow-[0_0_10px_rgba(255,255,255,0.7)]`;
                  case 'bright':
                        return `${baseClasses} w-1 h-1 shadow-[0_0_15px_rgba(255,255,255,0.8)]`;
                  default:
                        return baseClasses;
            }
      };

      return (
            <div className={`relative ${className}`}>
                  {/* Background gradient */}
                  <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-900/90 to-slate-900/95" />

                  {/* Nebula effects */}
                  <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05)_0%,transparent_50%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.04)_0%,transparent_50%)]" />

                  {/* Static stars */}
                  <div className="fixed inset-0 pointer-events-none">
                        {stars.map((star) => (
                              <div
                                    key={star.id}
                                    className={getStarClasses(star)}
                                    style={{
                                          left: `${star.x}%`,
                                          top: `${star.y}%`,
                                          animation: `twinkle ${star.duration}s linear infinite`,
                                          animationDelay: `${star.delay}s`
                                    }}
                              />
                        ))}
                  </div>

                  {/* Shooting stars container */}
                  <div ref={shootingStarsRef} className="fixed inset-0 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                        {children}
                  </div>

                  {/* Custom animations */}
                  {/* eslint-disable-next-line react/no-unknown-property */}
                  <style jsx>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes shoot {
          0% {
            opacity: 0;
            transform: translateX(-100px) translateY(100px);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100px) translateY(-100px);
          }
        }
      `}</style>
            </div>
      );
};

export default StarryBackground;