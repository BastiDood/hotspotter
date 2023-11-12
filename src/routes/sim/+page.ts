import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { getSim, getSignalStrength } from '$lib/plugins/TelephonyInfo';

export const load = (async () => {
    if (browser) return { sim: getSim(), strength: getSignalStrength() };
}) satisfies PageLoad;
