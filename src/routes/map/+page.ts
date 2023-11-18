import { array, parse } from 'valibot';
import { Data } from '$lib/models/api';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getLocation } from '$lib/plugins/Location';
import { getUrl } from '$lib/plugins/Config';

async function fetchMarkers() {
    const url = await getUrl();
    if (url === null) throw error(401);
    const response = await fetch(url);
    if (response.status !== 200) throw error(502);
    const json = await response.json();
    return parse(array(Data), json).map(({ gps: { latitude, longitude } }) => [longitude, latitude]);
}

export const load = (async () => {
    if (browser) {
        const [markers, position] = await Promise.all([fetchMarkers(), getLocation()]);
        if (position === null) throw error(403);
        return { markers, position };
    }
}) satisfies PageLoad;
