"use server";

import { Client } from "@googlemaps/google-maps-services-js"



const clientInfo = new Client({});
export const autocomplete = async (input: string) => {
    if (!input) return [];
    try {
        const response = await clientInfo.placeAutocomplete({
            params: {
                input,
                key: process.env.GOOGLE_MAPS_API_KEY!,
            
            },
        });

        return response.data.predictions;

    } catch (error) {
        console.error("Failed to fetch location suggestions", error);
        return [];
    }
};

export const getPlaceDetails = async (placeId: string) => {
    const response = await clientInfo.placeDetails({
        params: {
            place_id: placeId,
            key: process.env.GOOGLE_MAPS_API_KEY!,
        },
    });

    return response.data;
};


