import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>
                
                <div className="text-2xl font-normal tracking-tight">
                    WATASHI
                </div>
                
                <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/try-it"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try It Out
          </Link>
          
        </div>
      </div>
      <footer className="absolute bottom-1 text-center border-t border-border py-5 items-center justify-center">
        
        <div className="text-lg font-normal mb-2"> Connecting you with cosmic wisdom 

        <div className="text-sm text-muted-foreground">
            &copy; 2025 Watashi. All rights reserved.
        </div>
        </div>
        
        
      </footer>
    </div>
    )
}