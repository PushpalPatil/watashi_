import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Header from "../components/header"

interface User {
    name: string
    birthTime: string
    birthDate: Date | undefined
    birthLocation: string
    birthDN: "AM" | "PM"
}


export default function Dashboard() {

    return (
        <div>
            <Header />

            <section className="container mx-auto py-25 text-center flex flex-col items-center">
                <h1 className="text-3xl font-normal ">
                    welcome dear virgo
                </h1>
                <p className="text-lg text-muted-foreground pt-3 font-light"> which part of yourself do you want to yap with today?</p>
            </section>

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


            </div>
        </div>


    )
}


// const formData = 
// const birthDateStr = formData.get('birthDate') as string|null;

// const user: User = {
//     name: formData.get('name') as string,
//     birthTime: formData.get('birthTime') as string,
//     birthDate: birthDateStr ? new Date(birthDateStr) : undefined,
//     birthLocation: formData.get('birthLocation') as string,
//     birthDN: formData.get('birthDN') as "AM" | "PM",
// }
