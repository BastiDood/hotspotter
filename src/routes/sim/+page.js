import { getSignalStrength, getSim } from '$lib/plugins/TelephonyInfo';
import { building } from '$app/environment';

async function getData() {
    const [sim, strength] = await Promise.all([getSim(), getSignalStrength()]);
    return { sim, strength };
}

export async function load() {
    const result = building ? null : await getData();
    return { result };
}
