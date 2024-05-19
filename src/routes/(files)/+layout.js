import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { read } from '$lib/plugins/Cache';

export async function load() {
    const readings = !building && browser && Capacitor.isNativePlatform() ? Array.from(await read()) : [];
    return { readings };
}
