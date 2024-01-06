import { browser } from '$app/environment';
import { getLocation } from '$lib/plugins/Location';

export async function load() {
    const position = browser ? await getLocation() : null;
    return { position };
}
