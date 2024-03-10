import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getLastScan } from '$lib/plugins/Debounce';

export async function load() {
    const scan = !building && browser && Capacitor.isNativePlatform() ? await getLastScan() : null;
    return { scan };
}
