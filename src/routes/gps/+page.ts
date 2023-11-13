import { Geolocation } from '@capacitor/geolocation';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

async function getLocation() {
    const { location, coarseLocation } = await Geolocation.requestPermissions({ permissions: ['location'] });
    if (location !== 'granted' && coarseLocation !== 'granted') throw error(403, 'location permissions denied');
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true });
}

export const load = (() => {
    const position = browser ? getLocation() : null;
    return { position };
}) satisfies PageLoad;
