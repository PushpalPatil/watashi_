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
        /* ---------- 1. Read & validate payload ---------- */
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

        /* ---------- 2. Generate chart ---------- */
        swe.swe_set_ephe_path(path.join(process.cwd(), "lib/ephemeris"));

        const julianDay = swe.swe_julday(
            year,
            month,
            date,
            hour + (minute + second / 60) / 60,
            swe.SE_GREG_CAL
        );

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

        const planets: PlanetPoint[] = PLANET_IDS.map((pid) => {
            const { longitude, longitudeSpeed } = swe.swe_calc_ut(
                julianDay,
                pid,
                IF
            ) as any;
            const retro = longitudeSpeed < 0;
            const sweName = swe.swe_get_planet_name(pid);
            const planet = typeof sweName === "string" ? sweName : sweName.name;

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
