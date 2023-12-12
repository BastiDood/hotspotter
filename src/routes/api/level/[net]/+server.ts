import { error, json } from '@sveltejs/kit';
import {
    fetchCdmaCoords,
    fetchGsmCoords,
    fetchLteCoords,
    fetchNrCoords,
    fetchTdscdmaCoords,
    fetchWcdmaCoords,
} from '$lib/server/db';
import { MarkerMode } from '$lib/http';
import type { RequestHandler } from './$types';

function route(net: string) {
    switch (net) {
        case MarkerMode.Cdma:
            return fetchCdmaCoords;
        case MarkerMode.Gsm:
            return fetchGsmCoords;
        case MarkerMode.Lte:
            return fetchLteCoords;
        case MarkerMode.Nr:
            return fetchNrCoords;
        case MarkerMode.Tdscdma:
            return fetchTdscdmaCoords;
        case MarkerMode.Wcdma:
            return fetchWcdmaCoords;
        default:
            throw error(404);
    }
}

// eslint-disable-next-line func-style
export const GET: RequestHandler = async ({ params: { net } }) => {
    const coords = await route(net)();
    return json(coords);
};
