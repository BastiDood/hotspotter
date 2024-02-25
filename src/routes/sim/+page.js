import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getCellQuality } from '$lib/plugins/TelephonyInfo';

export async function load() {
    const result = !building && browser && Capacitor.isNativePlatform() ? await getCellQuality() : null;
    return { result };
}
