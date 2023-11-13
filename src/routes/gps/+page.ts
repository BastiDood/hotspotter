import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { getLocation } from '$lib/plugins/Location';

export const load = (() => {
    const position = browser ? getLocation() : null;
    return { position };
}) satisfies PageLoad;
