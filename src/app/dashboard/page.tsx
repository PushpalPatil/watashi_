import Header from "../components/header"
import LetsYap from "../letsyap/page"
import { useEffect, useState } from "react"
import { FormData } from "../letsyap/page"
import { MapLocation } from "../letsyap/page"


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
            <Header/>
            <h1>Welcome Pushpal</h1>
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
