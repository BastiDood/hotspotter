import type { PageLoad } from './$types';
import { Preferences } from '@capacitor/preferences';

export const load = (async () => {
    const { value } = await Preferences.get({ key: 'url' });
    return { url: value ?? 'https://example.com/' };
}) satisfies PageLoad;
