"use server";

import { Client } from "@googlemaps/google-maps-services-js";



const clientInfo = new Client({});
export const autocomplete = async (input: string) => {
    if (!input) return [];
    try {
        const apiKey = process.env._MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            throw new Error("Missing Google Maps API key. Set _MAPS_API_KEY or GOOGLE_MAPS_API_KEY in your environment.");
        }

        const response = await clientInfo.placeAutocomplete({
            params: {
                input,
                key: apiKey,

            },
        });

        return response.data.predictions;

    } catch (error) {
        console.error("Failed to fetch location suggestions", error);
        return [];
    }
};

export const getPlaceDetails = async (placeId: string) => {
    const apiKey = process.env._MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Google Maps API key. Set _MAPS_API_KEY or GOOGLE_MAPS_API_KEY in your environment.");
    }

    const response = await clientInfo.placeDetails({
        params: {
            place_id: placeId,
            key: apiKey,
        },
    });

    return response.data;
};


