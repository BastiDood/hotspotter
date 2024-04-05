package ph.edu.upd.dcs.ndsg.hotspotter;

import android.os.*;
import android.telephony.*;
import androidx.annotation.NonNull;
import com.getcapacitor.JSObject;

public class TelephonyInfo {
    private @NonNull TelephonyManager api;

    TelephonyInfo(@NonNull TelephonyManager api) {
        this.api = api;
    }

    @NonNull
    public static JSObject signalStrengthToJson(@NonNull SignalStrength strength) {
        var now = System.currentTimeMillis();
        var timestamp = Build.VERSION.SDK_INT < Build.VERSION_CODES.R
            ? now
            : now - SystemClock.elapsedRealtime() + strength.getTimestampMillis();
        var res = new JSObject()
            .put("timestamp", timestamp)
            .put("level", strength.getLevel());
        for (var cell : strength.getCellSignalStrengths()) {
            var json = new JSObject()
                .put("dbm", cell.getDbm())
                .put("asu", cell.getAsuLevel())
                .put("level", cell.getLevel());
            // TODO: Use `switch` expressions.
            // TODO: Handle case when signal strengths return more than one instance of the same class.
            if (cell instanceof CellSignalStrengthCdma s) {
                json.put("cdma_dbm", s.getCdmaDbm())
                    .put("cdma_ecio", s.getCdmaEcio())
                    .put("cdma_level", s.getCdmaLevel())
                    .put("evdo_dbm", s.getEvdoDbm())
                    .put("evdo_ecio", s.getEvdoEcio())
                    .put("evdo_level", s.getEvdoLevel())
                    .put("evdo_snr", s.getEvdoSnr());
                res.put("cdma", json);
            } else if (cell instanceof CellSignalStrengthGsm s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    var timingAdvance = s.getTimingAdvance();
                    json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? JSObject.NULL : timingAdvance);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        var bitErrorRate = s.getBitErrorRate();
                        json.put("bit_error_rate", bitErrorRate == CellInfo.UNAVAILABLE ? JSObject.NULL : bitErrorRate);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                            var rssi = s.getRssi();
                            json.put("rssi", rssi == CellInfo.UNAVAILABLE ? JSObject.NULL : rssi);
                        }
                    }
                }
                res.put("gsm", json);
            } else if (cell instanceof CellSignalStrengthLte s) {
                var timingAdvance = s.getTimingAdvance();
                json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? JSObject.NULL : timingAdvance);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    var cqi = s.getCqi();
                    var rsrp = s.getRsrp();
                    var rsrq = s.getRsrq();
                    var rssnr = s.getRssnr();
                    json.put("cqi", cqi == CellInfo.UNAVAILABLE ? JSObject.NULL : cqi)
                        .put("rsrp", rsrp == CellInfo.UNAVAILABLE ? JSObject.NULL : rsrp)
                        .put("rsrq", rsrq == CellInfo.UNAVAILABLE ? JSObject.NULL : rsrq)
                        .put("rssnr", rssnr == CellInfo.UNAVAILABLE ? JSObject.NULL : rssnr);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        var rssi = s.getRssi();
                        json.put("rssi", rssi == CellInfo.UNAVAILABLE ? JSObject.NULL : rssi);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            var cqiTableIndex = s.getCqiTableIndex();
                            json.put("cqi_table_index", cqiTableIndex == CellInfo.UNAVAILABLE ? JSObject.NULL : cqiTableIndex);
                        }
                    }
                }
                res.put("lte", json);
            } else if (cell instanceof CellSignalStrengthNr s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var csiRsrp = s.getCsiRsrp();
                    var csiRsrq = s.getCsiRsrq();
                    var csiSinr = s.getCsiSinr();
                    var ssRsrp = s.getSsRsrp();
                    var ssRsrq = s.getSsRsrq();
                    var ssSinr = s.getSsSinr();
                    json.put("csi_rsrp", csiRsrp == CellInfo.UNAVAILABLE ? JSObject.NULL : csiRsrp)
                        .put("csi_rsrq", csiRsrq == CellInfo.UNAVAILABLE ? JSObject.NULL : csiRsrq)
                        .put("csi_sinr", csiSinr == CellInfo.UNAVAILABLE ? JSObject.NULL : csiSinr)
                        .put("ss_rsrp", ssRsrp == CellInfo.UNAVAILABLE ? JSObject.NULL : ssRsrp)
                        .put("ss_rsrq", ssRsrq == CellInfo.UNAVAILABLE ? JSObject.NULL : ssRsrq)
                        .put("ss_sinr", ssSinr == CellInfo.UNAVAILABLE ? JSObject.NULL : ssSinr);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        var csiCqiTableIndex = s.getCsiCqiTableIndex();
                        json.put("csi_cqi_report", s.getCsiCqiReport())
                            .put("csi_cqi_table_index", csiCqiTableIndex == CellInfo.UNAVAILABLE ? JSObject.NULL : csiCqiTableIndex);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                            var timingAdvanceMicros = s.getTimingAdvanceMicros();
                            json.put("timing_advance_micros", timingAdvanceMicros == CellInfo.UNAVAILABLE ? JSObject.NULL : timingAdvanceMicros);
                        }
                    }
                }
                res.put("nr", json);
            } else if (cell instanceof CellSignalStrengthTdscdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var rscp = s.getRscp();
                    json.put("rscp", rscp == CellInfo.UNAVAILABLE ? JSObject.NULL : rscp);
                }
                res.put("tdscdma", json);
            } else if (cell instanceof CellSignalStrengthWcdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var ecNo = s.getEcNo();
                    json.put("ec_no", ecNo == CellInfo.UNAVAILABLE ? JSObject.NULL : ecNo);
                }
                res.put("wcdma", json);
            }
        }
        return res;
    }

    @NonNull
    private JSObject getSim() {
        // TODO(getDataNetworkType): Explore difference between `getActiveDataSubscriptionId` vs. `getDefaultDataSubscriptionId`.
        var networkType = api.getDataNetworkType();
        var json = new JSObject()
            // noinspection MissingPermission
            .put("network_type", networkType == TelephonyManager.NETWORK_TYPE_UNKNOWN ? JSObject.NULL : networkType)
            .put("operator_id", api.getSimOperator())
            .put("operator_name", api.getSimOperatorName());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            var carrierId = api.getSimCarrierId();
            var carrierName = api.getSimCarrierIdName();
            json.put("carrier_id", carrierId == TelephonyManager.UNKNOWN_CARRIER_ID ? JSObject.NULL : carrierId)
                .put("carrier_name", carrierName == null ? JSObject.NULL : carrierName.toString());
        }
        return json;
    }

    @NonNull
    private JSObject getSignalStrength() {
        return TelephonyInfo.signalStrengthToJson(api.getSignalStrength());
    }

    @NonNull
    public JSObject getCellQuality() {
        var strength = getSignalStrength();
        var sim = getSim();
        return sim.put("strength", strength);
    }
}