import { Preferences } from '@capacitor/preferences';
import { assert } from '$lib/assert';

export async function getUrl() {
    const { value } = await Preferences.get({ key: 'url' });
    if (value === null) return null;
    return new URL(value);
}

export async function setUrl(value: string) {
    assert(URL.canParse(value), 'bad endpoint');
    await Preferences.set({ key: 'url', value });
}

export async function getScanInterval() {
    const { value } = await Preferences.get({ key: 'scan-interval' });
    if (value === null) return null;
    const interval = parseInt(value, 10);
    assert(interval >= 0);
    return interval;
}

export async function setScanInterval(interval: number) {
    assert(Number.isSafeInteger(interval) && interval >= 0);
    await Preferences.set({ key: 'scan-interval', value: interval.toString() });
}
