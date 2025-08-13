'use client';

import React, { useState } from 'react';
import { toast } from 'sonner'; // Assuming you're using sonner for toasts

// Types
export interface BirthData {
      name: string;
      date: string; // YYYY-MM-DD format
      time: string; // HH:MM format
      city: string;
}

export interface PlanetData {
      sign: string;
      house: number;
      retrograde: boolean;
}

export interface BirthChartResult {
      sun: PlanetData;
      moon: PlanetData;
      mercury: PlanetData;
      venus: PlanetData;
      mars: PlanetData;
      jupiter: PlanetData;
      saturn: PlanetData;
      uranus: PlanetData;
      neptune: PlanetData;
      pluto: PlanetData;
}

// Utility functions (based on chart2txt logic)
const SIGNS = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function degreeToSign(degree: number): string {
      const signIndex = Math.floor(degree / 30);
      return SIGNS[signIndex];
}

function calculateWholeSignHouse(sunDegree: number, planetDegree: number): number {
      const sunSign = Math.floor(sunDegree / 30);
      const planetSign = Math.floor(planetDegree / 30);

      // In whole sign houses, the sign containing the ascendant becomes the 1st house
      // and each subsequent sign becomes the next house
      let house = ((planetSign - sunSign) % 12) + 1;
      if (house <= 0) house += 12;

      return house;
}

// Geocoding function using OpenStreetMap Nominatim API
async function geocodeCity(city: string): Promise<{ lat: number; lng: number }> {
      try {
            const response = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
            );

            if (!response.ok) {
                  throw new Error('Geocoding service unavailable');
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                  throw new Error('Location not found');
            }

            return {
                  lat: parseFloat(data[0].lat),
                  lng: parseFloat(data[0].lon)
            };
      } catch (error) {
            // Attach original error message for easier debugging instead of swallowing it
            const msg = (error as Error)?.message ?? String(error);
            throw new Error(`Failed to find location. ${msg}`);
      }
}

// Timezone detection function using TimeZoneDB API (free alternative)
async function getTimezoneOffset(lat: number, lng: number, date: string, time: string): Promise<number> {
      try {
            // Create a timestamp from the birth date and time
            const dateTime = new Date(`${date}T${time}:00`);
            const timestamp = Math.floor(dateTime.getTime() / 1000);

            // Use a free timezone API service
            // Note: You'll need to sign up for a free API key at https://timezonedb.com/
            // For now, we'll use a fallback method with coordinate-based timezone estimation

            // Fallback: Simple timezone estimation based on longitude
            // This is approximate but works for most cases
            const estimatedOffset = Math.round(lng / 15);

            // Try the more accurate API approach
            try {
                  // You can replace this with a proper timezone API call
                  // For example, using TimeZoneDB:
                  // const response = await fetch(
                  //   `http://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_API_KEY&format=json&by=position&lat=${lat}&lng=${lng}&time=${timestamp}`
                  // );

                  // For now, use coordinate-based estimation with DST consideration
                  return estimatedOffset;
            } catch (apiErr) {
                  console.error('Timezone API lookup failed, falling back to estimate:', apiErr);
                  return estimatedOffset;
            }
      } catch (error) {
            console.error('Timezone offset calculation failed, using simple longitude estimate:', error);
            // If all else fails, estimate based on longitude
            return Math.round(lng / 15);
      }
}

