import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
    house: number,
    persona?: string,
}

type State = {
    planets: Record<string, PlanetWithPersona>;
    setPlanets: (data: Record<string, PlanetWithPersona>) => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useStore = create<State>()(
    persist(
        (set) => ({
            planets: {},
            setPlanets: (data) => set({planets: data}),
            _hasHydrated: false,
            setHasHydrated: (state) => set({_hasHydrated: state}),
        }),
        {
            name: 'birth-chart-storage',
            storage: createJSONStorage(() => sessionStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);