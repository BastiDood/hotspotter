import { browser, building } from '$app/environment';
import { getUrl } from '$lib/plugins/Config';

export async function load() {
    const url = !building && browser ? await getUrl() : null;
    return { url };
}
