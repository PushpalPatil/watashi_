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

// Import the birth chart calculator
import { calculateBirthChart, BirthData, BirthChartResult } from "@/app/components/birthchartcalculator";
import { toast } from "sonner"; // Make sure you have sonner installed

export interface MapLocation {
      place_id: string
      description: string
      structured_formatting: {
            main_text: string
            secondary_text: string
      }
}

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
      // controls visibility of the suggestions dropdown
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
      const [_open, setOpen] = useState(false)

      // Add state for birth chart data
      const [chartData, setChartData] = useState<BirthChartResult | null>(null);
      const [isCalculatingChart, setIsCalculatingChart] = useState(false);

      useEffect(() => {
            const fetchSuggestions = async () => {
                  const predictions = await autocomplete(input);
                  setPredictions(predictions ?? []);
            }
            fetchSuggestions();
      }, [input]);

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault();
            setIsCalculatingChart(true);

            try {
                  // First, calculate the birth chart using the new calculator
                  console.log('Starting birth chart calculation...');

                  // Convert form data to BirthData format
                  const birthData: BirthData = {
                        name: form.name,
                        date: form.birthDate ? form.birthDate.toISOString().split('T')[0] : '', // Convert to YYYY-MM-DD
                        time: form.birthTime, // Already in HH:MM format
                        city: form.birthLocation
                  };

                  console.log('Birth data for calculation:', birthData);

                  // Calculate birth chart with new method
                  const newChartResult = await calculateBirthChart(birthData);
                  console.log('NEW BIRTH CHART RESULT:', newChartResult);
                  console.log('Chart data breakdown:');
                  Object.entries(newChartResult).forEach(([planet, data]) => {
                        console.log(`  ${planet}: ${data.sign} in House ${data.house}`);
                  });

                  setChartData(newChartResult);

                  // Also run your existing chart calculation for comparison/backup
                  const [hourStr, minStr] = form.birthTime.split(':');
                  const birthDataOld = {
                        year: form.birthDate?.getFullYear(),
                        month: (form.birthDate?.getMonth() ?? 0) + 1,
                        date: form.birthDate?.getDate(),
                        hour: parseInt(hourStr || '0', 10),
                        minute: parseInt(minStr || '0', 10),
                        second: 0,
                        lat: form.lat,
                        lon: form.lon,
                  };

                  console.log('Also calculating with old method for comparison...');

                  // Your existing chart calculation
                  const chart = await fetch('/api/chart', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(birthDataOld),
                  });

                  const { planets } = await chart.json();
                  console.log('🔗 OLD BIRTH CHART (for comparison):', planets);

                  // Your existing persona generation
                  const planetsWithPersona = await Promise.all(
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
                        })
                  );

                  // Save to zustand
                  setPlanets(
                        Object.fromEntries(
                              planetsWithPersona.map(p => [p.planet.toLowerCase(), p])
                        )
                  );

                  console.log('Birth chart calculation completed successfully!');
                  console.log('Final data saved to store');

                  // Navigate to dashboard
                  router.push('/dashboard');

            } catch (error: any) {
                  console.error('Birth chart calculation failed:', error);

                  // Handle specific error types
                  if (error.message === 'BIRTH_TIME_MISSING') {
                        toast.error('Please enter your birth time to calculate your chart');
                  } else if (error.message === 'GEOCODING_FAILED') {
                        toast.error('Please check your city name and try again');
                  } else {
                        toast.error('Failed to calculate birth chart. Please try again.');
                  }
            } finally {
                  setIsCalculatingChart(false);
            }
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
                                          onValueChange={(value) => {
                                                setInput(value);
                                                setShowSuggestions(value.length > 0);
                                          }}
                                    />
                                    {showSuggestions && (
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
                                                                        // hide suggestions after a selection is made
                                                                        setShowSuggestions(false);
                                                                        setPredictions([]);
                                                                        setOpen(false);
                                                                  }}
                                                            >
                                                                  {prediction.description}
                                                            </CommandItem>
                                                      ))}
                                                </CommandGroup>
                                                <CommandSeparator className="hidden" />
                                          </CommandList>
                                    )}
                              </Command>

                              {/* birth date */}
                              <div className="w-full max-w-sm items-center">
                                    <CalendarComponent
                                          value={form.birthDate}
                                          onChange={(d: any) => setForm({ ...form, birthDate: d })}
                                    />
                              </div>

                              {/* submit button with loading state */}
                              <Button
                                    type="submit"
                                    disabled={isCalculatingChart}
                                    className="rounded-full mt-5 items-center justify-center border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-md md:text-base sm:h-13 sm:w-auto md:w-[125px]"
                              >
                                    {isCalculatingChart ? (
                                          <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background"></div>
                                                <span className="text-sm">calculating...</span>
                                          </div>
                                    ) : (
                                          'submit'
                                    )}
                              </Button>
                        </form>

                        {/* Optional: Display chart data preview */}
                        {chartData && (
                              <div className="w-full max-w-sm mt-6 p-4 border rounded-md bg-transparent">
                                    <h3 className="text-sm font-medium mb-2">Chart Preview (check console for full data):</h3>
                                    <div className="text-xs space-y-1">
                                          <div>Sun: {chartData.sun.sign} (House {chartData.sun.house})</div>
                                          <div>Moon: {chartData.moon.sign} (House {chartData.moon.house})</div>
                                          <div>Mercury: {chartData.mercury.sign} (House {chartData.mercury.house})</div>
                                    </div>
                              </div>
                        )}
                  </section>
            </div>
      )
}