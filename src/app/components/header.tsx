import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
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
        </div>
    )
}