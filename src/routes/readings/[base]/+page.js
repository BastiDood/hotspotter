import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { readFile } from '$lib/plugins/Cache';

export const prerender = false;

/** @param {string} base */
async function getData(base) {
    const { payload } = await readFile(base);
    return payload;
}

export async function load({ params: { base } }) {
    const reading = !building && browser && Capacitor.isNativePlatform() ? await getData(base) : null;
    return { reading };
}
