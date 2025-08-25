import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "./components/header";
// src/app/layout.tsx or app/page.tsx
import './globals.css';

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






export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-foreground">
      <Header />
      <section className="container mx-auto px-6 py-32 text-center flex flex-col items-center">
        <h1 className="text-4xl font-normal ">
          
        </h1>
      </section>
      <section className="container mx-auto px-6 py-3 text-center flex flex-col items-center">
        <p className="text-lg  font-light text-muted-foreground pt-2">
          planets personified from your birth chart
        </p>

        <p className="text-lg text-muted-foreground pt-2 font-light">
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
