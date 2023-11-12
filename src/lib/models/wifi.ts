import { coerce, date, enum_, integer, number, object, string } from 'valibot';

export enum Standard {
    UNKNOWN = 0,
    /** 802.11a/b/g */
    LEGACY = 1,
    /** 802.11n */
    N = 4,
    /** 802.11ac */
    AC = 5,
    /** 802.11ax */
    AX = 6,
    /** 802.11ad */
    AD = 7,
    /** 802.11be */
    BE = 8,
}

export const AccessPoint = object({
    bssid: string(),
    ssid: string(),
    rssi: number([integer()]),
    level: number([integer()]),
    maxLevel: number([integer()]),
    frequency: number([integer()]),
    channelWidth: number([integer()]),
    centerFreq0: number([integer()]),
    centerFreq1: number([integer()]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: coerce(date(), input => new Date(input as any)),
    standard: enum_(Standard),
});
