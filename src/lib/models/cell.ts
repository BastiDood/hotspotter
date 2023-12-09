import {
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
    partial,
    safeInteger,
    string,
} from 'valibot';

export enum NetworkType {
    /** Unknown */
    UNKNOWN,
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

export const Gsm = object({
    dbm: number([safeInteger()]),
    asu: number([safeInteger(), minValue(0), maxValue(31)]),
    bit_error_rate: nullable(number([safeInteger(), minValue(0), maxValue(7)])),
    rssi: nullable(number([safeInteger(), minValue(-113), maxValue(-51)])),
    timing_advance: number([safeInteger()]),
});

export const Lte = object({
    dbm: number([safeInteger()]),
    asu: number([safeInteger(), minValue(0), maxValue(97)]),
    cqi: nullable(number([safeInteger(), minValue(0), maxValue(15)])),
    cqi_table_index: nullable(number([safeInteger(), minValue(1), maxValue(6)])),
    rsrp: nullable(number([safeInteger(), minValue(-140), maxValue(-43)])),
    rsrq: nullable(number([safeInteger()])),
    rssi: nullable(number([safeInteger(), minValue(-113), maxValue(-51)])),
    rssnr: nullable(number([safeInteger(), minValue(-20), maxValue(30)])),
    timing_advance: nullable(number([safeInteger(), minValue(0), maxValue(1282)])),
});

export const Nr = object({
    dbm: number([safeInteger(), minValue(-140), maxValue(-44)]),
    asu: number([safeInteger(), minValue(0), maxValue(97)]),
    csi_cqi_report: nullable(array(number([safeInteger(), minValue(0), maxValue(15)]))),
    csi_cqi_table_index: nullable(number([safeInteger(), minValue(0), maxValue(2)])),
    csi_rsrp: nullable(number([safeInteger(), minValue(-156), maxValue(-31)])),
    csi_rsrq: nullable(number([safeInteger(), minValue(-20), maxValue(-3)])),
    csi_sinr: nullable(number([safeInteger(), minValue(-23), maxValue(23)])),
    ss_rsrp: nullable(number([safeInteger(), minValue(-156), maxValue(-31)])),
    ss_rsrq: nullable(number([safeInteger(), minValue(-43), maxValue(20)])),
    ss_sinr: nullable(number([safeInteger(), minValue(-23), maxValue(40)])),
    timing_advance_micros: nullable(number([safeInteger(), minValue(0), maxValue(1282)])),
});

export const Tdscdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: number([safeInteger(), minValue(0), maxValue(96)]),
    rscp: nullable(number([safeInteger(), minValue(-120), maxValue(-24)])),
});

export const Wcdma = object({
    dbm: number([safeInteger(), minValue(-120), maxValue(-24)]),
    asu: number([safeInteger(), minValue(0), maxValue(96)]),
    ec_no: nullable(number([safeInteger(), minValue(-24), maxValue(-1)]))
});

export const CellSignalStrength = object({
    cdma: merge([CellSignalInfo, Cdma]),
    gsm: merge([CellSignalInfo, Gsm]),
    lte: merge([CellSignalInfo, Lte]),
    nr: merge([CellSignalInfo, Nr]),
    tdscdma: merge([CellSignalInfo, Tdscdma]),
    wcdma: merge([CellSignalInfo, Wcdma]),
});

export const SignalStrength = merge([
    // deno-lint-ignore no-explicit-any
    object({ timestamp: coerce(date(), input => new Date(input as any)) }),
    partial(CellSignalStrength),
]);

export const Sim = object({
    network_type: enum_(NetworkType),
    carrier_id: number(),
    carrier_name: string(),
    operator_id: string(),
    operator_name: string(),
});
