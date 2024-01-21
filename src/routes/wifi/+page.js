import { browser, building } from '$app/environment';
import { getScanResults } from '$lib/plugins/WifiInfo';

export async function load() {
    const networks = building || !browser ? [] : await getScanResults();
    return { networks };
}
