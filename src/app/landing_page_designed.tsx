
import StarryBackgroundLanding from "./components/starrybackgroundlanding";
// src/app/layout.tsx or app/page.tsx
import './globals.css';


export default function LandingPageDesigned() {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col relative">
      {/* Starry background */}
      <StarryBackgroundLanding />

      {/* Main content area that grows to fill available space */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        <section className="container mx-auto px-6 py-32 text-center flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Left GIF - Mercury */}
            <img
              src="/FLORA-GIF-MERCURY.gif"
              alt="Mercury Flora"
              className="w-16 h-16 md:w-20 md:h-20 absolute -left-20 md:-left-24 top-1/2 transform -translate-y-1/2 opacity-80"
            />

            {/* Center Title */}
            <h1 className="text-4xl font-expanded font-stretch-200% font-mono px-8">
              W A T A S H I
            </h1>

            {/* Right GIF - Sun */}
            <img
              src="/FLORA-GIF-SUN.gif"
              alt="Sun Flora"
              className="w-16 h-16 md:w-20 md:h-20 absolute -right-20 md:-right-24 top-1/2 transform -translate-y-1/2 opacity-80"
            />
          </div>

          {/* Bottom GIF - Moon */}
          <img
            src="/FLORA-GIF-MOON.gif"
            alt="Moon Flora"
            className="w-12 h-12 md:w-16 md:h-16 mt-6 opacity-70"
          />
        </section>
      </main>

      {/* Footer that sticks to bottom */}
      <footer className="py-6 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <div className="text-xs font-light mb-1">
            connecting you with cosmic wisdom
          </div>
          <div className="text-xs font-extralight text-muted-foreground">
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