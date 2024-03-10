import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { read } from '$lib/plugins/Cache';

export async function load() {
    const cache = !building && browser && Capacitor.isNativePlatform() ? await read() : {};
    return { cache };
}
