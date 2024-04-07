import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { read } from '$lib/plugins/Cache';

export async function load() {
    const data = !building && browser && Capacitor.isNativePlatform() ? await read() : [];
    const entries = data.map(({ now, ...row }) => [now.valueOf().toString(), row] as const);
    return { cache: Object.fromEntries(entries) };
}
