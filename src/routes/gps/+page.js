import { browser } from '$app/environment';
import { getLocation } from '$lib/plugins/Location';
import { getUrl } from '$lib/plugins/Config';

export async function load() {
    if (!browser) return { position: null };
    const [url, position] = await Promise.all([getUrl(), getLocation()]);
    return { url, position };
}
