import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { PUBLIC_HOTSPOTTER_URL } from '$lib/env';
import { read } from '$lib/plugins/Cache';

async function fetchData(http: typeof fetch) {
    const reading = await read();
    const entries = Object.entries(reading).map(async ([key, value]) => {
        const { longitude, latitude } = value.gps;
        const url = new URL(`api/score?lon=${longitude}&lat=${latitude}`, PUBLIC_HOTSPOTTER_URL);
        const response = await http(url);
        const text = await response.text();
        const score = parseFloat(text);
        return [key, { score, ...value }] as const;
    });
    return Object.fromEntries(await Promise.all(entries));
}

export async function load({ fetch }) {
    const cache = !building && browser && Capacitor.isNativePlatform() ? await fetchData(fetch) : {};
    return { cache };
}
