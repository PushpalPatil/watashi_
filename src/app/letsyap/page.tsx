"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../components/header";

import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

import { autocomplete, getPlaceDetails } from "@/lib/google";
import type { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { CalendarComponent } from "../components/calendar";
import { Calendar } from "@/components/ui/calendar";
import React from "react";

export interface MapLocation {
    place_id: string
    description: string
    structured_formatting: {
        main_text: string
        secondary_text: string
    }
}
// src/app/layout.tsx or app/page.tsx

export type FormData = {
    name: string,
    birthTime: string,
    birthDN: "AM" | "PM",
    birthDate: Date | undefined,
    birthLocation: string
}

export default function LetsYap() {

    const MAP_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [form, setForm] = useState<FormData>({
        name: "",
        birthTime: "",
        birthDN: "AM",
        birthDate: undefined,
        birthLocation: "",
    })

    const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
    const [input, setInput] = useState("");
    const [open, setOpen] = React.useState(false)
    
    useEffect(() => {
        const fetchSuggestions = async () => {
            const predictions = await autocomplete(input);
            setPredictions(predictions ?? []);
        }
        fetchSuggestions();
    }, [input]);

    console.log(form.name)
    console.log(form.birthTime)
    console.log(form.birthDate)
    const name = form.name
    const birthTime = form.birthTime

    return (
        <div>
            <Header />

            {/* welcome blurb  */}
            <section className="container mx-auto py-20 text-center flex flex-col items-center">
                <h1 className="text-3xl font-normal ">
                    ~ welcome ~
                </h1>
                <p className="text-lg text-muted-foreground pt-2 font-light"> please fill out your details</p>
            </section>

            
            {/* form section */}
            <section className="min-h-screen px-4 max-w-sm container flex space-y-6 flex-col items-center mx-auto font-normal">
                <form className="w-full max-w-sm items-center space-y-6">

                    {/* name */}
                    <div className="">
                        <Input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                            required
                        />
                    </div>
                    
                    {/* birth time */}
                    <div className="">
                        <input
                            type="time"
                            id="time"
                            className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                            min="00:00"
                            max="23:59"
                            required
                            value={form.birthTime}
                            onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                        />
                    </div>
                    
                    
                    
                    {/* birth location */}
                    <div className="">
                        <Command className="w-full rounded-md border border-border bg-transparent px-3 py-2text-sm focus:outline-none focus:ring-foreground">
                            <CommandInput
                                placeholder="Type location..."
                                value={input}
                                onValueChange={setInput}
                            />
                            <CommandList>
                                <CommandGroup >
                                    
                                    {predictions.map((prediction) => (
                                        <CommandItem
                                            
                                            key={prediction.place_id}
                                            value={prediction.description}
                                            onSelect={async () => {
                                                setInput(prediction.description);
                                                setForm(prev => ({ ...prev, birthLocation: prediction.description, birthLocationId: prediction.place_id }));
                                                const placeDetails = await getPlaceDetails(prediction.place_id);
                                                console.log("place details", placeDetails);
                                                setShowSuggestions(false);
                                                setOpen(false);
                                            }}
                                        >
                                            {prediction.description}
                                        </CommandItem>
                                    ))}

                                </CommandGroup>
                                <CommandSeparator className="hidden" />
                            </CommandList>
                        </Command>
                    </div>

                    {/* submit button */}
                    

                </form>
                {/* birth date */}
                <div className="w-full max-w-sm items-center">
                    <CalendarComponent/>
                </div>

                <Link href="/dashboard" className="flex flex-col justify-center items-center">
                    <Button className="rounded-full items-center justify-center border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-md md:text-base sm:h-13 sm:w-auto md:w-[125px]">
                        submit
                    </Button>
                </Link>
            </section>
        </div>
    )
}

