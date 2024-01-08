import { browser } from '$app/environment';
import { getScanResults } from '$lib/plugins/WifiInfo';

export async function load() {
    const results = browser ? await getScanResults() : null;
    return { results };
}
