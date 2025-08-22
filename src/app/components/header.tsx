"use client";

//import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
    const handleNewUser = () => {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies by setting them to expire in the past
        document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("="); // Finds the position of the = sign in the cookie string
            // eqPos > -1 Checks if an = sign was found (indexOf returns -1 if not found)
            // c.substr(0, eqPos)  If = exists, extracts everything before it (the cookie name)
            // c - If no = found, uses the entire string as the name
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = name + "=;expires=Thu, 01 Jan 2025 00:00:00 GMT;path=/";
        });

        // Reload the page to start fresh
        window.location.reload();
    };

    return (
        <div className="sticky top-0 z-50 bg-transparent backdrop-blur-xs">
            <header className="py-4">
                <div className="flex flex-row justify-between items-center">

                    <div className="text-4xl font-normal tracking-tight pl-4 text-white">
                        WATASHI
                    </div>

                    <div className="absolute top-4 right-4 pl-4">
                        {/* <section className="size-10">
                            <ThemeToggle />
                        </section> */}
                        <button
                            onClick={handleNewUser}
                            className="px-4 py-2 bg-transparent hover:bg-gray-600 border border-white/25 text-white text-sm rounded-lg transition-colors"
                        >
                            New User
                        </button>
                    </div>

                </div>
            </header>
        </div>
    )
}
