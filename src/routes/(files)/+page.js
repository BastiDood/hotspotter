import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { checkPermissions } from '$lib/plugins/Loop';
import { read } from '$lib/plugins/Cache';

async function getData() {
    const [generator, permissions] = await Promise.all([read(), checkPermissions()]);
    return { readings: Array.from(generator), permissions };
}

export async function load() {
    return !building && browser && Capacitor.isNativePlatform() ? await getData() : { readings: [], permissions: {} };
}
