package ph.edu.up.dcs.ndsg.opsense;

import android.content.Context;
import android.os.*;
import android.telephony.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TelephonyInfo")
public class TelephonyInfoPlugin extends Plugin {
    private TelephonyManager api;
    private Callback callback;

    private class Callback extends TelephonyCallback implements TelephonyCallback.SignalStrengthsListener {
        @Override
        public void onSignalStrengthsChanged(SignalStrength strength) {
            notifyListeners("strength", signalStrengthToJson(strength));
        }
    }

    private static JSObject signalStrengthToJson(SignalStrength strength) {
        var now = System.currentTimeMillis();
        var elapsed = SystemClock.elapsedRealtime();
        var timestamp = strength.getTimestampMillis();
        var res = new JSObject()
            .put("timestamp", now - elapsed + timestamp)
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
                    json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? null : timingAdvance);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        var bitErrorRate = s.getBitErrorRate();
                        json.put("bit_error_rate", bitErrorRate == CellInfo.UNAVAILABLE ? null : bitErrorRate);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                            var rssi = s.getRssi();
                            json.put("rssi", rssi == CellInfo.UNAVAILABLE ? null : rssi);
                        }
                    }
                }
                res.put("gsm", json);
            } else if (cell instanceof CellSignalStrengthLte s) {
                var timingAdvance = s.getTimingAdvance();
                json.put("timing_advance", timingAdvance == CellInfo.UNAVAILABLE ? null : timingAdvance);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    var cqi = s.getCqi();
                    var rsrp = s.getRsrp();
                    var rsrq = s.getRsrq();
                    var rssnr = s.getRssnr();
                    json.put("cqi", cqi == CellInfo.UNAVAILABLE ? null : cqi)
                        .put("rsrp", rsrp == CellInfo.UNAVAILABLE ? null : cqi)
                        .put("rsrq", rsrq == CellInfo.UNAVAILABLE ? null : rsrq)
                        .put("rssnr", rssnr == CellInfo.UNAVAILABLE ? null : rssnr);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        var rssi = s.getRssi();
                        json.put("rssi", rssi == CellInfo.UNAVAILABLE ? null : rssi);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            var cqiTableIndex = s.getCqiTableIndex();
                            json.put("cqi_table_index", cqiTableIndex == CellInfo.UNAVAILABLE ? null : cqiTableIndex);
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
                    json.put("csi_rsrp", csiRsrp == CellInfo.UNAVAILABLE ? null : csiRsrp)
                        .put("csi_rsrq", csiRsrq == CellInfo.UNAVAILABLE ? null : csiRsrq)
                        .put("csi_sinr", csiSinr == CellInfo.UNAVAILABLE ? null : csiSinr)
                        .put("ss_rsrp", ssRsrp == CellInfo.UNAVAILABLE ? null : ssRsrp)
                        .put("ss_rsrq", ssRsrq == CellInfo.UNAVAILABLE ? null : ssRsrq)
                        .put("ss_sinr", ssSinr == CellInfo.UNAVAILABLE ? null : ssSinr);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        var csiCqiTableIndex = s.getCsiCqiTableIndex();
                        json.put("csi_cqi_report", s.getCsiCqiReport())
                            .put("csi_cqi_table_index", csiCqiTableIndex == CellInfo.UNAVAILABLE ? null : csiCqiTableIndex);
                        // TODO(34): getTimingAdvanceMicros
                    }
                }
                res.put("nr", json);
            } else if (cell instanceof CellSignalStrengthTdscdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var rscp = s.getRscp();
                    json.put("rscp", rscp == CellInfo.UNAVAILABLE ? null : rscp);
                }
                res.put("tdscdma", json);
            } else if (cell instanceof CellSignalStrengthWcdma s) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var ecNo = s.getEcNo();
                    json.put("ec_no", ecNo == CellInfo.UNAVAILABLE ? null : ecNo);
                }
                res.put("wcdma", json);
            }
        }
        return res;
    }

    @Override
    public void load() {
        var act = getActivity();
        var exe = act.getMainExecutor();
        api = (TelephonyManager) act.getSystemService(Context.TELEPHONY_SERVICE);
        callback = new Callback();
        api.registerTelephonyCallback(exe, callback);
    }

    @Override
    public void handleOnDestroy() {
        api.unregisterTelephonyCallback(callback);
    }

    @PluginMethod()
    public void getSim(PluginCall ctx) {
        // TODO(getDataNetworkType): Explore difference between `getActiveDataSubscriptionId` vs. `getDefaultDataSubscriptionId`.
        var json = new JSObject()
            // noinspection MissingPermission
            .put("network_type", api.getNetworkType())
            .put("operator_id", api.getSimOperator())
            .put("operator_name", api.getSimOperatorName());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            var carrierId = api.getSimCarrierId();
            var carrierName = api.getSimCarrierIdName();
            json.put("carrier_id", carrierId == TelephonyManager.UNKNOWN_CARRIER_ID ? null : carrierId);
            json.put("carrier_name", carrierName == null ? null : carrierName.toString());
        }
        ctx.resolve(json);
    }

    @PluginMethod()
    public void getSignalStrength(PluginCall ctx) {
        // TODO: Gracefully downgrade to using `SignalStrength` deprecated getters for CDMA and GSM.
        ctx.resolve(signalStrengthToJson(api.getSignalStrength()));
    }
}
