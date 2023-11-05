import { integer, number, object, string } from 'valibot';

export const Network = object({
    level: number([integer()]),
    SSID: string(),
    BSSID: string(),
    frequency: number([integer()]),
    capabilities: string(),
    timestamp: number([integer()]),
    channelWidth: number([integer()]),
    centerFreq0: number([integer()]),
    centerFreq1: number([integer()]),
});
