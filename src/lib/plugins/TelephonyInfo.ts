import { registerPlugin } from '@capacitor/core';

interface TelephonyInfoPlugin {
    getNetworkOperatorName(): Promise<{ name: string }>;
}

export const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');
