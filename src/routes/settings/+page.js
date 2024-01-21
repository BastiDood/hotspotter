import { browser, building } from '$app/environment';
import { getScanInterval, getUrl } from '$lib/plugins/Config';

async function getData() {
    const [url, scanInterval] = await Promise.all([getUrl(), getScanInterval()]);
    return { url, scanInterval };
}

export async function load() {
    const result = building || !browser ? null : await getData();
    return { result };
}
