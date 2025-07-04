import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "./components/header";
// src/app/layout.tsx or app/page.tsx
import './globals.css';
import { useMemo } from "react";

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

// const StarryBackground: React.FC<StarryBackgroundProps> = ({
//   starCount = 100,
//   shootingStarFrequency = 0.01,
//   className,
//   children
// }) => {
//   const shootingStarsRef = useRef<HTMLDivElement>(null);

//   // Memoize stars to prevent regeneration on re-renders
//   const stars: Star[] = useMemo(() => {
//     const rand = Math.random();
//     let size: Star['size'];
//     let duration: number;

//     if (rand > 0.85) {
//       size = 'bright';
//       duration = 1.5;
//     } else if (rand > 0.65) {
//       size = 'large';
//       duration = 2;
//     } else if (rand > 0.35) {
//       size = 'medium';
//       duration = 2.5;
//     } else {
//       size = 'small';
//       duration = 3;
//     }

//     return {
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size,
//       delay: Math.random() * 3,
//       duration
//     };
//   });
// }, [starCount];
  




export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="container mx-auto px-6 py-32 text-center flex flex-col items-center">
        <h1 className="text-4xl font-normal ">
          talk to your planets
        </h1>
      </section>
      <section className="container mx-auto px-6 py-3 text-center flex flex-col items-center">
        <p className="text-lg text-muted-foreground pt-2">
          planets personified from your birth chart
        </p>

        <p className="text-lg text-muted-foreground pt-2">
          discover insights through meaningful conversations with your cosmic self
        </p>
      </section>
      <section className="container mx-auto px-6 py-32 text-center flex flex-col items-center">
        <div className="flex-grow flex flex-col justify-center items-center">
          <Link href="/letsyap">
            <Button className="rounded-full border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 w-full sm:w-auto md:w-[158px]">
              let&apos;s yap
            </Button>
          </Link>
        </div>
      </section>
      <footer className="border-t border-border py-6 mt-29">
        <div className = "container mx-auto px-6 text-center">
          <div className="text-lg font-normal mb-1">
            connecting you with cosmic wisdom
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2025 Watashi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>

  );
}
