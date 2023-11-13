import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { getScanResults } from '$lib/plugins/WifiInfo';

export const load = (() => {
    const results = browser ? getScanResults() : null;
    return { results };
}) satisfies PageLoad;
