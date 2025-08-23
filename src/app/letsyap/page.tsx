"use client";

import { Button } from "@/components/ui/button";
import { useChatStorage } from "@/hooks/useChatStorage";
import { useStore } from "@/store/storeInfo";
import { useEffect, useState } from "react";
import Header from "../components/header";


import { Input } from "@/components/ui/input";
import { autocomplete, getPlaceDetails } from "@/lib/google";
import type { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { useRouter } from "next/navigation";
import { CalendarComponent } from "../components/calendar";

// Import the birth chart calculator
import { BirthChartResult, BirthData, calculateBirthChart } from "@/app/components/birthchartcalculator";
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

      // Get chat storage to clear all chats when new birth chart is calculated
      const { clearAllChats } = useChatStorage('temp'); // planet name doesn't matter for clearAllChats

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
      const [open, setOpen] = useState(false)

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

      /*
       When form is submitted, handleSubmit parses all form details into their own BirthData format
       prevent auto refresh when submitting

      */
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

                  // Calculate birth chart with new method - not swisseph anymore
                  const newChartResult = await calculateBirthChart(birthData);

                  /* console.log('NEW BIRTH CHART RESULT:', newChartResult);
                  console.log('Chart data breakdown:');
                  */

                  Object.entries(newChartResult).forEach(([planet, data]) => {
                        console.log(`  ${planet}: ${data.sign} in House ${data.house}`);
                  });

                  setChartData(newChartResult);

                  // Convert Calculator #1 results to format needed for persona generation
                  const planetsForPersona = Object.entries(newChartResult).map(([planetName, planetData]) => ({
                        planet: planetName.charAt(0).toUpperCase() + planetName.slice(1), // Capitalize planet name
                        sign: planetData.sign,
                        house: planetData.house,
                        retrograde: planetData.retrograde
                  }));

                  // Save to zustand (personas will be generated on-demand by chat APIs)
                  setPlanets(
                        Object.fromEntries(
                              planetsForPersona.map(p => [p.planet.toLowerCase(), p])
                        )
                  );

                  // Clear all existing chat history for new birth chart
                  clearAllChats();

                  console.log('Birth chart calculation completed successfully!');
                  console.log('Final data saved to store');
                  console.log('All chat history cleared for new birth chart');

                  // Navigate to dashboard
                  router.push('/groupchat');

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
            <div className="bg-black">
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
                              <Input
                                    type="text"
                                    placeholder="Type location..."
                                    value={form.birthLocation}
                                    onChange={(e) => {
                                          setForm(prev => ({ ...prev, birthLocation: e.target.value }));
                                          setInput(e.target.value);
                                          setShowSuggestions(e.target.value.length > 0);
                                    }}
                                    className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                                    required
                              />

                              {/* Location suggestions dropdown */}
                              {showSuggestions && (
                                    <div className="w-full max-w-sm border border-border bg-background rounded-md">
                                          {/*
                                          map through predictions and display them
                                          key is the place_id, which is a unique identifier for the place -- for list rendering
                                          prediction.description = the readable location name for users is set in input box
                                          set form fetches coordinates from the prediction var (location & all it's descriptive tings)
                                          
                                          */}
                                          {predictions.map((prediction) => (
                                                <div
                                                      
                                                      key={prediction.place_id}
                                                      className="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                                      onClick={async () => {
                                                            setInput(prediction.description);
                                                            const details = await getPlaceDetails(prediction.place_id);
                                                            setForm(prev => ({
                                                                  ...prev,
                                                                  birthLocation: prediction.description,
                                                                  lat: details.result.geometry?.location.lat ?? prev.lat,
                                                                  lon: details.result.geometry?.location.lng ?? prev.lon
                                                            }));
                                                            console.log("place details", details);
                                                            // hide suggestions after a selection is made
                                                            setShowSuggestions(false);
                                                            setPredictions([]);
                                                            setOpen(false);
                                                      }}
                                                >
                                                      {prediction.description}
                                                </div>
                                          ))}
                                    </div>
                              )}

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

                        {/* chart data preview */}
                        {/* {chartData && (
                              <div className="w-full max-w-sm mt-6 p-4 border rounded-md bg-transparent">
                                    <h3 className="text-sm font-medium mb-2">Chart Preview (check console for full data):</h3>
                                    <div className="text-xs space-y-1">
                                          <div>Sun: {chartData.sun.sign} (House {chartData.sun.house})</div>
                                          <div>Moon: {chartData.moon.sign} (House {chartData.moon.house})</div>
                                          <div>Mercury: {chartData.mercury.sign} (House {chartData.mercury.house})</div>
                                    </div>
                              </div>
                        )} */}
                  </section>
            </div>
      )
}