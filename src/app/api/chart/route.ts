import { NextRequest, NextResponse } from "next/server";
import path from "path";
import swe from "swisseph";

export const runtime = "nodejs";

type PlanetPoint = {
    planet: string;
    deg: number;
    sign: string;
    retrograde: boolean;
};

export async function POST(req: NextRequest) {
    try {
        // Read & validate payload
        const {
            year,
            month,
            date,                     // <— expect **date**, not “day”
            hour = 0,
            minute = 0,
            second = 0,
            
        } = (await req.json()) as Record<string, number>;

        if (
            [year, month, date].some(
                (v) => typeof v !== "number" || Number.isNaN(v)
            )
        ) {
            return NextResponse.json(
                { error: "year, month and date are required numbers" },
                { status: 400 }
            );
        }

        // Generate chart
        swe.swe_set_ephe_path(path.join(process.cwd(), "lib/ephemeris"));

        const julianDay = swe.swe_julday(
            year,
            month,
            date,
            hour + (minute + second / 60) / 60,
            swe.SE_GREG_CAL
        );
        // SEFLG_SWIEPH is a flag that tells the program to use the Swiss Ephemeris library to calculate the position of the planets.
        const IF = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
        const PLANET_IDS = [
            swe.SE_SUN,
            swe.SE_MOON,
            swe.SE_MERCURY,
            swe.SE_VENUS,
            swe.SE_MARS,
            swe.SE_JUPITER,
            swe.SE_SATURN,
            swe.SE_URANUS,
            swe.SE_NEPTUNE,
            swe.SE_PLUTO,
        ] as const;

        const SIGNS = [
            "Aries",
            "Taurus",
            "Gemini",
            "Cancer",
            "Leo",
            "Virgo",
            "Libra",
            "Scorpio",
            "Sagittarius",
            "Capricorn",
            "Aquarius",
            "Pisces",
        ] as const;

        // swe_calc_ut is a function that calculates the position of the planets.
        // It takes the julian day, the planet id, and the flags.
        // It returns the longitude, longitude speed, and other information.
        // longitude is the position of the planet in the zodiac.
        // longitudeSpeed is the speed of the planet in the zodiac.

        const planets: PlanetPoint[] = PLANET_IDS.map((pid) => {
            const { longitude, longitudeSpeed } = swe.swe_calc_ut(
                julianDay,
                pid,
                IF
            ) as any;
            const retro = longitudeSpeed < 0;
            const sweName = swe.swe_get_planet_name(pid);
            const planet = typeof sweName === "string" ? sweName : sweName.name;
            // return the planet, longitude, sign, and retrograde
            /* longitude/30 % 12 because converts longitude to an absolute degree 
               (0-359.99) / 30 = (0-11.99)
                floor because it drops the fractional part and gives it a rounded down int
                %12 because longitude is 360 and forces the result back into 0-11
                then you look up the corresponding sign. as mentioned in order. 
            */
            return {
                planet,
                deg: longitude,
                sign: SIGNS[Math.floor(longitude / 30) % 12],
                retrograde: retro,
            };
        });

        return NextResponse.json({ planets });       // always JSON, status 200
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}
