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
import StarryBackgroundLanding from "../components/starrybackgroundlanding";

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

      // Add fade-in effect when component mounts
      useEffect(() => {
            // Reset body opacity and remove transition on page load
            document.body.style.opacity = '1';
            document.body.style.transition = '';
      }, []);

      return (
            <div className="bg-black animate-page-fade-in">
                  <Header />
                  <StarryBackgroundLanding />
                  <div className="justify-center mt-30">
                        {/* welcome blurb  */}
                        <section className="container mx-auto   py-20 text-center flex flex-col items-center">
                              {/* <h1 className="text-3xl font-normal ">
                              ~ welcome ~
                        </h1> */}
                              <p className="text-lg text-amber-50/85 pt-2 font-light font-serif"> please fill out your birth details</p>
                        </section>

                        {/* Floating zodiac symbols - arranged in circle around form */}
                        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
                              <div className="relative w-[600px] h-[600px] md:w-[700px] md:h-[700px] animate-orbit-slow">
                                    {/* Aries - 0° (top) */}
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float-1 glow-svg" style={{ top: '0px' }}>
                                          <img src="/symbols/aries-sign.svg" alt="Aries" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Taurus - 30° */}
                                    <div className="absolute animate-float-2 glow-svg" style={{ top: '13.4%', right: '6.7%', transform: 'translate(50%, -50%)' }}>
                                          <img src="/symbols/taurus-sign.svg" alt="Taurus" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                                    {/* Gemini - 60° */}
                                    <div className="absolute animate-float-3 glow-svg" style={{ top: '25%', right: '0%', transform: 'translate(50%, -50%)' }}>
                                          <img src="/symbols/gemini-sign.svg" alt="Gemini" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Cancer - 90° (right) */}
                                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 animate-float-4 glow-svg">
                                          <img src="/symbols/cancer-sign.svg" alt="Cancer" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                                    {/* Leo - 120° */}
                                    <div className="absolute animate-float-5 glow-svg" style={{ bottom: '25%', right: '0%', transform: 'translate(50%, 50%)' }}>
                                          <img src="/symbols/leo-sign.svg" alt="Leo" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Virgo - 150° */}
                                    <div className="absolute animate-float-6 glow-svg" style={{ bottom: '13.4%', right: '6.7%', transform: 'translate(50%, 50%)' }}>
                                          <img src="/symbols/virgo-sign.svg" alt="Virgo" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                                    {/* Libra - 180° (bottom) */}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 animate-float-1 glow-svg">
                                          <img src="/symbols/libra-sign.svg" alt="Libra" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Scorpio - 210° */}
                                    <div className="absolute animate-float-2 glow-svg" style={{ bottom: '13.4%', left: '6.7%', transform: 'translate(-50%, 50%)' }}>
                                          <img src="/symbols/scorpio-sign.svg" alt="Scorpio" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                                    {/* Sagittarius - 240° */}
                                    <div className="absolute animate-float-3 glow-svg" style={{ bottom: '25%', left: '0%', transform: 'translate(-50%, 50%)' }}>
                                          <img src="/symbols/sagittarius-sign.svg" alt="Sagittarius" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Capricorn - 270° (left) */}
                                    <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 animate-float-4 glow-svg">
                                          <img src="/symbols/capricorn-sign.svg" alt="Capricorn" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                                    {/* Aquarius - 300° */}
                                    <div className="absolute animate-float-5 glow-svg" style={{ top: '25%', left: '0%', transform: 'translate(-50%, -50%)' }}>
                                          <img src="/symbols/aquarius-sign.svg" alt="Aquarius" className="w-7 h-7 md:w-9 md:h-9 filter invert opacity-90" />
                                    </div>
                                    {/* Pisces - 330° */}
                                    <div className="absolute animate-float-6 glow-svg" style={{ top: '13.4%', left: '6.7%', transform: 'translate(-50%, -50%)' }}>
                                          <img src="/symbols/pisces-sign.svg" alt="Pisces" className="w-6 h-6 md:w-8 md:h-8 filter invert opacity-90" />
                                    </div>
                              </div>
                        </div>

                        {/* form section */}
                        <section className="min-h-screen px-4 max-w-sm container flex space-y-6 flex-col items-center mx-auto font-normal relative z-10">
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
                                          placeholder="Birth location..."
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
                                          <div className="w-full max-w-sm text-xs border border-border bg-background rounded-md">
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
                                          className="rounded-full mt-5 items-center justify-center hover:bg-accent text-amber-50/85 font-thin font-serif font-stretch-100% bg-transparent border-1 border-white/60 font-sm text-md md:text-base sm:h-13 sm:w-auto md:w-[125px]"
                                    >
                                          {isCalculatingChart ? (
                                                <div className="flex items-center space-x-2">
                                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background"></div>
                                                      <span className="text-xs text-amber-50/65">calculating...</span>
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
                  {/* Page fade-in animation and autofill styling */}
                  <style jsx global>{`
                        @keyframes page-fade-in {
                              0% {
                                    opacity: 0;
                              }
                              100% {
                                    opacity: 1;
                              }
                        }
                        
                        .animate-page-fade-in {
                              animation: page-fade-in 0.5s ease-out;
                        }

                        /* Remove browser autofill styling - make all inputs transparent */
                        input:-webkit-autofill,
                        input:-webkit-autofill:hover,
                        input:-webkit-autofill:focus,
                        input:-webkit-autofill:active {
                              -webkit-box-shadow: 0 0 0 30px black inset !important;
                              -webkit-text-fill-color: white !important;
                              background-color: transparent !important;
                              background-image: none !important;
                              transition: background-color 5000s ease-in-out 0s !important;
                        }

                        /* Firefox autofill */
                        input:-moz-autofill {
                              background-color: transparent !important;
                              background-image: none !important;
                        }

                        /* Force all inputs to have consistent styling */
                        input {
                              background-color: transparent !important;
                              background-image: none !important;
                        }

                        /* Fix time input styling */
                        input[type="time"] {
                              color-scheme: dark;
                              color: #9ca3af !important;
                        }

                        input[type="time"]::-webkit-calendar-picker-indicator {
                              filter: invert(0.5);
                              opacity: 0.7;
                        }

                        /* Fix calendar icon color - target Lucide CalendarIcon */
                        button[id="date-picker"] svg,
                        button[id="date-picker"],
                        .lucide-calendar,
                        .calendar-icon,
                        [data-testid="calendar-icon"],
                        svg[data-testid="calendar-icon"] {
                              color: #9ca3af !important;
                              opacity: 0.7 !important;
                        }

                        /* More specific targeting for the calendar button */
                        button[variant="ghost"] svg {
                              color: #9ca3af !important;
                              stroke: #9ca3af !important;
                        }

                        /* Zodiac symbols glow and float animations */
                        .glow-symbol {
                              text-shadow: 0 0 10px rgba(255, 255, 255, 0.9),
                                         0 0 20px rgba(255, 255, 255, 0.6),
                                         0 0 30px rgba(255, 255, 255, 0.4);
                        }

                        /* SVG glow effect */
                        .glow-svg img {
                              filter: invert(1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) 
                                      drop-shadow(0 0 16px rgba(255, 255, 255, 0.6)) 
                                      drop-shadow(0 0 24px rgba(255, 255, 255, 0.4));
                        }

                        @keyframes float-1 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              25% { transform: translateY(-10px) translateX(5px) rotate(2deg); }
                              50% { transform: translateY(0) translateX(10px) rotate(0deg); }
                              75% { transform: translateY(10px) translateX(5px) rotate(-2deg); }
                        }

                        @keyframes float-2 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              33% { transform: translateY(15px) translateX(-8px) rotate(-3deg); }
                              66% { transform: translateY(-5px) translateX(-15px) rotate(1deg); }
                        }

                        @keyframes float-3 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              20% { transform: translateY(-8px) translateX(12px) rotate(3deg); }
                              40% { transform: translateY(12px) translateX(8px) rotate(-1deg); }
                              60% { transform: translateY(-4px) translateX(-6px) rotate(2deg); }
                              80% { transform: translateY(6px) translateX(-12px) rotate(-2deg); }
                        }

                        @keyframes float-4 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              30% { transform: translateY(18px) translateX(10px) rotate(4deg); }
                              70% { transform: translateY(-12px) translateX(-5px) rotate(-3deg); }
                        }

                        @keyframes float-5 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              40% { transform: translateY(-15px) translateX(-10px) rotate(-4deg); }
                              80% { transform: translateY(8px) translateX(15px) rotate(2deg); }
                        }

                        @keyframes float-6 {
                              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
                              25% { transform: translateY(12px) translateX(-8px) rotate(3deg); }
                              50% { transform: translateY(-6px) translateX(6px) rotate(-1deg); }
                              75% { transform: translateY(14px) translateX(12px) rotate(-3deg); }
                        }

                        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
                        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
                        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
                        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
                        .animate-float-5 { animation: float-5 11s ease-in-out infinite; }
                        .animate-float-6 { animation: float-6 7s ease-in-out infinite; }

                        /* Orbital rotation animation */
                        @keyframes orbit {
                              0% { transform: rotate(0deg); }
                              100% { transform: rotate(360deg); }
                        }

                        .animate-orbit-slow {
                              animation: orbit 180s linear infinite;
                        }
                  `}</style>
            </div>
      )
}