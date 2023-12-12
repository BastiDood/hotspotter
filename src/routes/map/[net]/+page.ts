import { MarkerMode, fetchMarkers } from '$lib/http';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getUrl } from '$lib/plugins/Config';

export const load = (async ({ fetch, params: { net } }) => {
    if (!browser) return;
    const base = await getUrl();
    if (typeof base === 'undefined') return { markers: null };
    switch (net) {
        case MarkerMode.Cdma:
        case MarkerMode.Gsm:
        case MarkerMode.Lte:
        case MarkerMode.Nr:
        case MarkerMode.Tdscdma:
        case MarkerMode.Wcdma:
            return { markers: fetchMarkers(fetch, base, net) };
        default:
            throw error(404, 'unknown marker mode');
    }
}) satisfies PageLoad;
