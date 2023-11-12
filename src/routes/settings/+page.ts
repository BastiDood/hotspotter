import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { getUrl } from '$lib/plugins/Config';

export const load = (async () => {
    const url = browser ? await getUrl() : null;
    return { url };
}) satisfies PageLoad;
