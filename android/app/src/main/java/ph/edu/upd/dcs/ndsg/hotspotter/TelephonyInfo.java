package ph.edu.upd.dcs.ndsg.hotspotter;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;
import android.telephony.*;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresFeature;
import androidx.annotation.RequiresPermission;
import com.getcapacitor.JSObject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class TelephonyInfo {
    private @NonNull TelephonyManager api;

    TelephonyInfo(@NonNull TelephonyManager api) {
        this.api = api;
    }

    private static JSObject encodeFallibleReading(JSObject json, String key, int value) throws JSONException {
        // 3GPP 27.007 (Ver 10.3.0) Sec 8.69
        switch (value) {
            case 99:
            case 255:
                // Hardware reported a value, so treat as `null`.
                return json.putSafe(key, JSObject.NULL);
            case CellInfo.UNAVAILABLE:
                // Hardware is just not available at all, so treat as `undefined`.
                return json.putSafe(key, null);
            default:
                return json.putSafe(key, value);
        }
    }

    @NonNull
    public static JSObject signalStrengthToJson(@NonNull SignalStrength strength) throws JSONException {
        var now = System.currentTimeMillis();
        var timestamp = Build.VERSION.SDK_INT < Build.VERSION_CODES.R
            ? now
            : now - SystemClock.elapsedRealtime() + strength.getTimestampMillis();
        var res = new JSObject().putSafe("timestamp", timestamp).putSafe("level", strength.getLevel());
        for (var cell : strength.getCellSignalStrengths()) {
            var init = TelephonyInfo.encodeFallibleReading(new JSObject(), "asu", cell.getAsuLevel());
            var json = TelephonyInfo.encodeFallibleReading(init, "dbm", cell.getDbm())
                .putSafe("level", cell.getLevel());
            // TODO: Use `switch` expressions.
            // TODO: Handle case when signal strengths return more than one instance of the same class.
            if (cell instanceof CellSignalStrengthCdma s) {
                json.putSafe("cdma_dbm", s.getCdmaDbm())
                    .putSafe("cdma_ecio", s.getCdmaEcio())
                    .putSafe("cdma_level", s.getCdmaLevel())
                    .putSafe("evdo_dbm", s.getEvdoDbm())
                    .putSafe("evdo_ecio", s.getEvdoEcio())
                    .putSafe("evdo_level", s.getEvdoLevel())
                    .putSafe("evdo_snr", s.getEvdoSnr());
                res.putSafe("cdma", json);
            } else if (cell instanceof CellSignalStrengthGsm s) {
                var timingAdvance = s.getTimingAdvance();
                TelephonyInfo.encodeFallibleReading(json, "bit_error_rate", s.getBitErrorRate())
                    .putOpt("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? null : timingAdvance);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    var rssi = s.getRssi();
                    json.putOpt("rssi", rssi == CellInfo.UNAVAILABLE ? null : rssi);
                }
                res.putSafe("gsm", json);
            } else if (cell instanceof CellSignalStrengthLte s) {
                var cqi = s.getCqi();
                var rsrp = s.getRsrp();
                var rsrq = s.getRsrq();
                var rssnr = s.getRssnr();
                var timingAdvance = s.getTimingAdvance();
                TelephonyInfo.encodeFallibleReading(json, "rssi", s.getRssi())
                    .putOpt("cqi", cqi == CellInfo.UNAVAILABLE ? null : cqi)
                    .putOpt("rsrp", rsrp == CellInfo.UNAVAILABLE ? null : rsrp)
                    .putOpt("rsrq", rsrq == CellInfo.UNAVAILABLE ? null : rsrq)
                    .putOpt("rssnr", rssnr == CellInfo.UNAVAILABLE ? null : rssnr)
                    .putOpt("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? null : timingAdvance);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    var cqiTableIndex = s.getCqiTableIndex();
                    json.putOpt("cqi_table_index", cqiTableIndex == CellInfo.UNAVAILABLE ? null : cqiTableIndex);
                }
                res.putSafe("lte", json);
            } else if (cell instanceof CellSignalStrengthNr s) {
                var csiRsrp = s.getCsiRsrp();
                var csiRsrq = s.getCsiRsrq();
                var csiSinr = s.getCsiSinr();
                var ssRsrp = s.getSsRsrp();
                var ssRsrq = s.getSsRsrq();
                var ssSinr = s.getSsSinr();
                json.putOpt("csi_rsrp", csiRsrp == CellInfo.UNAVAILABLE ? null : csiRsrp)
                    .putOpt("csi_rsrq", csiRsrq == CellInfo.UNAVAILABLE ? null : csiRsrq)
                    .putOpt("csi_sinr", csiSinr == CellInfo.UNAVAILABLE ? null : csiSinr)
                    .putOpt("ss_rsrp", ssRsrp == CellInfo.UNAVAILABLE ? null : ssRsrp)
                    .putOpt("ss_rsrq", ssRsrq == CellInfo.UNAVAILABLE ? null : ssRsrq)
                    .putOpt("ss_sinr", ssSinr == CellInfo.UNAVAILABLE ? null : ssSinr);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    var csiCqiTableIndex = s.getCsiCqiTableIndex();
                    json.putSafe("csi_cqi_report", new JSONArray(s.getCsiCqiReport()))
                        .putOpt("csi_cqi_table_index", csiCqiTableIndex == CellInfo.UNAVAILABLE ? null : csiCqiTableIndex);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                        var timingAdvanceMicros = s.getTimingAdvanceMicros();
                        json.putOpt("timing_advance_micros", timingAdvanceMicros == CellInfo.UNAVAILABLE ? null : timingAdvanceMicros);
                    }
                }
                res.putSafe("nr", json);
            } else if (cell instanceof CellSignalStrengthTdscdma s) {
                var rscp = s.getRscp();
                json.putOpt("rscp", rscp == CellInfo.UNAVAILABLE ? null : rscp);
                res.putSafe("tdscdma", json);
            } else if (cell instanceof CellSignalStrengthWcdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    var ecNo = s.getEcNo();
                    json.putOpt("ec_no", ecNo == CellInfo.UNAVAILABLE ? null : ecNo);
                }
                res.putSafe("wcdma", json);
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
    private JSObject getSim() throws JSONException {
        // TODO(getDataNetworkType): Explore difference between `getActiveDataSubscriptionId` vs. `getDefaultDataSubscriptionId`.
        var networkType = api.getDataNetworkType();
        var carrierId = api.getSimCarrierId();
        var carrierName = api.getSimCarrierIdName();
        return new JSObject()
            .putSafe("network_type", networkType == TelephonyManager.NETWORK_TYPE_UNKNOWN ? JSObject.NULL : networkType)
            .putSafe("carrier_id", carrierId == TelephonyManager.UNKNOWN_CARRIER_ID ? JSObject.NULL : carrierId)
            .putSafe("carrier_name", carrierName == null ? JSObject.NULL : carrierName.toString())
            .putSafe("operator_id", api.getSimOperator())
            .putSafe("operator_name", api.getSimOperatorName());
    }

    @NonNull
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_RADIO_ACCESS,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    private JSObject getSignalStrength() throws JSONException {
        return TelephonyInfo.signalStrengthToJson(api.getSignalStrength());
    }

    @Nullable
    @RequiresPermission(Manifest.permission.READ_PHONE_STATE)
    @RequiresFeature(
        name = PackageManager.FEATURE_TELEPHONY_RADIO_ACCESS,
        enforcement = "android.content.pm.PackageManager#hasSystemFeature"
    )
    public JSObject getCellQuality() {
        try {
            var strength = getSignalStrength();
            return getSim().put("strength", strength);
        } catch (JSONException ex) {
            Log.wtf("TelephonyInfo", "cannot serialize cell information", ex);
            return null;
        }
    }
}
