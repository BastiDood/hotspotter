import { type Plugin, registerPlugin } from '@capacitor/core';
import { Sim } from '$lib/models/cell';
import { building } from '$app/environment';
import { parse } from 'valibot';

interface TelephonyInfoPlugin extends Plugin {
    getCellQuality(): Promise<unknown>;
}

const TelephonyInfo = building ? null : registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');

export async function getCellQuality() {
    if (TelephonyInfo === null) return null;
    const sim = await TelephonyInfo.getCellQuality();
    return parse(Sim, sim);
}
