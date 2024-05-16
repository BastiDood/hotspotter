import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { readFile } from '$lib/plugins/Cache';

export const prerender = false;

export async function load({ params: { name } }) {
    const reading = !building && browser && Capacitor.isNativePlatform() ? await readFile(name) : null;
    return { reading };
}
