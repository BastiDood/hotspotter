import { getSignalStrength, getSim } from '$lib/plugins/TelephonyInfo';
import { browser } from '$app/environment';

export async function load() {
    if (!browser) return;
    const [sim, strength] = await Promise.all([getSim(), getSignalStrength()]);
    return { sim, strength };
}
