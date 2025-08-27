"use client";

import { useRouter } from 'next/navigation';
import StarryBackgroundLanding from "./components/starrybackgroundlanding";
import './globals.css';

export default function LandingPageMobile() {
  const router = useRouter();

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

      {/* Main content area */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        <section className="container mx-auto px-4 py-16 text-center flex flex-col items-center relative">
          {/* Sun - Centered above title on mobile */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <video
              src="/FLORA_SUN.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-48 h-48 fixed top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/4 z-10"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Center Title */}
          <div className="relative z-10 mt-32">
            <h1 className="text-4xl font-expanded text-amber-50/85 font-stretch-200% font-serif animate-fade-in">
              W A T A S H I
            </h1>
            <p className="text-xs font-expanded font-mono font-thin text-amber-50/50 mt-2 animate-pulse animate-delayed-fade-in">
              tap to get started
            </p>
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
          `}</style>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 mt-auto justify-center">
        <div className="container mx-auto px-6 text-center">
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