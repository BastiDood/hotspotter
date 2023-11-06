import { registerPlugin } from '@capacitor/core';

export const enum NetworkType {
    /** Unknown */
    UNKNOWN,
    /** General Packet Radio Service (2.5G) */
    GPRS,
    /** Enhanced Data GSM Evolution (2.5G) */
    EDGE,
    /** Universal Mobile Telecommunications Service (3G) */
    UMTS,
    /** Code-Division Multiple Access (IS95A or IS95B) */
    CDMA,
    /** Evolution-Data Optimized (3G) */
    EVDO0,
    /** Evolution-Data Optimized: Revision A (3G) */
    EVDOA,
    /** Single-Carrier Transmission Technology */
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

export interface Sim {
    networkType: NetworkType;
    carrierId: number;
    carrierName: string;
    operatorId: string;
    operatorName: string;
}

export interface SignalStrength {
    timestamp: number;
    level: number;
}

interface TelephonyInfoPlugin {
    getSim(): Promise<Sim>;
    getSignalStrength(): Promise<SignalStrength>;
}

export const TelephonyInfo = registerPlugin<TelephonyInfoPlugin>('TelephonyInfo');
