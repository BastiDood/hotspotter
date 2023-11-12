import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { getScanResults } from '$lib/plugins/WifiInfo';

export const load = (async () => {
    const results = browser ? await getScanResults() : [];
    return { networks: results.sort((a, b) => b.rssi - a.rssi) };
}) satisfies PageLoad;