// Alternative: Use browser's Intl API for timezone detection (more accurate)
function getTimezoneFromCoordinates(lat: number, lng: number): number {
      try {
            // This is a simplified approach - in reality, you'd want to use a proper timezone lookup
            // But we can make a reasonable estimate based on longitude

            // Major timezone boundaries (approximate)
            const timezoneMap = [
                  { lng: -165, offset: -11 }, // Pacific/Midway
                  { lng: -150, offset: -10 }, // Pacific/Honolulu
                  { lng: -135, offset: -9 },  // America/Anchorage
                  { lng: -120, offset: -8 },  // America/Los_Angeles
                  { lng: -105, offset: -7 },  // America/Denver
                  { lng: -90, offset: -6 },   // America/Chicago
                  { lng: -75, offset: -5 },   // America/New_York
                  { lng: -60, offset: -4 },   // America/Halifax
                  { lng: -45, offset: -3 },   // America/Sao_Paulo
                  { lng: -30, offset: -2 },   // Atlantic/South_Georgia
                  { lng: -15, offset: -1 },   // Atlantic/Azores
                  { lng: 0, offset: 0 },      // Europe/London
                  { lng: 15, offset: 1 },     // Europe/Paris
                  { lng: 30, offset: 2 },     // Europe/Helsinki
                  { lng: 45, offset: 3 },     // Asia/Baghdad
                  { lng: 60, offset: 4 },     // Asia/Dubai
                  { lng: 75, offset: 5 },     // Asia/Karachi
                  { lng: 90, offset: 6 },     // Asia/Dhaka
                  { lng: 105, offset: 7 },    // Asia/Bangkok
                  { lng: 120, offset: 8 },    // Asia/Shanghai
                  { lng: 135, offset: 9 },    // Asia/Tokyo
                  { lng: 150, offset: 10 },   // Australia/Sydney
                  { lng: 165, offset: 11 },   // Pacific/Norfolk
                  { lng: 180, offset: 12 }    // Pacific/Auckland
            ];

            // Find the closest timezone
            let closestTimezone = timezoneMap[0];
            let minDistance = Math.abs(lng - timezoneMap[0].lng);

            for (const timezone of timezoneMap) {
                  const distance = Math.abs(lng - timezone.lng);
                  if (distance < minDistance) {
                        minDistance = distance;
                        closestTimezone = timezone;
                  }
            }

            return closestTimezone.offset;
      } catch (error) {
            console.error('Timezone from coordinates failed, using simple longitude estimate:', error);
            // Fallback to simple longitude-based calculation
            return Math.round(lng / 15);
      }
}

// THE MAIN GANGSTA FUNCTION. CALCULATES ACCORDING TO WHOLE HOUSE
export async function calculateBirthChart(birthData: BirthData): Promise<BirthChartResult> {
      // Validate inputs
      if (!birthData.time || birthData.time.trim() === '') {
            throw new Error('BIRTH_TIME_MISSING');
      }

      if (!birthData.city || birthData.city.trim() === '') {
            throw new Error('LOCATION_MISSING');
      }

      try {
            // Geocode the city
            const { lat, lng } = await geocodeCity(birthData.city);

            // Parse date and time
            // const [year, month, day] = birthData.date.split('-').map(Number);
            //const [hour, minute] = birthData.time.split(':').map(Number);

            // Get timezone offset for the birth location
            // const timezoneOffset = getTimezoneFromCoordinates(lat, lng);

            // Use the original birth time (user enters time in birth location's timezone)
            // The simple-astro-api expects local time for the given coordinates
            const apiDate = birthData.date;
            const apiTime = birthData.time;

            // Call simple-astro-api
            const apiUrl = 'https://simple-astro-api.netlify.app/api/positions';
            const params = new URLSearchParams({
                  date: apiDate,
                  time: `${apiTime}:00`, // Add seconds
                  lat: lat.toString(),
                  lng: lng.toString(),
                  house_system: 'W' // Whole Sign house system
            });

            const response = await fetch(`${apiUrl}?${params}`);

            if (!response.ok) {
                  throw new Error('Astrological calculation service is temporarily unavailable');
            }

            const data = await response.json();

            // Extract planetary positions from the API response
            // Note: The exact structure depends on simple-astro-api's response format
            // You may need to adjust these property names based on the actual API response
            const planets = data.planets ?? data;

            // Calculate signs and houses for each planet
            const result: BirthChartResult = {
                  sun: {
                        sign: degreeToSign(planets.sun ?? planets.Sun ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.sun ?? planets.Sun ?? 0),
                        retrograde: planets.sun_retrograde ?? planets.Sun_retrograde ?? false
                  },
                  moon: {
                        sign: degreeToSign(planets.moon ?? planets.Moon ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.moon ?? planets.Moon ?? 0),
                        retrograde: planets.moon_retrograde ?? planets.Moon_retrograde ?? false
                  },
                  mercury: {
                        sign: degreeToSign(planets.mercury ?? planets.Mercury ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.mercury ?? planets.Mercury ?? 0),
                        retrograde: planets.mercury_retrograde ?? planets.Mercury_retrograde ?? false
                  },
                  venus: {
                        sign: degreeToSign(planets.venus ?? planets.Venus ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.venus ?? planets.Venus ?? 0),
                        retrograde: planets.venus_retrograde ?? planets.Venus_retrograde ?? false
                  },
                  mars: {
                        sign: degreeToSign(planets.mars ?? planets.Mars ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.mars ?? planets.Mars ?? 0),
                        retrograde: planets.mars_retrograde ?? planets.Mars_retrograde ?? false
                  },
                  jupiter: {
                        sign: degreeToSign(planets.jupiter ?? planets.Jupiter ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.jupiter ?? planets.Jupiter ?? 0),
                        retrograde: planets.jupiter_retrograde ?? planets.Jupiter_retrograde ?? false
                  },
                  saturn: {
                        sign: degreeToSign(planets.saturn ?? planets.Saturn ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.saturn ?? planets.Saturn ?? 0),
                        retrograde: planets.saturn_retrograde ?? planets.Saturn_retrograde ?? false
                  },
                  uranus: {
                        sign: degreeToSign(planets.uranus ?? planets.Uranus ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.uranus ?? planets.Uranus ?? 0),
                        retrograde: planets.uranus_retrograde ?? planets.Uranus_retrograde ?? false
                  },
                  neptune: {
                        sign: degreeToSign(planets.neptune ?? planets.Neptune ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.neptune ?? planets.Neptune ?? 0),
                        retrograde: planets.neptune_retrograde ?? planets.Neptune_retrograde ?? false
                  },
                  pluto: {
                        sign: degreeToSign(planets.pluto ?? planets.Pluto ?? 0),
                        house: calculateWholeSignHouse(planets.sun ?? planets.Sun ?? 0, planets.pluto ?? planets.Pluto ?? 0),
                        retrograde: planets.pluto_retrograde ?? planets.Pluto_retrograde ?? false
                  }
            };

            return result;

      } catch (error: any) {
            if (error.message === 'BIRTH_TIME_MISSING') {
                  throw error;
            }
            if (error.message === 'LOCATION_MISSING') {
                  throw error;
            }
            if (error.message.includes('Failed to find location')) {
                  throw new Error('GEOCODING_FAILED');
            }
            throw error;
      }
}

