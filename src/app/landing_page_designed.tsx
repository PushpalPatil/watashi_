
"use client";

import StarryBackgroundLanding from "./components/starrybackgroundlanding";
import { useRouter } from 'next/navigation';
// src/app/layout.tsx or app/page.tsx
import './globals.css';


export default function LandingPageDesigned() {
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

      {/* Main content area that grows to fill available space */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        <section className="container mx-auto px-4 md:px-6 py-16 md:py-32 text-center flex flex-col items-center relative">
          {/* Solar System Layout - Ordered from top right clockwise */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Sun - Top right corner (largest) */}
            <video
              src="/FLORA_SUN_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-lg h-lg top-0 md:w-2xl md:h-2xl md:-top-64 md:-right-40 absolute"
              style={{ objectFit: 'cover' }}
            />

            {/* Mercury - Second from right, top area */}
            <video
              src="/FLORA_MERCURY_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="md:w-25 md:h-25 absolute md:top-100 md:right-100 "
              style={{ objectFit: 'cover' }}
            />

            {/* Venus - Top center-right */}
            <video
              src="/FLORA_VENUS_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="md:w-32 md:h-32 absolute md:top-170 md:right-50"
              style={{ objectFit: 'cover' }}
            />

            {/* Moon - Top left area */}
            <video
              src="/FLORA_MOON_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className=" md:w-12 md:h-10 absolute md:top-150 md:right-180 "
              style={{ objectFit: 'cover' }}
            />

            {/* Mars - Left side, middle height (placeholder) */}
            <video
              src="/FLORA_MARS_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="md:w-18 md:h-18 absolute md:top-50 md:right-240 brightness-85 "
              style={{ objectFit: 'cover' }}
            />

            {/* Jupiter - Left side, lower (largest planet) */}
            <video
              src="/FLORA_JUPITER_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="md:w-md md:h-md absolute md:top-120 md:right-270 opacity-90 brightness-90"
              style={{ objectFit: 'cover' }}
            />

            {/* Saturn - Bottom left */}
            <video
              src="/FLORA_SATURN_VID.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="md:w-md md:h-md md:top-20 md:right-350 opacity-95 "
              style={{ objectFit: 'cover' }}
            />

           

            

           
          </div>

          {/* Center Title - Above solar system */}
          <div className="relative z-10">
            <h1 className="text-5xl font-expanded text-amber-50/85 font-stretch-200% font-serif animate-fade-in">
              W A T A S H I
            </h1>
            <p className="text-xs font-expanded font-mono font-thin text-amber-50/50 mt-2 animate-pulse animate-delayed-fade-in">click to get started</p>
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

      {/* Footer that sticks to bottom */}
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



{/* <section className="container mx-auto px-6 py-3 text-center flex flex-col items-center">
          <p className="text-lg font-light text-muted-foreground pt-2">
            planets personified from your birth chart
          </p>

          <p className="text-lg text-muted-foreground pt-2 font-light">
            discover insights through meaningful conversations with your cosmic self
          </p>
        </section> */}

{/* Uncomment this section if needed */ }
{/* <section className="container mx-auto px-6 py-32 text-center flex flex-col items-center">
          <div className="flex-grow flex flex-col justify-center items-center">
            <Link href="/letsyap">
              <Button className="rounded-full border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 w-full sm:w-auto md:w-[158px]">
                let&apos;s yap
              </Button>
            </Link>
          </div>
        </section> */}