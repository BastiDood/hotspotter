import { coerce, date, enum_, merge, number, object, partial, string } from 'valibot';

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
    dbm: number(),
    asu: number(),
    level: number(),
});

export const Cdma = object({
    cdmaDbm: number(),
    cdmaEcio: number(),
    cdmaLevel: number(),
    evdoDbm: number(),
    evdoEcio: number(),
    evdoLevel: number(),
    evdoSnr: number(),
});

export const Gsm = object({
    bitErrorRate: number(),
    rssi: number(),
    timingAdvance: number(),
});

export const Lte = object({
    cqi: number(),
    cqiTableIndex: number(),
    rsrp: number(),
    rsrq: number(),
    rssi: number(),
    rssnr: number(),
    timingAdvance: number(),
});

export const Nr = object({
    csiCqiTableIndex: number(),
    csiRsrp: number(),
    csiRsrq: number(),
    csiSinr: number(),
    ssRsrp: number(),
    ssRsrq: number(),
    ssSinr: number(),
    timingAdvanceMicros: number(),
});

export const Tdscdma = object({ rscp: number() });
export const Wcdma = object({ ecNo: number() });

const CellSignalStrength = object({
    cdma: merge([CellSignalInfo, Cdma]),
    gsm: merge([CellSignalInfo, Gsm]),
    lte: merge([CellSignalInfo, Lte]),
    nr: merge([CellSignalInfo, Nr]),
    tdscdma: merge([CellSignalInfo, Tdscdma]),
    wcdma: merge([CellSignalInfo, Wcdma]),
});

const SummarySignalStrength = object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: coerce(date(), input => new Date(input as any)),
    level: number(),
});

export const SignalStrength = merge([SummarySignalStrength, partial(CellSignalStrength)]);

export const Sim = object({
    networkType: enum_(NetworkType),
    carrierId: number(),
    carrierName: string(),
    operatorId: string(),
    operatorName: string(),
});
