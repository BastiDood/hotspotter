import { CellSignalStrength, SignalStrength, Sim } from '$lib/models/cell';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { parse, partial } from 'valibot';

interface TelephonyInfoPlugin extends Plugin {
    getSim(): Promise<unknown>;
    getSignalStrength(): Promise<unknown>;
    getCellSignalStrengths(): Promise<unknown>;
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

export async function getCellSignalStrengths() {
    const cell = await TelephonyInfo.getCellSignalStrengths();
    return parse(partial(CellSignalStrength), cell);
}
