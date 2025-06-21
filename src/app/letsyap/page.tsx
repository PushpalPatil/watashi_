"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/store/storeInfo";
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
import { useRouter } from "next/navigation";
import React from "react";
import { CalendarComponent } from "../components/calendar";

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
    birthDate?: Date,
    birthLocation: string,
    lat: number,
    lon: number,
}


export default function LetsYap() {

    const router = useRouter();
    // const MAP_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const [showSuggestions, setShowSuggestions] = useState(false);
    const setPlanets = useStore.getState().setPlanets;

    const [form, setForm] = useState<FormData>({
        name: "",
        birthTime: "",
        birthDN: "AM",
        birthDate: undefined,
        birthLocation: "",
        lat: 0,
        lon: 0,
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


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        //once you submit, let's parse and assign the data
        const [hourStr, minStr] = form.birthTime.split(':');
        const birthData = {
            year: form.birthDate?.getFullYear(),
            month: (form.birthDate?.getMonth() ?? 0) + 1,
            date: form.birthDate?.getDate(),
            hour: parseInt(hourStr || '0', 10), // parse it so that the num is converted to a base10 no matter what. and it returns a valid number even if the input was missing
            minute: parseInt(minStr || '0', 10),
            second: 0,
            lat: form.lat,
            lon: form.lon,
        };
        // now let's make the chart
        const chart = await fetch('/api/chart', {
            method: 'POST',
            body: JSON.stringify(birthData),
        });

        // converts the HTTP response body to a JS object, and
        // extracts the planets array field from that object for easy use in the next steps.
        const { planets } = await chart.json();
        console.log('🔭 birth chart', planets);

        // Promise.all: Runs all those fetches in parallel and waits until every promise resolves. The result is an array of enriched planet objects.
        // planetsWithPersona holds the final array. 
        const planetsWithPersona = await Promise.all(

            // Loops over every planet object you just got from /api/chart (p is one planet).
            // For each planet, runs an asynchronous function that will fetch its persona.
            // Sends one POST request per planet to your /api/persona route, passing that planets data ({ planet, sign, retrograde, … }).
            // Waits for the /api/persona response, parses it, and extracts { persona } — the two-sentence GPT blurb you generated.
            planets.map(async (p: any) => {
                const res = await fetch('/api/persona', {
                    method: 'POST',
                    body: JSON.stringify(p),
                });
                console.log("persona: ", p);
                const { persona } = await res.json();
                return {
                    ...p, persona

                };
                // ^ Merges the original planet object and the new persona text into a single object.
                
            })
        );
        

        // save it all to zustand.
        setPlanets(
            Object.fromEntries(
                planetsWithPersona.map(p => [p.planet.toLowerCase(), p])
            )
        );

        
        console.log(birthData)
        // use router to push to dashboard
        router.push('/dashboard');
    }

    console.log(form.name)
    console.log(form.birthTime)
    console.log(form.birthDate)


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
                <form className="w-full max-w-sm items-center justify-center flex flex-col space-y-6" onSubmit={handleSubmit}>

                    {/* name */}
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                        required
                    />


                    {/* birth time */}
                    <Input
                        type="time"
                        id="time"
                        className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                        min="00:00"
                        max="23:59"
                        required
                        value={form.birthTime}
                        onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                    />


                    {/* birth location */}
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
                                            const details = await getPlaceDetails(prediction.place_id);
                                            setForm(prev => ({
                                                ...prev,
                                                birthLocation: prediction.description,
                                                lat: details.result.geometry?.location.lat ?? prev.lat,
                                                lon: details.result.geometry?.location.lng ?? prev.lon
                                            }));
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

                    {/* birth date */}
                    <div className="w-full max-w-sm items-center">
                        <CalendarComponent
                            value={form.birthDate}
                            onChange={(d: any) => setForm({ ...form, birthDate: d })}
                        />
                    </div>

                    {/* submit button */}
                    <Button type="submit" className="rounded-full items-center justify-center border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-md md:text-base sm:h-13 sm:w-auto md:w-[125px]">
                        submit
                    </Button>
                </form>

            </section>
        </div>
    )
}

