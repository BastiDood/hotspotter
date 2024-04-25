import {
    type Output,
    array,
    coerce,
    date,
    enum_,
    maxValue,
    merge,
    minValue,
    nullable,
    number,
    object,
    optional,
    partial,
    safeInteger,
    string,
    unknown,
} from 'valibot';

// TODO: Remove this after deprecating the `null` method.
function coerceNullAsUndefined(input: unknown): unknown {
    // eslint-disable-next-line no-undefined
    return input === null ? undefined : input;
}

export enum NetworkType {
    /** General Packet Radio Service (2.5G) */
    GPRS,
    /** Enhanced Data GSM Evolution (2.5G) */
    EDGE,
    /** Universal Mobile Telecommunications Service (3G) */
    UMTS,
    /** Code-Division Multiple Access (2G) */
    CDMA,
    /** Evolution-Data Optimized (3G) */
    EVDO0,
    /** Evolution-Data Optimized: Revision A (3G) */
    EVDOA,
    /** Single-Carrier Transmission Technology (3G) */
    RTT1X,
    /** High-Speed Downlink Packet Access (3G) */
    HSDPA,
    /** High-Speed Uplink Packet Access (3G) */
    HSUPA,
    /** High Speed Packet Access (HSDPA+HSUPA) */
    HSPA,
    /** Integrated Digital Enhanced Network */
    IDEN,
    /** Evolution-Data Optimized: Revision B (3G) */
    EVDOB,
    /** Long-Term Evoluation (4G) */
    LTE,
    /** Enhanced High-Rate Packet Data (EVDO+LTE) (3G+4G) */
    EHRPD,
    /** Evolved High Speed Packet (HSPA+) (3G) */
    HSPAP,
    /** Global System for Mobile Communications (2G) */
    GSM,
    /** Time Division-Synchronous Code Division Multiple Access (3G) */
    TD_SCDMA,
    /** Interworking Wireless LAN */
    IWLAN,
    /** New Radio (5G) */
    NR,
}

export const CellSignalInfo = object({
    level: number([safeInteger(), minValue(0), maxValue(4)]),
});

export type CellSignalInfo = Output<typeof CellSignalInfo>;

export const Cdma = object({
    dbm: number([safeInteger()]),
    // FIXME: Validate powers of two.
    asu: nullable(number([safeInteger(), minValue(1), maxValue(16)])),
    cdma_dbm: number([safeInteger()]),
    cdma_ecio: number([safeInteger()]),
    cdma_level: number([safeInteger(), minValue(0), maxValue(4)]),
    evdo_dbm: number([safeInteger()]),
    evdo_ecio: number([safeInteger()]),
    evdo_level: number([safeInteger(), minValue(0), maxValue(4)]),
    evdo_snr: number([safeInteger(), minValue(0), maxValue(8)]),
});

export type Cdma = Output<typeof Cdma>;

export const Gsm = object({
    dbm: number([safeInteger()]),
    asu: optional(number([safeInteger(), minValue(0), maxValue(31)])),
    bit_error_rate: optional(nullable(number([safeInteger(), minValue(0), maxValue(7)]))),
    rssi: coerce(optional(number([safeInteger(), minValue(-113), maxValue(-51)])), coerceNullAsUndefined),
    timing_advance: coerce(
        optional(nullable(number([safeInteger(), minValue(0), maxValue(219)]))),
        coerceNullAsUndefined,
    ),
});

export type Gsm = Output<typeof Gsm>;

