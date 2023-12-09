import {
    coerce,
    date,
    enum_,
    mac64,
    maxLength,
    maxValue,
    minLength,
    minValue,
    nullable,
    number,
    object,
    safeInteger,
    string,
} from 'valibot';

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
    bssid: string([mac64()]),
    ssid: string([minLength(2), maxLength(32)]),
    rssi: number([safeInteger()]),
    level: number([safeInteger()]),
    max_level: number([safeInteger()]),
    frequency: number([safeInteger()]),
    channel_width: number([safeInteger(), minValue(0), maxValue(5)]),
    center_freq_0: nullable(number([safeInteger()])),
    center_freq_1: nullable(number([safeInteger()])),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wifi_timestamp: coerce(date(), input => new Date(input as any)),
    standard: nullable(enum_(Standard)),
});
