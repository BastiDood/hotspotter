import { building } from '$app/environment';
import { getScanResults } from '$lib/plugins/WifiInfo';

export async function load() {
    const networks = building ? [] : await getScanResults();
    return { networks };
}
