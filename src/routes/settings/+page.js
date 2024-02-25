import { browser, building } from '$app/environment';
import { getScanInterval, getUrl } from '$lib/plugins/Config';
import { Capacitor } from '@capacitor/core';

async function getData() {
    const [url, scanInterval] = await Promise.all([getUrl(), getScanInterval()]);
    return { url, scanInterval };
}

export async function load() {
    const result = !building && browser && Capacitor.isNativePlatform() ? await getData() : null;
    return { result };
}
