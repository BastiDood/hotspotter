import { getSignalStrength, getSim } from '$lib/plugins/TelephonyInfo';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';

export const load = (() => {
    if (browser) return { sim: getSim(), strength: getSignalStrength() };
}) satisfies PageLoad;
