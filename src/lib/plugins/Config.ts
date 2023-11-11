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
