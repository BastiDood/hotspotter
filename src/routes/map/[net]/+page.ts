import { DataPoints } from '$lib/models/api';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getUrl } from '$lib/plugins/Config';
import { parse } from 'valibot';

async function fetchMarkers(mode: string) {
    const url = await getUrl();
    if (url === null) throw error(400, 'Base API endpoint not set.');
    const response = await fetch(new URL(`api/level/${mode}`, url.href));
    if (response.status !== 200) throw error(502, `[${response.status}]: ${response.statusText}`);
    const json = await response.json();
    return parse(DataPoints, json, { abortEarly: true });
}

export const load = (({ params: { net } }) => {
    if (browser) return { markers: fetchMarkers(net) };
}) satisfies PageLoad;
