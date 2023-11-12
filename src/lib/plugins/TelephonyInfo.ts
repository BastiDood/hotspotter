import { type Output, parse } from 'valibot';
import { type Plugin, registerPlugin } from '@capacitor/core';
import { SignalStrength, Sim } from '$lib/models/cell';

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

type Strength = Output<typeof SignalStrength>;
type ScanCallback = (strength: Strength) => void;
export function addScanListener(callback: ScanCallback) {
    return TelephonyInfo.addListener('strength', evt => callback(parse(SignalStrength, evt)));
}
