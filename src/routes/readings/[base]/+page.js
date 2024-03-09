import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { readFile } from '$lib/plugins/Cache';

export const prerender = false;

export async function load({ params: { base } }) {
    const reading = !building && browser && Capacitor.isNativePlatform() ? await readFile(base) : null;
    return { reading };
}