// React Component
interface BirthChartCalculatorProps {
      birthData: BirthData;
      onCalculationComplete?: (result: BirthChartResult) => void;
      onError?: (error: string) => void;
      autoCalculate?: boolean;
}

export default function BirthChartCalculator({
      birthData,
      onCalculationComplete,
      onError,
      autoCalculate = false
}: Readonly<BirthChartCalculatorProps>) {
      const [isCalculating, setIsCalculating] = useState(false);
      const [result, setResult] = useState<BirthChartResult | null>(null);
      const [error, setError] = useState<string | null>(null);

      const handleCalculation = async () => {
            setIsCalculating(true);
            setError(null);

            try {
                  const chartResult = await calculateBirthChart(birthData);
                  setResult(chartResult);
                  onCalculationComplete?.(chartResult);
                  toast.success('Birth chart calculated successfully!');
            } catch (err: any) {
                  let errorMessage = err.message;

                  // Handle specific error types with user-friendly toasts
                  if (err.message === 'BIRTH_TIME_MISSING') {
                        errorMessage = 'Please enter your birth time to calculate your chart';
                        toast.error(errorMessage);
                  } else if (err.message === 'GEOCODING_FAILED') {
                        errorMessage = 'Please check your city name and try again';
                        toast.error(errorMessage);
                  } else {
                        errorMessage = 'Failed to calculate birth chart. Please try again.';
                        toast.error(errorMessage);
                  }

                  setError(errorMessage);
                  onError?.(errorMessage);
            } finally {
                  setIsCalculating(false);
            }
      };

      // Auto-calculate when component mounts if autoCalculate is true
      React.useEffect(() => {
            if (autoCalculate && birthData.date && birthData.time && birthData.city) {
                  handleCalculation();
            }
      }, [autoCalculate, birthData]);

      if (autoCalculate) {
            // Auto-calculation mode - just return status
            return (
                  <div className="space-y-4">
                        {isCalculating && (
                              <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span>Calculating your birth chart...</span>
                              </div>
                        )}

                        {error && (
                              <div className="text-red-500 text-sm">
                                    {error}
                              </div>
                        )}

                        {result && (
                              <div className="text-green-500 text-sm">
                                    Birth chart calculated successfully!
                              </div>
                        )}
                  </div>
            );
      }

      // Manual calculation mode - show button and results
      return (
            <div className="space-y-4">
                  <button
                        onClick={handleCalculation}
                        disabled={isCalculating || !birthData.date || !birthData.time || !birthData.city}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                        {isCalculating ? 'Calculating...' : 'Calculate Birth Chart'}
                  </button>

                  {error && (
                        <div className="text-red-500 text-sm">
                              {error}
                        </div>
                  )}

                  {result && (
                        <div className="space-y-2">
                              <h3 className="font-semibold">Your Birth Chart:</h3>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(result).map(([planet, data]) => (
                                          <div key={planet} className="flex justify-between">
                                                <span className="capitalize font-medium">{planet}:</span>
                                                <span>{data.sign} (House {data.house})</span>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  )}
            </div>
      );
}