import { getScanInterval, getUrl } from '$lib/plugins/Config';
import { browser } from '$app/environment';

export async function load() {
    if (!browser) return;
    const [url, scanInterval] = await Promise.all([getUrl(), getScanInterval()]);
    return { url, scanInterval };
}
