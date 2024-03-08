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
    nullish,
    number,
    object,
    optional,
    partial,
    safeInteger,
    string,
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

export const CellSignalInfo = object({
    level: number([safeInteger(), minValue(0), maxValue(4)]),
});

export type CellSignalInfo = Output<typeof CellSignalInfo>;

export const Cdma = object({
    dbm: number([safeInteger()]),
    asu: number([safeInteger(), minValue(1), maxValue(16)]), // FIXME: Validate powers of two.
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
    asu: number([safeInteger(), minValue(0), maxValue(31)]),
    bit_error_rate: nullish(number([safeInteger(), minValue(0), maxValue(7)])),
    rssi: nullish(number([safeInteger(), minValue(-113), maxValue(-51)])),
    timing_advance: nullish(number([safeInteger()])),
});

export type Gsm = Output<typeof Gsm>;

export const Lte = object({
    dbm: number([safeInteger()]),
    asu: number([safeInteger(), minValue(0), maxValue(97)]),
    cqi: nullish(number([safeInteger(), minValue(0), maxValue(15)])),
    cqi_table_index: nullish(number([safeInteger(), minValue(1), maxValue(6)])),
    rsrp: nullish(number([safeInteger(), minValue(-140), maxValue(-43)])),
    rsrq: nullish(number([safeInteger()])),
    rssi: nullish(number([safeInteger(), minValue(-113), maxValue(-51)])),
    rssnr: nullish(number([safeInteger(), minValue(-20), maxValue(30)])),
    timing_advance: nullable(number([safeInteger(), minValue(0), maxValue(1282)])),
});

export type Lte = Output<typeof Lte>;

export const Nr = object({
    dbm: number([safeInteger(), minValue(-140), maxValue(-44)]),
    asu: number([safeInteger(), minValue(0), maxValue(97)]),
    csi_cqi_report: optional(array(number([safeInteger(), minValue(0), maxValue(15)]))),
    csi_cqi_table_index: nullish(number([safeInteger(), minValue(0), maxValue(2)])),
    csi_rsrp: nullish(number([safeInteger(), minValue(-156), maxValue(-31)])),
    csi_rsrq: nullish(number([safeInteger(), minValue(-20), maxValue(-3)])),
    csi_sinr: nullish(number([safeInteger(), minValue(-23), maxValue(23)])),
    ss_rsrp: nullish(number([safeInteger(), minValue(-156), maxValue(-31)])),
    ss_rsrq: nullish(number([safeInteger(), minValue(-43), maxValue(20)])),
    ss_sinr: nullish(number([safeInteger(), minValue(-23), maxValue(40)])),
    timing_advance_micros: nullish(number([safeInteger(), minValue(0), maxValue(1282)])),
});

export type Nr = Output<typeof Nr>;

export const Tdscdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: number([safeInteger(), minValue(0), maxValue(96)]),
    rscp: nullish(number([safeInteger(), minValue(-120), maxValue(-24)])),
});

export type Tdscdma = Output<typeof Tdscdma>;

export const Wcdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: number([safeInteger(), minValue(0), maxValue(96)]),
    ec_no: nullish(number([safeInteger(), minValue(-24), maxValue(-1)])),
});

export type Wcdma = Output<typeof Wcdma>;

export const CellSignalStrength = object({
    cdma: merge([CellSignalInfo, Cdma]),
    gsm: merge([CellSignalInfo, Gsm]),
    lte: merge([CellSignalInfo, Lte]),
    nr: merge([CellSignalInfo, Nr]),
    tdscdma: merge([CellSignalInfo, Tdscdma]),
    wcdma: merge([CellSignalInfo, Wcdma]),
});

export type CellSignalStrength = Output<typeof CellSignalStrength>;

export const SignalStrength = merge([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object({ timestamp: coerce(date(), input => new Date(input as any)) }),
    partial(CellSignalStrength),
    CellSignalInfo,
]);

export type SignalStrength = Output<typeof SignalStrength>;

export const Sim = object({
    network_type: nullable(enum_(NetworkType)),
    carrier_id: nullish(number()),
    carrier_name: nullish(string()),
    operator_id: string(),
    operator_name: string(),
    strength: SignalStrength,
});

export type Sim = Output<typeof Sim>;
