"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StarryBackgroundLanding from "./components/starrybackgroundlanding";
// src/app/layout.tsx or app/page.tsx
import './globals.css';


export default function LandingPageMobile() {
  const router = useRouter();

  // Force video autoplay on mobile
  useEffect(() => {
    const forceAutoplay = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.play().catch(err => console.log('Video autoplay prevented:', err));
      });
    };

    // Try to autoplay immediately
    forceAutoplay();

    // Also try after any user interaction
    const handleUserInteraction = () => {
      forceAutoplay();
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const handlePageClick = () => {
    // Add fade out effect before navigation
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';

    setTimeout(() => {
      router.push('/letsyap');
    }, 500);
  };

  return (
    <div
      className="min-h-screen bg-black text-foreground flex flex-col relative cursor-pointer"
      onClick={handlePageClick}
    >
      {/* Starry background */}
      <StarryBackgroundLanding />

      {/* Main content area that grows to fill available space */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        <section className="container mx-auto px-4 py-16 text-center flex flex-col items-center relative">
          {/* Mobile-optimized Solar System Layout */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Sun - Top center, larger and prominent */}
            <video
              src="/FLORA_SUN.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls={false}
              webkit-playsinline="true"
              className="w-2xl h-2xl fixed -top-30 left-1/2 transform -translate-x-1/2 sun-video"
              style={{ objectFit: 'cover', pointerEvents: 'none' }}
            />

            
          </div>

          {/* Center Title - Mobile optimized */}
          <div className="relative z-10 mt-20">
            <h1 className="text-4xl font-expanded text-amber-50/85 font-stretch-200% font-serif animate-fade-in tracking-widest">
              W A T A S H I
            </h1>
            <p className="text-sm font-expanded font-mono font-thin text-amber-50/50 mt-4 animate-pulse animate-delayed-fade-in">tap to get started</p>
          </div>

          {/* Custom fade-in animation */}
          <style jsx>{`
            @keyframes fade-in {
              0% {
                opacity: 0;
                transform: translateY(5px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes delayed-fade-in {
              0% {
                opacity: 0;
                transform: translateY(10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fade-in {
              animation: fade-in 3s ease-out;
            }
            
            .animate-delayed-fade-in {
              opacity: 0;
              animation: delayed-fade-in 1.5s ease-out 2s forwards;
            }

            .sun-video {
              mix-blend-mode: lighten;
              background: transparent;
              border: none;
              outline: none;
              clip-path: circle(52% at center);
            }
          `}</style>
        </section>
      </main>

      {/* Footer that sticks to bottom */}
      <footer className="py-4 mt-auto justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="text-xs font-light mb-1 justify-center text-amber-50/60">
            connecting you with cosmic wisdom
          </div>
          <div className="text-xs font-extralight text-amber-50/40">
            &copy; 2025 Watashi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}


/*


<video
  src="/SORA_SATURN.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-20 h-20 fixed top-12 right-8 sun-video opacity-90"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>


<video
  src="/FLORA_JUPITER_VID.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-16 h-16 fixed top-16 left-8 opacity-85 brightness-90"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>


<video
  src="/FLORA_VENUS_VID.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-14 h-14 fixed top-1/2 left-4 transform -translate-y-1/2"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>

<video
  src="/FLORA_MARS_VID.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-12 h-12 fixed top-1/2 right-4 transform -translate-y-1/2 brightness-85"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>

<video
  src="/FLORA_MERCURY_VID.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-10 h-10 fixed bottom-32 left-8"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>


<video
  src="/FLORA_MOON_VID.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  controls={false}
  webkit-playsinline="true"
  className="w-8 h-8 fixed bottom-32 right-8"
  style={{ objectFit: 'cover', pointerEvents: 'none' }}
/>


*/