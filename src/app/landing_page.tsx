import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border py-4">
        <div className="flex flex-row justify-between items-center">
          <div className="text-4xl font-normal tracking-tight pl-4">
            WATASHI
          </div>


          <div className="absolute top-4 right-4 pl-4">
            <section className="size-10">
              <ThemeToggle />
            </section>
          </div>
        </div>
      </header>


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
          <Button className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 w-full sm:w-auto md:w-[158px]">
            Let's Yap
          </Button>
        </div>
      </section>




      <div className="flex flex-col items-center">


        <footer className="absolute bottom-1 text-center border-t border-border py-5 items-center justify-center">
          <div className="text-lg font-normal mb-2">
            connecting you with cosmic wisdom
            <div className="text-sm text-muted-foreground">
              &copy; 2025 Watashi. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </div>

  );
}