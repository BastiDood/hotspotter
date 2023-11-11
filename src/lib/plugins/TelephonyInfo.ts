import { CellSignalStrength, SignalStrength, Sim } from '$lib/models/cell';
import { parse, partial } from 'valibot';
import { registerPlugin } from '@capacitor/core';

interface TelephonyInfoPlugin {
    getSim(): Promise<unknown>;
    getSignalStrength(): Promise<unknown>;
    getSignalStrengths(): Promise<unknown>;
}

const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');

export async function getSim() {
    const sim = await TelephonyInfo.getSim();
    return parse(Sim, sim);
}

export async function getSignalStrength() {
    const signal = await TelephonyInfo.getSignalStrength();
    return parse(SignalStrength, signal);
}

export async function getSignalStrengths() {
    const cell = await TelephonyInfo.getSignalStrengths();
    return parse(partial(CellSignalStrength), cell);
}
