import {
    type Output,
    array,
    coerce,
    date,
    enum_,
    literal,
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
    transform,
    union,
    unknown,
} from 'valibot';

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

function integerRange(min: number, max: number) {
    return number([safeInteger(), minValue(min), maxValue(max)]);
}

export const CellSignalInfo = object({
    level: integerRange(0, 4),
});

export type CellSignalInfo = Output<typeof CellSignalInfo>;

/** @deprecated */
function coerceValidNumber3gpp(value: unknown) {
    if (typeof value !== 'number') return value;
    switch (value) {
        case 99:
        case 255:
            return null;
        case 0x7fffffff:
            // eslint-disable-next-line no-undefined
            return undefined; // CellInfo.UNAVAILABLE
        default:
            return value;
    }
}

/** @deprecated */
function transformUnavailableCellInfoToNull(value: number) {
    // CellInfo.UNAVAILABLE
    return value === 0x7fffffff ? null : value;
}

export const Cdma = object({
    dbm: number([safeInteger()]),
    // FIXME: Validate powers of two.
    asu: nullable(integerRange(1, 16)),
    cdma_dbm: number([safeInteger()]),
    cdma_ecio: number([safeInteger()]),
    cdma_level: integerRange(0, 4),
    evdo_dbm: number([safeInteger()]),
    evdo_ecio: number([safeInteger()]),
    evdo_level: integerRange(0, 4),
    evdo_snr: integerRange(0, 8),
});

export type Cdma = Output<typeof Cdma>;

export const Gsm = object({
    dbm: number([safeInteger()]),
    asu: coerce(optional(nullable(integerRange(0, 31))), coerceValidNumber3gpp),
    bit_error_rate: coerce(optional(nullable(integerRange(0, 7))), coerceValidNumber3gpp),
    rssi: optional(integerRange(-113, -51)),
    timing_advance: optional(nullable(integerRange(0, 219))),
});

export type Gsm = Output<typeof Gsm>;

export const Lte = object({
    dbm: coerce(optional(number([safeInteger()])), coerceValidNumber3gpp),
    asu: coerce(optional(nullable(integerRange(0, 97))), coerceValidNumber3gpp),
    cqi: optional(integerRange(0, 15)),
    cqi_table_index: optional(integerRange(1, 6)),
    rsrp: optional(integerRange(-140, -43)),
    rsrq: optional(number([safeInteger()])),
    rssi: coerce(optional(nullable(integerRange(-113, -51))), coerceValidNumber3gpp),
    rssnr: optional(integerRange(-20, 30)),
    timing_advance: optional(integerRange(0, 1282)),
});

export type Lte = Output<typeof Lte>;

export const Nr = object({
    dbm: coerce(optional(union([integerRange(-140, -44), literal(0x7fffffff)])), coerceValidNumber3gpp),
    asu: coerce(optional(nullable(number([safeInteger(), minValue(0), maxValue(97)]))), coerceValidNumber3gpp),
    csi_cqi_report: optional(
        array(transform(union([integerRange(0, 15), literal(0x7fffffff)]), transformUnavailableCellInfoToNull)),
    ),
    csi_cqi_table_index: optional(integerRange(1, 3)),
    csi_rsrp: optional(integerRange(-156, -31)),
    csi_rsrq: optional(integerRange(-20, -3)),
    csi_sinr: optional(integerRange(-23, 23)),
    ss_rsrp: optional(integerRange(-156, -31)),
    ss_rsrq: optional(integerRange(-43, 20)),
    ss_sinr: optional(integerRange(-23, 40)),
    timing_advance_micros: optional(integerRange(0, 1282)),
});

export type Nr = Output<typeof Nr>;

export const Tdscdma = object({
    dbm: coerce(optional(union([integerRange(-120, -24), literal(0x7fffffff)])), coerceValidNumber3gpp),
    asu: coerce(optional(nullable(integerRange(0, 96))), coerceValidNumber3gpp),
    rscp: optional(integerRange(-120, -24)),
});

export type Tdscdma = Output<typeof Tdscdma>;

export const Wcdma = object({
    dbm: coerce(optional(union([integerRange(-120, -24), literal(0x7fffffff)])), coerceValidNumber3gpp),
    asu: coerce(optional(nullable(integerRange(0, 96))), coerceValidNumber3gpp),
    ec_no: optional(integerRange(-24, 1)),
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
