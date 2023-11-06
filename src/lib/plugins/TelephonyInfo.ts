import { registerPlugin } from '@capacitor/core';

export interface Sim {
    networkType: number;
    carrierId: number;
    carrierName: string;
    operatorId: string;
    operatorName: string;
}

export interface SignalStrength {
    timestamp: number;
    level: number;
}

interface TelephonyInfoPlugin {
    getSim(): Promise<Sim>;
    getSignalStrength(): Promise<SignalStrength>;
}

export const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');
