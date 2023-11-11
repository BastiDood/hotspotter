import { Preferences } from '@capacitor/preferences';

export async function getUrl() {
    const { value } = await Preferences.get({ key: 'url' });
    if (value === null) return null;
    return new URL(value);
}
