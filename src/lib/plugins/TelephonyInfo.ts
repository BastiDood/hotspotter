import type { CellSignalStrength, Sim, SignalStrength } from '$lib/models/cell';
import type { Output } from 'valibot';
import { registerPlugin } from '@capacitor/core';

interface TelephonyInfoPlugin {
    getSim(): Promise<Output<typeof Sim>>;
    getSignalStrength(): Promise<Output<typeof SignalStrength>>;
    getSignalStrengths(): Promise<Output<typeof CellSignalStrength>>;
}

export const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');
