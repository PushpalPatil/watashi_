
import { NextRequest, NextResponse } from "next/server";
import path from 'path';


export const runtime = 'nodejs'

interface PlanetPosition {
    name: string,
    longitude: number,
    speed: number
}

interface CalculationResult {
    planets: PlanetPosition[];
}

// object
type PlanetPoint = {
    planet: string,
    deg: number,
    sign: string,
    retrograde: boolean
}
// tell the swiss-ephemeris where the files are


//entry point
export async function POST(req: NextRequest) {

    const raw = await req.text();
    console.log('RAW BODY:', raw);
    const swe = (await import('swisseph')).default as typeof import('swisseph');

    swe.swe_set_ephe_path(path.join(process.cwd(), 'lib/ephemeris'));
    const PLANET_IDS = [
        swe.SE_SUN, swe.SE_MOON, swe.SE_MERCURY,
        swe.SE_VENUS, swe.SE_MARS,
        swe.SE_JUPITER, swe.SE_SATURN, swe.SE_URANUS,
        swe.SE_NEPTUNE, swe.SE_PLUTO
    ] as const;
    //array
    const SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    ] as const;
    // parse the body
    const { year, month, day,
        hour = 0,
        minute = 0,
        second = 0,
        latitude = 0,
        longitude = 0,
    } = JSON.parse(raw) as Record<string, number>;

    // calculate julian day - given the details given are from a modern day gregorian calendar
    const julianDay = swe.swe_julday(
        year,
        month,
        day,
        hour + (minute + second / 60) / 60,
        swe.SE_GREG_CAL,
    );

    const IF = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;  // 0x0003

    // planets will hold the result of PLANET_IDS.map( ...
    // PlanetPoint[] is the custom type/interface declared, it's an array whose elements match the PlanetPoint type
    // guarantees that planets is exactly [ {planet, deg, sign, retrograde}, ... etc]

    const p: PlanetPoint[] = PLANET_IDS.map((pID) => {

        const { longitude, longitudeSpeed } = swe.swe_calc_ut(julianDay, pID, IF) as any;
        const retro = longitudeSpeed < 0;

        // `get_planet_name` can return either a string *or* { name: string } depending on lib version
        const swePName = swe.swe_get_planet_name(pID)
        const planetName: string = typeof swePName === "string" ? swePName : swePName.name;
        const deg = longitude;
        return {
            planet: planetName,
            deg,
            sign: SIGNS[Math.floor(longitude / 30)],
            retrograde: retro
        }
    })

    console.log({ planets: p })
    return NextResponse.json({planets: p })

}