export const Lte = object({
    dbm: number([safeInteger()]),
    asu: optional(nullable(number([safeInteger(), minValue(0), maxValue(97)]))),
    cqi: coerce(optional(number([safeInteger(), minValue(0), maxValue(15)])), coerceNullAsUndefined),
    cqi_table_index: coerce(optional(number([safeInteger(), minValue(1), maxValue(6)])), coerceNullAsUndefined),
    rsrp: coerce(optional(number([safeInteger(), minValue(-140), maxValue(-43)])), coerceNullAsUndefined),
    rsrq: coerce(optional(number([safeInteger()])), coerceNullAsUndefined),
    rssi: coerce(optional(number([safeInteger(), minValue(-113), maxValue(-51)])), coerceNullAsUndefined),
    rssnr: coerce(optional(number([safeInteger(), minValue(-20), maxValue(30)])), coerceNullAsUndefined),
    timing_advance: coerce(optional(number([safeInteger(), minValue(0), maxValue(1282)])), coerceNullAsUndefined),
});

export type Lte = Output<typeof Lte>;

export const Nr = object({
    dbm: number([safeInteger(), minValue(-140), maxValue(-44)]),
    asu: optional(nullable(number([safeInteger(), minValue(0), maxValue(97)]))),
    // TODO: Deprecate the string workaround.
    csi_cqi_report: optional(
        coerce(array(number([safeInteger(), minValue(0), maxValue(15)])), input =>
            typeof input === 'string' ? JSON.parse(input) : input,
        ),
    ),
    csi_cqi_table_index: coerce(optional(number([safeInteger(), minValue(1), maxValue(3)])), coerceNullAsUndefined),
    csi_rsrp: coerce(optional(number([safeInteger(), minValue(-156), maxValue(-31)])), coerceNullAsUndefined),
    csi_rsrq: coerce(optional(number([safeInteger(), minValue(-20), maxValue(-3)])), coerceNullAsUndefined),
    csi_sinr: coerce(optional(number([safeInteger(), minValue(-23), maxValue(23)])), coerceNullAsUndefined),
    ss_rsrp: coerce(optional(number([safeInteger(), minValue(-156), maxValue(-31)])), coerceNullAsUndefined),
    ss_rsrq: coerce(optional(number([safeInteger(), minValue(-43), maxValue(20)])), coerceNullAsUndefined),
    ss_sinr: coerce(optional(number([safeInteger(), minValue(-23), maxValue(40)])), coerceNullAsUndefined),
    timing_advance_micros: coerce(
        optional(number([safeInteger(), minValue(0), maxValue(1282)])),
        coerceNullAsUndefined,
    ),
});

export type Nr = Output<typeof Nr>;

export const Tdscdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: optional(nullable(number([safeInteger(), minValue(0), maxValue(96)]))),
    rscp: coerce(optional(number([safeInteger(), minValue(-120), maxValue(-24)])), coerceNullAsUndefined),
});

export type Tdscdma = Output<typeof Tdscdma>;

export const Wcdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: optional(nullable(number([safeInteger(), minValue(0), maxValue(96)]))),
    ec_no: coerce(optional(number([safeInteger(), minValue(-24), maxValue(1)])), coerceNullAsUndefined),
});

export type Wcdma = Output<typeof Wcdma>;

export const CellSignalStrength = object({
    cdma: merge([CellSignalInfo, Cdma], unknown()),
    gsm: merge([CellSignalInfo, Gsm], unknown()),
    lte: merge([CellSignalInfo, Lte], unknown()),
    nr: merge([CellSignalInfo, Nr], unknown()),
    tdscdma: merge([CellSignalInfo, Tdscdma], unknown()),
    wcdma: merge([CellSignalInfo, Wcdma], unknown()),
});

export type CellSignalStrength = Output<typeof CellSignalStrength>;

export const SignalStrength = merge(
    [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object({
            timestamp: coerce(date(), input =>
                typeof input === 'string' || typeof input === 'number' ? new Date(input) : input,
            ),
        }),
        partial(CellSignalStrength),
        CellSignalInfo,
    ],
    unknown(),
);

export type SignalStrength = Output<typeof SignalStrength>;

export const Sim = object({
    network_type: nullable(enum_(NetworkType)),
    carrier_id: nullable(number()),
    carrier_name: nullable(string()),
    operator_id: string(),
    operator_name: string(),
    strength: SignalStrength,
});

export type Sim = Output<typeof Sim>;
