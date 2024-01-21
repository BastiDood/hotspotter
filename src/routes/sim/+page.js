import { browser, building } from '$app/environment';
import { getSignalStrength, getSim } from '$lib/plugins/TelephonyInfo';

async function getData() {
    const [sim, strength] = await Promise.all([getSim(), getSignalStrength()]);
    return { sim, strength };
}

export async function load() {
    const result = building || !browser ? null : await getData();
    return { result };
}
