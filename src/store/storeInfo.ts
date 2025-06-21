import { create } from "zustand";

/*
HOW ZUSTAND HELPS
all the parsed form input data is in 1 store/file. now you can read it into any file without calculating shit again
tbis store lives inside the component tree - navigating from the form to dashboard keeps data intact
there's only 1 hook - useStore(state=> state.planets)
no reducers, actions, providers, or context nesting - thank GOD
*/

export type PlanetWithPersona = {
    planet: string,
    deg: number,
    sign: string,
    retrograde: boolean,
    persona?: string,
}

type State = {
    planets: Record<string, PlanetWithPersona>;
    setPlanets: (data: Record<string, PlanetWithPersona>) => void;
}

export const useStore = create<State>((set) => ({
    planets: {},
    setPlanets: (data) => set({planets:data}),
}));