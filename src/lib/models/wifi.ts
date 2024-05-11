import {
    type Output,
    coerce,
    date,
    enum_,
    mac,
    maxLength,
    maxValue,
    minValue,
    nullable,
    number,
    object,
    optional,
    safeInteger,
    string,
    unknown,
} from 'valibot';

export enum Standard {
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

/** @deprecated */
function coerceUnspecified(value: unknown) {
    // ScanResult.UNSPECIFIED
    return value === -1 ? null : value;
}

export const AccessPoint = object(
    {
        bssid: string([mac()]),
        ssid: string([maxLength(32)]),
        rssi: number([safeInteger()]),
        level: number([safeInteger()]),
        max_level: number([safeInteger()]),
        frequency: number([safeInteger()]),
        channel_width: coerce(nullable(number([safeInteger(), minValue(0), maxValue(5)])), coerceUnspecified),
        center_freq_0: coerce(nullable(number([safeInteger()])), coerceUnspecified),
        center_freq_1: coerce(nullable(number([safeInteger()])), coerceUnspecified),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wifi_timestamp: coerce(date(), input => new Date(input as any)),
        standard: optional(nullable(enum_(Standard))),
    },
    unknown(),
);

export type AccessPoint = Output<typeof AccessPoint>;
