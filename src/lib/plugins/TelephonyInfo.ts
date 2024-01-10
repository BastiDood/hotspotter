import { type Plugin, registerPlugin } from '@capacitor/core';
import { SignalStrength, Sim } from '$lib/models/cell';
import { parse } from 'valibot';

interface TelephonyInfoPlugin extends Plugin {
    getSim(): Promise<unknown>;
    getSignalStrength(): Promise<unknown>;
}

const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');

export async function getSim() {
    const sim = await TelephonyInfo.getSim();
    return parse(Sim, sim);
}

export async function getSignalStrength() {
    const strength = await TelephonyInfo.getSignalStrength();
    return parse(SignalStrength, strength);
}
