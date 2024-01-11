import { getScanInterval, getUrl } from '$lib/plugins/Config';
import { building } from '$app/environment';

export async function load() {
    if (building) return { url: null, scanInterval: null };
    const [url, scanInterval] = await Promise.all([getUrl(), getScanInterval()]);
    return { url, scanInterval };
}
