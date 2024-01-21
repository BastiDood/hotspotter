import { browser, building } from '$app/environment';
import { getUrl } from '$lib/plugins/Config';

export async function load() {
    const base = building || !browser ? null : await getUrl();
    return { base };
}
