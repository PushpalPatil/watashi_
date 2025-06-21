'use client';
// import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import Link from "next/link"
import Header from "../components/header"
import { useStore } from "@/store/storeInfo"
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/ui/card';

interface User {
    name: string
    birthTime: string
    birthDate: Date | undefined
    birthLocation: string
    birthDN: "AM" | "PM"
}

const PLANETS = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
] as const;

export default function Dashboard() {

    const router = useRouter();
    const planets = useStore((s) => s.planets)

    const sunSign = planets.sun?.sign ?? '-';
    

    return (
        <div>
            <Header />

            <section className="container mx-auto py-25 text-center flex flex-col items-center">
                <h1 className="text-3xl font-normal ">
                    welcome dear <span>{sunSign.toLowerCase()}</span>
                </h1>
                <p className="text-lg text-muted-foreground pt-3 font-light"> which part of yourself do you want to yap with today?</p>
            </section>

            <div className="container mx-auto grid grid-cols-5 place-items-center gap-15 ">
                {PLANETS.map(p => (
                    <Card
                        key={p}
                        onClick={() => router.push(`/chat/${p}`)}
                        className="size-65 border-1 shadow-xl box-content p-0 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-accent-foreground flex flex-col justify-center items-center m-auto"
                    >
                        <CardContent className="mt-24 h-full w-full block mx-auto flex-col text-center justify-center">
                        <span className=" bg-transparent text-2xl text-muted-foreground font-normal dark:text-accent-foreground ">
                            {p}
                        </span>
                    </CardContent>
                    </Card>
                ))}
            </div>

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
        </div>


    )
}
