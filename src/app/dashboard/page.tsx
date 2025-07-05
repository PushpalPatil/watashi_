'use client';
// import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card";
// import Link from "next/link"
import { useStore } from "@/store/storeInfo";
import { useRouter } from 'next/navigation';
import Header from "../components/header";


const PLANETS = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
] as const;

export default function Dashboard() {

    const router = useRouter();
    const planets = useStore((s) => s.planets)
    const sunSign = planets.sun?.sign ?? '-';
    console.log('planets', planets);

    const handleCardClick = (planet: string) => {
        if (planet === 'sun' || planet === 'moon') {
            console.log('routing to chat: ', planet);
            router.push(`/chat/${planet}`);
        }
        else {
            console.log('going to other planets ', planet);
            router.push(`/chat/${planet}`);
        }
    }

    return (
        <div>
            <Header />
            <section className="container mx-auto py-15 text-center flex flex-col items-center">
                <h1 className="text-3xl font-normal ">
                    welcome dear <span>{sunSign.toLowerCase()}</span>
                </h1>
                <p className="text-lg text-muted-foreground pt-3 font-light"> which part of yourself do you want to yap with today?</p>
            </section>

            <div className="container mx-auto grid grid-cols-5 place-items-center gap-15 ">
                {PLANETS.map(p => {
                    const planetData = planets[p];
                    const sign = planetData?.sign ?? '-';
                    const retrograde = planetData?.retrograde ?? false;

                    console.log(`${p}:`, { sign, retrograde, fullData: planetData });

                    return (

                        <Card
                            key={p}
                            onClick={() => handleCardClick(p)}
                            className="size-65 border-1 shadow-xl box-content p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-accent-foreground flex flex-col justify-center items-center m-auto"
                        >
                            {/* router.push(`src/app/chat/${p} */}
                            <CardContent className="mt-24 h-full w-full block mx-auto flex-col text-center justify-center">
                                <div className="flex flex-col items-center space-y-6 space-x-6">
                                    <span className=" bg-transparent text-2xl text-muted-foreground font-normal dark:text-accent-foreground ">
                                        {p}
                                    </span>
                                    <span className="bg-transparent text-lg text-muted-foreground/80 font-light dark:text-accent-foreground/80">
                                        {sign !== '?' ? (
                                            <>
                                                {`{${sign.toLowerCase()}${retrograde ? ' ℞' : ''}}`}
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground/50">
                                                {'{calculating...}'}
                                            </span>
                                        )}
                                    </span>

                                    {/* Phase indicator for testing - remove in production */}
                                    {(p === 'sun' || p === 'mercury') && (
                                        <span className="text-xs text-green-500 font-mono">
                                            [dynamic]
                                        </span>
                                    )}
                                </div>

                            </CardContent>
                        </Card>

                    );
                }
                )
                }
            </div>

            {/* Debug info for development - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="container mx-auto mt-8 p-4 bg-muted/20 rounded-lg text-xs">
                    <h3 className="font-semibold mb-2">Debug: Planet Data</h3>
                    <pre className="overflow-auto">
                        {JSON.stringify(planets, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}



{/*
            
            <div className="container mx-auto pb-10 grid grid-cols-5 place-items-center gap-10">

                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href="/sun" className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            sun
                        </Button>
                    </Link>
                </Card >

                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/moon' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            moon
                        </Button>
                    </Link>
                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/mercury' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800"> 
                            mercury
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/venus' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800"> 
                            venus
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/mars' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            mars
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/jupiter' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            jupiter
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/saturn' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            saturn
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/uranus' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            uranus
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/neptune' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            neptune
                        </Button>
                    </Link>

                </Card>
                <Card className="size-60 border-1 shadow-xl box-content p-0">
                    <Link href='/pluto' className="h-full w-full block">
                        <Button className=" w-full h-full bg-transparent text-3xl text-muted-foreground font-normal hover:bg-gray-100 dark:text-accent-foreground dark:hover:bg-gray-800">
                            pluto
                        </Button>
                    </Link>

                </Card>


            </div> */}
