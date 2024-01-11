import { type Plugin, registerPlugin } from '@capacitor/core';
import { SignalStrength, Sim } from '$lib/models/cell';
import { building } from '$app/environment';
import { parse } from 'valibot';

interface TelephonyInfoPlugin extends Plugin {
    getSim(): Promise<unknown>;
    getSignalStrength(): Promise<unknown>;
}

const TelephonyInfo = building ? null : registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');

export async function getSim() {
    if (TelephonyInfo === null) return null;
    const sim = await TelephonyInfo.getSim();
    return parse(Sim, sim);
}

export async function getSignalStrength() {
    if (TelephonyInfo === null) return null;
    const strength = await TelephonyInfo.getSignalStrength();
    return parse(SignalStrength, strength);
}
