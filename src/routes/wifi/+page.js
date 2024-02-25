import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getScanResults } from '$lib/plugins/WifiInfo';

export async function load() {
    const networks = !building && browser && Capacitor.isNativePlatform() ? await getScanResults() : [];
    return { networks };
}
