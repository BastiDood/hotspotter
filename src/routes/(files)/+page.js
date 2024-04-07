import { browser, building } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { checkPermissions } from '$lib/plugins/Loop';

export async function load() {
    const permissions = !building && browser && Capacitor.isNativePlatform() ? await checkPermissions() : {};
    return { permissions };
}
