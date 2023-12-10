import { getScanInterval, getUrl } from '$lib/plugins/Config';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';

export const load = (() => {
    if (browser) return { url: getUrl(), scanInterval: getScanInterval() };
}) satisfies PageLoad;
