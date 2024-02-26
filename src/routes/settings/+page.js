import { browser, building } from '$app/environment';
import { getScanInterval, getUrl } from '$lib/plugins/Config';

async function getData() {
    const [url, scanInterval] = await Promise.all([getUrl(), getScanInterval()]);
    return { url, scanInterval };
}

export async function load() {
    const config = !building && browser ? await getData() : null;
    return { config };
}
