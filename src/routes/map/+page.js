import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getUrl } from '$lib/plugins/Config';

export async function load() {
    const base = !building && browser && Capacitor.isNativePlatform() ? await getUrl() : null;
    return { base };
}
