package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.*;
import android.telephony.*;
import androidx.annotation.*;
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
                var timingAdvance = s.getTimingAdvance();
                var bitErrorRate = s.getBitErrorRate();
                json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? JSObject.NULL : timingAdvance)
                    .put("bit_error_rate", bitErrorRate == CellInfo.UNAVAILABLE ? JSObject.NULL : bitErrorRate);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    var rssi = s.getRssi();
                    json.put("rssi", rssi == CellInfo.UNAVAILABLE ? JSObject.NULL : rssi);
                }
                res.put("gsm", json);
            } else if (cell instanceof CellSignalStrengthLte s) {
                var timingAdvance = s.getTimingAdvance();
                var cqi = s.getCqi();
                var rsrp = s.getRsrp();
                var rsrq = s.getRsrq();
                var rssnr = s.getRssnr();
                var rssi = s.getRssi();
                json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? JSObject.NULL : timingAdvance)
                    .put("cqi", cqi == CellInfo.UNAVAILABLE ? JSObject.NULL : cqi)
                    .put("rsrp", rsrp == CellInfo.UNAVAILABLE ? JSObject.NULL : rsrp)
                    .put("rsrq", rsrq == CellInfo.UNAVAILABLE ? JSObject.NULL : rsrq)
                    .put("rssnr", rssnr == CellInfo.UNAVAILABLE ? JSObject.NULL : rssnr)
                    .put("rssi", rssi == CellInfo.UNAVAILABLE ? JSObject.NULL : rssi);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    var cqiTableIndex = s.getCqiTableIndex();
                    json.put("cqi_table_index", cqiTableIndex == CellInfo.UNAVAILABLE ? JSObject.NULL : cqiTableIndex);
                }
                res.put("lte", json);
            } else if (cell instanceof CellSignalStrengthNr s) {
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
                res.put("nr", json);
            } else if (cell instanceof CellSignalStrengthTdscdma s) {
                var rscp = s.getRscp();
                json.put("rscp", rscp == CellInfo.UNAVAILABLE ? JSObject.NULL : rscp);
                res.put("tdscdma", json);
            } else if (cell instanceof CellSignalStrengthWcdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    var ecNo = s.getEcNo();
                    json.put("ec_no", ecNo == CellInfo.UNAVAILABLE ? JSObject.NULL : ecNo);
                }
                res.put("wcdma", json);
            }
        }
        return res;
    }

    @NonNull
    @RequiresPermission(Manifest.permission.READ_PHONE_STATE)
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_SUBSCRIPTION,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    private JSObject getSim() {
        // TODO(getDataNetworkType): Explore difference between `getActiveDataSubscriptionId` vs. `getDefaultDataSubscriptionId`.
        var networkType = api.getDataNetworkType();
        var carrierId = api.getSimCarrierId();
        var carrierName = api.getSimCarrierIdName();
        return new JSObject()
            .put("network_type", networkType == TelephonyManager.NETWORK_TYPE_UNKNOWN ? JSObject.NULL : networkType)
            .put("carrier_id", carrierId == TelephonyManager.UNKNOWN_CARRIER_ID ? JSObject.NULL : carrierId)
            .put("carrier_name", carrierName == null ? JSObject.NULL : carrierName.toString())
            .put("operator_id", api.getSimOperator())
            .put("operator_name", api.getSimOperatorName());
    }

    @NonNull
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_RADIO_ACCESS,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    private JSObject getSignalStrength() {
        return TelephonyInfo.signalStrengthToJson(api.getSignalStrength());
    }

    @NonNull
    @RequiresPermission(Manifest.permission.READ_PHONE_STATE)
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_RADIO_ACCESS,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    public JSObject getCellQuality() {
        var strength = getSignalStrength();
        var sim = getSim();
        return sim.put("strength", strength);
    }
}
